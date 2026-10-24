/* The theme switch every page shares: it picks light or dark before first
   paint and wires the toggle button. Theme only, so a page needs none of the
   RPC and wallet code in mint.js. No build step and no dependencies. */
(function (global) {
  'use strict';

  var Theme = {};

  /* Called from an inline script in <head>, before first paint, so the page
     never flashes the wrong theme. */
  Theme.initTheme = function () {
    try {
      var t = localStorage.getItem('theme');
      if (t !== 'light' && t !== 'dark') {
        t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.dataset.theme = t;
    } catch (e) {}
  };

  Theme.wireThemeToggle = function () {
    var root = document.documentElement;
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.hidden = false;
    function syncThumbnails() {
      document.querySelectorAll('img[data-theme-light][data-theme-dark]').forEach(function (image) {
        image.src = root.dataset.theme === 'dark' ? image.dataset.themeDark : image.dataset.themeLight;
      });
    }
    function describe() {
      btn.title = 'Switch to ' + (root.dataset.theme === 'dark' ? 'light' : 'dark') + ' mode';
      btn.setAttribute('aria-label', btn.title);
      syncThumbnails();
    }
    describe();
    btn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      describe();
    });
  };

  global.Theme = Theme;
})(this);
