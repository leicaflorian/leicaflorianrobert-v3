// Every Directus email (the flows' "Send Email", password reset, invites) through the Hostinger Mail API.
// Written directly in JavaScript, with no build step: it's a single file with no dependencies.
//
// DigitalOcean blocks the SMTP ports on the droplet, and Directus has no pluggable transport
// (EMAIL_TRANSPORT is a fixed list). But MailService.send() runs the `email.send` filter first and
// sends nothing when the filter returns null: this hook sends the email itself and returns null.
//
// - With HOSTINGER_MAIL_TOKEN and HOSTINGER_MAILBOX_ID set, the email leaves from that mailbox
//   (hPanel > Agentic Mail > API access). Without them the email is left to Directus, as before.
// - The API has no From or Reply-To: the sender is always the mailbox, with the email's sender name
//   (or the project name) as display name.
// - A refused email throws, so Directus reports it like any failed email.

const MAIL_API = 'https://api.mail.hostinger.com/api/v1/mailboxes'

/** Nodemailer accepts a string (comma-separated), an {name, address} object or a list of both. */
function addresses(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap(addresses)
  if (typeof value === 'object') return value.address ? [value.address] : []
  return String(value).split(',').map(address => address.trim()).filter(Boolean)
}

/** A nodemailer attachment as the API wants it: base64 content, unless it names its own encoding. */
function attachment({filename, content, contentType, cid, encoding}) {
  const out = {filename}
  if (typeof content === 'string' && encoding) {
    out.content = content
    out.encoding = encoding
  } else {
    out.content = Buffer.from(content ?? '').toString('base64')
  }
  if (contentType) out.contentType = contentType
  if (cid) out.cid = cid
  return out
}

export default ({filter}, {services, getSchema, env}) => {
  filter('email.send', async (mail) => {
    if (!env.HOSTINGER_MAIL_TOKEN || !env.HOSTINGER_MAILBOX_ID) return mail

    const mailer = new services.MailService({schema: await getSchema()})
    const defaults = await mailer.getDefaultTemplateData()
    const html = mail.template
      ? await mailer.renderTemplate(mail.template.name, {...defaults, ...mail.template.data})
      : mail.html

    const body = {
      to: addresses(mail.to),
      displayName: (typeof mail.from === 'object' && mail.from?.name) || defaults.projectName,
      subject: mail.subject ?? '',
    }
    const cc = addresses(mail.cc)
    const bcc = addresses(mail.bcc)
    if (cc.length) body.cc = cc
    if (bcc.length) body.bcc = bcc
    if (html) body.html = html
    if (mail.text) body.text = mail.text
    if (mail.attachments?.length) body.attachments = mail.attachments.map(attachment)

    const response = await fetch(`${MAIL_API}/${encodeURIComponent(env.HOSTINGER_MAILBOX_ID)}/send`, {
      method: 'POST',
      headers: {'Authorization': `Bearer ${env.HOSTINGER_MAIL_TOKEN}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`Hostinger Mail API answered ${response.status}: ${await response.text()}`)
    return null
  })
}
