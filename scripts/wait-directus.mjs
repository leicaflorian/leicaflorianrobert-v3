// Waits until Directus answers, before `nuxt generate` reads it. In Coolify a push rebuilds
// Directus too, and the site build can start while Directus is still restarting.
// Used by the Dockerfile; gives up after about five minutes.
//
//   NUXT_PUBLIC_DIRECTUS_URL=https://... node scripts/wait-directus.mjs

const url = `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/server/ping`

for (let attempt = 0; attempt < 60; attempt++) {
  try {
    if ((await fetch(url)).ok) process.exit(0)
  } catch {
    // not up yet
  }
  if (attempt === 0) console.log(`waiting for ${url}`)
  await new Promise(resolve => setTimeout(resolve, 5000))
}
console.error(`Directus doesn't answer: ${url}`)
process.exit(1)
