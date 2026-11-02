/** The part of the Clipboard API the copy button uses, so tests can pass a stand-in. */
export type Clipboard = { writeText(text: string): Promise<void> };

/** Copies the text and says whether it worked. A missing or blocked clipboard (an old browser, a
 *  permissions policy, a page served over plain HTTP) is a false, never an error. */
export async function copyText(text: string, clipboard: Clipboard | undefined): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Shows every [data-copy] button (they start hidden, since they need JavaScript) and makes a
 *  click copy its text. The label reports the result for two seconds, then returns. */
export function initCopyButtons(clipboard: Clipboard | undefined, holdMs = 2000): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    const idle = button.textContent;
    let timer: ReturnType<typeof setTimeout> | undefined;
    button.hidden = false;
    button.addEventListener('click', async () => {
      const ok = await copyText(button.dataset.copy ?? '', clipboard);
      button.textContent = ok ? 'Copied' : 'Select it to copy';
      button.classList.toggle('is-done', ok);
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = idle;
        button.classList.remove('is-done');
      }, holdMs);
    });
  });
}
