// Directus API access for the scripts in this folder.
// Reads URL and credentials from directus/.env (or from environment variables).

import {readFileSync, existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

const envFile = join(dirname(fileURLToPath(import.meta.url)), '..', '.env')
const fileEnv = existsSync(envFile)
  ? Object.fromEntries(readFileSync(envFile, 'utf8').split('\n')
      .map(line => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value]))
  : {}

export const env = key => process.env[key] ?? fileEnv[key]

export const DIRECTUS_URL = env('DIRECTUS_URL') ?? 'http://localhost:8055'

let token = env('DIRECTUS_TOKEN')

async function login() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: env('ADMIN_EMAIL'), password: env('ADMIN_PASSWORD')}),
  })
  if (!response.ok) throw new Error(`Directus login failed (${response.status}): ${await response.text()}`)
  token = (await response.json()).data.access_token
}

/** The admin access token, for non-JSON requests (file uploads). */
export async function authToken() {
  if (!token) await login()
  return token
}

/** An API call; returns `data`, or `null` on a 404 if `allow404`. */
export async function api(method, path, body, {allow404 = false} = {}) {
  if (!token) await login()
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (allow404 && (response.status === 404 || response.status === 403)) return null
  if (!response.ok) throw new Error(`${method} ${path} → ${response.status}: ${await response.text()}`)
  if (response.status === 204) return null
  return (await response.json()).data
}

/** Waits for Directus to respond, for scripts run right after `docker compose up`. */
export async function waitForDirectus(seconds = 120) {
  for (let i = 0; i < seconds; i++) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/server/ping`)
      if (response.ok) return
    } catch {
      // not up yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`Directus is not responding at ${DIRECTUS_URL}`)
}
