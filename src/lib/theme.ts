export type Theme = 'light' | 'dark';

export function currentTheme(attr: string | undefined, systemDark: boolean): Theme {
  if (attr === 'light' || attr === 'dark') return attr;
  return systemDark ? 'dark' : 'light';
}

export function nextTheme(attr: string | undefined, systemDark: boolean): Theme {
  return currentTheme(attr, systemDark) === 'dark' ? 'light' : 'dark';
}

export function initThemeToggle(button: HTMLButtonElement): void {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const label = () => {
    button.setAttribute('aria-label', `Switch to ${nextTheme(root.dataset.theme, system.matches)} theme`);
  };
  button.addEventListener('click', () => {
    const next = nextTheme(root.dataset.theme, system.matches);
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage blocked (private window): the choice lasts for this visit only.
    }
    label();
  });
  system.addEventListener('change', label);
  label();
}
