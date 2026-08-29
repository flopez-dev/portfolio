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

| Project                                                       | Folder                                | Status         |
| --------------------------------------------------------------- | --------------------------------------- | --------------- |
| [INMICA Villarrobledo](projects/inmica/)                       | `projects/inmica/`                     | Client work     |
| [Latiguillos La Guía](projects/latiguillos_laguia/)            | `projects/latiguillos_laguia/`         | In progress     |
| [Francisco López](projects/myself/)                            | `projects/myself/`                     | In progress     |
| [The Chantal Verdugo House](projects/chantal_verdugo_house/)   | `projects/chantal_verdugo_house/`      | Live            |
| [Magma Consulting](projects/magma_consulting/)                 | `projects/magma_consulting/`           | In progress     |

"In progress" folders are scaffolds — the structure is real, the content isn't yet. They
stay `noindex` and shown as such in the gallery rather than dressed up to look finished.

## Non-goals

- No CMS or admin panel — content changes are a commit, not a login.
- No shared component library or framework migration — the whole point is that each
  landing stays small enough not to need one.
- No analytics or tracking scripts vendored by default — added per-landing only if a
  client asks for it, and disclosed if so.

## Roadmap

- Real content for `projects/latiguillos_laguia/`, `projects/myself/` and
  `projects/magma_consulting/`.
- A short case-study section per finished project (problem, approach, result) once
  there's more than one to compare.
- Full Spanish parity on every individual landing, not just the root gallery.
- A working contact path on the landings that only have a `mailto:` today.

## Definition of done, for a new landing

1. Copy an existing folder under `projects/` and reset `public/index.html`,
   `public/css/styles.css`, `public/js/main.js`.
2. Fill in `<title>`, the meta description and the Open Graph tags for that business.
3. Add real `favicon.ico`/`favicon.svg` and `og.jpg` — they 404 until they exist.
4. Keep `<meta name="robots" content="noindex, nofollow" />` while it's a scaffold; drop
   it only once there's real content.
5. Regenerate its preview: `tools/preview-shots.sh <folder-name>` (bare folder name,
   e.g. `myself`, not `projects/myself`).
6. Add it to the table above and to the root `index.html` gallery (see
   [CLAUDE.md](CLAUDE.md) → "Root portfolio"), linking to `./projects/<folder>/public/`
   — that's the real repo path; the public URL is derived at deploy time (see
   "Deployment" below).
7. If the folder name would make an awkward public URL, add a shorter slug for it to
   the `SLUGS` map in `.github/workflows/deploy-pages.yml`. Most landings don't need
   this — the folder name is the slug by default.
8. Once the business has a domain, add `projects/<folder>/wrangler.jsonc` so it deploys
   to Cloudflare Workers too (see "Deployment" below).
9. Sanity pass: keyboard-only navigation, and nothing moves under
   `prefers-reduced-motion: reduce`.

## Local development

From the repo root (serves the gallery) or from inside any project's `public/` folder
under `projects/`:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

To regenerate every preview screenshot in the gallery:

```sh
tools/preview-shots.sh
```

## Deployment

Two independent deploys run off this repo.

**The root gallery** goes to GitHub Pages. Pushing to `develop` runs
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which
publishes the repo root plus every landing's `public/` folder to
<https://flopez-dev.github.io/portfolio>. Public URLs stay **flat**, at
`/portfolio/<slug>/` — matching how the site was structured before landings moved under
`projects/` — not `/portfolio/projects/<name>/`. The slug is the folder name unless the
workflow's `SLUGS` map says otherwise — see the map in
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) for current
entries. The build rewrites root `index.html`'s `./projects/<folder>/public/` links to
`./<slug>/` in the published copy only — the source keeps the real repo path, so local
preview (`python3 -m http.server` from the repo root) needs no build step.
`projects/inmica/` is additionally marked `noindex` in that published copy — it's a
client preview; the client's own domain is the canonical, indexable URL for that site.

**Each landing with a domain** also deploys on its own, as a Cloudflare Worker serving
its `public/` folder — see `projects/<name>/wrangler.jsonc` for its `name` and `routes`.
Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which finds every `wrangler.jsonc` in the repo and runs `wrangler deploy` from each of
those folders. `wrangler` is pinned as the repo's only dependency, in the root
`package.json`.
