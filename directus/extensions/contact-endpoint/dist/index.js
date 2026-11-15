// The site's contact form endpoint: POST /contact.
// Written directly in JavaScript, with no build step: it's a single file with no dependencies.
//
// Body: { name, surname?, email, message, project_types?, budget?, timeline?, locale?, token? }
// - project_types, budget and timeline are the project brief: keys from app/utils/brief.ts,
//   anything else is dropped.
// - If RECAPTCHA_SECRET is set, `token` (reCAPTCHA v3) is required and the score
//   must be at least RECAPTCHA_MIN_SCORE (0.5 if not set).
// - The message is saved to `messages` with server permissions: the public can
//   neither read nor write that collection.
// - Then it is emailed to CONTACT_EMAIL_TO through the Hostinger Mail API (HTTPS: the droplet
//   blocks the SMTP ports), from the mailbox HOSTINGER_MAILBOX_ID with HOSTINGER_MAIL_TOKEN.
//   Without them no email is sent. A failed email is only logged: the message is already saved.

const LIMITS = {name: 100, surname: 100, email: 200, message: 5000, locale: 5}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// The brief's options, as in app/utils/brief.ts.
const BRIEF = {
  types: ['site', 'web-app', 'ecommerce', 'mobile-app', 'ui-ux', 'devops', 'ai', 'consulting', 'training'],
  budget: ['lt-3k', '3-10k', '10-25k', '25k-plus', 'tbd'],
  timeline: ['urgent', '1-3m', '3-6m', 'flexible'],
}

function cleanBrief(body) {
  const types = Array.isArray(body?.project_types) ? body.project_types : []
  return {
    project_types: [...new Set(types.filter(type => BRIEF.types.includes(type)))],
    budget: BRIEF.budget.includes(body?.budget) ? body.budget : null,
    timeline: BRIEF.timeline.includes(body?.timeline) ? body.timeline : null,
  }
}

function clean(body) {
  const out = {}
  for (const [field, max] of Object.entries(LIMITS)) {
    const value = typeof body?.[field] === 'string' ? body[field].trim() : ''
    out[field] = value.slice(0, max)
  }
  return out
}

const MAIL_API = 'https://api.mail.hostinger.com/api/v1/mailboxes'

/** The notification for the site's owner, in Italian like the admin. */
function notification(message, brief) {
  const sender = [message.name, message.surname].filter(Boolean).join(' ')
  return {
    subject: `Nuovo messaggio dal sito: ${sender} <${message.email}>`,
    text: [
      `Nome: ${sender}`,
      `Email: ${message.email}`,
      `Lingua: ${message.locale || '-'}`,
      `Tipo di progetto: ${brief.project_types.join(', ') || '-'}`,
      `Budget: ${brief.budget || '-'}`,
      `Tempi: ${brief.timeline || '-'}`,
      '',
      message.message,
    ].join('\n'),
  }
}

/** Sends the notification; throws when the API refuses it or can't be reached. */
async function sendNotification(env, message, brief) {
  const response = await fetch(`${MAIL_API}/${encodeURIComponent(env.HOSTINGER_MAILBOX_ID)}/send`, {
    method: 'POST',
    headers: {'Authorization': `Bearer ${env.HOSTINGER_MAIL_TOKEN}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({to: [env.CONTACT_EMAIL_TO], displayName: 'leicaflorianrobert.dev', ...notification(message, brief)}),
  })
  if (!response.ok) throw new Error(`Hostinger Mail API answered ${response.status}: ${await response.text()}`)
}

async function verifyRecaptcha(secret, token, minScore) {
  if (!token) return false
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({secret, response: token}),
  })
  const result = await response.json()
  return result.success === true && result.action === 'contact' && (result.score ?? 0) >= minScore
}

export default {
  id: 'contact',
  handler: (router, {services, getSchema, env, logger}) => {
    router.post('/', async (req, res) => {
      const message = clean(req.body)
      if (!message.name || !EMAIL.test(message.email) || !message.message) {
        return res.status(400).json({errors: [{message: 'Name, email and message are required.'}]})
      }

      const secret = env.RECAPTCHA_SECRET
      if (secret) {
        const minScore = Number(env.RECAPTCHA_MIN_SCORE ?? 0.5)
        try {
          if (!(await verifyRecaptcha(secret, req.body?.token, minScore))) {
            return res.status(400).json({errors: [{message: 'reCAPTCHA verification failed.'}]})
          }
        } catch (error) {
          logger.error(error, 'contact-endpoint: reCAPTCHA verification error')
          return res.status(502).json({errors: [{message: 'reCAPTCHA verification unavailable.'}]})
        }
      }

      const brief = cleanBrief(req.body)
      try {
        const items = new services.ItemsService('messages', {schema: await getSchema(), accountability: null})
        await items.createOne({...message, ...brief, locale: message.locale || null, surname: message.surname || null})
      } catch (error) {
        logger.error(error, 'contact-endpoint: failed to save the message')
        return res.status(500).json({errors: [{message: 'Message not saved.'}]})
      }

      if (env.HOSTINGER_MAIL_TOKEN && env.HOSTINGER_MAILBOX_ID && env.CONTACT_EMAIL_TO) {
        try {
          await sendNotification(env, message, brief)
        } catch (error) {
          logger.error(error, 'contact-endpoint: the email for the new message was not sent')
        }
      }
      return res.status(204).end()
    })
  },
}
