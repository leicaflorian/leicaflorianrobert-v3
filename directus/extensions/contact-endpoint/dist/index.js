// The site's contact form endpoint: POST /contact.
// Written directly in JavaScript, with no build step: it's a single file with no dependencies.
//
// Body: { name, surname?, email, message, locale?, token? }
// - If RECAPTCHA_SECRET is set, `token` (reCAPTCHA v3) is required and the score
//   must be at least RECAPTCHA_MIN_SCORE (0.5 if not set).
// - The message is saved to `messages` with server permissions: the public can
//   neither read nor write that collection.

const LIMITS = {name: 100, surname: 100, email: 200, message: 5000, locale: 5}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(body) {
  const out = {}
  for (const [field, max] of Object.entries(LIMITS)) {
    const value = typeof body?.[field] === 'string' ? body[field].trim() : ''
    out[field] = value.slice(0, max)
  }
  return out
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

      try {
        const items = new services.ItemsService('messages', {schema: await getSchema(), accountability: null})
        await items.createOne({...message, locale: message.locale || null, surname: message.surname || null})
        return res.status(204).end()
      } catch (error) {
        logger.error(error, 'contact-endpoint: failed to save the message')
        return res.status(500).json({errors: [{message: 'Message not saved.'}]})
      }
    })
  },
}
