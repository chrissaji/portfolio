"""Write the resume without the phone number.

    python -I scripts/redact-resume.py "<source.pdf>" public/Chris_Thomas_Saji_Resume.pdf

The contact line is removed with true redaction (its text is deleted from the
file, not covered) and set again, centred, without the phone, in the resume's
own embedded font. The email and LinkedIn links are moved onto the new text.
Stops with a message, writing nothing, if any step cannot be done faithfully.

The number itself is never written here: the line is found, and the result
checked, by the shape of a phone number.
"""
import os
import re
import sys

import fitz  # PyMuPDF

# A phone number: optional country code, then ten digits, spaces or hyphens allowed between,
# and no digit either side (so the 14-digit PDF dates do not match).
PHONE = re.compile(r"(?<!\d)(?:\+\d{1,3}[\s-]?)?(?:\d[\s-]?){9}\d(?!\d)")


def has_phone(text):
    return PHONE.search(text) is not None


def contact_line(page):
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(span["text"] for span in line["spans"])
            if "@" in text and has_phone(text):
                return line
    sys.exit("No contact line with a phone number on page 1: nothing to do.")


def main(src, dst):
    doc = fitz.open(src)
    page = doc[0]
    line = contact_line(page)

    # Keep everything from the email on. The resume spaces its words by position
    # (its subset font has no space glyph), so each word keeps its original offset
    # and the whole line slides left to sit centred.
    chars = [c for span in raw_spans(page, line) for c in span["chars"]]
    joined = "".join(c["c"] for c in chars)
    at = joined.index("@")
    first = joined.rfind(" ", 0, at) + 1
    kept = chars[first:]
    if has_phone("".join(c["c"] for c in kept)):
        sys.exit("The phone number sits after the email in the contact line: cannot drop it cleanly.")

    words, current = [], None
    for c in kept:
        if c["c"] == " ":
            current = None
            continue
        if current is None:
            current = {"x": c["origin"][0], "text": ""}
            words.append(current)
        current["text"] += c["c"]

    span0 = raw_spans(page, line)[0]
    size, color = span0["size"], fitz.sRGB_to_pdf(span0["color"])
    baseline = kept[0]["origin"][1]
    left, right = kept[0]["origin"][0], kept[-1]["bbox"][2]
    shift = left - (page.rect.width - (right - left)) / 2

    font_name = span0["font"]
    xref = next(f[0] for f in page.get_fonts() if f[3].split("+")[-1] == font_name)
    _, _, _, buffer = doc.extract_font(xref)
    font = fitz.Font(fontbuffer=buffer)
    missing = sorted({ch for w in words for ch in w["text"] if not font.has_glyph(ord(ch))})
    if missing:
        sys.exit(f"The embedded font lacks {missing!r}. Export a phone-free PDF from the resume source instead.")

    band = fitz.Rect(line["bbox"])
    moved = [l for l in page.get_links() if l.get("uri") and fitz.Rect(l["from"]).intersects(band)]

    page.add_redact_annot(band)
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    page.insert_font(fontname="charter", fontbuffer=buffer)
    for w in words:
        page.insert_text((w["x"] - shift, baseline), w["text"], fontname="charter", fontsize=size, color=color)

    for link in page.get_links():
        if fitz.Rect(link["from"]).intersects(band):
            page.delete_link(link)
    for link in moved:
        r = fitz.Rect(link["from"])
        page.insert_link({"kind": fitz.LINK_URI, "from": fitz.Rect(r.x0 - shift, r.y0, r.x1 - shift, r.y1), "uri": link["uri"]})

    fix_hyphen(doc, page)
    move_after_name(doc, page, "Chris Thomas Saji", words[0]["text"])

    for p in doc:
        if has_phone(p.get_text()):
            sys.exit("A phone number is still in the text: not writing the file.")
    for value in (doc.metadata or {}).values():
        if value and has_phone(value):
            sys.exit("A phone number is in the PDF metadata: not writing the file.")

    doc.save(dst, garbage=4, deflate=True)

    # Read the file back as a parser would: name, then the contact line with real hyphens.
    lines = [l.strip() for l in fitz.open(dst)[0].get_text().splitlines() if l.strip()]
    expected = " ".join(w["text"] for w in words)
    if lines[:2] != ["Chris Thomas Saji", expected] or "\u00ad" in lines[1]:
        os.remove(dst)
        sys.exit(f"The saved file reads {lines[:2]!r}; expected the name, then {expected!r}. Removed it.")
    print(f"Wrote {dst}: contact line moved {shift:.1f} pt left, now {left - shift:.1f} to {right - shift:.1f} pt.")


def fix_hyphen(doc, page):
    """PyMuPDF maps the inserted font's hyphen glyph to U+00AD (a soft hyphen, which
    parsers drop). Map it to U+002D so the LinkedIn address extracts intact."""
    xref = next(f[0] for f in page.get_fonts() if f[4] == "charter")
    cmap = int(doc.xref_get_key(xref, "ToUnicode")[1].split()[0])
    text = doc.xref_stream(cmap).decode("latin-1")
    fixed = re.sub(r"(<[0-9a-fA-F]{4}>\s*)<00[aA][dD]>", r"\1<002d>", text)
    doc.update_stream(cmap, fixed.encode("latin-1"))


def move_after_name(doc, page, name, first_word):
    """The new line was appended to the page's content, so text-order parsers (most
    applicant-tracking systems) would read it last. Move it to just after the name,
    choosing the first position where extraction reads name, then contact line."""
    page.clean_contents()
    xref = page.get_contents()[0]
    stream = doc.xref_stream(xref).decode("latin-1")
    ours = re.findall(r"q [\d. ]+rg [\d. ]+RG BT/charter .*? ET Q", stream, flags=re.S)
    rest = stream
    for segment in ours:
        rest = rest.replace(segment, "", 1)
    for end in [m.end() for m in re.finditer(r"\bET\b", rest)]:
        candidate = rest[:end] + " " + " ".join(ours) + " " + rest[end:]
        doc.update_stream(xref, candidate.encode("latin-1"))
        page = doc.reload_page(page)  # a page keeps its parsed content until reloaded
        lines = [l for l in page.get_text().splitlines() if l.strip()]
        if len(lines) > 1 and lines[0].strip() == name and lines[1].startswith(first_word):
            return
    doc.update_stream(xref, stream.encode("latin-1"))
    sys.exit("Could not place the contact line after the name in reading order.")


def raw_spans(page, line):
    """The rawdict spans (with per-character positions) of the dict line given."""
    for block in page.get_text("rawdict")["blocks"]:
        for raw in block.get("lines", []):
            if fitz.Rect(raw["bbox"]) == fitz.Rect(line["bbox"]):
                return raw["spans"]
    sys.exit("Could not read the contact line's character positions.")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
