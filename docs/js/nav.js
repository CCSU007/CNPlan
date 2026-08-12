/**
 * Nav "Cities" dropdown behavior.
 * Hover opens it on desktop (pure CSS). Clicking "Cities" pins it open
 * so you can click into the list; click again (while open) navigates to
 * the Cities overview. Click anywhere outside or press Escape to close.
 */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.nav-item');
    if (!items.length) return;

    items.forEach(item => {
      const link = item.querySelector('a.nav-link');
      if (!link) return;
      link.addEventListener('click', e => {
        // Already open → let the link navigate to the Cities overview
        if (item.classList.contains('open')) return;
        e.preventDefault();
        items.forEach(i => i.classList.remove('open'));
        item.classList.add('open');
      });
    });

    // Close when clicking anywhere else
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-item')) {
        items.forEach(i => i.classList.remove('open'));
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        items.forEach(i => i.classList.remove('open'));
      }
    });
  });

  // ── PWA (installable app) ──
  // Inject the manifest link + theme color on every page, and register the
  // service worker (only works over http(s), harmless on file://).
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.body.getAttribute('data-root') || '';

    if (!document.querySelector('link[rel="manifest"]')) {
      const l = document.createElement('link');
      l.rel = 'manifest';
      l.href = root + 'manifest.webmanifest';
      document.head.appendChild(l);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      const m = document.createElement('meta');
      m.name = 'theme-color';
      m.content = '#6366f1';
      document.head.appendChild(m);
    }
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const a = document.createElement('link');
      a.rel = 'apple-touch-icon';
      a.href = root + 'icons/icon-180.png';
      document.head.appendChild(a);
    }
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      const root = document.body.getAttribute('data-root') || '';
      navigator.serviceWorker.register(root + 'sw.js').catch(() => {});
    });
  }
})();
