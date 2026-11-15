// Tests for the hostinger-mail hook. Run with `npm run test:directus` (node:test, no dependencies).
// The hook is registered on a fake `filter`; only the outside world is faked: Directus' MailService
// (templates and project data) and the network (globalThis.fetch).

import {test, beforeEach, afterEach} from 'node:test'
import assert from 'node:assert/strict'
import hook from '../dist/index.js'

const ENV = {HOSTINGER_MAIL_TOKEN: 'token-test', HOSTINGER_MAILBOX_ID: 'mbx-123'}
const SEND_URL = 'https://api.mail.hostinger.com/api/v1/mailboxes/mbx-123/send'

let requests
let fetchResponse
let originalFetch

beforeEach(() => {
  requests = []
  fetchResponse = () => new Response(null, {status: 204})
  originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    requests.push({url: String(url), init, body: JSON.parse(init.body)})
    return fetchResponse()
  }
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

/** Registers the hook with `env` and returns its email.send filter. */
function emailFilter(env = ENV) {
  const filters = {}
  class MailService {
    async getDefaultTemplateData() {
      return {projectName: 'LFR CMS', projectColor: '#000'}
    }

    async renderTemplate(name, data) {
      return `<p>${name}: ${data.projectName} ${data.url}</p>`
    }
  }
  hook(
    {filter: (event, fn) => (filters[event] = fn)},
    {services: {MailService}, getSchema: async () => ({}), env, logger: {warn: () => {}}},
  )
  return filters['email.send']
}

test('an email is sent through the Hostinger Mail API and Directus sends nothing', async () => {
  const result = await emailFilter()({to: 'info@example.com', subject: 'Hi', html: '<p>Hello</p>'})

  assert.equal(result, null)
  assert.equal(requests.length, 1)
  const [{url, init, body}] = requests
  assert.equal(url, SEND_URL)
  assert.equal(init.method, 'POST')
  assert.equal(init.headers.Authorization, 'Bearer token-test')
  assert.equal(init.headers['Content-Type'], 'application/json')
  assert.deepEqual(body.to, ['info@example.com'])
  assert.equal(body.subject, 'Hi')
  assert.equal(body.html, '<p>Hello</p>')
  assert.equal(body.displayName, 'LFR CMS')
})

test('recipients given as a list, a comma-separated string or objects become plain addresses', async () => {
  await emailFilter()({
    to: ['a@example.com', {name: 'B', address: 'b@example.com'}],
    cc: 'c@example.com, d@example.com',
    bcc: {name: 'E', address: 'e@example.com'},
    subject: 'Hi',
    html: '<p>x</p>',
  })

  const [{body}] = requests
  assert.deepEqual(body.to, ['a@example.com', 'b@example.com'])
  assert.deepEqual(body.cc, ['c@example.com', 'd@example.com'])
  assert.deepEqual(body.bcc, ['e@example.com'])
})

test('a system email is rendered with its Directus template', async () => {
  await emailFilter()({
    to: 'admin@example.com',
    subject: 'Reset',
    template: {name: 'password-reset', data: {url: 'https://cms/reset'}},
  })

  const [{body}] = requests
  assert.equal(body.html, '<p>password-reset: LFR CMS https://cms/reset</p>')
})

test('the sender name of the email wins over the project name', async () => {
  await emailFilter()({to: 'a@example.com', subject: 'Hi', html: 'x', from: {name: 'Sito', address: 'x@example.com'}})

  assert.equal(requests[0].body.displayName, 'Sito')
})

test('plain text and attachments are passed on, attachments in base64', async () => {
  await emailFilter()({
    to: 'a@example.com', subject: 'Hi', text: 'Hello',
    attachments: [
      {filename: 'a.txt', content: Buffer.from('hello'), contentType: 'text/plain'},
      {filename: 'b.txt', content: 'aGk=', encoding: 'base64'},
    ],
  })

  const [{body}] = requests
  assert.equal(body.text, 'Hello')
  assert.deepEqual(body.attachments, [
    {filename: 'a.txt', content: Buffer.from('hello').toString('base64'), contentType: 'text/plain'},
    {filename: 'b.txt', content: 'aGk=', encoding: 'base64'},
  ])
})

test('without the Hostinger settings the email is left to Directus', async () => {
  const mail = {to: 'a@example.com', subject: 'Hi', html: 'x'}

  const result = await emailFilter({})(mail)

  assert.equal(result, mail)
  assert.equal(requests.length, 0)
})

test('an email the API refuses is an error, so Directus reports it', async () => {
  fetchResponse = () => new Response('{"message":"invalid"}', {status: 422})

  await assert.rejects(
    emailFilter()({to: 'a@example.com', subject: 'Hi', html: 'x'}),
    /Hostinger Mail API answered 422/,
  )
})
