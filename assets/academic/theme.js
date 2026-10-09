(() => {
  const root = document.documentElement;
  const button = document.querySelector('.theme-button');
  if (!button) return;
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  button.hidden = false;
  sync();
  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('lixian-theme', next); } catch (error) {}
    sync();
  });
})();
