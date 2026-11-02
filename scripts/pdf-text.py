"""Print the text of a PDF, for the pre-deploy check."""
import sys

import fitz  # PyMuPDF

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(sys.argv[1])
print("\n".join(page.get_text() for page in doc))
print("\n".join(v for v in (doc.metadata or {}).values() if v))
