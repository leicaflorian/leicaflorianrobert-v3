# leicaflorianrobert.dev — V3

The personal website of Leica Florian Robert, version 3 (*Dual Engine*): it opens as a '90s HTML page (**legacy** mode) and, with a button, "starts the engine" and turns into a dark, terminal-style interface (**native** mode).

- **Nuxt 4** with **Tailwind 4**, generated as a static site (`nuxt generate`).
- **Directus 12** for content: texts, projects, experiences, services, technologies, images, form messages.
- **Three languages**: Italian (default, no prefix), English (`/en`), Romanian (`/ro`), with translated URLs.
- The reference design is in `design/` (a Claude Design export; the final pages are `… Dual Engine.dc.html` and `Case Study V3.dc.html`).

Analyses and work plans live in the Obsidian vault, under `Projects/Leica Florian Robert DEV`.

## Running locally

Requires Node 22 (see `.nvmrc`; ESLint doesn't run on Node 20) and Docker.

```bash
npm install

# Directus and PostgreSQL
cp directus/.env.example directus/.env   # then change SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run directus:up
npm run directus:setup                   # schema, public permissions, flows
npm run directus:seed                    # the design's content, in three languages

# the site
cp .env.example .env
npm run dev                              # http://localhost:3000
```

The Directus admin panel is at http://localhost:8055, with the credentials from `directus/.env`.

`?engine=native` (or `?engine=legacy`) in the URL opens a mode directly: handy for screenshots and for sharing a link.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | The site in development |
| `npm run generate` | The static site in `.output/public` (Directus must be reachable: content is read at build time) |
| `npm run typecheck` | Type checking |
| `npm run lint` / `lint:fix` | ESLint (code and formatting); `lint:fix` fixes what it can |
| `npm run directus:up` / `directus:down` | Starts / stops Directus in Docker |
| `npm run directus:setup` | Creates collections, translations, public read permissions and flows. Safe to re-run: skips what already exists |
| `npm run directus:seed` | Loads the design's content. Doesn't touch what's already filled in |
| `npm run directus:snapshot` | Saves the schema to `directus/snapshot.yaml` |
| `node directus/scripts/screenshots.mjs` | Screenshots of project websites that have no image, uploaded to Directus (`--all` to redo them all); typographic projects are skipped |

## How it's built

```
app/
  app.vue                 the current mode's layout and the boot overlay
  layouts/native.vue      header, footer
  layouts/legacy.vue      the '90s hypertext and the «Attiva Rendering Nativo» button
  pages/[...slug].vue     the only route: finds the page (or case study) whose slug matches the path
  components/
    blocks/               one folder per block type, each with Native.vue and Legacy.vue; Renderer.vue
    case-study/           the top of a case study (the project's own fields)
    site/                 header, footer, logo, language, boot overlay
    ui/                   the small pieces: titles with cursor, labels, buttons, images, ASCII portrait
    project/ service/ contact/ legacy/            cards, service illustrations, form and project.json, links
    widget/               the animated widgets (editor, lesson, neofetch) of the Widget block
  composables/
    useEngine.ts          the legacy/native mode, saved in the browser
    useContent.ts         reads from Directus, with the current language's translation (falling back to Italian)
    usePageLink.ts        links to pages by key, the menu, project links
    useContactForm.ts     the form's draft (shared by both engines) and sending it to /contact
  utils/brief.ts          the form's project brief options (type, budget, timeline)
  assets/css/main.css     the design's colors and fonts as Tailwind tokens
i18n/locales/             interface texts (menu, labels, buttons) in it, en, ro
directus/
  docker-compose.yml      Directus and PostgreSQL locally
  scripts/                setup, seed, screenshots
  seed-files/             images the seed uploads (project images and logos, case study screenshots)
  extensions/contact-endpoint   POST /contact: reCAPTCHA v3 and saving to `messages`
  snapshot.yaml           the Directus schema
design/                   the Claude Design export, for reference only
```

**What lives where.** Directus holds everything you might want to change without touching the code, section titles included; the `i18n/locales` files hold the texts that are part of the interface (buttons, form, boot lines). The two cut-out photos and the logo are in `public/imgs`.

**Pages and blocks.** In Directus, `pages` has one item per page, with a translated `slug` (the path) and a `sections` field: an ordered list of blocks of any type (many-to-any). Each block type is its own collection (`block_text`, `block_projects`…, with translations). Projects have `sections` too: a project with `case_study` gets the page `/<projects page slug>/<project slug>`. The menu lists the pages with `in_menu`, in their order. Labels are numbered by the site (`servizi` → `01 / servizi`), except those starting with `//`. Each block has `engines`, to show it in both modes or only in one.

**A new block type** needs: the collection in `BLOCKS` in `directus/scripts/setup.mjs` (setup also adds it to the types allowed in `sections`), its interface in `app/types/content.ts` (and in `Blocks`), its name in `BLOCK_COLLECTIONS` in `useContent.ts`, and `components/blocks/<name>/Native.vue` and `Legacy.vue`, registered in `components/blocks/Renderer.vue`. If the block reads other content (a collection, like the projects), add the composable to `BLOCK_DATA` in the Renderer too.

**Languages.** Every collection with texts has its own `<name>_translations` in Directus. The site downloads all translations and shows the current language's one; an empty field falls back to Italian.

**Modes.** The generated site is always in legacy mode, so the HTML is the same for everyone and complete for search engines. In the browser, after loading, it switches to the saved mode; a script in the page head hides the legacy page from visitors who chose native, to avoid a flash.

## Environment variables

Site (`.env`):

| Variable | |
| --- | --- |
| `NUXT_PUBLIC_DIRECTUS_URL` | The Directus URL: content at generation time, images and form in the browser |
| `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` | The reCAPTCHA v3 public key; if empty, the form is sent without it |

Directus (`directus/.env`, see `directus/.env.example`): `SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RECAPTCHA_SECRET`, `RECAPTCHA_MIN_SCORE`, `CONTACT_EMAIL_TO`, `DEPLOY_WEBHOOK_URL`, `EMAIL_*`.

The schema has over 25 collections, the limit without a license: activate the Directus license from the admin panel (it asks for it once the limit is reached) before running `directus:setup` or applying the snapshot.

## Deployment

The site is static. When content changes in Directus, the «Ricostruisci il sito» (rebuild the site) flow calls `DEPLOY_WEBHOOK_URL` (the Coolify deploy webhook), which regenerates and publishes the site.
