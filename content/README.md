# Editing the site's content

Everything visible on the website lives in this folder. Each file is plain text
you can edit on github.com — click a file, click the pencil, save.

This file is a guide only; it isn't published.

---

## How a file is put together

Every file has two parts. The bit between the `---` lines is the settings, and
everything after is the actual text:

```markdown
---
title: "My New Post"
date: 2026-07-25
authors: ["dpk011"]
---

This is the first paragraph, and it will appear on the page.
```

## Writing text

The text uses Markdown, which is mostly just typing:

```markdown
A normal paragraph. Leave a blank line between paragraphs.

**Bold text** and *italic text*.

[The words people click](https://example.com)

## A heading

- a list item
- another list item
```

---

## Writing a news post

Create a new file in `posts/`. Name it after the web address you want — for
example `posts/holi-2026.md` appears at `aidlaoc.org/holi-2026/`. Use lowercase
with hyphens instead of spaces.

```markdown
---
title: "Holi on the Beach 2026"
date: 2026-03-14
authors: ["dpk011"]
image: /images/holi-2026-banner.jpg
image_alt: "Crowds throwing coloured powder on the sand"
image_width: 930
image_height: 620
---

Join us on the sand for our annual Holi celebration.

{{< image src="/images/holi-crowd.jpg" alt="People celebrating Holi" >}}

{{< youtube id="dQw4w9WgXcQ" title="Last year's Holi" >}}
```

It appears on the News page automatically, newest first. Nothing else to update.

**The settings, one by one:**

| Setting | What it does |
|---|---|
| `title` | The headline |
| `date` | Controls the ordering. A future date still publishes immediately. |
| `authors` | Who wrote it — must match a folder name in `authors/` |
| `image` | Optional banner picture, shown on the News page and atop the post |
| `image_alt` | Describes the picture for blind visitors. Please fill this in. |
| `image_width` / `image_height` | The picture's real size in pixels |
| `tags` | Optional, e.g. `tags: ["covid19"]` — must match a folder in `tags/` |
| `excerpt` | Optional. The preview on the News page. Left out, one is written for you. |

---

## Adding a picture

1. Put the file in `static/images/` (on github.com: open that folder, then
   **Add file → Upload files**).
2. Refer to it as `/images/` plus the filename.

In a post, use the picture shortcut:

```markdown
{{< image src="/images/my-picture.jpg" alt="What the picture shows" >}}
```

Use lowercase filenames with hyphens and no spaces. Resize large photos before
uploading — anything wider than about 1500 pixels is bigger than the site needs
and just makes pages slow.

## Embedding a video or slideshow

```markdown
{{< youtube id="dQw4w9WgXcQ" title="A description of the video" >}}

{{< embed src="https://docs.google.com/presentation/d/e/XXXX/embed" >}}
```

For YouTube, the `id` is the part of the address after `v=`. For Google Slides,
use **File → Share → Publish to web → Embed** and copy the address out of it.

---

## Adding a new page

Create a file here, e.g. `volunteer.md`, and it appears at
`aidlaoc.org/volunteer/`:

```markdown
---
title: "Volunteer With Us"
---

We'd love your help.
```

To put it in the top menu, add a block to the `[menus]` section of `hugo.toml`:

```toml
[[menus.main]]
  name   = 'Volunteer'
  url    = '/volunteer/'
  weight = 5
```

`weight` sets the order — lower numbers sit further left.

**Optional page settings:** `hide_title: true` leaves off the big heading (the
front page uses this); `title_align: left` left-aligns it (Projects and Donate
use this).

---

## Things not to change without care

**`wp_id` numbers.** Several files carry a setting like `wp_id: 545`, left over
from WordPress. Some styling still keys off these numbers, so leave them alone.
New pages don't need one.

**The pages made of raw HTML.** `_index.md` (the front page), `about-us.md`,
`projects.md` and `donate.md` were built with WordPress's visual page builder,
so they're stored as their original HTML rather than Markdown. That's what keeps
them looking identical to the old site. Editing the words between the tags is
safe. Changing the tags and `class="..."` attributes will break the layout — if
you need a real redesign of one of these pages, that's a job worth doing
deliberately rather than in the browser editor.

Posts in `posts/` are ordinary Markdown and are safe to edit freely.

**`authors/` and `tags/`.** Each folder here creates a page listing the relevant
posts. The folder name becomes the web address; the `title` inside is the name
shown to visitors. So `authors/dpk011/` with `title: "Deepak Gupta"` gives a
page at `/author/dpk011/` headed "Deepak Gupta".
