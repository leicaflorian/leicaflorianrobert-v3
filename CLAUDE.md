# CLAUDE.md

Personal website of Leica Florian Robert, V3 "Dual Engine": Nuxt 4 + Tailwind 4, statically generated, content from Directus 12, three languages. `README.md` covers setup, scripts, env vars and deployment: read it first; this file adds what you need to work on the code.

## Superpowers

**Prima di qualsiasi altra cosa si usa Superpowers** (regola del proprietario, 13/10/2026). All'inizio di ogni conversazione, e prima di ogni risposta o azione (anche una domanda di chiarimento), si richiama la skill `superpowers:using-superpowers` e si seguono le skill di Superpowers che riguardano il compito. Il plugin è installato in Claude Code (`/plugin`) e abilitato per il progetto in `.claude/settings.json`, che è versionato perché lo trovi anche una sessione nel cloud. Come si usa in questo progetto (voci del ToDo, worktree, TDD) è nella sezione *Superpowers in questo progetto*, più sotto.

## Commands

```bash
npm run dev          # http://localhost:3000 (needs Directus running: npm run directus:up)
npm run lint         # ESLint, also enforces formatting; lint:fix applies the fixes
npm run typecheck    # run lint and typecheck after every change
npm run generate     # static build; reads Directus at build time
```

Node 22 (`.nvmrc`): ESLint crashes on Node 20. There are no tests. Verify UI changes in the browser, in **both** modes: `?engine=native` and `?engine=legacy` in the URL force one.

## Architecture: two engines

Every page exists twice: **legacy** (a '90s HTML page, Times New Roman, blue links) and **native** (the dark terminal-style design).

- `app/app.vue` renders `<NuxtLayout :name="mode">`, so the layout is `layouts/legacy.vue` or `layouts/native.vue`.
- Pages are built from blocks stored in Directus (see *Content*). `pages/[...slug].vue` is the only route; `components/blocks/Renderer.vue` renders each section with its native or legacy component. Keep the markup out of pages.
- The server renders only legacy blocks, and Nuxt keeps in the payload only the data fetched there. A block that reads other content (`useCollection`...) must also be listed in `BLOCK_DATA` in `Renderer.vue`, or its native component fetches Directus from the browser.
- `components/blocks/<type>/Native.vue` and `Legacy.vue` take the same `block` prop (native also gets `label`, already numbered). **When you change content or behaviour on one, update the other.**
- Native comes in once, legacy stays still: titles are typed in (`UiSectionTitle`/`UiPageTitle` render `UiTyped`, `useTypewriter`; a hand-made title should use `UiTyped` too), and paragraphs and cards take `v-reveal` (`.stagger` on a grid, for its children; `plugins/reveal.ts`). Both run once, after the engine boot, and not with `prefers-reduced-motion`. Give a new native block the same.
- The mode always starts as `legacy` on the server and on the first client render (identical, SEO-complete HTML). `plugins/engine.client.ts` then applies the URL or `localStorage` (`lfr-engine`) choice; the inline script in `nuxt.config.ts` hides legacy with `engine-native-pending` to avoid a flash. Don't read `localStorage` or `window` during setup.
- `components/site/EngineBoot.vue` is the switch animation; timings are in `useEngine.ts`.

Components are auto-imported with the folder as prefix: `components/home/Hero.vue` → `<HomeHero>`, `ui/Button.vue` → `<UiButton>`, `legacy/Link.vue` → `<LegacyLink>`.

## Content: Directus vs i18n

- **Directus** holds everything editable without code. Read it only through `composables/useContent.ts`: `useSingleton<T>('site')`, `useCollection<T>('projects', filter)`, `usePages()`, `useCaseStudy(slug)`. They fetch all translations once and lift the current locale's fields to the top level, falling back to Italian for empty fields.
- **Pages and blocks**: `pages` (translated `slug`, `in_menu`, `children`) and `projects` have a many-to-any `sections` field; each block type is a collection (`block_*`) with its translations. A page with `children: 'projects'` serves the case studies at `/<its slug>/<project slug>`. README → *Pages and blocks* lists what a new block type needs.
- **`i18n/locales/{it,en,ro}.json`** holds interface texts (buttons, form, boot lines, fixed legacy texts). Section titles and labels belong to the blocks. Add every key to all three files.
- Types for Directus content are in `app/types/content.ts`; translated fields are marked `// translated`.
- Directus text formatting: `**word**` highlights a word (`highlight()` for native via `v-html`, `plain()` for legacy), blank lines separate paragraphs (`paragraphs()`), one item per line for lists (`lines()`). All in `app/utils/text.ts`. Never `v-html` a Directus string without `highlight()`, which escapes it.
- Never write the years of experience as a number: `{years}` in any Directus text becomes them (`translateItem` → `withYears()`), counted from `CAREER_START` (2009) in `app/utils/career.ts`, at build time.
- Images are Directus file ids (`FileId`), rendered via `@nuxt/image` with the `directus` provider (see `components/ui/MediaImage.vue`).
- Where the design has no photo, the visuals are code: the service illustrations (`components/service/visual/`, picked by the service `icon`, an uploaded image wins), the ASCII portrait (`UiAsciiPortrait`, from `public/imgs`: the canvas reads its pixels, so it must be same-origin) and the widgets. Animations run only while visible (`useVisibleInterval`) and respect `prefers-reduced-motion`.

### Changing the schema

The schema is code, not clicks. To add a field or collection:

1. Edit `COLLECTIONS` in `directus/scripts/setup.mjs` (helpers `string`, `text`, `boolean`, `choice`, `image`...; translated fields go in `translations`). Put a new collection in its folder in `FOLDERS` (block types go in `blocks` automatically).
2. Add seed content for all three languages in `directus/scripts/seed.mjs`.
3. Update the matching interface in `app/types/content.ts`.
4. Run `npm run directus:setup`, `npm run directus:seed`, then `npm run directus:snapshot` and commit `directus/snapshot.yaml`.

Setup and seed skip what already exists: they add new things but don't alter existing fields or overwrite filled-in content. Field notes in Directus are in Italian, since they are for the site's editor.

`directus/extensions/contact-endpoint/dist/index.js` is hand-written (no build step). It's the `POST /contact` endpoint used by `useContactForm`. It accepts only the project brief keys of `app/utils/brief.ts` (type, budget, timeline): change both together, plus the choices of `messages` in `setup.mjs` and the labels in i18n (`form.brief.options`).

## Routing and i18n

- Locales: `it` (default, no prefix), `en` (`/en`), `ro` (`/ro`). Page paths are the translated `slug`s in Directus; a new page is a new item in `pages`, no code.
- Link to pages by key: `usePageLink()('contact')`, `<UiButton to="contact">`, `<LegacyLink to="contact">`; projects with `useProjectLink()`. Never hardcode paths or use route names.
- Prerendering crawls links from `/`, `/en`, `/ro`: a page that nothing links to won't be generated unless added to `nitro.prerender.routes`.

## Styling

- Tailwind 4, configured in CSS only: `app/assets/css/main.css` (`@theme`). There is no `tailwind.config`.
- Use the theme tokens (`bg-bg`, `text-ink`, `text-muted`, `text-accent`, `border-line-card`, `bg-legacy-face`, `font-legacy`...), not raw hex values. Add a token if one is missing.
- Custom utilities: `page` (the 1120px column), `section-y` (section spacing), `spring` (hover transition).
- In Tailwind 4 `translate-*` and `scale-*` set the CSS `translate` and `scale` properties, not `transform`: `transition-transform` doesn't animate them. Use `spring`, or list them (`transition-[translate]`). Loop animations go behind `motion-safe:`.
- Responsive breakpoint used throughout: `max-[860px]:`.
- `design/` is the Claude Design export, for reference only. The final pages are `* Dual Engine.dc.html` and `Case Study V3.dc.html`; match them when building UI. Don't import from `design/`.

## Code conventions

- Comments, docs and commit messages in **English**.
- `<script setup lang="ts">`, 2-space indent, single quotes, no semicolons, no spaces inside braces (`{mode}`, `import {ref} from 'vue'`), self-closing tags without a space (`<Foo/>`). ESLint enforces these: the rules are in `eslint.config.mjs` and `eslint.config.stylistic` in `nuxt.config.ts`.
- Short JSDoc on composables and exported helpers, explaining the *why*; follow the existing comment density.
- Keep composables in `app/composables/`, pure helpers in `app/utils/` (both auto-imported).

## Documentation

The documentation lives in the Obsidian vault on Google Drive, not in this repository (apart from `README.md`, `CHANGELOG.md` if present, and this file):

`/Users/florianleica/Library/CloudStorage/GoogleDrive-florian.leica@gmail.com/Il mio Drive/MyVault/Projects/Leica Florian Robert DEV`

- Start from `_index.md`. The folder follows the vault standard (`MyVault/Template/Standard dei progetti.md`): `01 - Documentazione funzionale` (what the user sees), `02 - Documentazione tecnica` (how it works), `03 - Branding/`, `ToDo/` (one folder per item).
- The infrastructure (Coolify, Droplet, shared MySQL, DNS) is documented for all projects in `MyVault/Infrastruttura`. The personal brand (logo, colours, font) is `03 - Branding/Branding personale.md`.
- Notes are in Italian. Rules (re-read the standard before writing): no `#` title at the top except in `_index` notes; at the top of the text only the `←` link back to the folder's `_index`; links to nearby notes in the properties (`funzioni`, `tecnica`), quoted, with the full path when the name repeats in the vault; a new note is added to its folder's `_index`. Edit existing notes by replacement and re-read them right before. Never put secrets in the notes. `python3 MyVault/_scripts/vault-check.py "Leica Florian Robert DEV"` checks the folder.
- **ToDo items**: `brainstorming` writes `ToDo/_Opened/<Title>/Analisi.md` and `writing-plans` writes `ToDo/_Opened/<Title>/Piano.md`, from `MyVault/Template/Template - Analisi.md` and `Template - Piano d'azione.md`, in Italian; the `←` line points to `[[Projects/Leica Florian Robert DEV/ToDo/_index|ToDo]]`. Do not use `docs/superpowers/`. A finished item moves to `_Done` only after the owner's check (rules in `ToDo/_index.md`).
- "Update the documentation" means the vault **and** `README.md`.
- To read the vault without prompts, add `Projects/Leica Florian Robert DEV`, `Infrastruttura` and `Template` to `permissions.additionalDirectories` in `.claude/settings.local.json` (personal, not versioned).
- Vault notes are not in git and are never committed. If the vault can't be read (e.g. in a cloud session), stop and say so.
