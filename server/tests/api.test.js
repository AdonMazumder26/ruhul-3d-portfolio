/**
 * API smoke tests against a real in-memory MongoDB.
 * Run with: npm test
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'owner@example.com'
const ADMIN_PASSWORD = 'correct horse battery staple'

let mongod
let server
let baseUrl
let Project
let ContactMessage
let Post
let adminCookie = ''

const json = (method, path, body, headers = {}) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })

// Authenticated admin request from the allowed origin.
const admin = (method, path, body) =>
  json(method, path, body, { Cookie: adminCookie, Origin: 'http://localhost:5173' })

before(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri('ruhul_portfolio_test')
  process.env.CLIENT_ORIGIN = 'http://localhost:5173'
  process.env.NODE_ENV = 'test'
  process.env.ADMIN_EMAIL = ADMIN_EMAIL
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD, 4)
  process.env.JWT_SECRET = 'test-secret-that-is-definitely-long-enough-for-validation'

  // env.js reads process.env at import time, so import everything lazily.
  const { connectDatabase } = await import('../src/config/db.js')
  const { createApp } = await import('../src/app.js')
  const { seedProjects } = await import('../scripts/seedProjects.js')
  ;({ Project } = await import('../src/modules/projects/project.model.js'))
  ;({ ContactMessage } = await import('../src/modules/contact/contact.model.js'))
  ;({ Post } = await import('../src/modules/posts/post.model.js'))

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

// ---------------------------------------------------------------------------
// Admin panel
// ---------------------------------------------------------------------------

test('admin routes require a session cookie', async () => {
  const res = await fetch(`${baseUrl}/api/admin/overview`)
  assert.equal(res.status, 401)
  const me = await fetch(`${baseUrl}/api/admin/auth/me`)
  assert.equal(me.status, 401)
})

test('POST /api/admin/auth/login rejects bad credentials and accepts the configured admin', async () => {
  const wrongPassword = await json('POST', '/api/admin/auth/login', { email: ADMIN_EMAIL, password: 'nope' })
  assert.equal(wrongPassword.status, 401)

  const wrongEmail = await json('POST', '/api/admin/auth/login', { email: 'someone@example.com', password: ADMIN_PASSWORD })
  assert.equal(wrongEmail.status, 401)

  const invalid = await json('POST', '/api/admin/auth/login', { email: 'not-an-email', password: '' })
  assert.equal(invalid.status, 400)

  const ok = await json('POST', '/api/admin/auth/login', { email: ADMIN_EMAIL.toUpperCase(), password: ADMIN_PASSWORD })
  assert.equal(ok.status, 200)
  assert.equal((await ok.json()).data.email, ADMIN_EMAIL)

  const setCookie = ok.headers.get('set-cookie')
  assert.match(setCookie, /ruhul_admin=/)
  assert.match(setCookie, /HttpOnly/i)
  adminCookie = setCookie.split(';')[0]

  const me = await admin('GET', '/api/admin/auth/me')
  assert.equal(me.status, 200)
  assert.equal((await me.json()).data.email, ADMIN_EMAIL)
})

test('admin mutations from a foreign origin are rejected', async () => {
  const res = await json(
    'POST',
    '/api/admin/projects',
    { title: 'x', slug: 'x', summary: 'xxxxxxxxxxxx', category: 'cat' },
    { Cookie: adminCookie, Origin: 'http://evil.example' },
  )
  // CORS rejects the foreign origin before requireAdmin runs.
  assert.equal(res.status, 403)
})

test('admin can create, read, update, toggle, reorder and delete projects', async () => {
  const all = await admin('GET', '/api/admin/projects')
  assert.equal(all.status, 200)
  const allBody = await all.json()
  assert.equal(allBody.data.length, 4)
  assert.ok(allBody.data.some((project) => project.slug === 'hidden-draft'))

  const created = await admin('POST', '/api/admin/projects', {
    title: 'Admin Made',
    slug: 'admin-made',
    summary: 'A project created from the admin panel.',
    category: 'Experiment',
    technologies: ['Node.js'],
    published: false,
  })
  assert.equal(created.status, 201)
  const project = (await created.json()).data
  assert.equal(project.status, 'in-progress')

  const duplicate = await admin('POST', '/api/admin/projects', {
    title: 'Dup',
    slug: 'admin-made',
    summary: 'Duplicate slug should conflict.',
    category: 'Experiment',
  })
  assert.equal(duplicate.status, 409)

  const invalid = await admin('POST', '/api/admin/projects', { title: 'x' })
  assert.equal(invalid.status, 400)

  const hiddenPublic = await fetch(`${baseUrl}/api/projects/admin-made`)
  assert.equal(hiddenPublic.status, 404)

  const toggled = await admin('PATCH', `/api/admin/projects/${project.id}`, { published: true, featured: true })
  assert.equal(toggled.status, 200)
  const toggledBody = (await toggled.json()).data
  assert.equal(toggledBody.published, true)
  // PATCH must not reset omitted fields to defaults.
  assert.deepEqual(toggledBody.technologies, ['Node.js'])
  assert.equal(toggledBody.summary, project.summary)

  const visiblePublic = await fetch(`${baseUrl}/api/projects/admin-made`)
  assert.equal(visiblePublic.status, 200)

  const fullUpdate = await admin('PUT', `/api/admin/projects/${project.id}`, {
    ...project,
    id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    title: 'Admin Made v2',
    published: true,
    repositoryUrl: 'http://insecure.example',
  })
  assert.equal(fullUpdate.status, 400)

  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = project
  const okUpdate = await admin('PUT', `/api/admin/projects/${project.id}`, { ...rest, title: 'Admin Made v2', published: true })
  assert.equal(okUpdate.status, 200)
  assert.equal((await okUpdate.json()).data.title, 'Admin Made v2')

  const ids = (await (await admin('GET', '/api/admin/projects')).json()).data.map((item) => item.id).reverse()
  const reordered = await admin('PUT', '/api/admin/projects/order', { ids })
  assert.equal(reordered.status, 200)
  const orders = (await reordered.json()).data.filter((item) => ids.includes(item.id))
  assert.equal(orders.find((item) => item.id === ids[0]).order, 1)

  const deleted = await admin('DELETE', `/api/admin/projects/${project.id}`)
  assert.equal(deleted.status, 200)
  const gone = await admin('GET', `/api/admin/projects/${project.id}`)
  assert.equal(gone.status, 404)
  const badId = await admin('GET', '/api/admin/projects/not-an-id')
  assert.equal(badId.status, 400)
})

test('admin inbox lists, updates and deletes contact messages', async () => {
  const list = await admin('GET', '/api/admin/contacts')
  assert.equal(list.status, 200)
  const body = (await list.json()).data
  assert.equal(body.total, 1)
  assert.equal(body.counts.new, 1)
  const message = body.items[0]
  assert.equal(message.email, 'visitor@example.com')

  const reviewed = await admin('PATCH', `/api/admin/contacts/${message.id}`, { status: 'reviewed' })
  assert.equal(reviewed.status, 200)
  assert.equal((await reviewed.json()).data.status, 'reviewed')

  const invalid = await admin('PATCH', `/api/admin/contacts/${message.id}`, { status: 'spam' })
  assert.equal(invalid.status, 400)

  const filtered = await admin('GET', '/api/admin/contacts?status=new')
  assert.equal((await filtered.json()).data.total, 0)

  const deleted = await admin('DELETE', `/api/admin/contacts/${message.id}`)
  assert.equal(deleted.status, 200)
  assert.equal(await ContactMessage.countDocuments(), 0)
})

test('blog posts: drafts stay private, published posts appear publicly with derived fields', async () => {
  const content = Array.from({ length: 450 }, (_, i) => `word${i}`).join(' ')
  const created = await admin('POST', '/api/admin/posts', {
    title: 'Hello World',
    slug: 'hello-world',
    excerpt: 'First post.',
    content,
    tags: ['React', 'notes'],
  })
  assert.equal(created.status, 201)
  const post = (await created.json()).data
  assert.equal(post.status, 'draft')
  assert.equal(post.publishedAt, null)
  assert.equal(post.readingMinutes, 2)
  assert.deepEqual(post.tags, ['react', 'notes'])

  const publicList = await fetch(`${baseUrl}/api/posts`)
  assert.equal((await publicList.json()).data.total, 0)
  const publicOne = await fetch(`${baseUrl}/api/posts/hello-world`)
  assert.equal(publicOne.status, 404)

  const published = await admin('PATCH', `/api/admin/posts/${post.id}`, { status: 'published' })
  assert.equal(published.status, 200)
  assert.ok((await published.json()).data.publishedAt)

  const listNow = await (await fetch(`${baseUrl}/api/posts?tag=react`)).json()
  assert.equal(listNow.data.total, 1)
  assert.equal(listNow.data.items[0].slug, 'hello-world')
  assert.equal('content' in listNow.data.items[0], false)
  assert.deepEqual(listNow.data.tags, ['notes', 'react'])

  const detail = await (await fetch(`${baseUrl}/api/posts/hello-world`)).json()
  assert.equal(detail.data.content, content)

  const adminList = await (await admin('GET', '/api/admin/posts')).json()
  assert.equal(adminList.data.length, 1)

  const deleted = await admin('DELETE', `/api/admin/posts/${post.id}`)
  assert.equal(deleted.status, 200)
  assert.equal(await Post.countDocuments(), 0)
})

test('theme settings: defaults are served, admin can save and reset', async () => {
  const defaults = await (await fetch(`${baseUrl}/api/settings/theme`)).json()
  assert.equal(defaults.data.customized, false)
  assert.equal(defaults.data.theme.colors.accent, '#67e8f9')

  const adminView = await (await admin('GET', '/api/admin/settings/theme')).json()
  assert.ok(Array.isArray(adminView.data.fontOptions))

  const invalid = await admin('PUT', '/api/admin/settings/theme', {
    ...defaults.data.theme,
    colors: { ...defaults.data.theme.colors, accent: 'red' },
  })
  assert.equal(invalid.status, 400)

  const saved = await admin('PUT', '/api/admin/settings/theme', {
    ...defaults.data.theme,
    colors: { ...defaults.data.theme.colors, accent: '#A3E635' },
    fonts: { display: 'Sora', sans: 'Inter' },
    hero: { ...defaults.data.theme.hero, stars: false },
  })
  assert.equal(saved.status, 200)
  const savedBody = await saved.json()
  assert.equal(savedBody.data.theme.colors.accent, '#a3e635')
  assert.equal(savedBody.data.customized, true)

  const publicNow = await (await fetch(`${baseUrl}/api/settings/theme`)).json()
  assert.equal(publicNow.data.theme.fonts.display, 'Sora')
  assert.equal(publicNow.data.theme.hero.stars, false)

  const reset = await admin('DELETE', '/api/admin/settings/theme')
  assert.equal(reset.status, 200)
  assert.equal((await reset.json()).data.customized, false)
})

test('POST /api/admin/auth/logout clears the session', async () => {
  const res = await admin('POST', '/api/admin/auth/logout')
  assert.equal(res.status, 200)
  assert.match(res.headers.get('set-cookie'), /ruhul_admin=;/)
})
