/*
 * Search for the News page sidebar.
 *
 * The site is a set of plain files with no server behind it, so searching
 * happens in the visitor's browser: it downloads /index.json (a list of every
 * page, built automatically by Hugo) and filters it as you type.
 *
 * Nothing here needs editing when you add pages or posts.
 */
(function () {
  'use strict';

  var form = document.querySelector('.widget_search .search-form');
  var results = document.querySelector('.widget_search .nv-search-results');
  if (!form || !results) return;

  var input = form.querySelector('.search-field');
  var index = null;
  var loading = false;

  // Grab the search index the first time the visitor interacts with the box.
  function loadIndex() {
    if (index || loading) return Promise.resolve();
    loading = true;
    return fetch(document.body.dataset.searchIndex || '/index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; loading = false; })
      .catch(function () { loading = false; });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // A page matches when every word typed appears in its title or its text.
  function search(query) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return (index || []).filter(function (page) {
      var haystack = (page.title + ' ' + page.content).toLowerCase();
      return words.every(function (w) { return haystack.indexOf(w) !== -1; });
    });
  }

  function snippet(page, query) {
    var text = page.content.replace(/\s+/g, ' ');
    var at = text.toLowerCase().indexOf(query.toLowerCase().split(/\s+/)[0]);
    if (at < 0) return text.slice(0, 120) + (text.length > 120 ? '…' : '');
    var start = Math.max(0, at - 40);
    return (start > 0 ? '…' : '') + text.slice(start, start + 140).trim() + '…';
  }

  function render(matches, query) {
    if (!query) { results.hidden = true; results.innerHTML = ''; return; }
    results.hidden = false;
    if (!matches.length) {
      results.innerHTML = '<p class="nv-search-empty">Nothing found for “' + escapeHTML(query) + '”.</p>';
      return;
    }
    results.innerHTML = '<ul>' + matches.map(function (p) {
      return '<li><a href="' + escapeHTML(p.url) + '">' + escapeHTML(p.title) + '</a>' +
             '<span class="nv-search-snippet">' + escapeHTML(snippet(p, query)) + '</span></li>';
    }).join('') + '</ul>';
  }

  function update() {
    var q = input.value.trim();
    if (!q) { render([], ''); return; }
    loadIndex().then(function () { render(search(q), q); });
  }

  input.addEventListener('focus', loadIndex);
  input.addEventListener('input', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); update(); });
})();
