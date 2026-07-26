# CLAUDE.md — working on the AID LA-OC website

Notes for AI agents working in this repository. Read this before changing
templates, CSS, or config. `README.md` and `content/README.md` are written for
human maintainers; this file is the engineering detail behind them.

---

## 1. What this is

A **static site** for the Los Angeles / Orange County chapter of the
Association for India's Development, published at **https://aidlaoc.org**.

- **Generator:** Hugo (extended), pinned to **0.164.0**.
- **Hosting:** GitHub Pages, built and deployed by GitHub Actions on every
  push to `main`.
- **No theme module.** All templates live in `layouts/` in this repo. There is
  no `themes/` directory, no Hugo module, no npm, no Go module, no Sass.
- **No JavaScript build step.** The one hand-written script is
  `static/js/search.js`, plain ES5-ish JS served as-is.

The visual design and its stylesheets originated as an export from a
WordPress/Neve/Gutentor site. That history explains the file and class names
(`wp-blocks.css`, `neve-page.css`, `gutentor-dynamic.css`, `wp_id`, and class
names like `nv-*`, `wp-block-*`, `gutentor-*`). **Treat those stylesheets as
vendored build artifacts, not as code to refactor** — see §6.

### The prime directive

The look of this site is load-bearing and hard to re-derive. Any change that
touches templates, CSS load order, or the raw-HTML pages must be **verified**,
not eyeballed. §8 gives a concrete method. Structural or styling regressions
here are easy to introduce and very hard to notice by reading a diff.

---

## 2. Commands

```sh
hugo server                    # preview at http://localhost:1313, live reload
hugo                           # build to public/
hugo build --gc --minify       # what CI runs
hugo build --gc --minify --baseURL "https://example.com/sub/"   # test a subpath
```

`public/` is gitignored and must never be committed.

`--minify` has been verified not to change rendering (HTML minification can
alter whitespace between inline elements; it does not here). Keep using it.

---

## 3. Repository layout

```
hugo.toml                  site config: menu, params, taxonomies, permalinks
content/                   all page content
  _index.md                  front page          (raw HTML body)
  about-us.md                                    (raw HTML body)
  projects.md                                    (raw HTML body)
  donate.md                                      (raw HTML body)
  news.md                    News list page      (empty body, layout: news)
  holi-on-the-beach.md       intentionally empty
  covid-19.md                intentionally empty, not in the menu
  posts/*.md                 5 news posts        (Markdown + shortcodes)
  authors/<slug>/_index.md   taxonomy terms -> /author/<slug>/
  tags/<slug>/_index.md      taxonomy terms -> /tag/<slug>/
  README.md                  human guide; excluded from the build
layouts/
  baseof.html                page skeleton
  home.html                  front page
  page.html                  standard pages
  news.html                  the News list  (selected via `layout: news`)
  posts/single.html          a single post
  term.html                  author AND tag pages (shared)
  home.json.json             emits /index.json, the search index
  _partials/                 head, header, footer, scripts, sidebar,
                             menu-items, post-card, post-meta, excerpt,
                             tags-list
  _shortcodes/               image, youtube, embed
static/
  css/                       site stylesheets (see §6)
  js/search.js               News page search
  lib/<pkg>/                 vendored third-party libs — do not edit
  images/                    all images, flat, 49 files
  CNAME                      aidlaoc.org
.github/workflows/deploy.yml
```

### Template selection

| Page | Kind/Type | Template | Body classes |
|---|---|---|---|
| `/` | home | `home.html` | `home wp-singular … page-id-N`, `nv-sidebar-full-width nv-without-title` |
| `/about-us/` etc. | page | `page.html` | `wp-singular … page-id-N`, `nv-sidebar-full-width` |
| `/news/` | page + `layout: news` | `news.html` | `blog`, `nv-sidebar-left` |
| `/<post-slug>/` | type `posts` | `posts/single.html` | `wp-singular … postid-N`, `nv-sidebar-full-width` |
| `/author/x/`, `/tag/x/` | term | `term.html` | `archive <kind> <kind>-<slug> <kind>-N`, `nv-sidebar-right` |

`term.html` serves both authors and tags and branches on `.Data.Singular`
(`"author"` wraps the heading in `<span class="vcard">`; tags do not).

---

## 4. URLs

Posts resolve to the **site root**, not `/posts/`:

```toml
[permalinks]
  posts = '/:slug/'
[permalinks.term]         # NOTE: `term`, singular. `terms` is a config error.
  authors = '/author/:slug/'
  tags    = '/tag/:slug/'
```

These URLs are a compatibility surface — external links and bookmarks point at
them. **Do not change a slug** without a deliberate decision.

Several posts set an explicit `slug:` because Hugo would otherwise derive a
wrong one from the title:

- `AID-LA/OC is 2021 Dhadkan Charity Partner` — the `/` becomes a path
  separator, yielding `/aid-la/oc-is-…/`.
- A title containing an HTML entity or typographic apostrophe leaks into the
  slug.

**Always set `slug:` explicitly on new posts.** It is cheap insurance.

`content/{posts,authors,tags}/_index.md` all set `build: {render: never}` so
Hugo does not emit `/posts/`, `/authors/`, `/tags/` listing pages, which the
site does not have templates or links for.

---

## 5. Front matter reference

Every key currently in use:

| Key | Where | Meaning |
|---|---|---|
| `title` | all | Page/post title |
| `slug` | posts, terms | Explicit URL segment — set it (§4) |
| `date` | posts | Ordering on the News page |
| `authors` | posts | List of folder names under `content/authors/` |
| `tags` | posts | List of folder names under `content/tags/` |
| `excerpt` | posts | Preview text on the News page; omit to auto-generate |
| `excerpt_truncated` | posts | Appends a "Read More »" link |
| `image` | posts | Banner + News-page thumbnail |
| `image_alt` / `image_width` / `image_height` | posts | Alt text and intrinsic size |
| `wp_id` | pages, posts, terms | Numeric id baked into body/article CSS classes — **see §7.7** |
| `hide_title` | pages | Omit the `<h1>` block (front page uses this) |
| `title_align` | pages | `left` adds `has-text-align-left` |
| `layout` | `news.md` only | Selects `layouts/news.html` |
| `search` | `news.md` only | Loads `search.css` + `search.js` |
| `neve_variant` | pages | Force the listing stylesheet — **see §7.2** |
| `build` | section `_index.md` | `render: never` |

---

## 6. CSS architecture

**Load order is deliberate and load-bearing.** Later rules override earlier
ones. `layouts/_partials/head.html` emits them in five numbered groups; do not
reorder without verifying (§8).

| File | Origin | Edit? |
|---|---|---|
| `static/css/custom.css` | hand-written | **Yes — put new styles here** |
| `static/css/search.css` | hand-written | Yes (search results only) |
| `static/css/wp-blocks.css` | generated export | No |
| `static/css/global-styles.css` | generated export | No |
| `static/css/neve-page.css` | generated export | No |
| `static/css/neve-archive.css` | generated export | No |
| `static/css/gutentor-dynamic.css` | generated export | No (but see below) |
| `static/css/core-block-supports.css` | generated export | No |
| `static/lib/**` | third-party libraries | No |

`gutentor-dynamic.css` carries the three **front-page slider background
images** as `url(../images/…)`. If slider backgrounds vanish, look here first.

`custom.css` contains rules for a WPForms contact form that does not exist on
this site. They are inert. Leaving them costs nothing; deleting them is safe
but pointless.

### `static/lib/`

Vendored: `jquery`, `slick` (slider), `gutentor`, `wow` (scroll animation),
`neve` (menu behaviour), `fontawesome` (icons — v5, `fas fa-*` classes),
`animate`, `wpness-grid`. Each package keeps its own internal directory shape
so its relative `url()` references to fonts/images still resolve. **Do not
flatten or reorganise these directories.**

Dead weight was already removed after verifying in a browser that it changed
nothing: WordPress editor stylesheets and a duplicate FontAwesome 4. Don't
re-add them.

---

## 7. Traps

Each of these has already caused a real bug in this repo.

### 7.1 `relURL` ignores a leading slash — the subpath trap

```
"/images/a.png" | relURL   →  /images/a.png          ← NOT prefixed
"images/a.png"  | relURL   →  /sub/images/a.png      ← prefixed
```

The site must work both at a domain root and under a subdirectory (a
`user.github.io/repo/` preview). Three mechanisms make that true:

1. **`canonifyURLs = true`** in `hugo.toml` rewrites `src` and `href` against
   `baseURL`. This covers page content, `srcset`, config params, and
   front-matter image paths in one go. **Leave it on.**
2. **CSS uses `url(../images/…)`**, never `url(/images/…)`. `canonifyURLs`
   does not touch files in `static/`.
3. **The search box uses absolute URLs.** `canonifyURLs` only rewrites `src`
   and `href` — so `baseof.html` builds `data-search-index` with `absURL`, and
   `home.json.json` emits `.Permalink`, not `.RelPermalink`.

If images work on the real domain but break on a preview link, it is one of
those three. Verify subpath safety with:

```sh
hugo build --gc --minify --baseURL "https://example.com/sub/"
```

then confirm every `src`/`href`/`srcset`/CSS `url()` starts with `/sub/`.

### 7.2 Two Neve stylesheet variants that must not be merged

`neve-page.css` and `neve-archive.css` are near-identical exports for
different page types. They **conflict**: the page variant contains

```css
#content.neve-main > .container > .row > .nv-sidebar-wrap { max-width: 0%; }
```

which, if served to a listing page, **collapses the News sidebar to nothing**
(it outweighs the archive rule on `#content` specificity). Merging the two
files into one "deduplicated" stylesheet is exactly the wrong move.

Selection lives in `head.html`:

```go
{{- $isListing := or (eq .Type "posts") (eq .Kind "term") (eq .Layout "news") (eq .Params.neve_variant "archive") -}}
```

Note it checks `.Type`/`.Kind`/`.Layout` — **not `.Kind == "page"`**, because
Hugo reports regular posts as kind `page` too. `content/holi-on-the-beach.md`
sets `neve_variant: archive` to match how that page has always been served.

### 7.3 `$` inside `range` is the *list* page, not the item

In `range`, `$` refers to the template's top-level context. Writing
`$.Params.image_width` inside a `range` over posts silently reads the **News
page's** params, producing default dimensions, wrong alt text, and thumbnail
links pointing at the wrong page.

This is why list markup lives in **`_partials/post-card.html`**, called as
`{{ partial "post-card.html" . }}`, where `.` and `$` are both the post.
`news.html` and `term.html` both use it. Keep it that way rather than
inlining article markup into either template.

### 7.4 Content pages are `.md` files containing raw HTML

Hugo 0.164 refuses `.html` files in `content/` by default
(`security.allowContent` excludes `text/html`). Rather than weaken that
policy, the four page-builder pages are `.md` files whose body is raw HTML,
enabled by:

```toml
[markup.goldmark.renderer]
  unsafe = true
```

**Goldmark ends a raw HTML block at the first blank line** and resumes parsing
as Markdown. The HTML bodies of `_index.md`, `about-us.md`, `projects.md` and
`donate.md` therefore contain **no blank lines**. If you edit them, do not
introduce blank lines or the tail of the page will be mangled.

### 7.5 `ignoreFiles` must be a top-level TOML key

```toml
ignoreFiles = ['content/README\.md$']
```

It sits near the top of `hugo.toml`, **before any `[table]` header**. TOML
scopes bare keys to the most recent table, so placing it lower silently makes
it `[permalinks].ignorefiles` and the build fails with a confusing
"permalinks configuration invalid" error.

### 7.6 Two CSS classes are deliberately absent

Posts converted to Markdown lost `wp-block-paragraph` (on `<p>`) and
`wp-image-NNN` (on `<img>`). Both were confirmed to match **zero** rules
across every stylesheet. Do not "restore" them; they are noise.

### 7.7 `wp_id` is not decoration

`wp_id` feeds real CSS hooks: `page-id-N`, `postid-N`, `post-N`, `author-N`,
`tag-N` on `<body>` and `<article>`. Changing or removing one can break
styling. New pages do not need one.

### 7.8 Lazy-loaded images produce false "broken image" reports

`loading="lazy"` images below the fold report `naturalWidth === 0` until
scrolled into view. A check like
`[...document.images].filter(i => i.naturalWidth === 0)` will report healthy
images as broken. **Verify assets by fetching their URLs** and checking status
codes, not by inspecting `naturalWidth`.

### 7.9 Google Fonts are external

`head.html` links Open Sans, Poppins and Work Sans from
`fonts.googleapis.com`. They are the only third-party runtime dependency
besides YouTube/Google Slides embeds inside posts. Self-hosting them is a
reasonable future change but will alter font loading behaviour — verify.

---

## 8. Verifying you did not break the styling

Reading a diff does not prove a CSS or template change is safe. Use an
**A/B computed-style comparison**: capture a fingerprint of the rendered page
before your change, make the change, capture again, and compare.

Serve two builds on different ports (e.g. build to two directories, then
`python3 -m http.server`), open each in a browser, and run:

```js
const H = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16); };
const P = ['display','position','width','height','marginTop','marginBottom',
           'paddingTop','paddingBottom','fontSize','fontFamily','fontWeight',
           'lineHeight','color','backgroundColor','textAlign','borderRadius',
           'maxWidth','opacity','letterSpacing'];
const o = [];
for (const el of document.querySelectorAll('#content *')) {
  if (['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName)) continue;
  const c = getComputedStyle(el), r = el.getBoundingClientRect();
  o.push(el.tagName + '|' + Math.round(r.width) + 'x' + Math.round(r.height) +
         '|' + P.map(p => c[p]).join(','));
}
`n=${o.length} hash=${H(o.join('\n'))} docH=${Math.round(document.body.scrollHeight)}`;
```

Equal `n`, `hash` and `docH` means the change is visually inert. This is how
the site's ~4 MB of unused CSS was removed safely, and how `--minify` was
cleared for use.

Cover at least: the front page, `about-us` (long, block-heavy), `donate`
(FontAwesome accordion icons), `news` (sidebar + listing), and one post.

**Also check link/asset integrity** after structural changes: walk every
`src`, `href`, `srcset` and CSS `url()` in `public/` and confirm the target
exists on disk. Expect exactly one known failure (§10).

---

## 9. Deployment

`.github/workflows/deploy.yml`:

- Triggers on push to `main`, plus manual `workflow_dispatch`.
- Installs Hugo **from the release tarball** into `~/.local/hugo` and adds it
  to `$GITHUB_PATH` (no `sudo`, no apt).
- `--baseURL` comes from `actions/configure-pages` output, **not** from
  `hugo.toml`. This is what lets a `github.io` preview build correctly before
  DNS is pointed.
- Sets `TZ: America/Los_Angeles` so post dates do not shift on a UTC runner.
- Action versions: `checkout@v7`, `configure-pages@v6`,
  `upload-pages-artifact@v5`, `deploy-pages@v5`.

`HUGO_VERSION` in the workflow must stay in step with the Hugo used locally.

**No `.nojekyll` file, and none is needed** — artifact-based Pages deployments
never run Jekyll. Don't add one back.

`static/CNAME` holds `aidlaoc.org`. Repo Settings → Pages must have Source =
"GitHub Actions" and the custom domain set.

Deliberately omitted from the official Hugo workflow: Dart Sass, Go and Node
steps (unused here) and the build cache (a full build takes under 100 ms).

---

## 10. Known intentional state — do not "fix" silently

These are deliberate. Changing them is fine **if the user asks**; doing so
unprompted is scope creep.

1. **`holi-on-the-beach.md` and `covid-19.md` are empty.** "Holi On The Beach"
   is still in the main menu, so it renders a blank page. `covid-19` is not
   linked from anywhere.
2. **One image is missing:** the post `2021-dhadkan-charity-partner` references
   `/images/AID_Partner-1024x576.jpeg`, which does not exist. A comment in the
   file marks the spot. Integrity checks will always report exactly this one
   failure — treat it as the expected baseline, and investigate if the count
   changes.
3. **The footer credit is inherited boilerplate** (`footerText` in
   `hugo.toml`) and does not describe the current stack.
4. **No comments system.** Static site; there were none to preserve.
5. **The front page has a single centred column** of recent posts
   (`style="flex-basis:50%;flex-grow:0;"` with the row centred). It sits in a
   `wp-block-columns` that once held a second column. Letting it span full
   width looks broken, because the post images are `aligncenter`.

### Security note

A Facebook page access token was previously published in this site's HTML. It
is gone. If it has not been revoked in Facebook's developer settings, it
should be. Do not reintroduce any plugin-style widget that embeds credentials
in page source.

---

## 11. Recipes

**Add a post** — create `content/posts/<slug>.md` with `title`, `slug`,
`date`, `authors`, and optionally `image`/`image_alt`/`image_width`/
`image_height`, `tags`, `excerpt`. It appears on `/news/` automatically.

**Add a page** — create `content/<slug>.md`. Add a `[[menus.main]]` block in
`hugo.toml` to link it. Body may be Markdown; only use raw HTML if you must,
and then respect §7.4.

**Add an image** — drop it in `static/images/` (flat, no subdirectories) and
reference `/images/<file>`. Lowercase-hyphenated names.

**Shortcodes** (`layouts/_shortcodes/`):

```
{{< image src="/images/x.jpg" alt="…" [size=] [width=] [height=] >}}
{{< youtube id="VIDEOID" title="…" [align="aligncenter"] >}}
{{< embed src="https://…/embed" [width=] [height=] >}}
```

**Add an author or tag** — create `content/authors/<slug>/_index.md` (or
`tags/`) with `title` (display name), `slug`, and `wp_id`. Reference the
folder name from a post's `authors:`/`tags:` list.

**Restyle something** — add rules to `static/css/custom.css`. Do not edit the
generated exports.

**Change the menu, logo, footer, or favicons** — `[params]` and `[menus]` in
`hugo.toml`.

### Search

`layouts/home.json.json` emits `/index.json` (title, url, date, isPost,
content) for every regular page. `static/js/search.js` fetches it on first
interaction and filters client-side; results render into
`.nv-search-results` in the News sidebar. Adding pages needs no action. Set
`searchExclude: true` in front matter to keep a page out of the index.

Because it is client-side, **the search box must be tested in a browser** —
building successfully proves nothing about it. Test it on a subpath build too
(§7.1).
