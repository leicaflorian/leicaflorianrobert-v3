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
    collection: 'page_home',
    singleton: true,
    icon: 'home',
    note: 'I testi della Home.',
    fields: [image('contact_image', 'Accanto al form «Parliamone»')],
    translations: [
      string('hero_title', 'Titolo, parte bianca'),
      string('hero_title_accent', 'Titolo, parte arancione'),
      text('hero_text', 'Sotto il titolo'),
      text('services_text', 'Sotto «Cosa posso fare per te?»'),
      text('contact_text', 'Sotto «Parliamone»'),
      text('legacy_text', 'In modalità legacy, sotto «Benvenuto nel mio ipertesto»'),
    ],
  },
  {
    collection: 'page_about',
    singleton: true,
    icon: 'person',
    note: 'I testi di Chi sono.',
    fields: [
      image('portrait', 'Ritratto nella hero'),
      image('gallery_1', 'Galleria: al lavoro'),
      image('gallery_2', 'Galleria: in aula / mentoring'),
      image('gallery_3', 'Galleria: il setup'),
    ],
    translations: [
      text('intro', 'La presentazione sotto «Ciao, benvenuto/a»'),
      text('story', 'La storia: paragrafi separati da una riga vuota'),
      text('experiences_text', 'Sotto «Ecco alcune esperienze»'),
      text('cta_text', 'Nel banner finale «Ora sai qualcosa in più, scrivimi»'),
    ],
  },
  {
    collection: 'page_projects',
    singleton: true,
    icon: 'grid_view',
    note: 'I testi di Progetti.',
    fields: [],
    translations: [
      text('intro', 'L\'introduzione: paragrafi separati da una riga vuota'),
      text('cta_text', 'Nel banner finale'),
    ],
  },
  {
    collection: 'page_contact',
    singleton: true,
    icon: 'mail',
    note: 'I testi di Contatti.',
    fields: [image('contact_image', 'Accanto al form')],
    translations: [text('intro', 'Accanto al titolo «Contatti»')],
  },
  {
    collection: 'page_case_study',
    singleton: true,
    icon: 'auto_stories',
    note: 'Il case study della V3. Nei testi, **parola** la evidenzia.',
    fields: [
      integer('year', 'Anno'),
      image('cover', 'Cover: la Home native'),
      image('shot_legacy', 'Screenshot legacy'),
      image('shot_native', 'Screenshot native'),
      image('shot_about', 'Screenshot di Chi sono'),
      image('shot_mobile', 'Screenshot mobile'),
    ],
    translations: [
      string('title', 'Titolo'),
      text('intro', 'Sotto il titolo'),
      string('role', 'Ruolo'),
      string('type', 'Tipo'),
      string('pages', 'Pagine'),
      text('start_text', '01 / punto di partenza'),
      text('concept_text', '02 / concept'),
      text('visual_text', '03 / sistema visivo'),
      text('logo_text', 'Accanto al logo'),
      text('details', '04 / dettagli: un punto per riga'),
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
      boolean('case_study', 'Ha la sua pagina sul sito (oggi solo la V3)'),
      image('image', 'Screenshot (WebP; 16:10 per i siti, 9:19,5 per le app)'),
    ],
    translations: [
      string('name', 'Nome'),
      string('note', 'Una riga sotto il nome, facoltativa'),
      string('subtitle', 'Sotto il nome nelle card in evidenza; se vuoto, il dominio'),
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

/** The collections whose changes must trigger a site rebuild. */
const CONTENT_COLLECTIONS = COLLECTIONS
  .filter(c => c.collection !== 'messages')
  .flatMap(c => c.translations.length ? [c.collection, `${c.collection}_translations`] : [c.collection])

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
  if (await exists(def.collection)) return
  const sortable = !def.singleton && def.sortable !== false

  await api('POST', '/collections', {
    collection: def.collection,
    meta: {
      icon: def.icon,
      note: def.note,
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

  for (const field of def.fields.filter(f => f.meta?.special?.includes('file'))) {
    await api('POST', '/relations', {
      collection: def.collection, field: field.field, related_collection: 'directus_files',
      schema: {on_delete: 'SET NULL'},
    })
  }

  if (def.translations.length) await createTranslations(def)
  console.log(`+ ${def.collection}`)
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
  if (existing) return

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
for (const def of COLLECTIONS) await createCollection(def)
await grantPublicRead()
await createFlows()
console.log('Schema ready.')
