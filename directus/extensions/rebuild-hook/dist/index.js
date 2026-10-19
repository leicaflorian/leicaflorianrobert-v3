// Rebuilds the static site when content changes, by calling the deploy webhook
// (DEPLOY_WEBHOOK_URL, with DEPLOY_WEBHOOK_TOKEN as bearer token).
// Written directly in JavaScript, with no build step.
//
// It replaces the «Ricostruisci il sito» flow, which fired once per collection: saving a project
// also saves its translations, a page its sections and blocks, so one edit started two or more
// deploys. Here every change restarts a timer, and the webhook is called once, DELAY after the
// last one. Messages from the contact form are not content and don't rebuild anything.

const DELAY = 30_000
const IGNORED = new Set(['messages'])

export default ({action}, {env, logger}) => {
  const url = env.DEPLOY_WEBHOOK_URL
  if (!url) return

  let timer = null

  async function deploy() {
    timer = null
    try {
      const response = await fetch(url, {method: 'POST', headers: {Authorization: `Bearer ${env.DEPLOY_WEBHOOK_TOKEN ?? ''}`}})
      if (response.ok) logger.info('rebuild of the site requested')
      else logger.error(`rebuild of the site: the webhook answered ${response.status}`)
    } catch (error) {
      logger.error(`rebuild of the site: ${error.message}`)
    }
  }

  for (const event of ['items.create', 'items.update', 'items.delete']) {
    action(event, ({collection}) => {
      if (IGNORED.has(collection)) return
      clearTimeout(timer)
      timer = setTimeout(deploy, DELAY)
    })
  }
}
