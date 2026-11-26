/* wardrobe.js: the smallest theme engine. A theme is one stylesheet that sets the app's own CSS tokens,
   loaded after the app's stylesheets. This file adds that one <link>, remembers the choice, and says so.

   <script src="wardrobe.js" data-base="https://the-wardrobe.starny-consulting.workers.dev/"></script>
   Wardrobe.list()            the themes on the rail (from themes/index.json)
   Wardrobe.wear('dusk')      put one on; resolves once its stylesheet has loaded
   Wardrobe.current()         the id being worn ('original' when none)
   Wardrobe.off()             back to the app's own look
   window 'wardrobe' event    { detail: { id, theme } } after every change */
(function () {
  var KEY = 'wardrobe.theme';
  var me = document.currentScript;
  var base = (me && me.dataset.base) || (me ? me.src.replace(/[^/]*$/, '') : './');
  var link = null;
  var index = null;
  var worn = 'original';

  function list() {
    if (!index) index = fetch(base + 'themes/index.json').then(function (r) { return r.json(); });
    return index;
  }
  function remember(id) { try { localStorage.setItem(KEY, id); } catch (e) {} }
  function saved() { try { return localStorage.getItem(KEY) || 'original'; } catch (e) { return 'original'; } }
  function announce(id, theme) {
    document.documentElement.dataset.wardrobe = id;
    window.dispatchEvent(new CustomEvent('wardrobe', { detail: { id: id, theme: theme || null } }));
  }

  function wear(id) {
    return list().then(function (all) {
      var theme = all.filter(function (t) { return t.id === id; })[0];
      if (!theme || id === 'original') return off();
      return new Promise(function (done) {
        var next = document.createElement('link');
        next.rel = 'stylesheet';
        next.href = base + theme.css;
        next.dataset.wardrobe = id;
        // swap only once the new one is ready, so the page never shows half a theme
        next.onload = next.onerror = function () {
          if (link && link !== next) link.remove();
          link = next;
          worn = id;
          remember(id);
          announce(id, theme);
          done(theme);
        };
        document.head.appendChild(next);
      });
    });
  }

  function off() {
    if (link) link.remove();
    link = null;
    worn = 'original';
    remember('original');
    announce('original', null);
    return Promise.resolve(null);
  }

  window.Wardrobe = { list: list, wear: wear, off: off, current: function () { return worn; }, saved: saved, base: base };
})();
