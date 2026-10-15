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
| `node directus/scripts/screenshots.mjs` | Screenshots of project websites that have no image, uploaded to Directus (`--all` to redo them all) |

## How it's built

```
app/
  app.vue                 the current mode's layout and the boot overlay
  layouts/native.vue      header, footer
  layouts/legacy.vue      the '90s hypertext and the «Attiva Rendering Nativo» button
  pages/                  one page per route: loads the data and picks the native or legacy version
  components/
    home/ about/ projects/ contact/ case-study/   the two versions of each page (Native.vue, Legacy.vue)
    site/                 header, footer, logo, language, closing banner, boot overlay
    ui/                   the small pieces: titles with cursor, labels, buttons, images
    project/ service/ contact/ legacy/            cards, form, links
  composables/
    useEngine.ts          the legacy/native mode, saved in the browser
    useContent.ts         reads from Directus, with the current language's translation (falling back to Italian)
    useContactForm.ts     sends the form to the Directus /contact endpoint
  assets/css/main.css     the design's colors and fonts as Tailwind tokens
i18n/locales/             interface texts (menu, labels, buttons) in it, en, ro
directus/
  docker-compose.yml      Directus and PostgreSQL locally
  scripts/                setup, seed, screenshots
  extensions/contact-endpoint   POST /contact: reCAPTCHA v3 and saving to `messages`
  snapshot.yaml           the Directus schema
design/                   the Claude Design export, for reference only
```

**What lives where.** Directus holds everything you might want to change without touching the code; the `i18n/locales` files hold the texts that are part of the design (menu items, section titles, buttons). The two cut-out photos and the logo are in `public/imgs`.

**Languages.** Every collection with texts has its own `<name>_translations` in Directus. The site downloads all translations and shows the current language's one; an empty field falls back to Italian.

**Modes.** The generated site is always in legacy mode, so the HTML is the same for everyone and complete for search engines. In the browser, after loading, it switches to the saved mode; a script in the page head hides the legacy page from visitors who chose native, to avoid a flash.

## Environment variables

Site (`.env`):

| Variable | |
| --- | --- |
| `NUXT_PUBLIC_DIRECTUS_URL` | The Directus URL: content at generation time, images and form in the browser |
| `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` | The reCAPTCHA v3 public key; if empty, the form is sent without it |

Directus (`directus/.env`, see `directus/.env.example`): `SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RECAPTCHA_SECRET`, `RECAPTCHA_MIN_SCORE`, `CONTACT_EMAIL_TO`, `DEPLOY_WEBHOOK_URL`, `EMAIL_*`.

## Deployment

The site is static. When content changes in Directus, the «Ricostruisci il sito» (rebuild the site) flow calls `DEPLOY_WEBHOOK_URL` (the Coolify deploy webhook), which regenerates and publishes the site.
