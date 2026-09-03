# portfolio

**Francisco López's personal site, and the small-business landing pages behind it — each
one a self-contained website you can hand over and walk away from.** Live at
<https://flopez-dev.github.io/portfolio>, in Spanish and English.

## The problem this solves

A small business that needs one good page — who you are, what you do, how to reach
you — usually gets offered two bad options: a page-builder subscription that never
stops charging and quietly locks you in, or a full agency engagement priced for a
project ten times the size. Neither leaves the owner with something they actually
control.

## The approach

Every project in this repo is a hand-written page: plain HTML, CSS and JavaScript, no
framework underneath it and no outside service it depends on to keep working. It costs
a fraction of a full build, and the client walks away owning a folder of files that
will still open in a browser in ten years — no subscription to cancel, no platform to
migrate off of if a relationship changes.

This repo is both the proof of that approach and the place it happens: every project
below is real client work or work in progress, shown as a portfolio at the same time
it's the workshop.

## Who this is for

- **A business owner** deciding whether this approach fits before committing to it.
- **Someone already running a site here**, who should be able to open their own
  project folder and understand the whole thing without asking anyone.
- **Anyone continuing this work**, including future me — the ground rules below exist
  so that building "one more page" stays fast and cheap, instead of every project
  quietly growing its own dependencies.

## What you get

- **You can read the whole thing.** No build tools, no framework, nothing to install
  to make sense of what's running. Open the page's source and it's all there.
- **Nothing you depend on lives on someone else's server.** No CDN, no third-party
  script your page needs in order to load. It renders correctly opened straight from
  a hard drive, and it keeps working the same way regardless of what any outside
  service does to its pricing or its API tomorrow.
- **Your site is yours alone.** Each project is one self-contained folder — nothing
  shared, nothing borrowed from another client's project. Handing it over means
  handing over everything, not a slice of a bigger system.
- **Fast and usable by default, not as an afterthought.** Keyboard navigation,
  readable structure, and pages light enough to load well on a slow connection —
  because a visitor who bounces on a bad connection doesn't come back to give it a
  second chance.

## What's live

| Project | What it is | Status |
| --- | --- | --- |
| [INMICA Villarrobledo](https://flopez-dev.github.io/portfolio/inmica/) | Industrial machinery service and repair, Villarrobledo, Spain | Finished client work |
| [The Chantal Verdugo House](https://www.thechantalverdugohouse.com/) | 4-bedroom vacation rental, Floyd, Virginia | Live |
| [Latiguillos La Guía](https://flopez-dev.github.io/portfolio/latiguillos_laguia/) | Hydraulic hose supplier | In progress |
| [Magma Consulting](https://flopez-dev.github.io/portfolio/magma-consulting/) | Telecommunications consultancy | In progress |

Each one also has a write-up at `/proyectos/<slug>` explaining what the business needed
and what got built. The copies linked above are browsable but not indexed: they are shown
as portfolio, and the canonical version of each site is either its own domain or nowhere.

"In progress" projects have the real structure in place but placeholder content —
they're shown as such rather than dressed up to look finished.

## What's deliberately not included

- No CMS or admin panel — updating the content is a text edit, not a login.
- No shared template engine across projects — each one stays simple enough that it
  doesn't need one.
- No analytics or tracking added by default — only if a client asks for it, and only
  ever disclosed when it's there.

## What's next

- Real content for the two projects still in progress.
- A domain of its own for this site, and the Cloudflare deploy that is already written
  and waiting for it.
- Real career detail on the profile page, and the WhatsApp number and LinkedIn link that
  are still placeholders in `src/config.ts`.
- Each individual landing available in both languages, not just this site.

## For developers

```sh
npm install
npm run dev     # http://localhost:4321/portfolio/ — site and every landing
npm run build   # dist/, ready to publish
```

The root is an Astro + Tailwind site. Everything under `projects/` is plain static HTML
with no build step, and stays that way: `integrations/landings.mjs` publishes each one
untouched at its own flat URL, in dev and in the build alike. `diff -r dist/<slug>
projects/<folder>/public` is the check that it stayed untouched.

Adding a project to the portfolio is two markdown files: the record in
`src/content/projects/es/` and its translation in `en/`, which carries the prose and
nothing else. The full technical reference — folder conventions,
deployment, the base-path contract, and the checklist for adding a new business — lives
in [CLAUDE.md](CLAUDE.md).
