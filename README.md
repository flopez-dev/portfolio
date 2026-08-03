# portfolio

**A portfolio of hand-built static landing pages, one folder per business.** Live at
<https://flopez-dev.github.io/portfolio>.

## Why this exists

Most small, local businesses get one of two options for a website: a template on a
page-builder SaaS with a monthly bill and someone else's JavaScript, or nothing at all
because a "real" agency quote doesn't make sense for a single landing page. Neither
option gives the owner something they actually control.

The bet behind this repo: for a business that needs one good page — who you are, what
you do, how to reach you — a hand-written static site delivers most of the value of a
full build, at a fraction of the cost and none of the ongoing dependency. No CMS to
patch, no subscription, no build pipeline to go stale. The client ends up owning a
folder of plain files that will still open in a browser in ten years.

This repo is both the proof of that bet and the workshop where it gets executed: every
landing here is real client work or a project in progress, and the root of the repo is
the portfolio that shows it.

## Who this is for

- **Prospective clients**, deciding whether this approach fits their business before
  they commit to it.
- **The businesses running a site here** (INMICA, and whoever's next), who should be
  able to open their own folder and understand the whole thing.
- **Me**, as the person maintaining all of it — the constraints below exist so that "one
  more landing" stays cheap to build and cheap to hand off, instead of accumulating
  framework debt one project at a time.

## Product principles

These aren't style preferences — each one is a decision, made for a reason:

- **No build step, no framework.** A client (or a future me) should be able to open
  `index.html` in a text editor and understand the entire page. Nothing to install,
  nothing to fall out of date.
- **No CDN, no third-party runtime.** A page must render correctly straight from disk
  (`file://`) and on the cheapest static hosting there is. Every font, icon and script
  is vendored into the landing's own `assets/` — nothing the business depends on lives
  on a server I don't control.
- **Assets stay scoped.** A landing never reaches into another landing's folder. Handing
  a client their site means handing them one self-contained directory, not "the repo
  minus some parts."
- **An accessibility and performance floor, by default.** Semantic HTML, visible focus
  states, `prefers-reduced-motion` respected, and pages light enough to load well on a
  slow connection — because the businesses this is for don't get a second chance if a
  visitor bounces.

Full technical conventions (folder skeleton, naming, how the root gallery is built) live
in [CLAUDE.md](CLAUDE.md).

## What's live

| Project                                        | Folder                    | Status         |
| ----------------------------------------------- | -------------------------- | --------------- |
| [INMICA Villarrobledo](inmica/)                 | `inmica/`                  | Client work     |
| [Latiguillos La Guía](latiguillos_laguia/)      | `latiguillos_laguia/`      | In progress     |
| [Francisco López](myself/)                      | `myself/`                  | In progress     |
| [The Chantal Verdugo House](chantal_verdugo_house/) | `chantal_verdugo_house/` | In progress     |

"In progress" folders are scaffolds — the structure is real, the content isn't yet. They
stay `noindex` and shown as such in the gallery rather than dressed up to look finished.

## Non-goals

- No CMS or admin panel — content changes are a commit, not a login.
- No shared component library or framework migration — the whole point is that each
  landing stays small enough not to need one.
- No analytics or tracking scripts vendored by default — added per-landing only if a
  client asks for it, and disclosed if so.

## Roadmap

- Real content for `latiguillos_laguia/`, `myself/` and `chantal_verdugo_house/`.
- A short case-study section per finished project (problem, approach, result) once
  there's more than one to compare.
- Full Spanish parity on every individual landing, not just the root gallery.
- A working contact path on the landings that only have a `mailto:` today.

## Definition of done, for a new landing

1. Copy an existing folder and reset `index.html`, `css/styles.css`, `js/main.js`.
2. Fill in `<title>`, the meta description and the Open Graph tags for that business.
3. Add real `favicon.ico`/`favicon.svg` and `og.jpg` — they 404 until they exist.
4. Keep `<meta name="robots" content="noindex, nofollow" />` while it's a scaffold; drop
   it only once there's real content.
5. Regenerate its preview: `tools/preview-shots.sh <folder-name>`.
6. Add it to the table above and to the root `index.html` gallery (see
   [CLAUDE.md](CLAUDE.md) → "Root portfolio").
7. Sanity pass: keyboard-only navigation, and nothing moves under
   `prefers-reduced-motion: reduce`.

## Local development

From the repo root (serves the gallery) or from inside any landing folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

To regenerate every preview screenshot in the gallery:

```sh
tools/preview-shots.sh
```

## Deployment

Pushing to `develop` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml),
which publishes the repo root plus every folder that has an `index.html` to GitHub
Pages, at <https://flopez-dev.github.io/portfolio>. `inmica/` is additionally marked
`noindex` in that published copy — it's a client preview; the client's own domain is the
canonical, indexable URL for that site.
