# CLAUDE.md

Personal website of Leica Florian Robert, V3 "Dual Engine": Nuxt 4 + Tailwind 4, statically generated, content from Directus 12, three languages. `README.md` covers setup, scripts, env vars and deployment: read it first; this file adds what you need to work on the code.

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
- The mode always starts as `legacy` on the server and on the first client render (identical, SEO-complete HTML). `plugins/engine.client.ts` then applies the URL or `localStorage` (`lfr-engine`) choice; the inline script in `nuxt.config.ts` hides legacy with `engine-native-pending` to avoid a flash. Don't read `localStorage` or `window` during setup.
- `components/site/EngineBoot.vue` is the switch animation; timings are in `useEngine.ts`.

Components are auto-imported with the folder as prefix: `components/home/Hero.vue` → `<HomeHero>`, `ui/Button.vue` → `<UiButton>`, `legacy/Link.vue` → `<LegacyLink>`.

## Content: Directus vs i18n

- **Directus** holds everything editable without code. Read it only through `composables/useContent.ts`: `useSingleton<T>('site')`, `useCollection<T>('projects', filter)`, `usePages()`, `useCaseStudy(slug)`. They fetch all translations once and lift the current locale's fields to the top level, falling back to Italian for empty fields.
- **Pages and blocks**: `pages` (translated `slug`, `in_menu`, `children`) and `projects` have a many-to-any `sections` field; each block type is a collection (`block_*`) with its translations. A page with `children: 'projects'` serves the case studies at `/<its slug>/<project slug>`. README → *Pages and blocks* lists what a new block type needs.
- **`i18n/locales/{it,en,ro}.json`** holds interface texts (buttons, form, boot lines, fixed legacy texts). Section titles and labels belong to the blocks. Add every key to all three files.
- Types for Directus content are in `app/types/content.ts`; translated fields are marked `// translated`.
- Directus text formatting: `**word**` highlights a word (`highlight()` for native via `v-html`, `plain()` for legacy), blank lines separate paragraphs (`paragraphs()`), one item per line for lists (`lines()`). All in `app/utils/text.ts`. Never `v-html` a Directus string without `highlight()`, which escapes it.
- Images are Directus file ids (`FileId`), rendered via `@nuxt/image` with the `directus` provider (see `components/ui/MediaImage.vue`).

### Changing the schema

The schema is code, not clicks. To add a field or collection:

1. Edit `COLLECTIONS` in `directus/scripts/setup.mjs` (helpers `string`, `text`, `boolean`, `choice`, `image`...; translated fields go in `translations`). Put a new collection in its folder in `FOLDERS` (block types go in `blocks` automatically).
2. Add seed content for all three languages in `directus/scripts/seed.mjs`.
3. Update the matching interface in `app/types/content.ts`.
4. Run `npm run directus:setup`, `npm run directus:seed`, then `npm run directus:snapshot` and commit `directus/snapshot.yaml`.

Setup and seed skip what already exists: they add new things but don't alter existing fields or overwrite filled-in content. Field notes in Directus are in Italian, since they are for the site's editor.

`directus/extensions/contact-endpoint/dist/index.js` is hand-written (no build step). It's the `POST /contact` endpoint used by `useContactForm`.

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

## Docs and plans

Analyses and work plans go in the Obsidian vault under `Projects/Leica Florian Robert DEV`, not in this repo.
