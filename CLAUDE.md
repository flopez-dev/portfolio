# CLAUDE.md

## What this repo is

A collection of independent landing pages, one folder per business. Each folder is a
self-contained static site that can be deployed on its own.

## Structure

Every landing folder follows the same skeleton:

```
<business>/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── assets/
    └── img/
```

Current landings: `inmica/`, `latiguillos_laguia/`, `myself/`.

## Constraints

- **No build step.** No framework, no bundler, no package manager. Plain HTML, CSS and JS.
- **No CDN or external dependencies.** A page must render correctly opened straight from
  disk (`file://`) and on plain static hosting. Fonts, icons and scripts are vendored into
  the landing's own `assets/`.
- **Assets stay scoped.** A landing never references files from another landing. If two
  landings need the same thing, duplicate it — there is no `shared/` folder.
- **Relative paths only.** No leading `/` in `href`/`src`, so a folder works from any
  subpath on a host.

## Conventions

- Folder names: lowercase, underscores instead of spaces (`my_business`).
- One `index.html` per landing; extra pages sit alongside it in the same folder.
- Keep `index.html` semantic: `<header>`, `<main>` with sections, `<footer>`.
- Every page carries `<title>`, `<meta name="description">` and Open Graph tags filled in
  for that specific business.
- CSS uses custom properties declared on `:root` for the palette and type scale.
- `main.js` is loaded with `defer`.

## Local preview

From inside a landing folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Adding a new business

1. Copy an existing landing folder and rename it after the business.
2. Reset the content of `index.html`, `css/styles.css` and `js/main.js`.
3. Update `<title>`, the meta description and the Open Graph tags.
4. Drop `favicon.ico` and `og.jpg` into `assets/img/` — `index.html` already points at
   both, and they 404 until the real files are added.
5. Add the business to the table in `README.md`.
