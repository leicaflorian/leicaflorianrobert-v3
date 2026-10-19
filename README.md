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
npx playwright install chromium         # prints the CV to PDF in npm run generate

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
| `npm run generate` | The static site in `.output/public` (Directus must be reachable: content is read at build time), then `sitemap.xml` and `robots.txt` (`scripts/seo-files.mjs`) and the CV PDFs (`scripts/cv-pdf.mjs`) |
| `npm run cv:pdf` | Prints the CV PDFs again from an existing `.output/public` |
| `npm run typecheck` | Type checking |
| `npm run lint` / `lint:fix` | ESLint (code and formatting); `lint:fix` fixes what it can |
| `npm run directus:up` / `directus:down` | Starts / stops Directus in Docker |
| `npm run directus:setup` | Creates collections, translations, public read permissions and flows. Safe to re-run: skips what already exists |
| `npm run directus:seed` | Loads the design's content. Doesn't touch what's already filled in |
| `npm run directus:snapshot` | Saves the schema to `directus/snapshot.yaml` |
| `node directus/scripts/screenshots.mjs` | Screenshots of project websites that have no image, uploaded to Directus (`--all` to redo them all); typographic projects are skipped |
| `scripts/cover-preview.html` | Open in the browser: the project covers drawn with the files in `directus/seed-files`, to try a new project's screenshot and logo before loading them (crop a logo file to its drawing, with no transparent margin: it fills its tile). Keep it in step with `ProjectCover` |

## How it's built

```
app/
  app.vue                 the current mode's layout and the boot overlay
  layouts/native.vue      header, footer
  layouts/legacy.vue      the '90s hypertext, the «Attiva Rendering Nativo» button and the first-visit nudge
  pages/[...slug].vue     the only route: finds the page (or case study) whose slug matches the path
  components/
    blocks/               one folder per block type, each with Native.vue and Legacy.vue; Renderer.vue
    case-study/           the top of a case study (the project's own fields)
    site/                 header, footer, logo, language, boot overlay
    ui/                   the small pieces: typed titles with cursor, labels, buttons, images, ASCII portrait
    project/ service/ contact/ legacy/            cards, covers and their illustrations, service illustrations, form and project.json, links
    widget/               the animated widgets (editor, lesson, neofetch) of the Widget block
  composables/
    useEngine.ts          the legacy/native mode, saved in the browser
    useContent.ts         reads from Directus, with the current language's translation (falling back to Italian)
    usePageLink.ts        links to pages by key, the menu, project links
    useContactForm.ts     the form's draft (shared by both engines) and sending it to /contact
    useTypewriter.ts      native titles typed in as they come into view (UiTyped)
  plugins/reveal.ts       v-reveal: native paragraphs and cards fade in as they come into view
  utils/brief.ts          the form's project brief options (type, budget, timeline)
  assets/css/main.css     the design's colors and fonts as Tailwind tokens
i18n/locales/             interface texts (menu, labels, buttons) in it, en, ro
directus/
  docker-compose.yml      Directus and PostgreSQL locally
  scripts/                setup, seed, screenshots
  seed-files/             images the seed uploads (project images and logos, case study screenshots)
  extensions/contact-endpoint   POST /contact: reCAPTCHA v3 and saving to `messages`
  extensions/noindex-hook       X-Robots-Tag: noindex, nofollow on every response
  snapshot.yaml           the Directus schema
design/                   the Claude Design export, for reference only
```

**What lives where.** Directus holds everything you might want to change without touching the code, section titles included; the `i18n/locales` files hold the texts that are part of the interface (buttons, form, boot lines). The two cut-out photos and the logo are in `public/imgs`.

**Pages and blocks.** In Directus, `pages` has one item per page, with a translated `slug` (the path) and a `sections` field: an ordered list of blocks of any type (many-to-any). Each block type is its own collection (`block_text`, `block_projects`…, with translations). Projects have `sections` too: a project with `case_study` gets the page `/<projects page slug>/<project slug>`. The menu lists the pages with `in_menu`, in their order. Labels are numbered by the site (`servizi` → `01 / servizi`), except those starting with `//`. Each block has `engines`, to show it in both modes or only in one.

**A new block type** needs: the collection in `BLOCKS` in `directus/scripts/setup.mjs` (setup also adds it to the types allowed in `sections`), its interface in `app/types/content.ts` (and in `Blocks`), its name in `BLOCK_COLLECTIONS` in `useContent.ts`, and `components/blocks/<name>/Native.vue` and `Legacy.vue`, registered in `components/blocks/Renderer.vue`. If the block reads other content (a collection, like the projects), add the composable to `BLOCK_DATA` in the Renderer too.

**Replacing a project image or logo.** Replace the file in `directus/seed-files/` (the seed never overwrites a filled-in field), then in Directus upload it as a **new file** and point the project to it. Don't replace the content of the old file (`PATCH /files/<id>`): its URL stays the same and Directus serves assets with `Cache-Control: public, max-age=2592000`, so a browser that already loaded it keeps the old image for up to 30 days. The old file can then be deleted from the library.

**A project that can't be shown.** Instead of a screenshot, a project can pick an illustration drawn in code with its `visual` field (today only `banking`, a client area like an online bank's, used by the investment platform): it fills the cover's browser window, with no domain in the bar and no logo tile. A new illustration needs its value in the `visual` choices in `setup.mjs` and in `ProjectVisual` in `app/types/content.ts`, its components in `components/project/visual/<name>/`, wired into `ProjectCover`, and a copy in `scripts/cover-preview.html`.

**The CV.** `pages/cv.vue` is the one route outside the Directus pages: a bare A4 sheet (no layout, no engine) at `/cv`, `/en/cv`, `/ro/cv`, listed in `nitro.prerender.routes` since nothing links to it, and `noindex`. It's built from the same content as the site (`useCvData()`: `site`, the About header intro as the profile, `experiences`, the daily and production `technologies`, plus `education` and `spoken_languages`), with no data the site doesn't already show. It fits one page: the experiences go in newest first while they fit, and the title then says how many are shown. After `nuxt generate`, `scripts/cv-pdf.mjs` opens the three pages in headless Chromium and saves `/cv/leica-florian-robert-cv-<locale>.pdf`; it fails the build on an empty or dark sheet, a grey column that overflows, a CV past one page, or when Chromium is missing. The «Scarica CV» button (`useCvLink()`) shows on the blocks with `cv_button` on (the About header and Contact info). In `npm run dev` the PDFs aren't generated: a dev-only handler (`scripts/cv-dev.mjs`, in `devServerHandlers`) prints one on request from the dev server's `/cv` page, so the button works as online (the first download takes a few seconds, while Chromium starts). The printing and its checks are in `scripts/cv-print.mjs`, shared by both.

**Languages.** Every collection with texts has its own `<name>_translations` in Directus. The site downloads all translations and shows the current language's one; an empty field falls back to Italian.

**Modes.** The generated site is always in legacy mode, so the HTML is the same for everyone and complete for search engines. In the browser, after loading, it switches to the saved mode; a script in the page head hides the legacy page from visitors who chose native, to avoid a flash. A first visit (no mode saved yet) gets a nudge (`components/legacy/Nudge.vue`): the legacy page glitches at random intervals (not with `prefers-reduced-motion`) and after 8 seconds a '90s dialog offers native. Either answer is saved as the mode, so it never comes back; to see it again, clear `lfr-engine` from `localStorage` (note that `?engine=` saves the mode too).

**Sitemap and robots.** After `nuxt generate`, `scripts/seo-files.mjs` reads the generated pages and writes `sitemap.xml` (each page at its canonical URL, with its translations as `hreflang` links; `noindex` pages such as the CV are left out) and `robots.txt`, which points to it. Both use the i18n `baseUrl`, the address of the canonical links. They exist only in the generated site, not in `npm run dev`.

**Native entrance animations.** In native, titles type themselves in and paragraphs and cards fade in, once, the first time they come into view; legacy stays static. Page and section titles get it through `UiPageTitle` / `UiSectionTitle`, which render `UiTyped` (`useTypewriter`); for any other title use `<UiTyped as="h2">`. For text and cards add the `v-reveal` directive (`app/plugins/reveal.ts`), or `v-reveal.stagger` on a container to reveal its direct children one after the other. Use them in new native blocks. Both wait for the engine boot to end and are off with `prefers-reduced-motion`.

## Environment variables

Site (`.env`):

| Variable | |
| --- | --- |
| `NUXT_PUBLIC_DIRECTUS_URL` | The Directus URL: content at generation time, images and form in the browser |
| `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` | The reCAPTCHA v3 public key; if empty, the form is sent without it |
| `NUXT_PUBLIC_SITE_URL` | The site's own URL, shown as the website in the CV; defaults to `https://leicaflorianrobert.dev` |

Directus (`directus/.env`, see `directus/.env.example`): `SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RECAPTCHA_SECRET`, `RECAPTCHA_MIN_SCORE`, `CONTACT_EMAIL_TO`, `DEPLOY_WEBHOOK_URL`, `DEPLOY_WEBHOOK_TOKEN`, `EMAIL_*`.

The schema has over 25 collections, the limit without a license: activate the Directus license from the admin panel (it asks for it once the limit is reached) before running `directus:setup` or applying the snapshot.

## Deployment

Production runs on Coolify, as two apps in the `Personali` project. The V2 is archived at `https://v2.leicaflorianrobert.dev` (its own app, `leicaflorianrobert-v2`).

| Coolify app | Build | Files | Domain |
| --- | --- | --- | --- |
| `leicaflorianrobert-v3` (the site) | Dockerfile, port 80 | `Dockerfile`, `nginx.conf`, `.dockerignore` | `https://leicaflorianrobert.dev` (`www.` redirects to it) |
| `leicaflorianrobert-v3-directus` | Docker Compose, base directory `/directus` | `directus/docker-compose.prod.yml`, `directus/Dockerfile` | `https://cms.leicaflorianrobert.dev` (also `https://cms-v3.164.90.206.43.sslip.io`) |

**The site** is built in two stages: `node:22-bookworm-slim` runs `npm ci`, `npx playwright install --with-deps chromium` and `npm run generate` (pages, sitemap, robots and the three CV PDFs), then `nginx:1.29-alpine` serves `.output/public` (`try_files $uri $uri/index.html`, Nuxt's `404.html`, `/_nuxt/` cached for a year, gzip, and 301 redirects from the V2 addresses: its pages to their V3 address, its files (`/img`, `/storage`, `/build`) to `v2.leicaflorianrobert.dev`). Directus must be up and filled in when the site builds. Build-time variables (set as build variables in Coolify): `NUXT_PUBLIC_DIRECTUS_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`. The i18n `baseUrl` in `nuxt.config.ts` is hardcoded to `https://leicaflorianrobert.dev`.

**Directus** is `postgres:17-alpine` (volume `database`) plus `directus/directus:12.5.0` with `directus/extensions` copied in (volume `uploads` for the files). The compose uses Coolify's generated values: `SERVICE_FQDN_DIRECTUS_8055` (domain and port), `PUBLIC_URL` from `SERVICE_URL_DIRECTUS`, `SECRET` from `SERVICE_BASE64_64_SECRET`, `ADMIN_PASSWORD` from `SERVICE_PASSWORD_ADMIN`, the database password from `SERVICE_PASSWORD_POSTGRES`. Set in Coolify: `ADMIN_EMAIL`, `CORS_ORIGIN` (the site's domains, comma-separated), `RECAPTCHA_SECRET`, `RECAPTCHA_MIN_SCORE`, `CONTACT_EMAIL_TO`, `DEPLOY_WEBHOOK_URL`, `DEPLOY_WEBHOOK_TOKEN`, `EMAIL_*` (`EMAIL_TRANSPORT` defaults to `sendmail`; the `EMAIL_SMTP_*` variables are ready). The CMS stays out of search engines: `extensions/noindex-hook` adds `X-Robots-Tag: noindex, nofollow` to every response, and `ROBOTS_TXT` lets crawlers read it (with Directus's default `Disallow: /` they'd never see the header, and the image addresses linked from the site could still be indexed). The healthcheck is `/server/ping`: in Directus 12 `/server/health` answers 403 to anonymous requests, the container turns unhealthy and the proxy doesn't route it.

**Push to deploy**: a GitHub webhook (push only) to Coolify's `/webhooks/source/github/events/manual` rebuilds both apps on every push to `main`; builds run one at a time.

**Rebuild on content change**: the «Ricostruisci il sito» flow sends `POST {{DEPLOY_WEBHOOK_URL}}` with `Authorization: Bearer {{DEPLOY_WEBHOOK_TOKEN}}`. `DEPLOY_WEBHOOK_URL` is `https://<coolify>/api/v1/deploy?uuid=<site app uuid>&force=true`: without `force`, Coolify finds an image already built for that commit and only restarts it; `DEPLOY_WEBHOOK_TOKEN` is a Coolify API token with the `deploy` permission only. Both are in `FLOWS_ENV_ALLOW_LIST`. A push rebuilds Directus too, and the site build can start while it's still restarting: the `Dockerfile` runs `scripts/wait-directus.mjs` (up to five minutes on `/server/ping`) before `npm run generate`.

**A new Directus**: deploy it, activate the license in the panel, then run setup and seed from your machine against it:

```bash
export DIRECTUS_URL=https://cms.leicaflorianrobert.dev
export ADMIN_EMAIL=...        # the production admin
export ADMIN_PASSWORD=...     # SERVICE_PASSWORD_ADMIN in Coolify
npm run directus:setup
npm run directus:seed
```

Then deploy the site: a site build against an empty Directus fails.

