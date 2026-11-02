/**
 * API smoke tests against a real in-memory MongoDB.
 * Run with: npm test
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod
let server
let baseUrl
let Project
let ContactMessage

const json = (method, path, body, headers = {}) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })

before(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri('ruhul_portfolio_test')
  process.env.CLIENT_ORIGIN = 'http://localhost:5173'
  process.env.NODE_ENV = 'test'

  // env.js reads process.env at import time, so import everything lazily.
  const { connectDatabase } = await import('../src/config/db.js')
  const { createApp } = await import('../src/app.js')
  const { seedProjects } = await import('../scripts/seedProjects.js')
  ;({ Project } = await import('../src/modules/projects/project.model.js'))
  ;({ ContactMessage } = await import('../src/modules/contact/contact.model.js'))

  await connectDatabase()
  await seedProjects()
  await Project.create({
    title: 'Hidden Draft',
    slug: 'hidden-draft',
    summary: 'Should never be returned by the public API.',
    category: 'Draft',
    published: false,
  })

  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve) => server?.close(resolve))
  await mongoose.disconnect()
  await mongod?.stop()
})

test('GET /api/health reports a connected database', async () => {
  const res = await fetch(`${baseUrl}/api/health`)
  const body = await res.json()
  assert.equal(res.status, 200)
  assert.equal(body.success, true)
  assert.equal(body.data.status, 'ok')
  assert.equal(body.data.database, 'connected')
})

test('GET /api/projects returns only published projects, featured first then by order', async () => {
  const res = await fetch(`${baseUrl}/api/projects`)
  const body = await res.json()
  assert.equal(res.status, 200)
  assert.deepEqual(
    body.data.map((project) => project.slug),
    ['teamforge', 'ledgerflow', 'abandoned-but-not-forgotten'],
  )
  assert.ok(body.data.every((project) => project.published === true))
  assert.ok(body.data.every((project) => typeof project.id === 'string' && !('_id' in project)))
})

test('GET /api/projects supports featured, category and technology filters', async () => {
  const featured = await (await fetch(`${baseUrl}/api/projects?featured=true`)).json()
  assert.equal(featured.data.length, 3)

  const byTech = await (await fetch(`${baseUrl}/api/projects?technology=three.js`)).json()
  assert.deepEqual(byTech.data.map((project) => project.slug), ['abandoned-but-not-forgotten'])

  const byCategory = await (await fetch(`${baseUrl}/api/projects?category=${encodeURIComponent('Finance application')}`)).json()
  assert.deepEqual(byCategory.data.map((project) => project.slug), ['ledgerflow'])

  const invalid = await fetch(`${baseUrl}/api/projects?featured=maybe`)
  assert.equal(invalid.status, 400)
})

test('GET /api/projects/:slug returns the project, 404 for unknown/unpublished, 400 for invalid slugs', async () => {
  const ok = await fetch(`${baseUrl}/api/projects/teamforge`)
  const okBody = await ok.json()
  assert.equal(ok.status, 200)
  assert.equal(okBody.data.title, 'TeamForge')
  assert.equal(okBody.data.status, 'in-progress')

  const missing = await fetch(`${baseUrl}/api/projects/does-not-exist`)
  assert.equal(missing.status, 404)
  assert.equal((await missing.json()).success, false)

  const unpublished = await fetch(`${baseUrl}/api/projects/hidden-draft`)
  assert.equal(unpublished.status, 404)

  const invalid = await fetch(`${baseUrl}/api/projects/${encodeURIComponent('Bad Slug!')}`)
  assert.equal(invalid.status, 400)
})

test('seed script is idempotent and does not overwrite edits unless forced', async () => {
  const { seedProjects } = await import('../scripts/seedProjects.js')
  await Project.updateOne({ slug: 'teamforge' }, { $set: { summary: 'Edited by owner' } })

  const second = await seedProjects()
  assert.deepEqual(second, { inserted: 0, updated: 0, skipped: 3 })
  assert.equal((await Project.findOne({ slug: 'teamforge' }).lean()).summary, 'Edited by owner')

  const forced = await seedProjects({ force: true })
  assert.deepEqual(forced, { inserted: 0, updated: 3, skipped: 0 })
  assert.notEqual((await Project.findOne({ slug: 'teamforge' }).lean()).summary, 'Edited by owner')
})

// Contact POSTs below share one rate-limit bucket (5 per hour per IP). Order matters.
test('POST /api/contact rejects invalid, oversized and unexpected payloads', async () => {
  const invalid = await json('POST', '/api/contact', { name: 'A', email: 'nope', message: 'short' }) // #1
  const invalidBody = await invalid.json()
  assert.equal(invalid.status, 400)
  assert.deepEqual(
    invalidBody.errors.map((error) => error.field).sort(),
    ['email', 'message', 'name'],
  )

  const oversized = await json('POST', '/api/contact', {
    name: 'Visitor',
    email: 'visitor@example.com',
    message: 'x'.repeat(2001),
  }) // #2
  assert.equal(oversized.status, 400)

  const unexpected = await json('POST', '/api/contact', {
    name: 'Visitor',
    email: 'visitor@example.com',
    message: 'A perfectly fine message body.',
    isAdmin: true,
  }) // #3
  assert.equal(unexpected.status, 400)

  // Malformed JSON is rejected by the body parser before the limiter sees it.
  const malformed = await json('POST', '/api/contact', '{not json')
  assert.equal(malformed.status, 400)
  assert.match((await malformed.json()).message, /valid JSON/)
})

test('POST /api/contact silently drops honeypot submissions', async () => {
  const res = await json('POST', '/api/contact', {
    name: 'Bot',
    email: 'bot@example.com',
    message: 'This is a honeypot test message body.',
    website: 'http://spam.example',
  }) // #4
  assert.equal(res.status, 202)
  assert.equal(await ContactMessage.countDocuments({ email: 'bot@example.com' }), 0)
})

test('POST /api/contact persists valid submissions privately', async () => {
  const res = await json('POST', '/api/contact', {
    name: '  Test   Visitor ',
    email: 'Visitor@Example.com',
    subject: 'Hello',
    message: 'This is a valid test message with enough length.',
  }) // #5
  const body = await res.json()
  assert.equal(res.status, 201)
  assert.equal(body.success, true)
  assert.ok(body.data.id)

  const stored = await ContactMessage.findById(body.data.id).lean()
  assert.equal(stored.name, 'Test Visitor')
  assert.equal(stored.email, 'visitor@example.com')
  assert.equal(stored.status, 'new')
  assert.ok(stored.createdAt instanceof Date)

  const read = await fetch(`${baseUrl}/api/contact`)
  assert.equal(read.status, 404)
  const readOne = await fetch(`${baseUrl}/api/contact/${body.data.id}`)
  assert.equal(readOne.status, 404)
})

test('POST /api/contact is rate limited after five attempts', async () => {
  const sixth = await json('POST', '/api/contact', {
    name: 'Visitor',
    email: 'visitor@example.com',
    message: 'Another perfectly valid message body.',
  }) // #6
  assert.equal(sixth.status, 429)
  assert.equal((await sixth.json()).success, false)
  assert.equal(await ContactMessage.countDocuments(), 1)
})

test('CORS allows the configured origin and rejects others', async () => {
  const allowed = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'http://localhost:5173' } })
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173')

  const blocked = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'http://evil.example' } })
  assert.equal(blocked.status, 403)
})

test('unknown routes return a JSON 404', async () => {
  const res = await fetch(`${baseUrl}/api/nope`)
  assert.equal(res.status, 404)
  assert.equal((await res.json()).success, false)
})
