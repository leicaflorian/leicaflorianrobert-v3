// Loads the design's content (directus/../design) into Directus: Italian texts,
// plus a first draft in English and Romanian, to be reviewed in the admin panel.
// Doesn't touch singletons and items that already have content: it only adds what's missing.
//
//   node directus/scripts/seed.mjs

import {readFile} from 'node:fs/promises'
import {api, authToken, DIRECTUS_URL, waitForDirectus} from './api.mjs'

/** From `{it: {...}, en: {...}}` to Directus translation rows. */
const tr = byLocale => Object.entries(byLocale).map(([languages_code, fields]) => ({languages_code, ...fields}))

// --- singletons --------------------------------------------------------------------------

const SINGLETONS = {
  site: {
    name: 'Leica Florian Robert',
    available: true,
    email: 'info@leicaflorianrobert.dev',
    pec: 'florian.leica@pec.it',
    street: 'Via Pozza Maraschin, 44/B',
    postal_code: '36015',
    city: 'Schio',
    province: 'VI',
    vat: '04329800249',
    rea: 'VI - 396256',
    sdi: 'M5UXCR1',
    github: 'https://github.com/leicaflorian',
    linkedin: 'https://www.linkedin.com/in/florian-robert-leica/',
    translations: tr({
      it: {
        role: 'Sviluppatore Web & Mobile',
        profession: 'Sviluppatore Web & Mobile',
        tagline: 'Sviluppatore Web & Mobile. Da {years} anni trasformo idee in prodotti digitali.',
      },
      en: {
        role: 'Web & Mobile Developer',
        profession: 'Web & Mobile Developer',
        tagline: 'Web & Mobile Developer. For {years} years I have been turning ideas into digital products.',
      },
      ro: {
        role: 'Dezvoltator Web & Mobile',
        profession: 'Dezvoltator Web & Mobile',
        tagline: 'Dezvoltator Web & Mobile. De {years} ani transform idei în produse digitale.',
      },
    }),
  },
}

// --- lists -------------------------------------------------------------------------------

const note = (it, en, ro) => ({it: {note: it}, en: {note: en}, ro: {note: ro}})
const name = n => ({it: {name: n}, en: {name: n}, ro: {name: n}})
const merge = (...parts) => tr(parts.reduce((acc, part) => {
  for (const [locale, fields] of Object.entries(part)) acc[locale] = {...acc[locale], ...fields}
  return acc
}, {}))

const project = (slug, url, extra, ...translations) => ({
  status: 'published', slug, url, kind: 'direct', featured: false, on_home: false, case_study: false, mockup: 'none', ...extra,
  translations: merge(...translations),
})

const PROJECTS = [
  project('v3', 'https://leicaflorianrobert.dev', {kind: 'personal', branch: 'main', case_study: true}, name('My website V3'),
    note('Versione attuale del sito', 'Current version of this site', 'Versiunea actuală a site-ului')),
  project('tfp', 'https://thefullproject.it/', {case_study: true, on_home: true}, name('The Full Project'),
    note('20+ server, deploy automatici, zero disservizi in 2 anni e mezzo', '20+ servers, automated deploys, no outages in two and a half years', '20+ servere, deploy-uri automate, zero întreruperi în doi ani și jumătate')),
  project('xpulire', 'https://www.xpulire.com/', {case_study: true, on_home: true}, name('xPulire'),
    note('Trasloco IT completo in un giorno, senza fermare la produzione', 'A complete IT move in one day, without stopping production', 'Mutarea IT completă într-o zi, fără oprirea producției')),
  project('imanpack', 'https://www.imanpack.it/', {case_study: true, on_home: true}, name('Imanpack'),
    note('Dal CMS a Mailchimp in automatico, newsletter bilingui senza lavoro a mano', 'From the CMS to Mailchimp automatically: bilingual newsletters with no manual work', 'Din CMS în Mailchimp automat: newslettere bilingve fără muncă manuală')),
  project('steelfuture', 'https://steelfuture.com/', {case_study: true}, name('Steel Future'),
    note('Gestionale PHP 5 portato su Git, con deploy automatico a ogni push', 'PHP 5 management software brought under Git, with automatic deploys on every push', 'Software de gestiune PHP 5 adus în Git, cu deploy automat la fiecare push')),
  project('v2', 'https://leicaflorianrobert.dev', {kind: 'personal', branch: 'main', year: 2023}, name('My website V2')),
  // co-founded, so mine rather than a client's; no longer operating, and its site is gone: no link, not featured
  project('wab', '', {kind: 'personal', year: 2023}, name('Web Artisan Bros'),
    note('Software house co-fondata nel 2023', 'Software house I co-founded in 2023', 'Software house co-fondată în 2023')),
  project('slides', 'https://chromewebstore.google.com/detail/slidescom-companion/bciknjamldhnbbckmgbchmkdcalngnco', {kind: 'personal', case_study: true}, name('Slides.com Companion'),
    note('Estensione Chrome ed Edge', 'Chrome and Edge extension', 'Extensie Chrome și Edge')),
  project('tvit', 'https://tvit.leicaflorianrobert.dev/channels', {kind: 'personal', on_home: true, case_study: true}, name('TvIt'),
    note('65 stelle su GitHub, lista e guida TV che si aggiornano da sole', '65 stars on GitHub, a list and TV guide that update themselves', '65 de stele pe GitHub, listă și ghid TV care se actualizează singure')),
  // the site is no longer the one I built: the link goes to its code
  project('biologica', 'https://github.com/leicaflorian/biologioca_disinfestazioni', {}, name('Biologica Disinfestazioni'),
    note('Sito web — il codice su GitHub', 'Website — the code on GitHub', 'Site web — codul pe GitHub')),
  project('nosponsor', 'https://chromewebstore.google.com/detail/nlbdnpodndocljlpajidbahbdomalbea', {kind: 'personal', case_study: true}, name('NoSponsor'),
    note('Estensione Chrome, sul Chrome Web Store', 'Chrome extension, on the Chrome Web Store', 'Extensie Chrome, în Chrome Web Store')),
  project('booleancli', 'https://www.npmjs.com/package/boolean-cli', {kind: 'personal', case_study: true}, name('Boolean CLI'),
    note('CLI per docenti e tutor, su npm', 'CLI for teachers and tutors, on npm', 'CLI pentru profesori și tutori, pe npm')),
  project('pimpmycrud', 'https://packagist.org/packages/leicaflorian/pimp_my_crud', {kind: 'personal'}, name('Pimp My CRUD'),
    note('Pacchetto Laravel che genera i CRUD', 'Laravel package that generates CRUDs', 'Pachet Laravel care generează CRUD-uri')),
  project('enigma', 'https://leicaflorian.github.io/enigma_machine', {kind: 'personal'}, name('Enigma'),
    note('Macchina Enigma', 'Enigma machine', 'Mașina Enigma')),
  project('fold', 'https://leicaflorian.github.io/fold_my_paper', {kind: 'personal'}, name('Fold my paper')),
  project('v1', 'https://v1.leicaflorianrobert.dev', {kind: 'personal', branch: 'main', year: 2018}, name('My website V1')),
  // the client is never named: no name, no link
  project('fintech', '', {case_study: true},
    {it: {name: 'Piattaforma per investimenti'}, en: {name: 'Investment platform'}, ro: {name: 'Platformă de investiții'}},
    note('Due web app, un\'app mobile e un\'area clienti come in una banca online', 'Two web apps, a mobile app and a client area like online banking', 'Două aplicații web, o aplicație mobilă și o zonă pentru clienți ca într-un internet banking')),
  project('fib', 'https://leicaflorian.github.io/fibonacci_counter/', {kind: 'personal'}, name('Fibonacci Counter')),
  // client work done through an agency, which is never named
  project('agrigento', 'https://agrigento2025.org', {kind: 'agency', category: 'initiative'}, name('Agrigento 2025')),
  project('alfaomega', 'https://alfaomega.it', {kind: 'agency', category: 'corporate'}, name('Alfa Omega')),
  project('antoine', 'https://maisonantoine.it', {kind: 'agency', category: 'corporate'}, name('Maison Antoine')),
  project('biscottificio', 'https://www.biscottificioverona.com', {kind: 'agency', category: 'corporate'}, name('Biscottificio Verona')),
  project('chipsit', 'https://chips.it', {kind: 'agency', category: 'initiative'}, name('Chips.it')),
  project('doppel', 'https://doppel.it', {kind: 'agency', category: 'corporate'}, name('Doppel')),
  project('energia', 'https://festivaldellenergia.it', {kind: 'agency', category: 'initiative'}, name('Festival dell\'Energia')),
  project('ga4g', 'https://generaliact4green.it', {kind: 'agency', category: 'initiative'}, name('Generali Act4Green')),
  project('oasi', 'https://oasigregorina.it', {kind: 'agency', category: 'initiative'}, name('Oasi Gregorina')),
  project('oasi-app', 'https://app.oasigregorina.it', {kind: 'agency', category: 'platform'}, name('Oasi App')),
  project('radici', 'https://futureradici.it', {kind: 'agency', category: 'initiative'}, name('Future Radici')),
  project('gpf', 'https://gpf.it', {kind: 'agency', category: 'corporate'}, name('GPF')),
  project('iresales', 'https://iresales.it', {kind: 'agency', category: 'corporate'}, name('iResales')),
  project('kilocal', 'https://www.kilocalprogram.it', {kind: 'agency', category: 'platform'}, name('Kilocal'), note('Sito, shop e app', 'Website, shop and app', 'Site, magazin și aplicație')),
  project('kyp', 'https://knowyourpartner.it', {kind: 'agency', category: 'corporate'}, name('Know Your Partner')),
  project('mipharm', 'https://mipharm.it', {kind: 'agency', category: 'corporate'}, name('Mipharm')),
  project('dmx', 'https://dmxpharma.com', {kind: 'agency', category: 'corporate'}, name('DMX Pharma')),
  project('pezzulli', 'https://pezzulli.it', {kind: 'agency', category: 'corporate'}, name('Pezzulli')),
  project('pmi', 'https://pmitutoring.it', {kind: 'agency', category: 'corporate'}, name('PMI Tutoring')),
  project('qubit', 'https://qub.it', {kind: 'agency', category: 'corporate'}, name('Qub.it')),
  project('tim', 'https://tim-management.com', {kind: 'agency', category: 'corporate'}, name('TIM Management')),
  project('volersi', 'https://volersibenessere.it', {kind: 'agency', category: 'platform'}, name('Volersi Benessere'), note('Piattaforma, shop e dashboard', 'Platform, shop and dashboard', 'Platformă, magazin și dashboard')),
  project('worldlink', 'https://worldlinkcompany.com', {kind: 'agency', category: 'corporate'}, name('World Link')),
]

/**
 * An experience: the role is the same in every language unless given as `{it, en, ro}`,
 * the description (what I did there, one or two sentences) always is. The years are the
 * start, `[start, end]` or `[start, 'now']`; a company that is a description rather than
 * a name ("Self-employed") gets its translations as `label`.
 */
const experience = (company, years, link, role, description = null, label = null) => {
  const roles = typeof role === 'string' ? {it: role, en: role, ro: role} : role
  const [year, end = null] = [years].flat()
  return {
    company, year, end_year: end === 'now' ? null : end, current: end === 'now', link,
    translations: tr(Object.fromEntries(Object.entries(roles).map(([locale, value]) => [
      locale, {company_label: label?.[locale] ?? null, role: value, description: description?.[locale] ?? null},
    ]))),
  }
}

const EXPERIENCES = [
  experience('Mediamotion s.r.l.', 2009, null, 'Full Stack Developer', {
    it: 'Siti con Adobe Flex, HTML e CSS sul frontend, Ruby on Rails e PHP sul backend, su database MySQL. Ne curavo anche grafica, SEO e il server locale che li ospitava.',
    en: 'Websites with Adobe Flex, HTML and CSS on the frontend, Ruby on Rails and PHP on the backend, on MySQL databases. I also took care of their design, SEO and the local server hosting them.',
    ro: 'Site-uri cu Adobe Flex, HTML și CSS pe frontend, Ruby on Rails și PHP pe backend, pe baze de date MySQL. Mă ocupam și de grafică, SEO și de serverul local care le găzduia.',
  }),
  experience('Tecnobit s.r.l.', 2009, 'https://www.tecnobit.it/', {it: 'Sviluppo software gestionale', en: 'Management software development', ro: 'Dezvoltare software de gestiune'}, {
    it: 'Un software gestionale in Visual Basic e MySQL per l\'Ordine degli Ingegneri della Provincia di Potenza, distribuito su CD-ROM agli iscritti. Ne ho curato grafica, interfaccia, architettura e sviluppo.',
    en: 'Management software in Visual Basic and MySQL for the Order of Engineers of the Province of Potenza, distributed on CD-ROM to its members. I handled its design, interface, architecture and development.',
    ro: 'Un software de gestiune în Visual Basic și MySQL pentru Ordinul Inginerilor din Provincia Potenza, distribuit membrilor pe CD-ROM. M-am ocupat de grafică, interfață, arhitectură și dezvoltare.',
  }),
  experience('Organizzazione no-profit', [2010, 2017], null, 'Desktop & Web Developer', {
    it: 'Applicazioni desktop gestionali in Visual Basic, Adobe Flex (AIR) e come app ed estensioni di Chrome, e siti in PHP e MySQL integrati con le API di Google: Drive, Maps e Sign-In.',
    en: 'Desktop management applications in Visual Basic, Adobe Flex (AIR) and as Chrome apps and extensions, plus PHP and MySQL websites integrated with Google APIs: Drive, Maps and Sign-In.',
    ro: 'Aplicații desktop de gestiune în Visual Basic, Adobe Flex (AIR) și ca aplicații și extensii Chrome, plus site-uri în PHP și MySQL integrate cu API-urile Google: Drive, Maps și Sign-In.',
  }, {it: 'Organizzazione no-profit', en: 'Non-profit organisation', ro: 'Organizație non-profit'}),
  experience('Self-employed', [2017, 'now'], null, 'Full Stack Developer, Web Designer, Mobile Developer', {
    it: 'Siti e applicazioni per clienti diretti: interfacce responsive, app ibride con Cordova e poi Ionic, siti WordPress e Joomla con temi e moduli su misura.',
    en: 'Websites and applications for direct clients: responsive interfaces, hybrid apps with Cordova and then Ionic, WordPress and Joomla sites with custom themes and modules.',
    ro: 'Site-uri și aplicații pentru clienți direcți: interfețe responsive, aplicații hibride cu Cordova și apoi Ionic, site-uri WordPress și Joomla cu teme și module pe măsură.',
  }, {it: 'Libero professionista', en: 'Freelancer', ro: 'Liber profesionist'}),
  experience('Zucchetti Software Giuridico s.r.l.', [2018, 2020], 'http://www.zucchettisoftwaregiuridico.it', 'Front-End Developer', {
    it: 'Manutenzione e nuove funzionalità delle web app aziendali: componenti in Vue.js, refactoring del codice legacy e librerie interne riutilizzabili.',
    en: 'Maintenance and new features of the company\'s web apps: Vue.js components, refactoring of legacy code and reusable internal libraries.',
    ro: 'Mentenanța și funcționalitățile noi ale aplicațiilor web ale firmei: componente Vue.js, refactorizarea codului legacy și biblioteci interne reutilizabile.',
  }),
  experience('Develon s.r.l.', [2020, 2021], 'https://www.develon.com', 'Senior Full Stack Developer', {
    it: 'Progetti enterprise monolitici e a microservizi, con Vue.js e Node.js (Express, AdonisJS, Nest.js): componenti UI, flussi backend e integrazioni con sistemi esterni.',
    en: 'Enterprise projects, monolithic and microservice-based, with Vue.js and Node.js (Express, AdonisJS, Nest.js): UI components, backend flows and integrations with external systems.',
    ro: 'Proiecte enterprise monolitice și pe microservicii, cu Vue.js și Node.js (Express, AdonisJS, Nest.js): componente UI, fluxuri backend și integrări cu sisteme externe.',
  }),
  experience('Boolean Careers', [2021, 2024], 'https://www.boolean.careers', {it: 'Main Teacher nel corso di Full-Stack Web Development', en: 'Main Teacher of the Full-Stack Web Development course', ro: 'Main Teacher la cursul de Full-Stack Web Development'}, {
    it: 'Docente principale del corso Full Stack: lezioni da HTML a Laravel, React e Node.js, mentoring individuale e valutazione dei progetti di decine di studenti.',
    en: 'Lead teacher of the Full Stack course: lessons from HTML to Laravel, React and Node.js, one-to-one mentoring and assessment of the projects of dozens of students.',
    ro: 'Profesor principal al cursului Full Stack: lecții de la HTML la Laravel, React și Node.js, mentorat individual și evaluarea proiectelor a zeci de studenți.',
  }),
  experience('Web Artisan Bros', [2023, 2025], null, 'Co-Founder & Full Stack Developer', {
    it: 'Ho co-fondato una software house di prodotti digitali su misura: scelta dello stack, sviluppo frontend e backend, intero ciclo dei progetti e rapporto diretto con i clienti.',
    en: 'I co-founded a software house building custom digital products: choosing the stack, frontend and backend development, the whole project lifecycle and direct contact with clients.',
    ro: 'Am co-fondat o software house de produse digitale pe măsură: alegerea stack-ului, dezvoltare frontend și backend, întregul ciclu al proiectelor și relația directă cu clienții.',
  }),
  experience('The Full Project', [2023, 2026], 'https://thefullproject.it/', 'CTO & Full Stack Developer', {
    it: 'CTO dell\'agenzia: architetture, processi e coordinamento del team. Ho gestito il reparto IT, dai server alle pipeline CI/CD, e creato i template Nuxt e Directus per i nuovi progetti.',
    en: 'CTO of the agency: architecture, processes and team coordination. I ran the IT department, from servers to CI/CD pipelines, and built the Nuxt and Directus templates for new projects.',
    ro: 'CTO al agenției: arhitecturi, procese și coordonarea echipei. Am condus departamentul IT, de la servere la pipeline-urile CI/CD, și am creat template-urile Nuxt și Directus pentru proiectele noi.',
  }),
  experience('Up2You', [2024, 2025], null, 'Full Stack Developer', {
    it: 'Piattaforme per la sostenibilità e il marketing, con TypeScript, Laravel, Vue.js e MySQL: API su misura e ottimizzazione di prestazioni e user experience.',
    en: 'Platforms for sustainability and marketing, with TypeScript, Laravel, Vue.js and MySQL: custom APIs and optimisation of performance and user experience.',
    ro: 'Platforme pentru sustenabilitate și marketing, cu TypeScript, Laravel, Vue.js și MySQL: API-uri pe măsură și optimizarea performanței și a experienței utilizatorilor.',
  }),
  experience('Deepser s.r.l.', [2026, 'now'], null, 'Senior Back-end Developer', {
    it: 'Sviluppo e manutenzione della piattaforma aziendale e delle sue nuove funzionalità.',
    en: 'Development and maintenance of the company platform and its new features.',
    ro: 'Dezvoltarea și mentenanța platformei firmei și a noilor sale funcționalități.',
  }),
]

const service = (icon, it, en, ro) => ({icon, translations: tr({it, en, ro})})

const SERVICES = [
  service('web',
    {title: 'Sviluppo web', text: 'Siti, web app e prodotti SaaS su misura — dall\'idea al lancio, integrazioni e pagamenti compresi.'},
    {title: 'Web development', text: 'Custom websites, web apps and SaaS products — from idea to launch, integrations and payments included.'},
    {title: 'Dezvoltare web', text: 'Site-uri, aplicații web și produse SaaS pe măsură — de la idee la lansare, cu integrări și plăți incluse.'}),
  service('mobile',
    {title: 'Sviluppo mobile', text: 'App native o cross-platform che i tuoi utenti aprono davvero, non solo scaricano una volta e dimenticano.'},
    {title: 'Mobile development', text: 'Native or cross-platform apps your users actually open, not just download once and forget.'},
    {title: 'Dezvoltare mobile', text: 'Aplicații native sau cross-platform pe care utilizatorii tăi chiar le deschid, nu doar le descarcă o dată și le uită.'}),
  service('design',
    {title: 'Design UI / UX', text: 'Interfacce chiare che guidano l\'utente dove deve arrivare — belle sì, ma soprattutto che funzionano.'},
    {title: 'UI / UX design', text: 'Clear interfaces that guide users where they need to go — beautiful, yes, but above all working.'},
    {title: 'Design UI / UX', text: 'Interfețe clare care îl conduc pe utilizator acolo unde trebuie să ajungă — frumoase, da, dar mai ales funcționale.'}),
  service('devops',
    {title: 'DevOps & Infrastruttura', text: 'Cloud, deploy automatici e monitoraggio. Finito vuol dire online e stabile, non "funziona sul mio computer".'},
    {title: 'DevOps & Infrastructure', text: 'Cloud, automated deploys and monitoring. Done means online and stable, not "it works on my machine".'},
    {title: 'DevOps & Infrastructură', text: 'Cloud, deploy-uri automate și monitorizare. Gata înseamnă online și stabil, nu „pe calculatorul meu merge".'}),
  service('ai',
    {title: 'AI & Automazione', text: 'Chatbot sui tuoi contenuti, dati estratti dai documenti, automazioni e agenti che collegano i tuoi strumenti: l\'AI dove serve davvero, integrata nei sistemi che usi già.'},
    {title: 'AI & Automation', text: 'Chatbots on your own content, data pulled out of documents, automations and agents that connect your tools: AI where it actually helps, built into the systems you already use.'},
    {title: 'AI & Automatizare', text: 'Chatboți pe conținutul tău, date extrase din documente, automatizări și agenți care îți conectează instrumentele: AI acolo unde chiar ajută, integrat în sistemele pe care le folosești deja.'}),
  service('formazione',
    {title: 'Formazione e mentoring', text: 'Corsi e mentoring per sviluppatori che vogliono crescere sul serio, anche nel lavorare con gli assistenti AI: non copiare codice, ma capirlo e dirigerlo.'},
    {title: 'Training and mentoring', text: 'Courses and mentoring for developers who want to really grow, including working with AI assistants: not copying code, but understanding and directing it.'},
    {title: 'Formare și mentorat', text: 'Cursuri și mentorat pentru dezvoltatorii care vor să crească pe bune, inclusiv în lucrul cu asistenții AI: nu să copieze cod, ci să-l înțeleagă și să-l dirijeze.'}),
  service('consulenza',
    {title: 'Consulenza tecnica', text: 'Code review, architettura, scelta dello stack e dove l\'AI ha senso (e dove no) — un parere esterno onesto, anche quando la risposta è "meglio riscriverlo".'},
    {title: 'Technical consulting', text: 'Code reviews, architecture, choosing the stack and where AI makes sense (and where it doesn\'t) — an honest outside opinion, even when the answer is "better rewrite it".'},
    {title: 'Consultanță tehnică', text: 'Code review, arhitectură, alegerea stack-ului și unde are sens AI-ul (și unde nu) — o părere externă sinceră, chiar și când răspunsul este „mai bine îl rescriem".'}),
]

/** Technologies of a group (see `group` in setup.mjs): how much I use them, not a rating. */
const tech = group => name => ({name, group})

const TECHNOLOGIES = [
  ...['HTML5', 'CSS3 / SASS', 'Tailwind CSS', 'JavaScript', 'TypeScript', 'Vue.js / Nuxt.js', 'Node.js', 'PHP',
    'Laravel', 'Directus', 'MySQL / SQL Server / MongoDB', 'Git / CI/CD', 'Docker', 'Claude Code'].map(tech('daily')),
  ...['Bootstrap', 'jQuery', 'Ionic', 'Webpack / Vite', 'Express / AdonisJS / Nest.js', 'Statamic', 'GraphQL',
    'DigitalOcean', 'Laravel Forge / Cleavr'].map(tech('production')),
  ...['Go', 'NativeScript', 'React', 'Python', 'Rust', 'C#', 'API LLM (Claude, OpenAI)'].map(tech('explored')),
]

// --- pages -------------------------------------------------------------------------------
// Labels starting with `//` are shown as they are; the others are numbered by the site.

/** A section: a block of the given type, with its own fields and the translated ones. */
const section = (collection, fields, byLocale) => ({collection, item: {...fields, translations: tr(byLocale)}})
/** The same text in the three languages, for fields like `{label: 'stack'}`. */
const same = fields => ({it: fields, en: fields, ro: fields})
const lines = (...items) => items.join('\n')
const paras = (...items) => items.join('\n\n')
/** A gallery's images, from directus/seed-files: uploaded when the gallery is created. */
const files = (...names) => ({seedFiles: names})

const PAGES = [
  {
    key: 'home',
    in_menu: true,
    translations: tr({
      it: {slug: '', title: 'Home', seo_title: 'Dall\'idea al server: siti, app e SaaS che arrivano online e ci restano', description: 'Sviluppatore Web & Mobile a Schio (Vicenza): siti, app e SaaS che arrivano online e ci restano. {years} anni tra sviluppo, design e infrastruttura.'},
      en: {slug: '', title: 'Home', seo_title: 'From idea to server: websites, apps and SaaS that go live and stay live', description: 'Web & Mobile Developer in Schio (Vicenza, Italy): websites, apps and SaaS that go live and stay live. {years} years across development, design and infrastructure.'},
      ro: {slug: '', title: 'Acasă', seo_title: 'De la idee la server: site-uri, aplicații și SaaS care ajung online și rămân acolo', description: 'Dezvoltator Web & Mobile în Schio (Vicenza, Italia): site-uri, aplicații și SaaS care ajung online și rămân acolo. {years} ani între dezvoltare, design și infrastructură.'},
    }),
    sections: [
      section('block_hero_home', {}, {
        it: {
          title: 'Dall\'idea',
          title_accent: 'al server',
          text: 'Siti, app e SaaS che arrivano online e ci restano. {years} anni tra sviluppo, design e infrastruttura.',
          legacy_text: 'Da {years} anni trasformo idee in siti, app e interfacce che funzionano davvero. Questa pagina è servita dal vecchio DOM: testo, link blu e tabelle.',
        },
        en: {
          title: 'From idea',
          title_accent: 'to server',
          text: 'Websites, apps and SaaS that go live and stay live. {years} years across development, design and infrastructure.',
          legacy_text: 'For {years} years I have been turning ideas into websites, apps and interfaces that actually work. This page is served by the old DOM: text, blue links and tables.',
        },
        ro: {
          title: 'De la idee',
          title_accent: 'la server',
          text: 'Site-uri, aplicații și SaaS care ajung online și rămân acolo. {years} ani între dezvoltare, design și infrastructură.',
          legacy_text: 'De {years} ani transform idei în site-uri, aplicații și interfețe care chiar funcționează. Această pagină este servită de vechiul DOM: text, linkuri albastre și tabele.',
        },
      }),
      section('block_services', {}, {
        it: {label: 'servizi', title: 'Cosa posso fare per te?', text: 'Che ti serva un sito, un\'app o un\'interfaccia che non faccia scappare gli utenti, ecco come posso aiutarti:'},
        en: {label: 'services', title: 'What can I do for you?', text: 'Whether you need a website, an app or an interface that doesn\'t scare users away, here\'s how I can help:'},
        ro: {label: 'servicii', title: 'Ce pot face pentru tine?', text: 'Fie că ai nevoie de un site, de o aplicație sau de o interfață care să nu-i alunge pe utilizatori, iată cum te pot ajuta:'},
      }),
      section('block_projects', {show: 'home', all_link: true}, {
        it: {label: 'progetti', title: 'Lavori selezionati'},
        en: {label: 'projects', title: 'Selected work'},
        ro: {label: 'proiecte', title: 'Lucrări selectate'},
      }),
      section('block_contact_form', {}, {
        it: {label: 'contatti', title: 'Parliamone', text: 'Hai un progetto, un problema o solo un dubbio tecnico? Scrivimi: ti dico onestamente cosa farei, senza giri di parole.', steps_title: 'Come funziona', steps: lines('Mi scrivi (anche due righe vanno bene)', 'Ti rispondo entro 1–2 giorni lavorativi e, se serve, ci sentiamo in una call di 30 minuti', 'Ti mando una proposta chiara: tempi, costi, cosa è incluso')},
        en: {label: 'contact', title: 'Let\'s talk', text: 'Got a project, a problem or just a technical question? Write to me: I\'ll tell you honestly what I\'d do, no beating around the bush.', steps_title: 'How it works', steps: lines('You write to me (two lines are enough)', 'I reply within 1–2 working days and, if needed, we have a 30-minute call', 'I send you a clear proposal: timing, costs, what\'s included')},
        ro: {label: 'contact', title: 'Hai să vorbim', text: 'Ai un proiect, o problemă sau doar o nelămurire tehnică? Scrie-mi: îți spun sincer ce aș face, fără ocolișuri.', steps_title: 'Cum funcționează', steps: lines('Îmi scrii (sunt de ajuns două rânduri)', 'Îți răspund în 1–2 zile lucrătoare și, dacă e nevoie, vorbim într-un call de 30 de minute', 'Îți trimit o propunere clară: termene, costuri, ce este inclus')},
      }),
    ],
  },
  {
    key: 'about',
    in_menu: true,
    translations: tr({
      it: {slug: 'chi-sono', title: 'Chi sono', description: 'Sono Leica Florian Robert, sviluppatore Web & Mobile: sviluppo full stack, progetto interfacce (UI e UX) e insegno tecnologie web.'},
      en: {slug: 'about', title: 'About me', description: 'I\'m Leica Florian Robert, a Web & Mobile Developer: I build full stack, design interfaces (UI and UX) and teach web technologies.'},
      ro: {slug: 'despre-mine', title: 'Despre mine', description: 'Sunt Leica Florian Robert, dezvoltator Web & Mobile: dezvolt full stack, proiectez interfețe (UI și UX) și predau tehnologii web.'},
    }),
    sections: [
      section('block_page_header', {variant: 'about'}, {
        it: {label: '// su di me', title: 'Ciao, piacere', intro: 'Sono Leica Florian Robert, sviluppatore Web & Mobile: sviluppo full stack, progetto interfacce (UI e UX) e insegno tecnologie web. Sono un grande appassionato d\'informatica e di tecnologia.'},
        en: {label: '// about me', title: 'Hi, nice to meet you', intro: 'I\'m Leica Florian Robert, a Web & Mobile Developer: I build full stack, design interfaces (UI and UX) and teach web technologies. I\'m a big fan of computing and technology.'},
        ro: {label: '// despre mine', title: 'Salut, încântat de cunoștință', intro: 'Sunt Leica Florian Robert, dezvoltator Web & Mobile: dezvolt full stack, proiectez interfețe (UI și UX) și predau tehnologii web. Sunt un mare pasionat de informatică și tehnologie.'},
      }),
      section('block_text', {widgets: ['web', 'editor', 'lesson', 'agent']}, {
        it: {
          label: 'storia',
          title: 'Da autodidatta a sviluppatore',
          steps: lines('l\'inizio', 'la crescita', 'insegnare', 'oggi'),
          text: paras(
            'Ho cominciato a programmare da autodidatta, a 20 anni, nel 2009, con un\'applicazione in Visual Basic per l\'Ordine degli Ingegneri della Provincia di Potenza, sviluppata per Tecnobit. Nessun corso, solo qualche dritta da un amico: per il resto documentazione, tentativi ed errori. Volevo capire come funziona il web e, prima o poi, farne parte.',
            'Un tassello alla volta, quella curiosità è diventata un mestiere. Mi sono messo alla prova su progetti sempre più grandi, fino a co-fondare una software house e a guidare, da CTO, la parte tecnica di una web agency: backend in Laravel e Node.js, interfacce in Vue e Nuxt, app mobile. Mi è capitato di sbagliare, e ogni errore mi ha insegnato qualcosa che un manuale non spiega.',
            'Ho imparato da solo, e per questo so quanto conta avere qualcuno che ti spiega le cose bene. Per quasi tre anni, dal 2021 al 2024, ho formato programmatori Full Stack con Boolean Careers, insegnando loro quello che serve per lavorare davvero. Spiegare mi ha costretto a capire ogni cosa fino in fondo, e mi ha reso uno sviluppatore migliore.',
            'Oggi lavoro come sviluppatore e continuo a guardare dove sta andando la tecnologia. Soprattutto l\'AI, che sta cambiando il modo di lavorare in molti settori. Per me è uno strumento come gli altri, e come ogni buon strumento semplifica molte cose: la uso ogni giorno come un collega instancabile, che scrive e verifica codice sotto la mia direzione. Questo sito ne è la prova, e lo racconto nel suo case study.',
          ),
        },
        en: {
          label: 'story',
          title: 'From self-taught to developer',
          steps: lines('the start', 'growing', 'teaching', 'today'),
          text: paras(
            'I started programming self-taught at 20, in 2009, with a Visual Basic application for the Order of Engineers of the Province of Potenza, built for Tecnobit. No courses, just a few tips from a friend: the rest was documentation, trial and error. I wanted to understand how the web works and, sooner or later, be part of it.',
            'Piece by piece, that curiosity became a trade. I tested myself on bigger and bigger projects, up to co-founding a software house and leading, as CTO, the technical side of a web agency: Laravel and Node.js backends, Vue and Nuxt interfaces, mobile apps. I made mistakes along the way, and every one taught me something no manual explains.',
            'I learned on my own, and that\'s why I know how much it matters to have someone who explains things well. For almost three years, from 2021 to 2024, I trained Full Stack developers at Boolean Careers, teaching them what they need to really do the job. Explaining forced me to understand everything all the way down, and made me a better developer.',
            'Today I work as a developer and keep watching where technology is going. Above all AI, which is changing how people work in many fields. To me it\'s a tool like any other, and like every good tool it makes many things simpler: I use it every day like a tireless colleague that writes and checks code under my direction. This site is the proof, and I tell the story in its case study.',
          ),
        },
        ro: {
          label: 'poveste',
          title: 'De la autodidact la dezvoltator',
          steps: lines('începutul', 'creșterea', 'predarea', 'azi'),
          text: paras(
            'Am început să programez ca autodidact la 20 de ani, în 2009, cu o aplicație în Visual Basic pentru Ordinul Inginerilor din Provincia Potenza, dezvoltată pentru Tecnobit. Niciun curs, doar câteva sfaturi de la un prieten: în rest, documentație, încercări și greșeli. Voiam să înțeleg cum funcționează web-ul și, mai devreme sau mai târziu, să fac parte din el.',
            'Pas cu pas, acea curiozitate a devenit o meserie. M-am pus la încercare pe proiecte tot mai mari, până la a co-fonda o software house și a conduce, ca CTO, partea tehnică a unei agenții web: backend în Laravel și Node.js, interfețe în Vue și Nuxt, aplicații mobile. Mi s-a întâmplat să greșesc, iar fiecare greșeală m-a învățat ceva ce niciun manual nu explică.',
            'Am învățat singur și de aceea știu cât contează să ai pe cineva care îți explică bine lucrurile. Timp de aproape trei ani, din 2021 până în 2024, am format programatori Full Stack la Boolean Careers, învățându-i ce le trebuie ca să lucreze cu adevărat. Să explic m-a obligat să înțeleg totul până la capăt și m-a făcut un dezvoltator mai bun.',
            'Astăzi lucrez ca dezvoltator și continui să urmăresc încotro merge tehnologia. Mai ales AI-ul, care schimbă felul în care se lucrează în multe domenii. Pentru mine e un instrument ca oricare altul și, ca orice instrument bun, simplifică multe lucruri: îl folosesc zilnic ca pe un coleg neobosit, care scrie și verifică cod sub îndrumarea mea. Acest site este dovada, iar povestea o spun în studiul lui de caz.',
          ),
        },
      }),
      section('block_experiences', {}, {
        it: {label: 'esperienze', title: 'Ecco alcune esperienze', text: 'Queste sono alcune delle esperienze più significative che ho avuto nel corso della mia carriera. Ci sono stati molti altri progetti e collaborazioni, e tutte queste esperienze mi hanno permesso di crescere professionalmente, ma sicuramente queste sono le più importanti.'},
        en: {label: 'experience', title: 'Some of my experience', text: 'These are some of the most significant experiences of my career. There have been many other projects and collaborations, and all of them helped me grow professionally, but these are certainly the most important.'},
        ro: {label: 'experiență', title: 'Câteva dintre experiențele mele', text: 'Acestea sunt câteva dintre cele mai semnificative experiențe din cariera mea. Au mai fost multe alte proiecte și colaborări, iar toate m-au ajutat să cresc profesional, dar acestea sunt cu siguranță cele mai importante.'},
      }),
      section('block_stack', {}, {
        it: {label: 'stack', title: 'Tecnologie e linguaggi'},
        en: {label: 'stack', title: 'Technologies and languages'},
        ro: {label: 'stack', title: 'Tehnologii și limbaje'},
      }),
      section('block_cta', {variant: 'banner', engines: 'native'}, {
        it: {title: 'Ora sai qualcosa in più,', title_accent: 'scrivimi', text: 'Se hai bisogno di un sito web, di un\'applicazione mobile, di un logo o di un\'identità visiva, o se hai semplicemente bisogno di un consiglio, non esitare a contattarmi! Sono sempre alla ricerca di nuove sfide, nuovi entusiasmanti progetti e nuove opportunità per migliorare come persona e come professionista.'},
        en: {title: 'Now you know a bit more,', title_accent: 'drop me a line', text: 'If you need a website, a mobile app, a logo or a visual identity, or if you simply need some advice, don\'t hesitate to get in touch! I\'m always looking for new challenges, exciting new projects and new opportunities to grow as a person and as a professional.'},
        ro: {title: 'Acum știi ceva mai mult,', title_accent: 'scrie-mi', text: 'Dacă ai nevoie de un site web, de o aplicație mobilă, de un logo sau de o identitate vizuală, sau dacă ai nevoie pur și simplu de un sfat, nu ezita să mă contactezi! Sunt mereu în căutarea unor noi provocări, a unor proiecte noi și interesante și a unor noi oportunități de a mă dezvolta ca om și ca profesionist.'},
      }),
    ],
  },
  {
    key: 'projects',
    in_menu: true,
    children: 'projects',
    translations: tr({
      it: {slug: 'progetti', title: 'Progetti', description: 'Alcuni dei progetti che ho realizzato: siti, web app, app mobile ed esperimenti.'},
      en: {slug: 'projects', title: 'Projects', description: 'Some of the projects I\'ve built: websites, web apps, mobile apps and experiments.'},
      ro: {slug: 'proiecte', title: 'Proiecte', description: 'Câteva dintre proiectele pe care le-am realizat: site-uri, aplicații web, aplicații mobile și experimente.'},
    }),
    sections: [
      section('block_page_header', {variant: 'projects'}, {
        it: {
          label: '// {n} progetti',
          title: 'Progetti',
          intro: paras(
            'Siti, piattaforme, app, infrastrutture: qui sotto una parte di quello che ho costruito, per clienti e per me. Oggi lavoro anche con l\'AI, che mi fa andare più veloce, mentre decisioni, architettura e qualità restano mie. Hai qualcosa di diverso in mente? Scrivimi.',
          ),
        },
        en: {
          label: '// {n} projects',
          title: 'Projects',
          intro: paras(
            'Websites, platforms, apps, infrastructure: below is part of what I\'ve built, for clients and for myself. Today I also work with AI, which makes me faster, while the decisions, the architecture and the quality stay mine. Have something different in mind? Write to me.',
          ),
        },
        ro: {
          label: '// {n} proiecte',
          title: 'Proiecte',
          intro: paras(
            'Site-uri, platforme, aplicații, infrastructuri: mai jos e o parte din ce am construit, pentru clienți și pentru mine. Astăzi lucrez și cu AI, care mă face mai rapid, în timp ce deciziile, arhitectura și calitatea rămân ale mele. Ai altceva în minte? Scrie-mi.',
          ),
        },
      }),
      section('block_projects', {show: 'featured'}, {
        it: {label: 'in evidenza'},
        en: {label: 'featured'},
        ro: {label: 'în evidență'},
      }),
      section('block_projects', {show: 'archive', kind: 'direct'}, {
        it: {label: 'clienti', title: 'Lavori per i clienti'},
        en: {label: 'clients', title: 'Client work'},
        ro: {label: 'clienți', title: 'Lucrări pentru clienți'},
      }),
      section('block_projects', {show: 'grouped', kind: 'agency'}, {
        it: {label: 'agenzie', title: 'Tramite agenzia'},
        en: {label: 'agencies', title: 'Through agencies'},
        ro: {label: 'agenții', title: 'Prin agenții'},
      }),
      section('block_projects', {show: 'archive', kind: 'personal'}, {
        it: {label: 'lab', title: 'Progetti personali'},
        en: {label: 'lab', title: 'Personal projects'},
        ro: {label: 'lab', title: 'Proiecte personale'},
      }),
      section('block_cta', {variant: 'banner', engines: 'native'}, {
        it: {title: 'Ora sai qualcosa in più,', title_accent: 'scrivimi', text: 'Sia che tu stia cercando di creare un sito web aziendale, un e-commerce, un blog o qualsiasi altra soluzione web, sono qui per aiutarti. Contattami oggi stesso per scoprire come possiamo collaborare e creare un sito web straordinario insieme!'},
        en: {title: 'Now you know a bit more,', title_accent: 'drop me a line', text: 'Whether you want to build a company website, an online shop, a blog or any other web solution, I\'m here to help. Get in touch today to find out how we can work together and build an outstanding website!'},
        ro: {title: 'Acum știi ceva mai mult,', title_accent: 'scrie-mi', text: 'Fie că vrei să creezi un site de prezentare, un magazin online, un blog sau orice altă soluție web, sunt aici să te ajut. Contactează-mă chiar azi ca să vedem cum putem colabora și crea împreună un site extraordinar!'},
      }),
    ],
  },
  {
    key: 'contact',
    in_menu: true,
    translations: tr({
      it: {slug: 'contatti', title: 'Contatti', description: 'Sito, app, consulenza o solo un parere tecnico — scrivimi e vediamo insieme come darti una mano.'},
      en: {slug: 'contact', title: 'Contact', description: 'A website, an app, consulting or just a technical opinion — write to me and let\'s figure out together how I can help.'},
      ro: {slug: 'contact', title: 'Contact', description: 'Site, aplicație, consultanță sau doar o părere tehnică — scrie-mi și vedem împreună cum te pot ajuta.'},
    }),
    sections: [
      section('block_page_header', {variant: 'contact'}, {
        it: {title: 'Contatti', intro: 'Raccontami cosa hai in mente, anche se è solo un\'idea abbozzata. Nessun impegno.'},
        en: {title: 'Contact', intro: 'Tell me what you have in mind, even if it\'s just a rough idea. No commitment.'},
        ro: {title: 'Contact', intro: 'Povestește-mi ce ai în minte, chiar dacă e doar o idee schițată. Fără niciun angajament.'},
      }),
      section('block_contact_info', {engines: 'legacy'}, same({})),
      section('block_contact_form', {}, {
        it: {label: 'scrivimi', title: 'Parliamone', steps_title: 'Come funziona', steps: lines('Mi scrivi (anche due righe vanno bene)', 'Ti rispondo entro 1–2 giorni lavorativi e, se serve, ci sentiamo in una call di 30 minuti', 'Ti mando una proposta chiara: tempi, costi, cosa è incluso')},
        en: {label: 'write to me', title: 'Let\'s talk', steps_title: 'How it works', steps: lines('You write to me (two lines are enough)', 'I reply within 1–2 working days and, if needed, we have a 30-minute call', 'I send you a clear proposal: timing, costs, what\'s included')},
        ro: {label: 'scrie-mi', title: 'Hai să vorbim', steps_title: 'Cum funcționează', steps: lines('Îmi scrii (sunt de ajuns două rânduri)', 'Îți răspund în 1–2 zile lucrătoare și, dacă e nevoie, vorbim într-un call de 30 de minute', 'Îți trimit o propunere clară: termene, costuri, ce este inclus')},
      }),
      section('block_contact_info', {engines: 'native'}, {
        it: {label: 'recapiti', title: 'Dove trovarmi'},
        en: {label: 'details', title: 'Where to find me'},
        ro: {label: 'date de contact', title: 'Unde mă găsești'},
      }),
    ],
  },
  {
    key: 'privacy',
    in_menu: false,
    translations: tr({
      it: {slug: 'privacy', title: 'Privacy', description: 'Come tratto i dati che mi lasci quando mi scrivi dal modulo di contatto di questo sito.'},
      en: {slug: 'privacy', title: 'Privacy', description: 'How I handle the data you leave me when you write to me through this site\'s contact form.'},
      ro: {slug: 'confidentialitate', title: 'Confidențialitate', description: 'Cum folosesc datele pe care mi le lași când îmi scrii prin formularul de contact al acestui site.'},
    }),
    sections: [
      section('block_page_header', {}, {
        it: {title: 'Informativa privacy', intro: 'Come tratto i dati che mi lasci quando mi scrivi dal modulo di contatto di questo sito.'},
        en: {title: 'Privacy policy', intro: 'How I handle the data you leave me when you write to me through this site\'s contact form.'},
        ro: {title: 'Politica de confidențialitate', intro: 'Cum folosesc datele pe care mi le lași când îmi scrii prin formularul de contact al acestui site.'},
      }),
      section('block_text', {}, {
        it: {title: 'Titolare del trattamento', text: 'Il titolare è **Leica Florian Robert**, ditta individuale con sede a Schio (VI), P. IVA 04329800249. Per qualsiasi domanda sui tuoi dati scrivimi a info@leicaflorianrobert.dev.'},
        en: {title: 'Data controller', text: 'The controller is **Leica Florian Robert**, a sole proprietorship based in Schio (VI), Italy, VAT no. 04329800249. For any question about your data, write to me at info@leicaflorianrobert.dev.'},
        ro: {title: 'Operatorul de date', text: 'Operatorul este **Leica Florian Robert**, întreprindere individuală cu sediul în Schio (VI), Italia, cod TVA 04329800249. Pentru orice întrebare despre datele tale, scrie-mi la info@leicaflorianrobert.dev.'},
      }),
      section('block_text', {}, {
        it: {title: 'Quali dati raccolgo', text: paras('Dal modulo di contatto: nome, indirizzo email e messaggio e, se li scegli, tipo di progetto, budget e tempistiche, oltre alla lingua della pagina da cui scrivi.', 'Non ti chiedo dati particolari (sulla salute, giudiziari e simili): ti chiedo di non inserirli nel messaggio.')},
        en: {title: 'What data I collect', text: paras('From the contact form: name, email address and message and, if you pick them, project type, budget and timing, plus the language of the page you write from.', 'I don\'t ask for special categories of data (health, criminal records and the like): please don\'t put them in the message.')},
        ro: {title: 'Ce date colectez', text: paras('Din formularul de contact: numele, adresa de email și mesajul și, dacă le alegi, tipul de proiect, bugetul și termenele, plus limba paginii din care scrii.', 'Nu îți cer date speciale (despre sănătate, cazier și altele asemenea): te rog să nu le scrii în mesaj.')},
      }),
      section('block_text', {}, {
        it: {title: 'Perché li uso', text: paras('Solo per risponderti e, se ne nasce una collaborazione, per prepararti una proposta. La base giuridica è l\'esecuzione di misure precontrattuali richieste da te (art. 6, par. 1, lett. b del GDPR).', 'Non uso i dati per newsletter o marketing, e non li vendo né li cedo a terzi.')},
        en: {title: 'Why I use it', text: paras('Only to reply to you and, if we end up working together, to prepare a proposal. The legal basis is taking steps at your request before entering into a contract (Art. 6(1)(b) GDPR).', 'I don\'t use the data for newsletters or marketing, and I don\'t sell or pass it on to third parties.')},
        ro: {title: 'De ce le folosesc', text: paras('Doar ca să-ți răspund și, dacă ajungem să colaborăm, ca să-ți pregătesc o propunere. Temeiul legal este efectuarea unor demersuri la cererea ta înainte de încheierea unui contract (art. 6 alin. (1) lit. b din GDPR).', 'Nu folosesc datele pentru newslettere sau marketing și nu le vând și nu le transmit terților.')},
      }),
      section('block_text', {}, {
        it: {title: 'Dove sono e per quanto tempo', text: 'Il messaggio viene salvato nel sistema che gestisce i contenuti del sito e mi arriva per email. Lo conservo per il tempo necessario a gestire la richiesta, e comunque non oltre 24 mesi dall\'ultimo contatto; se nasce un rapporto di lavoro, valgono i tempi di conservazione previsti dalla legge per i documenti fiscali.'},
        en: {title: 'Where it is and for how long', text: 'The message is saved in the system that manages the site\'s content and reaches me by email. I keep it as long as needed to handle the request, and in any case no longer than 24 months after our last contact; if we end up working together, the retention periods required by law for tax records apply.'},
        ro: {title: 'Unde sunt și cât timp', text: 'Mesajul este salvat în sistemul care gestionează conținutul site-ului și îmi ajunge pe email. Îl păstrez cât timp e nevoie pentru a gestiona cererea și, oricum, nu mai mult de 24 de luni de la ultimul contact; dacă ajungem să colaborăm, se aplică termenele de păstrare prevăzute de lege pentru documentele fiscale.'},
      }),
      section('block_text', {}, {
        it: {title: 'Protezione dallo spam', text: 'Per proteggere il modulo dallo spam uso **Google reCAPTCHA v3**, che analizza alcune informazioni sul dispositivo e sull\'uso della pagina e può impostare dei cookie. Questi dati sono trattati da Google secondo la propria informativa (policies.google.com/privacy) e possono essere trasferiti fuori dall\'Unione europea.'},
        en: {title: 'Spam protection', text: 'To protect the form from spam I use **Google reCAPTCHA v3**, which analyses some information about the device and how the page is used, and may set cookies. This data is processed by Google under its own policy (policies.google.com/privacy) and may be transferred outside the European Union.'},
        ro: {title: 'Protecția împotriva spamului', text: 'Ca să protejez formularul de spam folosesc **Google reCAPTCHA v3**, care analizează unele informații despre dispozitiv și despre folosirea paginii și poate seta cookie-uri. Aceste date sunt prelucrate de Google conform propriei politici (policies.google.com/privacy) și pot fi transferate în afara Uniunii Europene.'},
      }),
      section('block_text', {}, {
        it: {title: 'Cookie e preferenze', text: 'Il sito non usa cookie di profilazione né strumenti di statistica. Salva nel tuo browser solo la scelta tra la versione legacy e quella nativa, per ricordarla alla prossima visita.'},
        en: {title: 'Cookies and preferences', text: 'The site uses no profiling cookies and no analytics. It only saves in your browser your choice between the legacy and the native version, to remember it on your next visit.'},
        ro: {title: 'Cookie-uri și preferințe', text: 'Site-ul nu folosește cookie-uri de profilare și nici instrumente de statistică. Salvează în browserul tău doar alegerea dintre versiunea legacy și cea nativă, ca s-o țină minte la următoarea vizită.'},
      }),
      section('block_text', {}, {
        it: {title: 'I tuoi diritti', text: paras('Puoi chiedermi in ogni momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne il trattamento, opporti al trattamento o riceverli in un formato leggibile (artt. 15–22 del GDPR), scrivendo all\'email qui sopra.', 'Se ritieni che il trattamento non sia corretto, puoi presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).')},
        en: {title: 'Your rights', text: paras('You can ask me at any time to access, correct or delete your data, restrict or object to its processing, or receive it in a readable format (Art. 15–22 GDPR), by writing to the email above.', 'If you believe the processing isn\'t lawful, you can lodge a complaint with the Italian data protection authority, the Garante per la protezione dei dati personali (garanteprivacy.it).')},
        ro: {title: 'Drepturile tale', text: paras('Îmi poți cere oricând să îți accesez, corectez sau șterg datele, să le restricționez prelucrarea, să te opui prelucrării sau să le primești într-un format ușor de citit (art. 15–22 din GDPR), scriindu-mi la adresa de email de mai sus.', 'Dacă crezi că prelucrarea nu este corectă, poți depune o plângere la autoritatea italiană pentru protecția datelor, Garante per la protezione dei dati personali (garanteprivacy.it).')},
      }),
    ],
  },
]

// --- case studies ------------------------------------------------------------------------
// The case study fields and sections of the projects with `case_study`.

const NEXT_STEP = section('block_cta', {variant: 'split', engines: 'native'}, {
  it: {label: '// prossimo passo', title: 'Hai un progetto simile in mente?'},
  en: {label: '// next step', title: 'Got a similar project in mind?'},
  ro: {label: '// pasul următor', title: 'Ai un proiect asemănător în minte?'},
})

const CASE_STUDIES = {
  v3: {
    year: 2026,
    translations: {
      it: {intro: 'Il restyling del mio portfolio: un sito che non si limita a mostrare i progetti, ma racconta in prima persona il passaggio dal vecchio web al rendering moderno.', role: 'Design e sviluppo', type: 'Portfolio personale', stack: 'Nuxt, Tailwind, Directus'},
      en: {intro: 'The redesign of my portfolio: a site that doesn\'t just show projects, but tells first-hand the move from the old web to modern rendering.', role: 'Design and development', type: 'Personal portfolio', stack: 'Nuxt, Tailwind, Directus'},
      ro: {intro: 'Redesignul portofoliului meu: un site care nu se limitează să prezinte proiectele, ci povestește la persoana întâi trecerea de la web-ul vechi la randarea modernă.', role: 'Design și dezvoltare', type: 'Portofoliu personal', stack: 'Nuxt, Tailwind, Directus'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'punto di partenza',
          title: 'Chiaro, ma silenzioso',
          text: paras(
            'La V2 era ordinata e funzionale: palette chiara e calda, testi discorsivi, nessuna anteprima dei lavori in home. Presentava bene i servizi, ma non mostrava cosa so fare.',
            'Gli obiettivi della V3: una grafica più moderna e contrastata, più immagini, e un\'identità che parli da sviluppatore.',
          ),
        },
        en: {
          label: 'starting point',
          title: 'Clear, but quiet',
          text: paras(
            'V2 was tidy and functional: a light, warm palette, wordy copy, no previews of my work on the home page. It presented the services well, but didn\'t show what I can do.',
            'The goals for V3: a more modern, higher-contrast look, more images, and an identity that speaks like a developer.',
          ),
        },
        ro: {
          label: 'punct de plecare',
          title: 'Clar, dar tăcut',
          text: paras(
            'V2 era ordonată și funcțională: o paletă deschisă și caldă, texte lungi, nicio previzualizare a lucrărilor pe prima pagină. Prezenta bine serviciile, dar nu arăta ce știu să fac.',
            'Obiectivele V3: o grafică mai modernă și mai contrastantă, mai multe imagini și o identitate care să vorbească precum un dezvoltator.',
          ),
        },
      }),
      section('block_gallery', {images: files('cs-v3-legacy.png', 'cs-v3-native.png')}, {
        it: {
          label: 'concept',
          title: 'Il Motore Duale',
          text: paras(
            'Il sito si apre in modalità **Legacy**: Times New Roman, link blu sottolineati, foto in bianco e nero in una cornice grigia. Un ipertesto anni \'90.',
            'Un pulsante, **Attiva Rendering Nativo**, avvia una breve sequenza di boot con glitch e porta alla versione **Native**: scura, monospace, con accenti arancio. La scelta resta memorizzata tra le pagine.',
          ),
          captions: lines('legacy', '**native**'),
        },
        en: {
          label: 'concept',
          title: 'The Dual Engine',
          text: paras(
            'The site opens in **Legacy** mode: Times New Roman, underlined blue links, a black-and-white photo in a grey frame. A 90s hypertext.',
            'A button, **Enable Native Rendering**, starts a short boot sequence with a glitch and leads to the **Native** version: dark, monospaced, with orange accents. The choice is remembered across pages.',
          ),
          captions: lines('legacy', '**native**'),
        },
        ro: {
          label: 'concept',
          title: 'Motorul Dual',
          text: paras(
            'Site-ul se deschide în modul **Legacy**: Times New Roman, linkuri albastre subliniate, o fotografie alb-negru într-o ramă gri. Un hipertext din anii \'90.',
            'Un buton, **Activează randarea nativă**, pornește o scurtă secvență de boot cu un glitch și duce la versiunea **Native**: întunecată, monospațiată, cu accente portocalii. Alegerea este memorată între pagini.',
          ),
          captions: lines('legacy', '**native**'),
        },
      }),
      section('block_palette', {colors: lines('#111113', '#18181B', '#EDEBE6', '#FF5B14'), site_logo: true}, {
        it: {
          label: 'sistema visivo',
          title: 'Pochi elementi, molto contrasto',
          text: 'Un nero morbido invece del nero assoluto, un solo colore d\'accento e un unico carattere: JetBrains Mono, dal titolo al form.',
          color_names: lines('sfondo', 'superficie', 'testo', 'accento'),
          logo_text: 'Il nuovo logo: le iniziali in minuscolo con il cursore, come un comando da terminale. Sostituisce il monogramma FR con le due L rovesciate.',
        },
        en: {
          label: 'visual system',
          title: 'Few elements, lots of contrast',
          text: 'A soft black instead of pure black, a single accent colour and a single typeface: JetBrains Mono, from the headline to the form.',
          color_names: lines('background', 'surface', 'text', 'accent'),
          logo_text: 'The new logo: lowercase initials with a cursor, like a terminal command. It replaces the FR monogram with the two flipped Ls.',
        },
        ro: {
          label: 'sistem vizual',
          title: 'Puține elemente, mult contrast',
          text: 'Un negru moale în loc de negru absolut, o singură culoare de accent și un singur font: JetBrains Mono, de la titlu la formular.',
          color_names: lines('fundal', 'suprafață', 'text', 'accent'),
          logo_text: 'Noul logo: inițialele cu litere mici și cursorul, ca o comandă de terminal. Înlocuiește monograma FR cu cei doi L răsturnați.',
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'dettagli',
          title: 'Movimento e respiro',
          items: lines(
            'Hover con curva a molla su card e pulsanti, invece di transizioni lineari.',
            'Parallasse leggera su foto, alone e snippet di codice nella hero.',
            'Spaziature verticali ampie tra le sezioni, colonna di 1120px.',
            'Progetti mostrati in mockup laptop e smartphone, servizi con immagine.',
            'Su mobile i servizi diventano uno slider orizzontale.',
          ),
        },
        en: {
          label: 'details',
          title: 'Motion and room to breathe',
          items: lines(
            'Spring-curve hover on cards and buttons instead of linear transitions.',
            'Subtle parallax on the photo, glow and code snippet in the hero.',
            'Generous vertical spacing between sections, a 1120px column.',
            'Projects shown in laptop and smartphone mockups, services with images.',
            'On mobile, the services become a horizontal slider.',
          ),
        },
        ro: {
          label: 'detalii',
          title: 'Mișcare și spațiu',
          items: lines(
            'Hover cu curbă „arc" pe carduri și butoane, în loc de tranziții liniare.',
            'Paralaxă ușoară pe fotografie, halou și fragmentul de cod din hero.',
            'Spații verticale generoase între secțiuni, o coloană de 1120px.',
            'Proiecte prezentate în machete de laptop și smartphone, servicii cu imagine.',
            'Pe mobil, serviciile devin un slider orizontal.',
          ),
        },
      }),
      section('block_gallery', {engines: 'native'}, {
        it: {captions: lines('Chi sono', 'Versione mobile')},
        en: {captions: lines('About me', 'Mobile version')},
        ro: {captions: lines('Despre mine', 'Versiunea mobilă')},
      }),
      section('block_text', {}, {
        it: {
          label: 'come è stato costruito',
          title: 'Diretto da me, scritto con l\'AI',
          text: paras(
            'Il design è nato in **Claude Design**. Il codice e i testi li ha scritti **Claude Code**, con il metodo **Superpowers**: per ogni modifica un piano, la mia approvazione, la verifica nel browser in entrambe le modalità e commit piccoli.',
            'Non è un sito generato con un clic: è il risultato di tante scelte, ognuna discussa e decisa da me.',
          ),
        },
        en: {
          label: 'how it was built',
          title: 'Directed by me, written with AI',
          text: paras(
            'The design was born in **Claude Design**. The code and the copy were written by **Claude Code**, with the **Superpowers** method: for every change a plan, my approval, a check in the browser in both modes and small commits.',
            'It isn\'t a site generated with one click: it\'s the result of many choices, each one discussed and decided by me.',
          ),
        },
        ro: {
          label: 'cum a fost construit',
          title: 'Condus de mine, scris cu AI',
          text: paras(
            'Designul s-a născut în **Claude Design**. Codul și textele le-a scris **Claude Code**, cu metoda **Superpowers**: pentru fiecare modificare un plan, aprobarea mea, verificarea în browser în ambele moduri și commit-uri mici.',
            'Nu este un site generat dintr-un clic: este rezultatul multor alegeri, fiecare discutată și decisă de mine.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'chi ha fatto cosa',
          title: 'Io e l\'AI',
          items: lines(
            'Io: obiettivi, architettura, contenuti, e l\'ultima parola su ogni passaggio.',
            'L\'AI: il codice, i testi in tre lingue, le verifiche nel browser e i commit.',
            'Tante idee sono mie: la timeline delle esperienze ripresa dal vecchio sito, sticky e con l\'anno che si accende mentre scorri.',
            'Tante correzioni anche: lo spazio tra le sezioni, i dati allineati al CV, i nomi da non fare.',
          ),
        },
        en: {
          label: 'who did what',
          title: 'Me and the AI',
          items: lines(
            'Me: goals, architecture, content, and the last word on every step.',
            'The AI: the code, the copy in three languages, the browser checks and the commits.',
            'Many ideas are mine: the experience timeline taken from the old site, sticky and lighting up the year as you scroll.',
            'Many corrections too: the spacing between sections, the data aligned with my CV, the names not to mention.',
          ),
        },
        ro: {
          label: 'cine ce a făcut',
          title: 'Eu și AI-ul',
          items: lines(
            'Eu: obiectivele, arhitectura, conținutul și ultimul cuvânt la fiecare pas.',
            'AI-ul: codul, textele în trei limbi, verificările în browser și commit-urile.',
            'Multe idei sunt ale mele: cronologia experiențelor preluată din vechiul site, sticky și cu anul care se aprinde când derulezi.',
            'Și multe corecturi: spațiul dintre secțiuni, datele aliniate cu CV-ul, numele care nu trebuie menționate.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  tfp: {
    year: 2023,
    translations: {
      it: {intro: 'Due anni e mezzo in una web agency da CTO e sviluppatore: siti, web app ed e-commerce, e l\'infrastruttura che li porta online e li tiene in piedi.', role: 'CTO, sviluppo e IT', type: 'Web agency', stack: 'Laravel, Statamic, Vue, Nuxt, Directus, Docker, DigitalOcean'},
      en: {intro: 'Two and a half years at a web agency as CTO and developer: websites, web apps and e-commerce, and the infrastructure that takes them online and keeps them up.', role: 'CTO, development and IT', type: 'Web agency', stack: 'Laravel, Statamic, Vue, Nuxt, Directus, Docker, DigitalOcean'},
      ro: {intro: 'Doi ani și jumătate într-o agenție web ca CTO și dezvoltator: site-uri, aplicații web și e-commerce, plus infrastructura care le pune online și le ține în funcțiune.', role: 'CTO, dezvoltare și IT', type: 'Agenție web', stack: 'Laravel, Statamic, Vue, Nuxt, Directus, Docker, DigitalOcean'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'punto di partenza',
          title: 'Tutto a mano',
          text: paras(
            'Quando sono arrivato i siti erano quasi tutti in WordPress, su pochi server, e si pubblicavano a mano: file trasferiti via FTP, un rilascio alla volta.',
            'La gestione dei server è passata poi a un\'azienda esterna, ma col tempo si è visto che così non era gestibile. Alla fine l\'agenzia l\'ha affidata **interamente a me**.',
          ),
        },
        en: {
          label: 'starting point',
          title: 'Everything by hand',
          text: paras(
            'When I arrived, the sites were almost all WordPress, on a handful of servers, and were published by hand: files uploaded over FTP, one release at a time.',
            'Server management then moved to an outside company, but over time it became clear this wasn\'t manageable. In the end the agency handed it **entirely to me**.',
          ),
        },
        ro: {
          label: 'punct de plecare',
          title: 'Totul de mână',
          text: paras(
            'Când am ajuns, site-urile erau aproape toate în WordPress, pe câteva servere, și se publicau de mână: fișiere transferate prin FTP, câte o lansare pe rând.',
            'Gestionarea serverelor a trecut apoi la o firmă externă, dar cu timpul s-a văzut că așa nu se putea gestiona. În final agenția mi-a încredințat-o **în întregime mie**.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'sviluppo',
          title: 'Cosa ho sviluppato',
          items: lines(
            'Siti web, dallo sviluppo alla messa online.',
            'Web app su misura.',
            'PWA, installabili sul telefono come un\'app.',
            'E-commerce.',
            'Laravel e Statamic sul backend, Vue e Nuxt sul frontend, Directus come CMS headless.',
          ),
        },
        en: {
          label: 'development',
          title: 'What I built',
          items: lines(
            'Websites, from development to going live.',
            'Custom web apps.',
            'PWAs, installable on the phone like an app.',
            'E-commerce.',
            'Laravel and Statamic on the backend, Vue and Nuxt on the frontend, Directus as a headless CMS.',
          ),
        },
        ro: {
          label: 'dezvoltare',
          title: 'Ce am dezvoltat',
          items: lines(
            'Site-uri web, de la dezvoltare la publicare.',
            'Aplicații web pe măsură.',
            'PWA, care se instalează pe telefon ca o aplicație.',
            'E-commerce.',
            'Laravel și Statamic pe backend, Vue și Nuxt pe frontend, Directus ca CMS headless.',
          ),
        },
      }),
      section('block_gallery', {}, {
        it: {
          label: 'infrastruttura',
          title: 'Oltre 20 server, un solo metodo',
          text: paras(
            'Più di 20 server, tutti droplet su **DigitalOcean**. **Laravel Forge** e **Cleavr** ne gestiscono configurazione e deploy: nessun server configurato a mano, ognuno costruito allo stesso modo.',
            'I progetti **Directus** e **Laravel** girano in container **Docker**.',
          ),
          captions: lines('schema dell\'infrastruttura', 'Laravel Forge', 'Cleavr'),
        },
        en: {
          label: 'infrastructure',
          title: 'Over 20 servers, one method',
          text: paras(
            'More than 20 servers, all droplets on **DigitalOcean**. **Laravel Forge** and **Cleavr** handle their configuration and deploys: no server set up by hand, each one built the same way.',
            'The **Directus** and **Laravel** projects run in **Docker** containers.',
          ),
          captions: lines('infrastructure diagram', 'Laravel Forge', 'Cleavr'),
        },
        ro: {
          label: 'infrastructură',
          title: 'Peste 20 de servere, o singură metodă',
          text: paras(
            'Peste 20 de servere, toate droplet-uri pe **DigitalOcean**. **Laravel Forge** și **Cleavr** se ocupă de configurare și de deploy: niciun server configurat de mână, fiecare construit la fel.',
            'Proiectele **Directus** și **Laravel** rulează în containere **Docker**.',
          ),
          captions: lines('schema infrastructurii', 'Laravel Forge', 'Cleavr'),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'pipeline',
          title: 'Dal push alla produzione',
          items: lines(
            'Un push su git avvia il deploy: niente FTP, niente passaggi a mano.',
            'Il branch decide dove va: server di staging/test o produzione.',
            'Deploy senza interruzioni: il sito resta online mentre si aggiorna.',
            'DNS, certificati SSL, email, backup e monitoraggio: tutto seguito da me.',
          ),
        },
        en: {
          label: 'pipeline',
          title: 'From push to production',
          items: lines(
            'A git push starts the deploy: no FTP, no manual steps.',
            'The branch decides where it goes: staging/test servers or production.',
            'Zero-downtime deploys: the site stays online while it updates.',
            'DNS, SSL certificates, email, backups and monitoring: all handled by me.',
          ),
        },
        ro: {
          label: 'pipeline',
          title: 'De la push la producție',
          items: lines(
            'Un push pe git pornește deploy-ul: fără FTP, fără pași manuali.',
            'Branch-ul decide unde ajunge: servere de staging/test sau producție.',
            'Deploy fără întreruperi: site-ul rămâne online cât se actualizează.',
            'DNS, certificate SSL, email, backup și monitorizare: toate gestionate de mine.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Un\'agenzia autonoma',
          items: lines(
            'Siti pubblicati più velocemente e con più qualità.',
            'Nessun disservizio in due anni e mezzo.',
            'Costi dei server prevedibili.',
            'Nessuna dipendenza da aziende esterne: dall\'idea allo sviluppo alla pubblicazione, tutto interno.',
            'Più progetti gestiti insieme, e sempre più complessi.',
          ),
        },
        en: {
          label: 'results',
          title: 'A self-sufficient agency',
          items: lines(
            'Sites published faster and with higher quality.',
            'No outages in two and a half years.',
            'Predictable server costs.',
            'No reliance on outside companies: from idea to development to launch, all in-house.',
            'More projects handled at once, and increasingly complex ones.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'O agenție autonomă',
          items: lines(
            'Site-uri publicate mai repede și cu o calitate mai bună.',
            'Nicio întrerupere a serviciului în doi ani și jumătate.',
            'Costuri previzibile pentru servere.',
            'Nicio dependență de firme externe: de la idee la dezvoltare și publicare, totul intern.',
            'Mai multe proiecte gestionate în paralel, tot mai complexe.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  imanpack: {
    year: 2024,
    translations: {
      it: {intro: 'Un sistema di newsletter in Laravel che collega il CMS proprietario in .NET di Imanpack a Mailchimp: i dati inseriti nel CMS diventano newsletter, create e programmate in automatico.', role: 'Sviluppo e integrazione', type: 'Automazione newsletter', stack: 'Laravel, .NET, Microsoft SQL Server, Mailchimp API'},
      en: {intro: 'A Laravel newsletter system that connects Imanpack\'s proprietary .NET CMS to Mailchimp: the data entered in the CMS becomes newsletters, created and scheduled automatically.', role: 'Development and integration', type: 'Newsletter automation', stack: 'Laravel, .NET, Microsoft SQL Server, Mailchimp API'},
      ro: {intro: 'Un sistem de newslettere în Laravel care leagă CMS-ul proprietar .NET al Imanpack de Mailchimp: datele introduse în CMS devin newslettere, create și programate automat.', role: 'Dezvoltare și integrare', type: 'Automatizare newsletter', stack: 'Laravel, .NET, Microsoft SQL Server, Mailchimp API'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'punto di partenza',
          title: 'Due sistemi che non si parlavano',
          text: paras(
            'Imanpack gestisce i suoi contenuti con un **CMS proprietario** scritto in .NET, su database Microsoft. Le newsletter invece passano da **Mailchimp**.',
            'L\'obiettivo: far nascere le newsletter direttamente dai dati inseriti nel CMS, senza ricopiarli a mano.',
          ),
        },
        en: {
          label: 'starting point',
          title: 'Two systems that didn\'t talk',
          text: paras(
            'Imanpack manages its content with a **proprietary CMS** written in .NET, on a Microsoft database. Newsletters, instead, go through **Mailchimp**.',
            'The goal: build the newsletters straight from the data entered in the CMS, without copying it over by hand.',
          ),
        },
        ro: {
          label: 'punct de plecare',
          title: 'Două sisteme care nu comunicau',
          text: paras(
            'Imanpack își gestionează conținutul cu un **CMS proprietar** scris în .NET, pe o bază de date Microsoft. Newsletterele, în schimb, trec prin **Mailchimp**.',
            'Obiectivul: newsletterele să pornească direct din datele introduse în CMS, fără a le copia de mână.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'come funziona',
          title: 'Dal CMS alla casella di posta',
          items: lines(
            'Nel CMS si inseriscono i dati, che finiscono nel database Microsoft.',
            'Un hook avvisa il sistema in Laravel a ogni nuovo inserimento.',
            'Laravel legge i dati e crea la newsletter su Mailchimp tramite le sue API.',
            'La newsletter viene pubblicata o programmata secondo le configurazioni impostate nel CMS.',
          ),
        },
        en: {
          label: 'how it works',
          title: 'From the CMS to the inbox',
          items: lines(
            'Data is entered in the CMS and stored in the Microsoft database.',
            'A hook notifies the Laravel system of every new entry.',
            'Laravel reads the data and creates the newsletter on Mailchimp through its API.',
            'The newsletter is published or scheduled according to the settings in the CMS.',
          ),
        },
        ro: {
          label: 'cum funcționează',
          title: 'Din CMS în căsuța de e-mail',
          items: lines(
            'În CMS se introduc datele, care ajung în baza de date Microsoft.',
            'Un hook anunță sistemul Laravel la fiecare înregistrare nouă.',
            'Laravel citește datele și creează newsletterul în Mailchimp prin API-ul său.',
            'Newsletterul este publicat sau programat după configurările din CMS.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Dati nel CMS, il resto in automatico',
          items: lines(
            'Clienti contattati in modo più automatico e più pulito.',
            'Rispettate le richieste di iscrizione alla newsletter degli utenti.',
            'Newsletter bilingui, per raggiungere anche i clienti internazionali.',
            'Niente più lavoro a mano su Mailchimp: basta inserire i dati nel CMS, al resto pensa il sistema.',
          ),
        },
        en: {
          label: 'results',
          title: 'Data in the CMS, the rest automatic',
          items: lines(
            'Customers reached in a more automated, cleaner way.',
            'Users\' newsletter sign-up requests respected.',
            'Bilingual newsletters, to reach international customers too.',
            'No more manual work on Mailchimp: just enter the data in the CMS, the system takes care of the rest.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'Datele în CMS, restul automat',
          items: lines(
            'Clienți contactați într-un mod mai automat și mai curat.',
            'Cererile utilizatorilor de abonare la newsletter respectate.',
            'Newslettere bilingve, pentru a ajunge și la clienții internaționali.',
            'Fără muncă manuală în Mailchimp: ajunge să introduci datele în CMS, de rest se ocupă sistemul.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  steelfuture: {
    year: 2023,
    translations: {
      it: {intro: 'Il gestionale in PHP 5 di un\'azienda di lavorazione dell\'acciaio: problemi risolti, software ottimizzato, nuove funzionalità, e il codice finalmente versionato, con deploy automatico.', role: 'Sviluppo e manutenzione', type: 'Gestionale aziendale', stack: 'PHP 5, Git, GitHub'},
      en: {intro: 'The PHP 5 management software of a steel processing company: issues fixed, software optimised, new features, and the code finally under version control, with automatic deploys.', role: 'Development and maintenance', type: 'Business management software', stack: 'PHP 5, Git, GitHub'},
      ro: {intro: 'Software-ul de gestiune în PHP 5 al unei firme de prelucrare a oțelului: probleme rezolvate, software optimizat, funcționalități noi și, în sfârșit, codul versionat, cu deploy automat.', role: 'Dezvoltare și mentenanță', type: 'Software de gestiune', stack: 'PHP 5, Git, GitHub'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'punto di partenza',
          title: 'Un gestionale di altri tempi',
          text: paras(
            'Steel Future lavora con un gestionale molto vecchio, scritto in **PHP 5**. Il codice stava su un server locale dell\'azienda, raggiungibile solo in locale, e **non era versionato**.',
            'Mi hanno chiamato per sistemare alcuni problemi e ottimizzare il software.',
          ),
        },
        en: {
          label: 'starting point',
          title: 'Management software from another era',
          text: paras(
            'Steel Future works with very old management software, written in **PHP 5**. The code sat on a local server at the company, reachable only locally, and **wasn\'t under version control**.',
            'They called me in to fix some issues and optimise the software.',
          ),
        },
        ro: {
          label: 'punct de plecare',
          title: 'Un software de gestiune din alte vremuri',
          text: paras(
            'Steel Future lucrează cu un software de gestiune foarte vechi, scris în **PHP 5**. Codul stătea pe un server local al firmei, accesibil doar local, și **nu era versionat**.',
            'M-au chemat să rezolv câteva probleme și să optimizez software-ul.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'cosa ho fatto',
          title: 'Sistemare, ottimizzare, aggiungere',
          items: lines(
            'Risolti i problemi del codice legacy.',
            'Software ottimizzato.',
            'Nuove funzionalità.',
            'Codice versionato su GitHub.',
            'Deploy automatico con un push su git.',
          ),
        },
        en: {
          label: 'what I did',
          title: 'Fix, optimise, extend',
          items: lines(
            'Legacy code issues fixed.',
            'Software optimised.',
            'New features.',
            'Code under version control on GitHub.',
            'Automatic deploys on a git push.',
          ),
        },
        ro: {
          label: 'ce am făcut',
          title: 'Reparat, optimizat, extins',
          items: lines(
            'Problemele codului legacy rezolvate.',
            'Software optimizat.',
            'Funcționalități noi.',
            'Cod versionat pe GitHub.',
            'Deploy automat la un push pe git.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Più semplice da usare',
          items: lines(
            'Un software più semplice da usare.',
            'Operatività migliorata, con i problemi legacy risolti.',
            'Ogni modifica tracciata, e pubblicata con un push.',
          ),
        },
        en: {
          label: 'results',
          title: 'Easier to use',
          items: lines(
            'Software that is easier to use.',
            'Smoother operations, with the legacy issues fixed.',
            'Every change tracked, and published with a push.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'Mai simplu de folosit',
          items: lines(
            'Un software mai simplu de folosit.',
            'Activitate îmbunătățită, cu problemele legacy rezolvate.',
            'Fiecare modificare urmărită și publicată cu un push.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  fintech: {
    year: 2020,
    translations: {
      it: {intro: 'Per una società di investimenti finanziari ho costruito tutta l\'infrastruttura informatica: due web app gestionali, un\'app mobile e i servizi che le tengono insieme, dall\'idea alla pubblicazione.', role: 'Ideazione, design, sviluppo e infrastruttura', type: 'Piattaforma web e mobile', stack: 'Node.js, AdonisJS, Nuxt, Vue, Ionic'},
      en: {intro: 'For a financial investment company I built the whole IT infrastructure: two management web apps, a mobile app and the services that hold them together, from idea to launch.', role: 'Concept, design, development and infrastructure', type: 'Web and mobile platform', stack: 'Node.js, AdonisJS, Nuxt, Vue, Ionic'},
      ro: {intro: 'Pentru o firmă de investiții financiare am construit întreaga infrastructură IT: două aplicații web de gestiune, o aplicație mobilă și serviciile care le țin împreună, de la idee la lansare.', role: 'Concepție, design, dezvoltare și infrastructură', type: 'Platformă web și mobilă', stack: 'Node.js, AdonisJS, Nuxt, Vue, Ionic'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'punto di partenza',
          title: 'Clienti su fogli Excel',
          text: paras(
            'All\'inizio la società gestiva i suoi clienti con dei **fogli Excel**.',
            'Mi ha commissionato tutta la sua presenza online: applicazioni, grafica, sviluppo e infrastruttura.',
          ),
        },
        en: {
          label: 'starting point',
          title: 'Customers in Excel sheets',
          text: paras(
            'At first the company managed its customers with **Excel sheets**.',
            'It commissioned me to build its whole online presence: applications, design, development and infrastructure.',
          ),
        },
        ro: {
          label: 'punct de plecare',
          title: 'Clienți în foi Excel',
          text: paras(
            'La început firma își gestiona clienții în **foi Excel**.',
            'Mi-a încredințat întreaga sa prezență online: aplicații, grafică, dezvoltare și infrastructură.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'cosa ho fatto',
          title: 'Dall\'idea alla pubblicazione',
          items: lines(
            'Ideazione delle applicazioni, insieme all\'azienda.',
            'La grafica.',
            'Due web app gestionali, con Nuxt e Vue sul frontend e Node.js e AdonisJS sul backend.',
            'Un\'app mobile con Ionic.',
            'La pubblicazione di tutto.',
          ),
        },
        en: {
          label: 'what I did',
          title: 'From idea to launch',
          items: lines(
            'Designing the applications, together with the company.',
            'The visual design.',
            'Two management web apps, with Nuxt and Vue on the frontend and Node.js and AdonisJS on the backend.',
            'A mobile app with Ionic.',
            'Launching all of it.',
          ),
        },
        ro: {
          label: 'ce am făcut',
          title: 'De la idee la lansare',
          items: lines(
            'Conceperea aplicațiilor, împreună cu firma.',
            'Grafica.',
            'Două aplicații web de gestiune, cu Nuxt și Vue pe frontend și Node.js și AdonisJS pe backend.',
            'O aplicație mobilă cu Ionic.',
            'Publicarea tuturor.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'infrastruttura',
          title: 'Servizi che lavorano insieme',
          items: lines(
            'I server necessari alle applicazioni, gestiti da me.',
            'Microservizi collegati tra loro: centro notifiche, gestione delle code, identità e accessi, file.',
          ),
        },
        en: {
          label: 'infrastructure',
          title: 'Services working together',
          items: lines(
            'The servers the applications need, managed by me.',
            'Connected microservices: notification centre, queue management, identity and access, files.',
          ),
        },
        ro: {
          label: 'infrastructură',
          title: 'Servicii care lucrează împreună',
          items: lines(
            'Serverele necesare aplicațiilor, gestionate de mine.',
            'Microservicii conectate între ele: centru de notificări, gestionarea cozilor, identitate și acces, fișiere.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Come una banca online',
          items: lines(
            'Ogni cliente con il suo profilo e la sua area privata.',
            'Clienti autonomi nelle operazioni, come in un home banking.',
            'Acquisti direttamente dall\'app mobile.',
          ),
        },
        en: {
          label: 'results',
          title: 'Like an online bank',
          items: lines(
            'Every customer with their own profile and private area.',
            'Customers operating on their own, as in online banking.',
            'Purchases straight from the mobile app.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'Ca o bancă online',
          items: lines(
            'Fiecare client cu profilul și zona sa privată.',
            'Clienți autonomi în operațiuni, ca într-un internet banking.',
            'Cumpărături direct din aplicația mobilă.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  tvit: {
    year: 2022,
    translations: {
      it: {intro: 'Un progetto personale che raccoglie i canali TV italiani in chiaro, già trasmessi in streaming dalle emittenti, in un\'unica lista IPTV con la guida TV: da guardare nel browser o con qualsiasi player.', role: 'Ideazione e sviluppo', type: 'Progetto personale', stack: 'Laravel, Vue, Docker'},
      en: {intro: 'A personal project that gathers Italian free-to-air TV channels, already streamed by the broadcasters, into a single IPTV list with a TV guide: to watch in the browser or with any player.', role: 'Concept and development', type: 'Personal project', stack: 'Laravel, Vue, Docker'},
      ro: {intro: 'Un proiect personal care adună canalele TV italiene gratuite, deja transmise în streaming de televiziuni, într-o singură listă IPTV cu ghid TV: de urmărit în browser sau cu orice player.', role: 'Concepție și dezvoltare', type: 'Proiect personal', stack: 'Laravel, Vue, Docker'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'idea',
          title: 'La TV in chiaro, in un posto solo',
          text: paras(
            'I canali italiani in chiaro si possono già guardare in streaming, ma ognuno sul sito della sua emittente. TvIt li raccoglie in **un\'unica lista IPTV**.',
            'Nessun contenuto privato: solo i canali che le emittenti trasmettono già pubblicamente sui loro siti.',
          ),
        },
        en: {
          label: 'idea',
          title: 'Free-to-air TV, in one place',
          text: paras(
            'Italian free-to-air channels can already be watched as streams, but each on its broadcaster\'s website. TvIt gathers them into **a single IPTV list**.',
            'No private content: only the channels the broadcasters already stream publicly on their websites.',
          ),
        },
        ro: {
          label: 'idee',
          title: 'Televiziunea gratuită, într-un singur loc',
          text: paras(
            'Canalele italiene gratuite se pot urmări deja în streaming, dar fiecare pe site-ul televiziunii sale. TvIt le adună într-o **singură listă IPTV**.',
            'Niciun conținut privat: doar canalele pe care televiziunile le transmit deja public pe site-urile lor.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'come funziona',
          title: 'Dal sito dell\'emittente al player',
          items: lines(
            'Lo studio dei player delle emittenti, per capire da dove arrivano i flussi video pubblici.',
            'Una lista M3U, e una in JSON, generata in automatico: un link per canale.',
            'La guida TV (EPG) raccolta dalle pagine dei palinsesti e aggiornata ogni notte.',
            'Si guarda dal browser, sulla pagina dei canali, o con qualsiasi player IPTV non proprietario, come VLC.',
          ),
        },
        en: {
          label: 'how it works',
          title: 'From the broadcaster\'s site to the player',
          items: lines(
            'Studying the broadcasters\' players to find where the public video streams come from.',
            'An M3U list, and a JSON one, generated automatically: one link per channel.',
            'The TV guide (EPG) scraped from the schedule pages and updated every night.',
            'Watch it in the browser, on the channels page, or with any non-proprietary IPTV player, like VLC.',
          ),
        },
        ro: {
          label: 'cum funcționează',
          title: 'De pe site-ul televiziunii în player',
          items: lines(
            'Studiul playerelor televiziunilor, pentru a afla de unde vin fluxurile video publice.',
            'O listă M3U, și una în JSON, generată automat: un link pentru fiecare canal.',
            'Ghidul TV (EPG) colectat din paginile cu programe și actualizat în fiecare noapte.',
            'Se urmărește din browser, pe pagina canalelor, sau cu orice player IPTV non-proprietar, precum VLC.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Usata anche da altri',
          items: lines(
            '65 stelle e 4 fork su GitHub: il mio repository più seguito.',
            'Lista e guida TV si aggiornano da sole, senza interventi a mano.',
          ),
        },
        en: {
          label: 'results',
          title: 'Used by others too',
          items: lines(
            '65 stars and 4 forks on GitHub: my most followed repository.',
            'The list and the TV guide update themselves, with no manual work.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'Folosită și de alții',
          items: lines(
            '65 de stele și 4 fork-uri pe GitHub: cel mai urmărit repository al meu.',
            'Lista și ghidul TV se actualizează singure, fără intervenții manuale.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  slides: {
    year: 2021,
    translations: {
      it: {intro: 'Un\'estensione per Chrome ed Edge che aggiunge a Slides.com, gratis, le funzioni che mancano senza abbonamento: il download di qualsiasi presentazione in PDF, la vista relatore e le note del relatore.', role: 'Ideazione e sviluppo', type: 'Estensione browser', stack: 'TypeScript, Vue, WXT'},
      en: {intro: 'A Chrome and Edge extension that adds to Slides.com, for free, the features missing without a subscription: downloading any presentation as a PDF, the speaker view and speaker notes.', role: 'Concept and development', type: 'Browser extension', stack: 'TypeScript, Vue, WXT'},
      ro: {intro: 'O extensie pentru Chrome și Edge care adaugă gratuit în Slides.com funcțiile care lipsesc fără abonament: descărcarea oricărei prezentări în PDF, vizualizarea pentru prezentator și notițele prezentatorului.', role: 'Concepție și dezvoltare', type: 'Extensie de browser', stack: 'TypeScript, Vue, WXT'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'idea',
          title: 'Il PDF che mancava',
          text: paras(
            'Slides.com è un servizio per creare e mostrare presentazioni online, ma l\'export in PDF è solo nei **piani a pagamento**.',
            'L\'estensione aggiunge il download di **qualsiasi presentazione** in PDF, gratis. È nata come Slides.com Downloader ed è diventata Slides.com Companion, pensata per raccogliere altre funzioni.',
          ),
        },
        en: {
          label: 'idea',
          title: 'The missing PDF',
          text: paras(
            'Slides.com is a service for creating and showing presentations online, but PDF export is only in the **paid plans**.',
            'The extension adds the download of **any presentation** as a PDF, for free. It started as Slides.com Downloader and became Slides.com Companion, built to hold more features.',
          ),
        },
        ro: {
          label: 'idee',
          title: 'PDF-ul care lipsea',
          text: paras(
            'Slides.com este un serviciu pentru a crea și prezenta prezentări online, dar exportul în PDF există doar în **planurile plătite**.',
            'Extensia adaugă descărcarea în PDF a **oricărei prezentări**, gratuit. A pornit ca Slides.com Downloader și a devenit Slides.com Companion, gândită pentru a aduna și alte funcții.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'come funziona',
          title: 'Dentro l\'estensione',
          items: lines(
            'Un content script lavora sulla pagina della presentazione.',
            'Il PDF si crea con il comando di stampa del browser, senza servizi esterni.',
            'Un popup in Vue, uno script in background, tutto scritto in TypeScript.',
            'Funziona su Chrome ed Edge, ed è pubblicata sul Chrome Web Store.',
          ),
        },
        en: {
          label: 'how it works',
          title: 'Inside the extension',
          items: lines(
            'A content script works on the presentation page.',
            'The PDF is made with the browser\'s print command, with no outside services.',
            'A Vue popup and a background script, all written in TypeScript.',
            'It runs on Chrome and Edge, and is published on the Chrome Web Store.',
          ),
        },
        ro: {
          label: 'cum funcționează',
          title: 'În interiorul extensiei',
          items: lines(
            'Un content script lucrează pe pagina prezentării.',
            'PDF-ul se creează cu comanda de tipărire a browserului, fără servicii externe.',
            'Un popup în Vue și un script în fundal, totul scris în TypeScript.',
            'Funcționează pe Chrome și Edge și este publicată în Chrome Web Store.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'per chi presenta',
          title: 'Vista e note del relatore',
          items: lines(
            'Una barra a scomparsa sul bordo delle slide, con tre pulsanti: Print, Speaker e Notes.',
            'La vista relatore, che Slides.com senza abbonamento non offre: la slide di adesso, quella dopo, le note e il tempo, in una finestra da tenere sul proprio schermo. Usa quella di Reveal.js, su cui è costruito Slides.com.',
            'Le note del relatore di ogni slide, scritte nell\'estensione e salvate da sole mentre si scrive: compaiono subito nella vista relatore.',
            'Riscritta su WXT, con i test: le note sono nell\'ultima versione, su GitHub, in attesa di arrivare sullo store.',
          ),
        },
        en: {
          label: 'for presenters',
          title: 'Speaker view and notes',
          items: lines(
            'A sliding bar on the edge of the slides, with three buttons: Print, Speaker and Notes.',
            'The speaker view, which Slides.com doesn\'t offer without a subscription: the current slide, the next one, the notes and the time, in a window to keep on your own screen. It uses the one from Reveal.js, which Slides.com is built on.',
            'Speaker notes for every slide, written in the extension and saved as you type: they show up right away in the speaker view.',
            'Rebuilt on WXT, with tests: the notes are in the latest version, on GitHub, waiting to reach the store.',
          ),
        },
        ro: {
          label: 'pentru prezentatori',
          title: 'Vizualizarea și notițele prezentatorului',
          items: lines(
            'O bară care apare pe marginea slide-urilor, cu trei butoane: Print, Speaker și Notes.',
            'Vizualizarea pentru prezentator, pe care Slides.com nu o oferă fără abonament: slide-ul curent, cel următor, notițele și timpul, într-o fereastră de ținut pe propriul ecran. Folosește vizualizarea din Reveal.js, pe care este construit Slides.com.',
            'Notițele prezentatorului pentru fiecare slide, scrise în extensie și salvate singure în timp ce scrii: apar imediat în vizualizarea pentru prezentator.',
            'Refăcută pe WXT, cu teste: notițele sunt în ultima versiune, pe GitHub, și urmează să ajungă în store.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  nosponsor: {
    year: 2026,
    translations: {
      it: {intro: 'Un\'estensione per Chrome, pubblicata sul Chrome Web Store, che trova i contenuti sponsorizzati e li evidenzia, li comprime in una barra cliccabile o li nasconde: su Google, Amazon, Subito.it ed eBay, e in modo generico su tutti gli altri siti. Su YouTube copre gli annunci video.', role: 'Ideazione e sviluppo', type: 'Estensione browser', stack: 'TypeScript, WXT, Chrome Extensions (Manifest V3)'},
      en: {intro: 'A Chrome extension, published on the Chrome Web Store, that finds sponsored content and highlights it, collapses it into a clickable bar or hides it: on Google, Amazon, Subito.it and eBay, and generically on every other site. On YouTube it covers video ads.', role: 'Concept and development', type: 'Browser extension', stack: 'TypeScript, WXT, Chrome Extensions (Manifest V3)'},
      ro: {intro: 'O extensie pentru Chrome, publicată în Chrome Web Store, care găsește conținutul sponsorizat și îl evidențiază, îl restrânge într-o bară pe care se poate da clic sau îl ascunde: pe Google, Amazon, Subito.it și eBay, și în mod generic pe toate celelalte site-uri. Pe YouTube acoperă reclamele video.', role: 'Concepție și dezvoltare', type: 'Extensie de browser', stack: 'TypeScript, WXT, Chrome Extensions (Manifest V3)'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'idea',
          title: 'Sponsorizzato, ma non si vede',
          text: paras(
            'Su molti siti i contenuti sponsorizzati sono mescolati a quelli normali, e non sempre si distinguono. NoSponsor li trova e lascia scegliere cosa farne: **evidenziarli**, **comprimerli** in una barra cliccabile o **nasconderli**.',
            'Ci sono rilevatori dedicati per **Google, Amazon, Subito.it ed eBay**. Sugli altri siti lavora un rilevamento generico, che si può disattivare, basato su etichette come "Sponsorizzato" o "Pubblicità" e sugli slot pubblicitari standard.',
          ),
        },
        en: {
          label: 'idea',
          title: 'Sponsored, but hard to see',
          text: paras(
            'On many sites sponsored content is mixed in with the rest, and it doesn\'t always stand out. NoSponsor finds it and lets you choose what to do with it: **highlight** it, **collapse** it into a clickable bar or **hide** it.',
            'There are dedicated detectors for **Google, Amazon, Subito.it and eBay**. On other sites a generic detection, which can be turned off, relies on labels like "Sponsored" or "Advertisement" and on standard ad slots.',
          ),
        },
        ro: {
          label: 'idee',
          title: 'Sponsorizat, dar greu de văzut',
          text: paras(
            'Pe multe site-uri conținutul sponsorizat este amestecat cu restul și nu se distinge mereu. NoSponsor îl găsește și te lasă să alegi ce faci cu el: îl **evidențiezi**, îl **restrângi** într-o bară pe care se poate da clic sau îl **ascunzi**.',
            'Există detectoare dedicate pentru **Google, Amazon, Subito.it și eBay**. Pe celelalte site-uri lucrează o detectare generică, care se poate dezactiva, bazată pe etichete precum „Sponsorizat" sau „Publicitate" și pe sloturile publicitare standard.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'come funziona',
          title: 'Trovare senza rompere',
          items: lines(
            'Nessun elemento rimosso: l\'estensione li marca con una classe e il CSS fa il resto, così le pagine in React o Vue non si rompono e il cambio di modalità è istantaneo.',
            'Tre strategie: selettori noti, etichette testuali risalendo alla card e, sui siti che offuscano, il testo realmente visibile, ricostruito nell\'ordine in cui appare a schermo.',
            'Un MutationObserver copre lo scroll infinito e i contenuti caricati dopo.',
            'Ogni elemento trovato porta con sé la regola che l\'ha individuato, per capire subito i falsi positivi.',
            'Un contatore sull\'icona per ogni scheda, e un popup per scegliere la modalità e attivarla sito per sito.',
          ),
        },
        en: {
          label: 'how it works',
          title: 'Finding without breaking',
          items: lines(
            'Nothing is removed: the extension marks elements with a class and CSS does the rest, so React or Vue pages don\'t break and switching mode is instant.',
            'Three strategies: known selectors, text labels traced up to their card and, on sites that obfuscate, the text actually visible, rebuilt in on-screen order.',
            'A MutationObserver covers infinite scroll and content loaded later.',
            'Every element found carries the rule that found it, to spot false positives right away.',
            'A per-tab counter on the icon, and a popup to choose the mode and turn it on site by site.',
          ),
        },
        ro: {
          label: 'cum funcționează',
          title: 'Găsește fără să strice',
          items: lines(
            'Nimic nu este eliminat: extensia marchează elementele cu o clasă și CSS-ul face restul, așa că paginile în React sau Vue nu se strică, iar schimbarea modului este instantanee.',
            'Trei strategii: selectori cunoscuți, etichete text urmărite până la card și, pe site-urile care ascund textul, textul vizibil cu adevărat, reconstruit în ordinea de pe ecran.',
            'Un MutationObserver acoperă scroll-ul infinit și conținutul încărcat ulterior.',
            'Fiecare element găsit poartă regula care l-a identificat, pentru a înțelege imediat rezultatele fals pozitive.',
            'Un contor pe pictogramă pentru fiecare filă și un popup pentru a alege modul și a-l activa site cu site.',
          ),
        },
      }),
      section('block_text', {}, {
        it: {
          label: 'youtube',
          title: 'Un velo sugli annunci video',
          text: paras(
            'Su YouTube, quando parte un annuncio, NoSponsor ci mette sopra un **velo**: il video è nero, l\'audio è tolto e va a **16x**, la velocità più alta che il browser permette. Un annuncio di 30 secondi dura circa due secondi, con il tempo che manca scritto in alto.',
            'Finito l\'annuncio si ritrova tutto com\'era: l\'audio, e la velocità a cui si stava guardando. Un muto messo da chi guarda resta, e l\'audio riacceso a mano durante l\'annuncio non viene tolto.',
          ),
        },
        en: {
          label: 'youtube',
          title: 'A veil over video ads',
          text: paras(
            'On YouTube, when an ad starts, NoSponsor puts a **veil** over it: the video goes black, the sound is muted and it plays at **16x**, the highest speed the browser allows. A 30-second ad lasts about two seconds, with the time left shown at the top.',
            'When the ad ends everything is back as it was: the sound, and the speed you were watching at. A mute set by the viewer stays, and sound turned back on by hand during the ad isn\'t taken away.',
          ),
        },
        ro: {
          label: 'youtube',
          title: 'Un văl peste reclamele video',
          text: paras(
            'Pe YouTube, când pornește o reclamă, NoSponsor pune peste ea un **văl**: video-ul e negru, sunetul e oprit și merge la **16x**, viteza cea mai mare pe care o permite browserul. O reclamă de 30 de secunde durează cam două secunde, cu timpul rămas scris sus.',
            'Când reclama se termină, totul revine cum era: sunetul și viteza cu care te uitai. Sunetul oprit de cel care se uită rămâne oprit, iar sunetul repornit de mână în timpul reclamei nu mai este oprit.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Dal prototipo allo store',
          items: lines(
            'Riscritta in TypeScript su WXT, con test unitari ed end-to-end confrontati con la prima versione, e una CI.',
            'In italiano o in inglese, secondo la lingua del browser.',
            'Pubblicata sul Chrome Web Store, con un link nel popup per segnalare uno sponsor mancato.',
          ),
        },
        en: {
          label: 'results',
          title: 'From prototype to store',
          items: lines(
            'Rewritten in TypeScript on WXT, with unit and end-to-end tests checked against the first version, and CI.',
            'In Italian or English, following the browser\'s language.',
            'Published on the Chrome Web Store, with a link in the popup to report a missed sponsor.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'De la prototip la store',
          items: lines(
            'Rescrisă în TypeScript pe WXT, cu teste unitare și end-to-end comparate cu prima versiune, și un CI.',
            'În italiană sau în engleză, după limba browserului.',
            'Publicată în Chrome Web Store, cu un link în popup pentru a semnala un sponsor scăpat.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  booleancli: {
    year: 2022,
    translations: {
      it: {intro: 'Una riga di comando per i docenti e i tutor di Boolean, che automatizza i lavori ripetitivi di ogni giorno: dalle registrazioni delle lezioni ai nuovi progetti, fino ai repository GitHub. Pubblicata su npm.', role: 'Ideazione e sviluppo', type: 'Strumento a riga di comando', stack: 'TypeScript, Node.js, npm, GitHub CLI'},
      en: {intro: 'A command line for Boolean\'s teachers and tutors that automates everyday repetitive work: from lesson recordings to new projects and GitHub repositories. Published on npm.', role: 'Concept and development', type: 'Command-line tool', stack: 'TypeScript, Node.js, npm, GitHub CLI'},
      ro: {intro: 'O linie de comandă pentru profesorii și tutorii Boolean, care automatizează munca repetitivă de zi cu zi: de la înregistrările lecțiilor la proiecte noi și repository-uri GitHub. Publicată pe npm.', role: 'Concepție și dezvoltare', type: 'Instrument în linia de comandă', stack: 'TypeScript, Node.js, npm, GitHub CLI'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'idea',
          title: 'Meno lavoro ripetitivo',
          text: paras(
            'Da Main Teacher a Boolean, gli stessi compiti tornavano ogni giorno: rinominare e caricare le registrazioni Zoom delle lezioni, preparare i file di partenza dei progetti, creare i repository.',
            '**Boolean CLI** riduce ognuno di questi lavori a un comando, per me e per gli altri docenti e tutor.',
          ),
        },
        en: {
          label: 'idea',
          title: 'Less repetitive work',
          text: paras(
            'As Main Teacher at Boolean, the same tasks came back every day: renaming and uploading the Zoom recordings of the lessons, preparing the starter files of projects, creating repositories.',
            '**Boolean CLI** turns each of these jobs into one command, for me and for the other teachers and tutors.',
          ),
        },
        ro: {
          label: 'idee',
          title: 'Mai puțină muncă repetitivă',
          text: paras(
            'Ca Main Teacher la Boolean, aceleași sarcini reveneau în fiecare zi: redenumirea și încărcarea înregistrărilor Zoom ale lecțiilor, pregătirea fișierelor de pornire ale proiectelor, crearea repository-urilor.',
            '**Boolean CLI** reduce fiecare dintre aceste munci la o singură comandă, pentru mine și pentru ceilalți profesori și tutori.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'comandi',
          title: 'Un comando per ogni lavoro',
          items: lines(
            'video-rename: rinomina le registrazioni Zoom secondo le convenzioni di Boolean e le carica nella cartella di Google Drive. Si può anche annullare.',
            'scaffold: crea i file di partenza di un progetto (HTML, PHP, CSS, JS, immagini, README), con librerie come Bootstrap, Font Awesome, Axios o Vue 3 incluse via CDN.',
            'repo: crea i repository GitHub.',
            'config: salva le impostazioni predefinite di ogni comando.',
          ),
        },
        en: {
          label: 'commands',
          title: 'One command for each job',
          items: lines(
            'video-rename: renames Zoom recordings following Boolean\'s conventions and uploads them to the Google Drive folder. It can also be undone.',
            'scaffold: creates a project\'s starter files (HTML, PHP, CSS, JS, images, README), with libraries like Bootstrap, Font Awesome, Axios or Vue 3 included via CDN.',
            'repo: creates GitHub repositories.',
            'config: stores the default settings of each command.',
          ),
        },
        ro: {
          label: 'comenzi',
          title: 'O comandă pentru fiecare muncă',
          items: lines(
            'video-rename: redenumește înregistrările Zoom după convențiile Boolean și le încarcă în folderul Google Drive. Se poate și anula.',
            'scaffold: creează fișierele de pornire ale unui proiect (HTML, PHP, CSS, JS, imagini, README), cu biblioteci precum Bootstrap, Font Awesome, Axios sau Vue 3 incluse prin CDN.',
            'repo: creează repository-urile GitHub.',
            'config: salvează setările implicite ale fiecărei comenzi.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Un comando per installarla',
          items: lines(
            'Pubblicata su npm: si installa con npm install -g boolean-cli.',
            'Circa 600 download nell\'ultimo anno.',
          ),
        },
        en: {
          label: 'results',
          title: 'One command to install it',
          items: lines(
            'Published on npm: install it with npm install -g boolean-cli.',
            'About 600 downloads in the last year.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'O comandă pentru instalare',
          items: lines(
            'Publicată pe npm: se instalează cu npm install -g boolean-cli.',
            'Aproximativ 600 de descărcări în ultimul an.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
  xpulire: {
    year: 2025,
    translations: {
      it: {intro: 'Il trasloco dell\'infrastruttura IT di un\'azienda di attrezzature industriali per la pulizia: dalla rete improvvisata della vecchia sede a una rete progettata, cablata e documentata, senza fermare un giorno di lavoro.', role: 'IT e infrastruttura di rete', type: 'Infrastruttura di rete', stack: 'Cablaggio strutturato, rack, switch PoE, Wi-Fi, VoIP, UPS'},
      en: {intro: 'Moving the IT infrastructure of a company selling industrial cleaning equipment: from the makeshift network of the old premises to a network that is designed, cabled and documented, without stopping a single working day.', role: 'IT and network infrastructure', type: 'Network infrastructure', stack: 'Structured cabling, rack, PoE switches, Wi-Fi, VoIP, UPS'},
      ro: {intro: 'Mutarea infrastructurii IT a unei firme care vinde echipamente industriale de curățenie: de la rețeaua improvizată din vechiul sediu la o rețea proiectată, cablată și documentată, fără să oprească nicio zi de lucru.', role: 'IT și infrastructură de rețea', type: 'Infrastructură de rețea', stack: 'Cablare structurată, rack, switch-uri PoE, Wi-Fi, VoIP, UPS'},
    },
    sections: [
      section('block_text', {}, {
        it: {
          label: 'punto di partenza',
          title: 'Cavi volanti e password perse',
          text: paras(
            'Nella vecchia sede il server era un normale PC con Windows Server. Le password degli account dei computer erano andate perse, i cavi correvano liberi, e modem e router erano collegati in cascata, appoggiati uno sopra l\'altro.',
            'Prima del trasloco ho seguito la manutenzione: configurazione e sistemazione dei PC, e aggiornamenti hardware dove servivano.',
          ),
        },
        en: {
          label: 'starting point',
          title: 'Loose cables and lost passwords',
          text: paras(
            'In the old premises the server was an ordinary PC running Windows Server. The passwords of the computer accounts had been lost, cables ran loose, and the modem and router were chained together, stacked one on top of the other.',
            'Before the move I took care of maintenance: setting up and sorting out the PCs, and upgrading their hardware where needed.',
          ),
        },
        ro: {
          label: 'punct de plecare',
          title: 'Cabluri atârnând și parole pierdute',
          text: paras(
            'În vechiul sediu, serverul era un PC obișnuit cu Windows Server. Parolele conturilor de pe calculatoare se pierduseră, cablurile atârnau liber, iar modemul și routerul erau legate în cascadă, puse unul peste altul.',
            'Înainte de mutare m-am ocupat de mentenanță: configurarea și punerea în ordine a PC-urilor și îmbunătățiri hardware acolo unde era nevoie.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'metodo',
          title: 'Un trasloco in un giorno',
          items: lines(
            'Sopralluogo nella nuova sede e obiettivi definiti insieme all\'azienda.',
            'Schema della rete e preventivo.',
            'Tutto il materiale acquistato prima di iniziare.',
            'Il lavoro in un giorno non lavorativo, per non fermare la produzione.',
          ),
        },
        en: {
          label: 'method',
          title: 'A move in one day',
          items: lines(
            'A site survey of the new premises and goals set together with the company.',
            'Network diagram and quote.',
            'All the equipment bought before starting.',
            'The work done on a non-working day, so production never stopped.',
          ),
        },
        ro: {
          label: 'metodă',
          title: 'O mutare într-o zi',
          items: lines(
            'Inspecția noului sediu și obiective stabilite împreună cu firma.',
            'Schema rețelei și oferta de preț.',
            'Tot materialul cumpărat înainte de a începe.',
            'Lucrarea făcută într-o zi nelucrătoare, ca să nu se oprească producția.',
          ),
        },
      }),
      section('block_gallery', {}, {
        it: {
          label: 'la nuova rete',
          title: 'Tutto parte dal rack',
          text: paras(
            'Al centro un **rack** con gruppo di continuità, switch core **PoE** da 24 porte e patch panel. Da lì partono i collegamenti verso gli uffici, ognuno con il suo switch, verso la stampante e verso due **access point**: uno negli uffici e uno nel magazzino.',
            'Ogni cavo è etichettato, e la rete è documentata.',
          ),
          captions: lines('schema della rete', 'il rack'),
        },
        en: {
          label: 'the new network',
          title: 'It all starts from the rack',
          text: paras(
            'At the centre, a **rack** with a UPS, a 24-port **PoE** core switch and a patch panel. From there, the links go out to the offices, each with its own switch, to the printer and to two **access points**: one in the offices and one in the warehouse.',
            'Every cable is labelled, and the network is documented.',
          ),
          captions: lines('network diagram', 'the rack'),
        },
        ro: {
          label: 'noua rețea',
          title: 'Totul pornește din rack',
          text: paras(
            'În centru, un **rack** cu UPS, un switch core **PoE** cu 24 de porturi și un patch panel. De acolo pleacă legăturile spre birouri, fiecare cu switch-ul lui, spre imprimantă și spre două **access point**-uri: unul în birouri și unul în depozit.',
            'Fiecare cablu este etichetat, iar rețeaua este documentată.',
          ),
          captions: lines('schema rețelei', 'rack-ul'),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'messa in opera',
          title: 'Pronti a lavorare il giorno dopo',
          items: lines(
            'Cablaggio, rack, switch e access point installati e collegati.',
            'Ogni postazione configurata.',
            'Il vecchio server reinstallato, per le attività che ne hanno ancora bisogno.',
            'Gruppo di continuità e telefoni IP configurati.',
          ),
        },
        en: {
          label: 'installation',
          title: 'Ready to work the next day',
          items: lines(
            'Cabling, rack, switches and access points installed and connected.',
            'Every workstation set up.',
            'The old server reinstalled, for the tasks that still need it.',
            'UPS and IP phones configured.',
          ),
        },
        ro: {
          label: 'punere în funcțiune',
          title: 'Gata de lucru a doua zi',
          items: lines(
            'Cablare, rack, switch-uri și access point-uri instalate și conectate.',
            'Fiecare stație de lucru configurată.',
            'Vechiul server reinstalat, pentru activitățile care încă au nevoie de el.',
            'UPS-ul și telefoanele IP configurate.',
          ),
        },
      }),
      section('block_list', {}, {
        it: {
          label: 'risultati',
          title: 'Una rete che si capisce',
          items: lines(
            'Una struttura chiara, con tecnologia moderna.',
            'Sicurezza migliorata.',
            'Wi-Fi in ogni angolo, anche nel magazzino.',
            'Manutenzione semplice: tutto documentato ed etichettato.',
          ),
        },
        en: {
          label: 'results',
          title: 'A network that makes sense',
          items: lines(
            'A clear structure, with modern technology.',
            'Improved security.',
            'Wi-Fi in every corner, warehouse included.',
            'Easy maintenance: everything documented and labelled.',
          ),
        },
        ro: {
          label: 'rezultate',
          title: 'O rețea care se înțelege',
          items: lines(
            'O structură clară, cu tehnologie modernă.',
            'Securitate îmbunătățită.',
            'Wi-Fi în fiecare colț, inclusiv în depozit.',
            'Mentenanță simplă: totul documentat și etichetat.',
          ),
        },
      }),
      NEXT_STEP,
    ],
  },
}

// --- loading -----------------------------------------------------------------------------

async function seedSingleton(collection, data) {
  const current = await api('GET', `/items/${collection}?fields=translations.id`)
  if (current?.translations?.length) return console.log(`= ${collection} (already filled in)`)
  await api('PATCH', `/items/${collection}`, data)
  console.log(`+ ${collection}`)
}

/** Uploads a file from directus/seed-files, or returns the one already uploaded with that name. */
async function upload(name) {
  const [existing] = await api('GET', `/files?filter[filename_download][_eq]=${encodeURIComponent(name)}&fields=id`)
  if (existing) return existing.id

  const form = new FormData()
  form.append('title', name.replace(/\.\w+$/, ''))
  form.append('file', new Blob([await readFile(new URL(`../seed-files/${name}`, import.meta.url))]), name)
  const response = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${await authToken()}`},
    body: form,
  })
  if (!response.ok) throw new Error(`Upload of ${name} failed: ${await response.text()}`)
  console.log(`+ file ${name}`)
  return (await response.json()).data.id
}

/** The gallery images of `files(...)`, uploaded, as rows of the gallery's junction. */
async function galleryImages(images) {
  if (!images?.seedFiles) return images
  const ids = []
  for (const name of images.seedFiles) ids.push(await upload(name))
  return ids.map((id, i) => ({directus_files_id: id, sort: i + 1}))
}

/** Sections in the given order, with their files uploaded. */
async function sorted(sections) {
  const out = []
  for (const [i, {item, ...section}] of sections.entries()) {
    out.push({...section, sort: i + 1, item: {...item, ...(item.images ? {images: await galleryImages(item.images)} : {})}})
  }
  return out
}

/**
 * Creates the items whose `key` field isn't in the collection yet, so that items added
 * here later reach a Directus already filled in. New ones go after the existing ones.
 */
async function seedCollection(collection, items, key) {
  const existing = await api('GET', `/items/${collection}?limit=-1&fields=${key},sort`)
  const known = new Set(existing.map(item => item[key]))
  const missing = items.filter(item => !known.has(item[key]))
  if (!missing.length) return console.log(`= ${collection} (already filled in)`)
  const last = Math.max(0, ...existing.map(item => item.sort ?? 0))
  await api('POST', `/items/${collection}`, missing.map((item, i) => ({sort: last + i + 1, ...item})))
  console.log(`+ ${collection}: ${missing.map(item => item[key]).join(', ')}`)
}

/**
 * Adds the case study to existing projects that don't have one yet: the fields
 * (updating the translations already there) and the sections.
 */
async function seedCaseStudies() {
  for (const [slug, {translations, sections, ...fields}] of Object.entries(CASE_STUDIES)) {
    const [project] = await api('GET', `/items/projects?filter[slug][_eq]=${slug}&fields=id,sections,translations.id,translations.languages_code`)
    if (!project) continue
    if (project.sections.length) {
      console.log(`= case study ${slug} (already filled in)`)
      continue
    }

    const rows = Object.entries(translations).map(([languages_code, values]) => {
      const existing = project.translations.find(t => t.languages_code === languages_code)
      return existing ? {id: existing.id, ...values} : {languages_code, ...values}
    })
    await api('PATCH', `/items/projects/${project.id}`, {
      ...fields,
      case_study: true,
      translations: {create: rows.filter(r => !r.id), update: rows.filter(r => r.id), delete: []},
      sections: await sorted(sections),
    })
    console.log(`+ case study ${slug}`)
  }
}

/**
 * Case studies created before their gallery had images (`files(...)`): uploads the images
 * into those galleries that are still empty. Galleries are matched by position.
 */
async function seedGalleryFiles() {
  for (const [slug, {sections}] of Object.entries(CASE_STUDIES)) {
    const fields = 'sections.sort,sections.collection,sections.item:block_gallery.id,sections.item:block_gallery.images.id'
    const [project] = await api('GET', `/items/projects?filter[slug][_eq]=${slug}&fields=${fields}`)
    if (!project) continue
    const current = [...project.sections].sort((a, b) => a.sort - b.sort)
    for (const [i, {collection, item}] of sections.entries()) {
      const existing = current[i]
      if (!item.images?.seedFiles || existing?.collection !== collection || existing.item?.images?.length) continue
      await api('PATCH', `/items/block_gallery/${existing.item.id}`, {images: await galleryImages(item.images)})
      console.log(`+ case study ${slug}: images of section ${i + 1}`)
    }
  }
}

await waitForDirectus()
for (const [collection, data] of Object.entries(SINGLETONS)) await seedSingleton(collection, data)
const pages = []
for (const page of PAGES) pages.push({...page, sections: await sorted(page.sections)})
await seedCollection('pages', pages, 'key')
await seedCollection('projects', PROJECTS, 'slug')
await seedCaseStudies()
await seedGalleryFiles()
await seedCollection('experiences', EXPERIENCES, 'company')
await seedCollection('services', SERVICES, 'icon')
await seedCollection('technologies', TECHNOLOGIES, 'name')
console.log('Content loaded.')
