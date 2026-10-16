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
        role: 'Full Stack Developer',
        profession: 'Sviluppatore Web & Mobile',
        tagline: 'Sviluppatore Web Full Stack, UI/UX Designer, Mobile Developer. Da oltre 15 anni trasformo idee in prodotti digitali.',
      },
      en: {
        role: 'Full Stack Developer',
        profession: 'Web & Mobile Developer',
        tagline: 'Full Stack Web Developer, UI/UX Designer, Mobile Developer. For over 15 years I have been turning ideas into digital products.',
      },
      ro: {
        role: 'Full Stack Developer',
        profession: 'Dezvoltator Web & Mobile',
        tagline: 'Dezvoltator Web Full Stack, UI/UX Designer, Mobile Developer. De peste 15 ani transform idei în produse digitale.',
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
  project('v3', 'https://leicaflorianrobert.dev', {kind: 'personal', case_study: true}, name('My website V3'),
    note('Versione attuale del sito — case study', 'Current version of this site — case study', 'Versiunea actuală a site-ului — studiu de caz')),
  project('tfp', 'https://thefullproject.it/', {case_study: true}, name('The Full Project'),
    note('Sviluppo e infrastruttura — case study', 'Development and infrastructure — case study', 'Dezvoltare și infrastructură — studiu de caz')),
  project('xpulire', 'https://www.xpulire.com/', {case_study: true}, name('xPulire'),
    note('Infrastruttura di rete — case study', 'Network infrastructure — case study', 'Infrastructură de rețea — studiu de caz')),
  project('imanpack', 'https://www.imanpack.it/', {case_study: true}, name('Imanpack'),
    note('Newsletter automatiche con Mailchimp — case study', 'Automated newsletters with Mailchimp — case study', 'Newslettere automate cu Mailchimp — studiu de caz')),
  project('v2', 'https://leicaflorianrobert.dev', {kind: 'personal'}, name('My website V2')),
  project('wab', 'https://webartisanbros.com/', {featured: true, mockup: 'laptop'}, name('Web Artisan Bros')),
  project('slides', 'https://chrome.google.com/webstore/detail/slidescom-downloader/bciknjamldhnbbckmgbchmkdcalngnco?hl=it', {kind: 'personal'}, name('Slides.com downloader'),
    note('Estensione Chrome', 'Chrome extension', 'Extensie Chrome')),
  project('tvit', 'https://tvit.leicaflorianrobert.dev/channels', {kind: 'personal', on_home: true}, name('TvIt')),
  project('biologica', 'https://biologicadisinfestazioni.it', {on_home: true}, name('Biologica Disinfestazioni')),
  project('enigma', 'https://leicaflorian.github.io/enigma_machine', {kind: 'personal'}, name('Enigma'),
    note('Macchina Enigma', 'Enigma machine', 'Mașina Enigma')),
  project('fold', 'https://leicaflorian.github.io/fold_my_paper', {kind: 'personal'}, name('Fold my paper')),
  project('gca', 'https://globalgroup.consulting/club/', {featured: true, mockup: 'phone'}, name('Global Club App'),
    {it: {subtitle: 'App mobile'}, en: {subtitle: 'Mobile app'}, ro: {subtitle: 'Aplicație mobilă'}}),
  project('v1', 'https://v1.leicaflorianrobert.dev', {kind: 'personal'}, name('My website V1')),
  project('ggc', 'https://private.globalgroup.consulting/', {}, name('Global Group Consulting')),
  project('fib', 'https://leicaflorian.github.io/fibonacci_counter/', {kind: 'personal'}, name('Fibonacci Counter')),
  // client work done through an agency, which is never named
  project('agrigento', 'https://agrigento2025.org', {kind: 'agency'}, name('Agrigento 2025')),
  project('alfaomega', 'https://alfaomega.it', {kind: 'agency'}, name('Alfa Omega')),
  project('antoine', 'https://maisonantoine.it', {kind: 'agency'}, name('Maison Antoine')),
  project('biscottificio', 'https://www.biscottificioverona.com', {kind: 'agency'}, name('Biscottificio Verona')),
  project('chipsit', 'https://chips.it', {kind: 'agency'}, name('Chips.it')),
  project('doppel', 'https://doppel.it', {kind: 'agency'}, name('Doppel')),
  project('energia', 'https://festivaldellenergia.it', {kind: 'agency'}, name('Festival dell\'Energia')),
  project('ga4g', 'https://generaliact4green.it', {kind: 'agency'}, name('Generali Act4Green')),
  project('oasi', 'https://oasigregorina.it', {kind: 'agency'}, name('Oasi Gregorina')),
  project('oasi-app', 'https://app.oasigregorina.it', {kind: 'agency'}, name('Oasi App')),
  project('radici', 'https://futureradici.it', {kind: 'agency'}, name('Future Radici')),
  project('gpf', 'https://gpf.it', {kind: 'agency'}, name('GPF')),
  project('iresales', 'https://iresales.it', {kind: 'agency'}, name('iResales')),
  project('kilocal', 'https://www.kilocalprogram.it', {kind: 'agency'}, name('Kilocal'), note('Sito, shop e app', 'Website, shop and app', 'Site, magazin și aplicație')),
  project('kyp', 'https://knowyourpartner.it', {kind: 'agency'}, name('Know Your Partner')),
  project('mipharm', 'https://mipharm.it', {kind: 'agency'}, name('Mipharm')),
  project('dmx', 'https://dmxpharma.com', {kind: 'agency'}, name('DMX Pharma')),
  project('pezzulli', 'https://pezzulli.it', {kind: 'agency'}, name('Pezzulli')),
  project('pmi', 'https://pmitutoring.it', {kind: 'agency'}, name('PMI Tutoring')),
  project('qubit', 'https://qub.it', {kind: 'agency'}, name('Qub.it')),
  project('tim', 'https://tim-management.com', {kind: 'agency'}, name('TIM Management')),
  project('volersi', 'https://volersibenessere.it', {kind: 'agency'}, name('Volersi Benessere'), note('Piattaforma, shop e dashboard', 'Platform, shop and dashboard', 'Platformă, magazin și dashboard')),
  project('worldlink', 'https://worldlinkcompany.com', {kind: 'agency'}, name('World Link')),
]

const experience = (company, year, link, it, en = it, ro = it) => ({
  company, year, link, translations: tr({it: {role: it}, en: {role: en}, ro: {role: ro}}),
})

const EXPERIENCES = [
  experience('Tecnobit s.r.l.', null, 'https://www.tecnobit.it/', 'Sviluppo software gestionale', 'Management software development', 'Dezvoltare software de gestiune'),
  experience('Mediamotion s.r.l.', 2009, null, 'Junior Full Stack Developer'),
  experience('Organizzazione no-profit', 2010, null, 'Desktop & Web Developer'),
  experience('Self-employed', 2017, null, 'Full Stack Developer, Web Designer, Mobile Developer'),
  experience('Zucchetti Software Giuridico s.r.l.', 2018, 'http://www.zucchettisoftwaregiuridico.it', 'Senior Front-End Developer'),
  experience('Develon s.r.l.', 2020, 'https://www.develon.com', 'Senior Full Stack Developer'),
  experience('Boolean Careers', 2021, 'https://www.boolean.careers', 'Main Teacher nel corso di Full-Stack Web Development', 'Main Teacher of the Full-Stack Web Development course', 'Main Teacher la cursul de Full-Stack Web Development'),
  experience('Web Artisan Bros', 2023, 'https://webartisanbros.com', 'Co-founder & CTO'),
  experience('The Full Project', 2024, 'https://thefullproject.it/', 'Full Stack Developer & IT Manager'),
  experience('xPulire', 2025, 'https://www.xpulire.com/', 'IT & Network Infrastructure'),
]

const service = (icon, it, en, ro) => ({icon, translations: tr({it, en, ro})})

const SERVICES = [
  service('web',
    {title: 'Web Developer', text: 'Siti, web app e prodotti SaaS su misura — dall\'idea al lancio, integrazioni e pagamenti compresi.'},
    {title: 'Web Developer', text: 'Custom websites, web apps and SaaS products — from idea to launch, integrations and payments included.'},
    {title: 'Web Developer', text: 'Site-uri, aplicații web și produse SaaS pe măsură — de la idee la lansare, cu integrări și plăți incluse.'}),
  service('mobile',
    {title: 'Mobile Developer', text: 'App native o cross-platform che i tuoi utenti aprono davvero, non solo scaricano una volta e dimenticano.'},
    {title: 'Mobile Developer', text: 'Native or cross-platform apps your users actually open, not just download once and forget.'},
    {title: 'Mobile Developer', text: 'Aplicații native sau cross-platform pe care utilizatorii tăi chiar le deschid, nu doar le descarcă o dată și le uită.'}),
  service('design',
    {title: 'UI / UX Designer', text: 'Interfacce chiare che guidano l\'utente dove deve arrivare — belle sì, ma soprattutto che funzionano.'},
    {title: 'UI / UX Designer', text: 'Clear interfaces that guide users where they need to go — beautiful, yes, but above all working.'},
    {title: 'UI / UX Designer', text: 'Interfețe clare care îl conduc pe utilizator acolo unde trebuie să ajungă — frumoase, da, dar mai ales funcționale.'}),
  service('devops',
    {title: 'DevOps & Infrastruttura', text: 'Server in cloud, deploy automatici, DNS, SSL, backup e monitoraggio, con DigitalOcean, Forge, Cleavr e Docker. Un progetto non è finito quando funziona sul mio computer: è finito quando è online e resta in piedi.'},
    {title: 'DevOps & Infrastructure', text: 'Cloud servers, automated deploys, DNS, SSL, backups and monitoring, with DigitalOcean, Forge, Cleavr and Docker. A project isn\'t done when it works on my machine: it\'s done when it\'s online and stays up.'},
    {title: 'DevOps & Infrastructură', text: 'Servere în cloud, deploy-uri automate, DNS, SSL, backup și monitorizare, cu DigitalOcean, Forge, Cleavr și Docker. Un proiect nu e gata când merge pe calculatorul meu: e gata când e online și rămâne online.'}),
  service('formazione',
    {title: 'Formazione / Mentoring', text: 'Corsi e mentoring per sviluppatori che vogliono crescere sul serio — non solo copiare codice, ma capirlo davvero.'},
    {title: 'Training / Mentoring', text: 'Courses and mentoring for developers who want to really grow — not just copy code, but truly understand it.'},
    {title: 'Formare / Mentorat', text: 'Cursuri și mentorat pentru dezvoltatorii care vor să crească pe bune — nu doar să copieze cod, ci să-l înțeleagă cu adevărat.'}),
  service('consulenza',
    {title: 'Consulenza tecnica', text: 'Code review, architettura, scelta dello stack — un parere esterno onesto, anche quando la risposta è "meglio riscriverlo".'},
    {title: 'Technical consulting', text: 'Code reviews, architecture, choosing the stack — an honest outside opinion, even when the answer is "better rewrite it".'},
    {title: 'Consultanță tehnică', text: 'Code review, arhitectură, alegerea stack-ului — o părere externă sinceră, chiar și când răspunsul este „mai bine îl rescriem".'}),
]

const TECHNOLOGIES = [
  'HTML5', 'CSS3 / SASS', 'JavaScript', 'TypeScript', 'jQuery', 'Vue.js / Nuxt.js', 'Node.js', 'Nest.js',
  'NativeScript', 'Ionic', 'Webpack / Vite', 'PHP', 'Laravel', 'MongoDB / MySQL', 'Docker',
  'Statamic', 'Directus', 'DigitalOcean', 'Laravel Forge / Cleavr',
].map(name => ({name}))

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
      it: {slug: '', title: 'Home', seo_title: 'Costruisco esperienze digitali su misura', description: 'Siti, app e interfacce che funzionano davvero. Oltre 15 anni tra web, mobile e UI/UX.'},
      en: {slug: '', title: 'Home', seo_title: 'I build digital experiences made to measure', description: 'Websites, apps and interfaces that actually work. Over 15 years across web, mobile and UI/UX.'},
      ro: {slug: '', title: 'Acasă', seo_title: 'Construiesc experiențe digitale pe măsură', description: 'Site-uri, aplicații și interfețe care chiar funcționează. Peste 15 ani între web, mobile și UI/UX.'},
    }),
    sections: [
      section('block_hero_home', {}, {
        it: {
          title: 'Costruisco esperienze digitali',
          title_accent: 'su misura',
          text: 'Siti, app e interfacce che funzionano davvero. Oltre 15 anni tra web, mobile e UI/UX.',
          legacy_text: 'Da oltre 15 anni trasformo idee in siti, app e interfacce che funzionano davvero. Questa pagina è servita dal vecchio DOM: testo, link blu e tabelle.',
        },
        en: {
          title: 'I build digital experiences',
          title_accent: 'made to measure',
          text: 'Websites, apps and interfaces that actually work. Over 15 years across web, mobile and UI/UX.',
          legacy_text: 'For over 15 years I have been turning ideas into websites, apps and interfaces that actually work. This page is served by the old DOM: text, blue links and tables.',
        },
        ro: {
          title: 'Construiesc experiențe digitale',
          title_accent: 'pe măsură',
          text: 'Site-uri, aplicații și interfețe care chiar funcționează. Peste 15 ani între web, mobile și UI/UX.',
          legacy_text: 'De peste 15 ani transform idei în site-uri, aplicații și interfețe care chiar funcționează. Această pagină este servită de vechiul DOM: text, linkuri albastre și tabele.',
        },
      }),
      section('block_services', {}, {
        it: {label: 'servizi', title: 'Cosa posso fare per te?', text: 'Che tu abbia bisogno di un sito, un\'app o un\'interfaccia che non faccia scappare gli utenti, sei nel posto giusto anche tu. Ecco come posso aiutarti:'},
        en: {label: 'services', title: 'What can I do for you?', text: 'Whether you need a website, an app or an interface that doesn\'t scare users away, you\'re in the right place. Here\'s how I can help:'},
        ro: {label: 'servicii', title: 'Ce pot face pentru tine?', text: 'Fie că ai nevoie de un site, de o aplicație sau de o interfață care să nu-i alunge pe utilizatori, ești în locul potrivit. Iată cum te pot ajuta:'},
      }),
      section('block_projects', {show: 'home', all_link: true}, {
        it: {label: 'progetti', title: 'Lavori selezionati'},
        en: {label: 'projects', title: 'Selected work'},
        ro: {label: 'proiecte', title: 'Lucrări selectate'},
      }),
      section('block_contact_form', {}, {
        it: {label: 'contatti', title: 'Parliamone', text: 'Sito, app, consulenza o solo un parere tecnico — scrivimi e vediamo insieme come darti una mano, senza giri di parole.'},
        en: {label: 'contact', title: 'Let\'s talk', text: 'A website, an app, consulting or just a technical opinion — write to me and let\'s figure out together how I can help, no beating around the bush.'},
        ro: {label: 'contact', title: 'Hai să vorbim', text: 'Site, aplicație, consultanță sau doar o părere tehnică — scrie-mi și vedem împreună cum te pot ajuta, fără ocolișuri.'},
      }),
    ],
  },
  {
    key: 'about',
    in_menu: true,
    translations: tr({
      it: {slug: 'chi-sono', title: 'Chi sono', description: 'Sono Leica Florian Robert, sviluppatore Web Full Stack, UI e UX Designer, sviluppatore Mobile e insegnante di tecnologie web.'},
      en: {slug: 'about', title: 'About me', description: 'I\'m Leica Florian Robert: Full Stack Web Developer, UI and UX Designer, Mobile Developer and web technologies teacher.'},
      ro: {slug: 'despre-mine', title: 'Despre mine', description: 'Sunt Leica Florian Robert, dezvoltator Web Full Stack, UI și UX Designer, dezvoltator Mobile și profesor de tehnologii web.'},
    }),
    sections: [
      section('block_page_header', {variant: 'about'}, {
        it: {label: '// su di me', title: 'Ciao, benvenuto/a', intro: 'Sono Leica Florian Robert, sviluppatore Web Full Stack, UI e UX Designer, sviluppatore Mobile, insegnante tecnologie web, grande appassionato d\'informatica e di tecnologia.'},
        en: {label: '// about me', title: 'Hi, welcome', intro: 'I\'m Leica Florian Robert: Full Stack Web Developer, UI and UX Designer, Mobile Developer, web technologies teacher, and a big fan of computing and technology.'},
        ro: {label: '// despre mine', title: 'Salut, bine ai venit', intro: 'Sunt Leica Florian Robert, dezvoltator Web Full Stack, UI și UX Designer, dezvoltator Mobile, profesor de tehnologii web, mare pasionat de informatică și tehnologie.'},
      }),
      section('block_text', {}, {
        it: {
          label: 'storia',
          title: 'Da autodidatta a formatore',
          text: paras(
            'Adoro questi settori in quanto offrono opportunità uniche e (a volte) semplificano di molto la vita o comunque la migliorano e questa mia passione cerco di trasmetterla anche ad altri.',
            'Dall\'inizio della mia carriera professionale questa passione mi ha spinto a voler imparare il più possibile come funziona il web, come funziona l\'informatica e come posso a mia volta farne parte anche io.',
            'Ho iniziato a programmare da autodidatta. Giorno dopo giorno, tassello dopo tassello, ho imparato cose nuove, mi sono costantemente messo alla prova, allargando i miei limiti, a volte anche fallendo, ma tutto questo mi ha fatto crescere professionalmente e acquisire le capacità necessarie per rendere questa passione un lavoro.',
            'Attualmente ho la splendida opportunità di trasmettere anche ad altri la mia passione, la mia esperienza e le conoscenze acquisite, formando programmatori Full Stack ed insegnando loro tutto il necessario per poter contribuire attivamente al mondo della programmazione! Oltre ad insegnare, continuo a lavorare come sviluppatore e mi diletto nello sperimentare nuove tecnologie e continuare ad imparare cose nuove.',
          ),
        },
        en: {
          label: 'story',
          title: 'From self-taught to teacher',
          text: paras(
            'I love these fields because they offer unique opportunities and (sometimes) make life a lot simpler, or at least better — and it\'s a passion I try to pass on to others too.',
            'Since the start of my career, this passion has pushed me to learn as much as I can about how the web works, how computing works, and how I can become part of it myself.',
            'I started programming self-taught. Day after day, piece by piece, I learned new things, constantly tested myself, pushed my limits, sometimes failed — and all of this made me grow professionally and gave me the skills to turn this passion into a job.',
            'Today I have the wonderful opportunity to pass on my passion, my experience and what I\'ve learned, training Full Stack developers and teaching them everything they need to actively contribute to the world of programming! Besides teaching, I keep working as a developer and enjoy experimenting with new technologies and learning new things.',
          ),
        },
        ro: {
          label: 'poveste',
          title: 'De la autodidact la formator',
          text: paras(
            'Iubesc aceste domenii pentru că oferă oportunități unice și (uneori) simplifică mult viața sau, oricum, o îmbunătățesc — iar această pasiune încerc să le-o transmit și altora.',
            'De la începutul carierei mele, această pasiune m-a împins să învăț cât mai mult despre cum funcționează web-ul, cum funcționează informatica și cum pot și eu să devin parte din ele.',
            'Am început să programez ca autodidact. Zi după zi, pas cu pas, am învățat lucruri noi, m-am pus constant la încercare, mi-am depășit limitele, uneori am și greșit, dar toate acestea m-au ajutat să cresc profesional și să dobândesc abilitățile necesare pentru a transforma această pasiune într-o meserie.',
            'În prezent am minunata oportunitate de a le transmite și altora pasiunea, experiența și cunoștințele mele, formând programatori Full Stack și învățându-i tot ce le trebuie pentru a contribui activ la lumea programării! Pe lângă predat, continui să lucrez ca dezvoltator și îmi place să experimentez tehnologii noi și să învăț mereu lucruri noi.',
          ),
        },
      }),
      section('block_widgets', {engines: 'native', widgets: ['editor', 'lesson', 'neofetch']}, same({})),
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
            'Come disse qualcuno (non ricordo chi), "L\'unico limite è la tua immaginazione" e questo è vero anche per i progetti che puoi realizzare con me. Non c\'è nulla (quasi) che non possa essere fatto, se hai la voglia e ti rivolgi alla persona giusta. E dove non arrivano le mie capacità, ci arrivo con l\'AI.',
            'Qui di seguito troverai una lista di alcuni dei progetti che ho realizzato in passato, ma non esitare a contattarmi per qualsiasi altra cosa tu possa desiderare.',
          ),
        },
        en: {
          label: '// {n} projects',
          title: 'Projects',
          intro: paras(
            'As someone once said (I can\'t remember who), "The only limit is your imagination" — and that\'s true for the projects you can build with me too. There\'s (almost) nothing that can\'t be done, if you have the will and turn to the right person. And where my skills fall short, AI takes me the rest of the way.',
            'Below you\'ll find a list of some of the projects I\'ve built in the past, but don\'t hesitate to contact me for anything else you might have in mind.',
          ),
        },
        ro: {
          label: '// {n} proiecte',
          title: 'Proiecte',
          intro: paras(
            'Cum a spus cineva (nu-mi amintesc cine), „Singura limită este imaginația ta", iar asta e valabil și pentru proiectele pe care le poți realiza cu mine. Nu există (aproape) nimic care să nu poată fi făcut, dacă ai voință și te adresezi persoanei potrivite. Iar acolo unde nu ajung abilitățile mele, ajung cu ajutorul AI.',
            'Mai jos găsești o listă cu câteva dintre proiectele pe care le-am realizat în trecut, dar nu ezita să mă contactezi pentru orice altceva ți-ai dori.',
          ),
        },
      }),
      section('block_projects', {show: 'featured'}, {
        it: {label: 'in evidenza'},
        en: {label: 'featured'},
        ro: {label: 'în evidență'},
      }),
      section('block_projects', {show: 'archive', kind: 'client'}, {
        it: {label: 'clienti', title: 'Lavori per i clienti'},
        en: {label: 'clients', title: 'Client work'},
        ro: {label: 'clienți', title: 'Lucrări pentru clienți'},
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
        it: {title: 'Contatti', intro: 'Sito, app, consulenza o solo un parere tecnico — scrivimi e vediamo insieme come darti una mano, senza giri di parole.'},
        en: {title: 'Contact', intro: 'A website, an app, consulting or just a technical opinion — write to me and let\'s figure out together how I can help, no beating around the bush.'},
        ro: {title: 'Contact', intro: 'Site, aplicație, consultanță sau doar o părere tehnică — scrie-mi și vedem împreună cum te pot ajuta, fără ocolișuri.'},
      }),
      section('block_contact_info', {engines: 'legacy'}, same({})),
      section('block_contact_form', {}, {
        it: {label: 'scrivimi', title: 'Parliamone'},
        en: {label: 'write to me', title: 'Let\'s talk'},
        ro: {label: 'scrie-mi', title: 'Hai să vorbim'},
      }),
      section('block_contact_info', {engines: 'native'}, {
        it: {label: 'recapiti', title: 'Dove trovarmi'},
        en: {label: 'details', title: 'Where to find me'},
        ro: {label: 'date de contact', title: 'Unde mă găsești'},
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
      NEXT_STEP,
    ],
  },
  tfp: {
    year: 2024,
    translations: {
      it: {intro: 'Due anni in una web agency da sviluppatore e responsabile IT: siti, web app ed e-commerce, e l\'infrastruttura che li porta online e li tiene in piedi.', role: 'Sviluppo e IT', type: 'Web agency', stack: 'Laravel, Statamic, Vue, Nuxt, Directus, Docker, DigitalOcean'},
      en: {intro: 'Two years at a web agency as developer and IT manager: websites, web apps and e-commerce, and the infrastructure that takes them online and keeps them up.', role: 'Development and IT', type: 'Web agency', stack: 'Laravel, Statamic, Vue, Nuxt, Directus, Docker, DigitalOcean'},
      ro: {intro: 'Doi ani într-o agenție web ca dezvoltator și responsabil IT: site-uri, aplicații web și e-commerce, plus infrastructura care le pune online și le ține în funcțiune.', role: 'Dezvoltare și IT', type: 'Agenție web', stack: 'Laravel, Statamic, Vue, Nuxt, Directus, Docker, DigitalOcean'},
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
            'Nessun disservizio in due anni.',
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
            'No outages in two years.',
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
            'Nicio întrerupere a serviciului în doi ani.',
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
