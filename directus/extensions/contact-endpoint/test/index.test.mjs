// Tests for POST /contact. Run with `npm run test:directus` (node:test, no dependencies).
// The endpoint is driven through a fake router; only the outside world is faked:
// Directus' ItemsService and the network (globalThis.fetch).

import {test, beforeEach, afterEach} from 'node:test'
import assert from 'node:assert/strict'
import endpoint from '../dist/index.js'

const HOSTINGER_ENV = {
  CONTACT_EMAIL_TO: 'info@leicaflorianrobert.dev',
  HOSTINGER_MAIL_TOKEN: 'token-test',
  HOSTINGER_MAILBOX_ID: 'mbx-123',
}

const BODY = {
  name: 'Ada', surname: 'Lovelace', email: 'ada@example.com', message: 'Hello\n"there"',
  project_types: ['site', 'nope'], budget: '3-10k', timeline: 'flexible', locale: 'en',
}

let requests
let fetchResponse
let originalFetch

beforeEach(() => {
  requests = []
  fetchResponse = () => new Response(null, {status: 204})
  originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    requests.push({url: String(url), init})
    return fetchResponse()
  }
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

/** Mounts the endpoint and posts `body`, returning the response and what was saved and logged. */
async function post(body, {env = HOSTINGER_ENV, saveFails = false} = {}) {
  let handler
  const router = {post: (path, fn) => (handler = fn)}
  const saved = []
  const errors = []
  class ItemsService {
    async createOne(item) {
      if (saveFails) throw new Error('db down')
      saved.push(item)
    }
  }
  endpoint.handler(router, {
    services: {ItemsService},
    getSchema: async () => ({}),
    env,
    logger: {error: (...args) => errors.push(args), warn: () => {}},
  })
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
    end() { return this },
  }
  await handler({body}, res)
  return {res, saved, errors}
}

test('a saved message is emailed to CONTACT_EMAIL_TO through the Hostinger Mail API', async () => {
  const {res, saved} = await post(BODY)

  assert.equal(res.statusCode, 204)
  assert.equal(saved.length, 1)
  assert.equal(requests.length, 1)
  const [{url, init}] = requests
  assert.equal(url, 'https://api.mail.hostinger.com/api/v1/mailboxes/mbx-123/send')
  assert.equal(init.method, 'POST')
  assert.equal(init.headers.Authorization, 'Bearer token-test')
  assert.equal(init.headers['Content-Type'], 'application/json')
  const mail = JSON.parse(init.body)
  assert.deepEqual(mail.to, ['info@leicaflorianrobert.dev'])
  assert.equal(mail.subject, 'Nuovo messaggio dal sito: Ada Lovelace <ada@example.com>')
  assert.match(mail.text, /Email: ada@example.com/)
  assert.match(mail.text, /Tipo di progetto: site\n/)
  assert.match(mail.text, /Budget: 3-10k/)
  assert.match(mail.text, /Tempi: flexible/)
  assert.match(mail.text, /Lingua: en/)
  assert.ok(mail.text.endsWith('Hello\n"there"'))
})

test('without the Hostinger settings the message is saved and no email is sent', async () => {
  const {res, saved} = await post(BODY, {env: {}})

  assert.equal(res.statusCode, 204)
  assert.equal(saved.length, 1)
  assert.equal(requests.length, 0)
})

test('a failed email is logged and the visitor still gets a success', async () => {
  fetchResponse = () => new Response('{"message":"nope"}', {status: 422})

  const {res, saved, errors} = await post(BODY)

  assert.equal(res.statusCode, 204)
  assert.equal(saved.length, 1)
  assert.equal(errors.length, 1)
  assert.match(String(errors[0][1]), /email/i)
})

test('an unreachable mail API is logged and the visitor still gets a success', async () => {
  fetchResponse = () => {
    throw new TypeError('fetch failed')
  }

  const {res, errors} = await post(BODY)

  assert.equal(res.statusCode, 204)
  assert.equal(errors.length, 1)
})

test('a message that is not saved is not emailed', async () => {
  const {res} = await post(BODY, {saveFails: true})

  assert.equal(res.statusCode, 500)
  assert.equal(requests.length, 0)
})
