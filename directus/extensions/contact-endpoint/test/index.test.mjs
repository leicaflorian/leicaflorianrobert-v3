// Tests for POST /contact. The email for a new message is the flow's job (extensions/hostinger-mail).
// Run with `npm run test:directus` (node:test, no dependencies).
// The endpoint is driven through a fake router; only the outside world is faked:
// Directus' ItemsService and the network (globalThis.fetch).

import {test, beforeEach, afterEach} from 'node:test'
import assert from 'node:assert/strict'
import endpoint from '../dist/index.js'

// set, to show the endpoint ignores them: the email is sent by the flow through extensions/hostinger-mail
const HOSTINGER_ENV = {HOSTINGER_MAIL_TOKEN: 'token-test', HOSTINGER_MAILBOX_ID: 'mbx-123'}

const BODY = {
  name: 'Ada', surname: 'Lovelace', email: 'ada@example.com', message: 'Hello\n"there"',
  project_types: ['site', 'nope'], budget: '3-10k', timeline: 'flexible', locale: 'en',
}

let requests
let originalFetch

beforeEach(() => {
  requests = []
  originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    requests.push({url: String(url), init})
    return new Response(null, {status: 204})
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

test('a valid message is saved and the endpoint sends no email itself (the flow does)', async () => {
  const {res, saved} = await post(BODY)

  assert.equal(res.statusCode, 204)
  assert.equal(saved.length, 1)
  assert.equal(saved[0].email, 'ada@example.com')
  assert.deepEqual(saved[0].project_types, ['site'])
  assert.equal(requests.length, 0)
})

test('a message that is not saved answers 500', async () => {
  const {res} = await post(BODY, {saveFails: true})

  assert.equal(res.statusCode, 500)
  assert.equal(requests.length, 0)
})
