# AID LA-OC website

The website for the Los Angeles / Orange County chapter of the Association for
India's Development, at **https://aidlaoc.org**.

It used to run on WordPress. It is now a **static site**: a set of plain HTML
files built ahead of time by [Hugo](https://gohugo.io). There is no database,
no login page, no plugins and no software to keep patched. Publishing happens
by editing a text file in this repository.

---

## Making a change

You do not need to install anything. Everything can be done from github.com.

1. Find the file you want to change (see [What's where](#whats-where) below).
2. Click the pencil icon to edit it.
3. Describe your change in the box at the bottom and click **Commit changes**.
4. Wait a minute or two, then reload the site. Your change is live.

Step 4 is automatic — a robot rebuilds and republishes the site every time
something changes. You can watch it happen under the repository's **Actions**
tab. If a change ever fails to appear, that tab will show a red mark and the
reason.

To undo something, open the **Commits** list, find the change, and revert it.
Nothing is ever really lost.

---

## What's where

```
content/          The words on the site — this is what you'll edit
  _index.md         the front page
  about-us.md       the About Us page
  projects.md       the Projects page
  donate.md         the Donate page
  news.md           the News / Events page (the list builds itself)
  holi-on-the-beach.md   currently empty
  covid-19.md            currently empty, not linked from the menu
  posts/            one file per news post
  authors/          one folder per author
  tags/             one folder per tag

hugo.toml         Site settings: the menu, the logo, the footer text
layouts/          The page templates — the shape of the pages
static/           Files served as-is
  images/           every picture on the site
  css/              stylesheets carried over from WordPress
  lib/              third-party libraries — don't edit
  js/               the News page search box
.github/workflows/deploy.yml   the robot that publishes the site
```

There is a second, shorter guide at **[content/README.md](content/README.md)**
covering the day-to-day jobs: writing a post, adding a picture, adding a page.

---

## Common jobs

| I want to… | Do this |
|---|---|
| Fix a typo | Edit the matching file in `content/` |
| Write a news post | Add a file to `content/posts/` — see [content/README.md](content/README.md) |
| Add a picture | Upload to `static/images/`, then reference it as `/images/yourfile.jpg` |
| Change a menu link | Edit the `[menus]` section of `hugo.toml` |
| Change the footer text | Edit `footerText` in `hugo.toml` |
| Change the logo | Replace the file in `static/images/`, update `logo` in `hugo.toml` |
| Restyle something | Add rules to `static/css/custom.css` |

---

## Working on your own computer (optional)

Only needed if you want to preview changes before publishing.

```sh
brew install hugo     # macOS; see gohugo.io for other systems
hugo server           # then open http://localhost:1313
```

The preview reloads as you save. Stop it with Ctrl-C. `hugo server` never
touches the live site — publishing only happens when you commit.

Build with `hugo`; the finished site lands in `public/`, which is deliberately
not committed.

---

## How the styling was preserved

The goal was for the new site to look exactly like the old one. To make that
safe rather than hopeful, every page was measured in a browser — the size,
position, font, colour and spacing of every element — and compared against the
same page on the old server. Seven of the twelve pages match to the pixel. The
five news posts differ only in two CSS class names that no stylesheet uses.

Because of that, the stylesheets in `static/css/` are mostly **machine-generated
exports from WordPress**. They are not meant to be read or hand-edited:

| File | What it is |
|---|---|
| `custom.css` | **The one to edit.** Hand-written styles, carried over from WordPress. |
| `neve-page.css` / `neve-archive.css` | Theme settings. Two versions — see the comment in `layouts/_partials/head.html`. |
| `wp-blocks.css` | WordPress block styling |
| `global-styles.css` | Colour and spacing presets |
| `gutentor-dynamic.css` | Styling for specific homepage/Donate blocks, including the slider background images |
| `core-block-supports.css` | Two small alignment rules |
| `search.css` | The search results — the only styling written from scratch |

The order these load in matters. `layouts/_partials/head.html` explains why.

---

## Things worth knowing

**Two pages are blank.** `holi-on-the-beach.md` and `covid-19.md` have no
content. They were blank on the old WordPress site too. "Holi On The Beach" is
still in the top menu, so visitors clicking it reach an empty page — that was
already true before the move and was left as-is deliberately. Add text to the
file to fix it, or remove the entry from `[menus]` in `hugo.toml`.

**One picture is missing.** The post "AID-LA/OC is 2021 Dhadkan Charity
Partner" refers to `AID_Partner-1024x576.jpeg`, which had been deleted from the
WordPress media library — the old site showed a broken image there too. The
post has a comment marking the spot: add the file to `static/images/`, or
delete that line.

**The footer still credits WordPress.** It reads "Neve | Powered by WordPress",
which is no longer true. It was kept to match the old site exactly. Change
`footerText` in `hugo.toml` when you want.

**A Facebook access token is no longer published.** The old homepage carried a
live Facebook feed whose script embedded a page access token in the HTML of
every page, visible to anyone viewing the source. The feed has been removed and
the token with it. If that token was ever valid, it is worth revoking it in
Facebook's developer settings.

### What was dropped, and why

- **The Facebook feed** on the homepage. Removed at your request. The remaining
  posts list keeps its original width and is now centred.
- **Comments** on posts. Static sites can't accept them, and there were none.
- **Amazon Polly** text-to-speech. It loaded on every page and displayed
  nothing at all.
- **~4 MB of unused CSS and fonts** — WordPress's editor styles and a second,
  redundant copy of FontAwesome. Both were checked in a browser first: removing
  them changed nothing on any page.

### What replaced something

- **Search** on the News page now runs in the visitor's browser using
  `static/js/search.js` and a list of pages Hugo rebuilds automatically. It
  needs no server.
