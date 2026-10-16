// Creates the site schema, public read permissions and flows in Directus.
// Safe to re-run: skips what already exists.
//
//   node directus/scripts/setup.mjs

import {api, waitForDirectus} from './api.mjs'

// --- fields ------------------------------------------------------------------------------

const id = () => ({
  field: 'id', type: 'integer',
  meta: {hidden: true, readonly: true, interface: 'input'},
  schema: {is_primary_key: true, has_auto_increment: true},
})
const sort = () => ({field: 'sort', type: 'integer', meta: {hidden: true, interface: 'input'}, schema: {}})
const string = (field, note, extra = {}) => ({
  field, type: 'string', meta: {interface: 'input', note, width: extra.width ?? 'full', required: extra.required ?? false}, schema: {default_value: extra.default ?? null},
})
const text = (field, note) => ({field, type: 'text', meta: {interface: 'input-multiline', note}, schema: {}})
const integer = (field, note, width = 'half') => ({field, type: 'integer', meta: {interface: 'input', note, width}, schema: {}})
const boolean = (field, note, defaultValue = false) => ({
  field, type: 'boolean', meta: {interface: 'boolean', note, width: 'half', special: ['cast-boolean']}, schema: {default_value: defaultValue},
})
const choice = (field, note, choices, defaultValue) => ({
  field, type: 'string',
  meta: {interface: 'select-dropdown', note, width: 'half', options: {choices: choices.map(([value, label]) => ({value, text: label}))}, display: 'labels'},
  schema: {default_value: defaultValue},
})
const image = (field, note) => ({field, type: 'uuid', meta: {interface: 'file-image', note, special: ['file'], width: 'half'}, schema: {}})
const label = note => string('label', note ?? 'Etichetta piccola sopra il titolo, numerata in automatico: «servizi» → «01 / servizi»')
const title = note => string('title', note ?? 'Titolo')

/**
 * A block type: one collection per type, with its translations. Blocks are hidden from the menu:
 * they're edited from the page (or project) they belong to, in its `sections` field.
 */
const block = (collection, {icon, note, fields = [], translations}) => ({
  collection, icon, note, hidden: true, sortable: false,
  display: '{{translations.title}}',
  fields: [
    choice('engines', 'In quale modalità si vede', [['both', 'Entrambe'], ['native', 'Solo native'], ['legacy', 'Solo legacy']], 'both'),
    ...fields,
  ],
  translations,
})

// --- collections -------------------------------------------------------------------------
// `fields`: the collection's fields; `translations`: the translated fields, in `<name>_translations`.

const COLLECTIONS = [
  {
    collection: 'site',
    singleton: true,
    icon: 'badge',
    note: 'I dati della persona e dell\'attività: header, footer, Contatti.',
    fields: [
      string('name', 'Nome e cognome', {width: 'half'}),
      boolean('available', 'Mostra «Disponibile per nuovi progetti»', true),
      string('email', null, {width: 'half'}),
      string('pec', null, {width: 'half'}),
      string('street', 'Via e numero', {width: 'half'}),
      string('postal_code', 'CAP', {width: 'half'}),
      string('city', null, {width: 'half'}),
      string('province', 'Sigla', {width: 'half'}),
      string('vat', 'Partita IVA', {width: 'half'}),
      string('rea', null, {width: 'half'}),
      string('sdi', 'Codice destinatario', {width: 'half'}),
      string('github', 'URL del profilo', {width: 'half'}),
      string('linkedin', 'URL del profilo', {width: 'half'}),
    ],
    translations: [
      string('role', 'Nella hero della Home: «// Nome — Full Stack Developer»'),
      string('profession', 'In modalità legacy: «Professione: …»'),
      text('tagline', 'La presentazione nel footer'),
    ],
  },
  {
    collection: 'pages',
    icon: 'web',
    note: 'Le pagine del sito: percorso, menu e sezioni, che si compongono con i blocchi.',
    display: '{{translations.title}}',
    fields: [
      string('key', 'Nome per il codice, da non cambiare: home, about, projects, contact', {width: 'half', required: true}),
      boolean('in_menu', 'Nel menu', true),
      choice('children', 'Le pagine di dettaglio sotto questa: /progetti/<slug> apre il case study', [['none', 'Nessuna'], ['projects', 'Case study dei progetti']], 'none'),
    ],
    translations: [
      string('slug', 'Percorso, senza / iniziale: «chi-sono». Vuoto per la Home'),
      string('title', 'Titolo: menu legacy e scheda del browser'),
      string('seo_title', 'Titolo nella scheda del browser, se diverso dal titolo'),
      text('description', 'Descrizione per i motori di ricerca'),
    ],
  },
  {
    collection: 'projects',
    icon: 'rocket_launch',
    note: 'I progetti: in evidenza (Home e Progetti), in Home, nell\'archivio.',
    archive: true,
    display: '{{slug}}',
    fields: [
      choice('status', 'Le bozze non si vedono sul sito', [['published', 'Pubblicato'], ['draft', 'Bozza']], 'published'),
      string('slug', 'Nome breve, senza spazi', {width: 'half', required: true}),
      string('url', 'Il sito del progetto'),
      boolean('featured', 'In evidenza, con il mockup'),
      choice('mockup', 'La sagoma intorno allo screenshot, se in evidenza', [['laptop', 'Portatile'], ['phone', 'Telefono'], ['none', 'Nessuna']], 'laptop'),
      boolean('on_home', 'Anche in Home, tra le card piccole'),
      boolean('case_study', 'Ha la sua pagina sul sito: i campi «Case study» e le sezioni qui sotto'),
      image('image', 'Screenshot (WebP; 16:10 per i siti, 9:19,5 per le app)'),
      integer('year', 'Case study: anno'),
      image('cover', 'Case study: immagine grande sotto il titolo; se vuota, lo screenshot'),
    ],
    translations: [
      string('name', 'Nome'),
      string('note', 'Una riga sotto il nome, facoltativa'),
      string('subtitle', 'Sotto il nome nelle card in evidenza; se vuoto, il dominio'),
      text('intro', 'Case study: sotto il titolo'),
      string('role', 'Case study: ruolo', {width: 'half'}),
      string('type', 'Case study: tipo di progetto', {width: 'half'}),
      string('stack', 'Case study: tecnologie, facoltativo'),
    ],
  },
  {
    collection: 'experiences',
    icon: 'work_history',
    note: 'Le esperienze di Chi sono, dalla più vecchia alla più recente.',
    display: '{{company}}',
    fields: [
      integer('year', 'Anno di inizio; vuoto se non si mostra'),
      string('company', 'Azienda', {width: 'half'}),
      string('link', 'Sito dell\'azienda, facoltativo'),
    ],
    translations: [string('role', 'Ruolo')],
  },
  {
    collection: 'services',
    icon: 'design_services',
    note: 'I servizi della Home.',
    fields: [
      choice('icon', 'Icona', [['web', 'Web'], ['mobile', 'Mobile'], ['design', 'Design'], ['devops', 'DevOps'], ['formazione', 'Formazione'], ['consulenza', 'Consulenza']], 'web'),
      image('image', 'Immagine della card'),
    ],
    translations: [
      string('title', 'Titolo'),
      text('text', 'Descrizione'),
    ],
  },
  {
    collection: 'technologies',
    icon: 'code',
    note: 'Lo stack di Chi sono.',
    display: '{{name}}',
    fields: [string('name', 'Nome', {required: true})],
    translations: [],
  },
  {
    collection: 'messages',
    icon: 'inbox',
    note: 'I messaggi arrivati dal form di contatto. Li scrive l\'endpoint /contact.',
    display: '{{name}} {{surname}} — {{email}}',
    sortable: false,
    fields: [
      {field: 'date_created', type: 'timestamp', meta: {special: ['date-created'], interface: 'datetime', readonly: true, width: 'half'}, schema: {}},
      string('locale', 'Lingua del sito da cui è stato scritto', {width: 'half'}),
      string('name', null, {width: 'half'}),
      string('surname', null, {width: 'half'}),
      string('email'),
      text('message', null),
      boolean('read', 'Letto'),
    ],
    translations: [],
  },
]

// --- blocks ------------------------------------------------------------------------------
// The sections of pages and case studies. In texts, **word** highlights a word.

const BLOCKS = [
  block('block_hero_home', {
    icon: 'waving_hand',
    note: 'La hero della Home, con la foto e lo snippet di codice.',
    translations: [
      string('title', 'Titolo, parte bianca'),
      string('title_accent', 'Titolo, parte arancione'),
      text('text', 'Sotto il titolo'),
      text('legacy_text', 'In modalità legacy, sotto «Benvenuto nel mio ipertesto»'),
    ],
  }),
  block('block_page_header', {
    icon: 'title',
    note: 'La testata di una pagina: etichetta, titolo grande e introduzione.',
    fields: [
      choice('variant', 'Gli elementi in più', [['plain', 'Nessuno'], ['about', 'Ritratto e numeri (Chi sono)'], ['projects', 'Numero di progetti (Progetti)'], ['contact', 'Disponibilità ed email (Contatti)']], 'plain'),
      image('image', 'Il ritratto, nella variante Chi sono'),
    ],
    translations: [
      label('Etichetta sopra il titolo: «// su di me». {n} diventa il numero di progetti'),
      title(),
      text('intro', 'Introduzione: paragrafi separati da una riga vuota'),
    ],
  }),
  block('block_text', {
    icon: 'notes',
    note: 'Titolo a sinistra, testo a destra.',
    translations: [label(), title(), text('text', 'Paragrafi separati da una riga vuota')],
  }),
  block('block_gallery', {
    icon: 'photo_library',
    note: 'Immagini. Con un titolo stanno sotto il testo, accanto al titolo; senza, a tutta larghezza.',
    translations: [
      label('Etichetta piccola, facoltativa'),
      title('Titolo, facoltativo'),
      text('text', 'Testo sopra le immagini, facoltativo'),
      text('captions', 'Le didascalie, una per riga, nell\'ordine delle immagini'),
    ],
  }),
  block('block_list', {
    icon: 'format_list_bulleted',
    note: 'Un elenco, accanto al titolo.',
    translations: [label(), title(), text('items', 'Un punto per riga')],
  }),
  block('block_palette', {
    icon: 'palette',
    note: 'I colori e il logo di un progetto.',
    fields: [
      text('colors', 'Un colore per riga, in esadecimale: #FF5B14'),
      image('logo', 'Logo, facoltativo'),
      boolean('site_logo', 'Al posto del logo, quello animato di questo sito'),
    ],
    translations: [
      label(), title(),
      text('text', 'Testo sopra i colori'),
      text('color_names', 'I nomi dei colori, uno per riga, nell\'ordine dei colori'),
      text('logo_text', 'Accanto al logo'),
    ],
  }),
  block('block_cta', {
    icon: 'campaign',
    note: 'L\'invito a scrivere, con il bottone Contattami.',
    fields: [choice('variant', 'Aspetto', [['banner', 'Banner centrato'], ['split', 'Titolo a sinistra, bottoni a destra (con Tutti i progetti)']], 'banner')],
    translations: [
      label('Etichetta piccola, solo nella variante a due colonne'),
      title(),
      string('title_accent', 'Fine del titolo, in arancione, facoltativa'),
      text('text', 'Testo sotto il titolo, facoltativo'),
    ],
  }),
  block('block_contact_form', {
    icon: 'contact_mail',
    note: 'Il form di contatto, con un\'immagine accanto.',
    fields: [image('image', 'Accanto al form')],
    translations: [label(), title(), text('text', 'Sopra il form, facoltativo')],
  }),
  block('block_services', {
    icon: 'design_services',
    note: 'Le card dei servizi (dalla collection Servizi).',
    translations: [label(), title(), text('text', 'Sotto il titolo')],
  }),
  block('block_projects', {
    icon: 'rocket_launch',
    note: 'I progetti (dalla collection Progetti).',
    fields: [
      choice('show', 'Quali progetti', [['home', 'In evidenza e in Home'], ['featured', 'Solo in evidenza'], ['archive', 'Tutti tranne quelli in evidenza']], 'home'),
      boolean('all_link', 'Link «Tutti i progetti» accanto al titolo'),
    ],
    translations: [label(), title('Titolo, facoltativo')],
  }),
  block('block_experiences', {
    icon: 'work_history',
    note: 'La timeline delle esperienze (dalla collection Esperienze).',
    translations: [label(), title(), text('text', 'Accanto al titolo')],
  }),
  block('block_stack', {
    icon: 'code',
    note: 'Le tecnologie (dalla collection Tecnologie).',
    translations: [label(), title()],
  }),
  block('block_contact_info', {
    icon: 'contact_page',
    note: 'Contatti, social e dati aziendali (dai dati del sito).',
    translations: [label(), title()],
  }),
]

/** The collections that can have sections. */
const WITH_SECTIONS = ['pages', 'projects']

/** The junction between a gallery block and its images. */
const GALLERY_FILES = 'block_gallery_files'

/** Collections from earlier schemas, removed by setup. */
const OBSOLETE = ['page_home', 'page_about', 'page_projects', 'page_contact', 'page_case_study']

/** The collections whose changes must trigger a site rebuild. */
const CONTENT_COLLECTIONS = [
  ...[...COLLECTIONS, ...BLOCKS]
    .filter(c => c.collection !== 'messages')
    .flatMap(c => c.translations.length ? [c.collection, `${c.collection}_translations`] : [c.collection]),
  ...WITH_SECTIONS.map(c => `${c}_sections`),
  GALLERY_FILES,
]

// --- creation ----------------------------------------------------------------------------

async function exists(collection) {
  return Boolean(await api('GET', `/collections/${collection}`, undefined, {allow404: true}))
}

async function createLanguages() {
  if (await exists('languages')) return
  await api('POST', '/collections', {
    collection: 'languages',
    meta: {icon: 'translate', note: 'Le lingue del sito', display_template: '{{name}}'},
    schema: {},
    fields: [
      {field: 'code', type: 'string', meta: {interface: 'input'}, schema: {is_primary_key: true, length: 5}},
      string('name', null),
      {field: 'direction', type: 'string', meta: {interface: 'select-dropdown', options: {choices: [{value: 'ltr', text: 'LTR'}, {value: 'rtl', text: 'RTL'}]}}, schema: {default_value: 'ltr'}},
    ],
  })
  await api('POST', '/items/languages', [
    {code: 'it', name: 'Italiano'},
    {code: 'en', name: 'English'},
    {code: 'ro', name: 'Română'},
  ])
  console.log('+ languages')
}

async function createCollection(def) {
  if (await exists(def.collection)) return addMissingFields(def)
  const sortable = !def.singleton && def.sortable !== false

  await api('POST', '/collections', {
    collection: def.collection,
    meta: {
      icon: def.icon,
      note: def.note,
      hidden: Boolean(def.hidden),
      singleton: Boolean(def.singleton),
      sort_field: sortable ? 'sort' : null,
      display_template: def.display ?? null,
      archive_field: def.archive ? 'status' : null,
      archive_value: def.archive ? 'draft' : null,
      unarchive_value: def.archive ? 'published' : null,
    },
    schema: {},
    fields: [id(), ...(sortable ? [sort()] : []), ...def.fields],
  })

  await createFileRelations(def.collection, def.fields)
  if (def.translations.length) await createTranslations(def)
  console.log(`+ ${def.collection}`)
}

async function createFileRelations(collection, fields) {
  for (const field of fields.filter(f => f.meta?.special?.includes('file'))) {
    await api('POST', '/relations', {
      collection, field: field.field, related_collection: 'directus_files',
      schema: {on_delete: 'SET NULL'},
    })
  }
}

async function fieldNames(collection) {
  return new Set((await api('GET', `/fields/${collection}`)).map(f => f.field))
}

/** Adds the fields defined here but not yet in Directus. Existing fields are left as they are. */
async function addMissingFields(def) {
  const targets = [[def.collection, def.fields]]
  if (def.translations.length) targets.push([`${def.collection}_translations`, def.translations])

  for (const [collection, fields] of targets) {
    const present = await fieldNames(collection)
    const missing = fields.filter(f => !present.has(f.field))
    if (!missing.length) continue
    for (const field of missing) await api('POST', `/fields/${collection}`, field)
    await createFileRelations(collection, missing)
    console.log(`+ ${collection}: ${missing.map(f => f.field).join(', ')}`)
  }
}

async function createTranslations(def) {
  const junction = `${def.collection}_translations`
  const parentKey = `${def.collection}_id`

  await api('POST', '/collections', {
    collection: junction,
    meta: {hidden: true, icon: 'import_export'},
    schema: {},
    fields: [
      id(),
      {field: parentKey, type: 'integer', meta: {hidden: true}, schema: {}},
      {field: 'languages_code', type: 'string', meta: {hidden: true}, schema: {}},
      ...def.translations,
    ],
  })

  await api('POST', `/fields/${def.collection}`, {
    field: 'translations',
    type: 'alias',
    meta: {
      special: ['translations'],
      interface: 'translations',
      options: {languageField: 'name', defaultLanguage: 'it', defaultOpenSplitView: true},
    },
  })

  await api('POST', '/relations', {
    collection: junction, field: parentKey, related_collection: def.collection,
    meta: {one_field: 'translations', junction_field: 'languages_code'},
    schema: {on_delete: 'CASCADE'},
  })
  await api('POST', '/relations', {
    collection: junction, field: 'languages_code', related_collection: 'languages',
    meta: {junction_field: parentKey},
    schema: {on_delete: 'SET NULL'},
  })
}

/**
 * The `sections` field: an ordered list of blocks of any type (many-to-any),
 * through the `<collection>_sections` junction.
 */
async function createSections(parent) {
  const junction = `${parent}_sections`
  const parentKey = `${parent}_id`
  const allowed = BLOCKS.map(b => b.collection)

  if ((await fieldNames(parent)).has('sections')) {
    // new block types become available in the existing field
    const relation = await api('GET', `/relations/${junction}/item`)
    const missing = allowed.filter(c => !relation.meta.one_allowed_collections?.includes(c))
    if (missing.length) {
      await api('PATCH', `/relations/${junction}/item`, {meta: {one_allowed_collections: allowed}})
      console.log(`~ ${parent}.sections: + ${missing.join(', ')}`)
    }
    return
  }

  await api('POST', '/collections', {
    collection: junction,
    meta: {hidden: true, icon: 'import_export'},
    schema: {},
    fields: [
      id(),
      {field: parentKey, type: 'integer', meta: {hidden: true}, schema: {}},
      {field: 'item', type: 'string', meta: {hidden: true}, schema: {}},
      {field: 'collection', type: 'string', meta: {hidden: true}, schema: {}},
      sort(),
    ],
  })
  await api('POST', `/fields/${parent}`, {
    field: 'sections', type: 'alias',
    meta: {special: ['m2a'], interface: 'list-m2a', note: 'Le sezioni della pagina, nell\'ordine'},
  })
  await api('POST', '/relations', {
    collection: junction, field: 'item', related_collection: null,
    meta: {one_allowed_collections: allowed, one_collection_field: 'collection', junction_field: parentKey},
  })
  await api('POST', '/relations', {
    collection: junction, field: parentKey, related_collection: parent,
    meta: {one_field: 'sections', junction_field: 'item', sort_field: 'sort'},
    schema: {on_delete: 'CASCADE'},
  })
  console.log(`+ ${parent}.sections`)
}

/** The gallery blocks' `images` field: many files, in order. */
async function createGalleryImages() {
  if ((await fieldNames('block_gallery')).has('images')) return

  await api('POST', '/collections', {
    collection: GALLERY_FILES,
    meta: {hidden: true, icon: 'import_export'},
    schema: {},
    fields: [
      id(),
      {field: 'block_gallery_id', type: 'integer', meta: {hidden: true}, schema: {}},
      {field: 'directus_files_id', type: 'uuid', meta: {hidden: true}, schema: {}},
      sort(),
    ],
  })
  await api('POST', '/fields/block_gallery', {
    field: 'images', type: 'alias',
    meta: {special: ['files'], interface: 'files', note: 'Le immagini, nell\'ordine'},
  })
  await api('POST', '/relations', {
    collection: GALLERY_FILES, field: 'directus_files_id', related_collection: 'directus_files',
    meta: {junction_field: 'block_gallery_id'},
    schema: {on_delete: 'CASCADE'},
  })
  await api('POST', '/relations', {
    collection: GALLERY_FILES, field: 'block_gallery_id', related_collection: 'block_gallery',
    meta: {one_field: 'images', junction_field: 'directus_files_id', sort_field: 'sort'},
    schema: {on_delete: 'CASCADE'},
  })
  console.log('+ block_gallery.images')
}

/** Removes the collections of earlier schemas, with their translations. */
async function removeObsolete() {
  for (const collection of OBSOLETE.flatMap(c => [`${c}_translations`, c])) {
    if (!await exists(collection)) continue
    await api('DELETE', `/collections/${collection}`)
    console.log(`- ${collection}`)
  }
}

/** The site reads without login: the public policy can read content and files, not messages. */
async function grantPublicRead() {
  const [access] = await api('GET', '/access?filter[role][_null]=true&filter[user][_null]=true&fields=policy')
  const policy = access.policy

  const existing = await api('GET', `/permissions?filter[policy][_eq]=${policy}&fields=collection,action&limit=-1`)
  const has = new Set(existing.map(p => `${p.collection}:${p.action}`))

  const readable = ['languages', 'directus_files', ...CONTENT_COLLECTIONS]
  const toCreate = readable
    .filter(collection => !has.has(`${collection}:read`))
    .map(collection => ({
      // No filter rules (e.g. only published projects): in unlicensed Directus 12
      // they're a restricted feature. The site excludes drafts by requesting only `published`.
      policy, collection, action: 'read', fields: ['*'], permissions: null,
    }))

  if (toCreate.length) {
    await api('POST', '/permissions', toCreate)
    console.log(`+ public read permissions: ${toCreate.map(p => p.collection).join(', ')}`)
  }
}

async function createFlow({name, description, icon, options, operations}) {
  const [existing] = await api('GET', `/flows?filter[name][_eq]=${encodeURIComponent(name)}`)
  if (existing) {
    // new collections must trigger the flow too
    const missing = options.collections.filter(c => !existing.options?.collections?.includes(c))
    if (missing.length) {
      await api('PATCH', `/flows/${existing.id}`, {options: {...existing.options, collections: options.collections}})
      console.log(`~ flow «${name}»: + ${missing.join(', ')}`)
    }
    return
  }

  const flow = await api('POST', '/flows', {
    name, description, icon, status: 'active', trigger: 'event', accountability: 'all', options,
  })

  // operations are created from the last one, since each points to the next (`resolve`)
  let next = null
  for (const [i, op] of operations.map((op, i) => [i, op]).reverse()) {
    const created = await api('POST', '/operations', {
      ...op, flow: flow.id, position_x: 19 + i * 18, position_y: 1, resolve: next,
    })
    next = created.id
  }
  await api('PATCH', `/flows/${flow.id}`, {operation: next})
  console.log(`+ flow «${name}»`)
}

async function createFlows() {
  await createFlow({
    name: 'Ricostruisci il sito',
    description: 'Quando cambia un contenuto chiama il webhook di deploy (DEPLOY_WEBHOOK_URL), che rigenera il sito statico.',
    icon: 'published_with_changes',
    options: {type: 'action', scope: ['items.create', 'items.update', 'items.delete'], collections: CONTENT_COLLECTIONS},
    operations: [
      {
        key: 'webhook_configurato', name: 'Webhook configurato?', type: 'condition',
        options: {filter: {$env: {DEPLOY_WEBHOOK_URL: {_nempty: true}}}},
      },
      {
        key: 'deploy', name: 'Deploy', type: 'request',
        options: {method: 'POST', url: '{{$env.DEPLOY_WEBHOOK_URL}}'},
      },
    ],
  })

  await createFlow({
    name: 'Email per un nuovo messaggio',
    description: 'Manda a CONTACT_EMAIL_TO ogni messaggio arrivato dal form di contatto.',
    icon: 'forward_to_inbox',
    options: {type: 'action', scope: ['items.create'], collections: ['messages']},
    operations: [
      {
        key: 'email', name: 'Email', type: 'mail',
        options: {
          to: ['{{$env.CONTACT_EMAIL_TO}}'],
          subject: 'Nuovo messaggio dal sito: {{$trigger.payload.name}} <{{$trigger.payload.email}}>',
          type: 'markdown',
          body: [
            '**Nome:** {{$trigger.payload.name}}',
            '**Cognome:** {{$trigger.payload.surname}}',
            '**Email:** {{$trigger.payload.email}}',
            '**Lingua:** {{$trigger.payload.locale}}',
            '',
            '{{$trigger.payload.message}}',
          ].join('\n'),
        },
      },
    ],
  })
}

await waitForDirectus()
await createLanguages()
await removeObsolete()
for (const def of [...COLLECTIONS, ...BLOCKS]) await createCollection(def)
for (const parent of WITH_SECTIONS) await createSections(parent)
await createGalleryImages()
await grantPublicRead()
await createFlows()
console.log('Schema ready.')
