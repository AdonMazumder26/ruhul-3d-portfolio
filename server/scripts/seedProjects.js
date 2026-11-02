/**
 * Seeds the three initial project records.
 *
 * Default mode is non-destructive: a project is inserted only if no record
 * with the same slug exists, so edits made directly in the database survive.
 * Run with --force to overwrite existing records with the data below.
 *
 *   npm run seed
 *   npm run seed:force
 */
import { pathToFileURL } from 'node:url'
import mongoose from 'mongoose'
import { Project } from '../src/modules/projects/project.model.js'

export const projects = [
  {
    slug: 'teamforge',
    title: 'TeamForge',
    category: 'Full-stack platform',
    status: 'in-progress',
    summary:
      'A startup matchmaking platform that helps founders and potential collaborators discover opportunities to work together.',
    description:
      'TeamForge is a platform concept built around the idea that good startups start with the right team. Founders can publish what they are building and who they need, while collaborators can browse listings, apply, and manage their involvement from a single profile.',
    purpose:
      'Discovering early-stage collaborators usually happens through scattered chats and luck. TeamForge brings listings, applications and profiles into one structured workflow.',
    features: [
      'Authentication with JWT and cookie-based sessions',
      'Startup listings with role requirements',
      'Application flow between collaborators and founders',
      'User profiles and dashboards',
      'Image handling through Cloudinary',
    ],
    implementationNotes: [
      'React and Vite front end styled with Tailwind CSS.',
      'Node.js and Express REST API with MongoDB persistence.',
      'Session handling built on JWT delivered through HTTP cookies.',
    ],
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Cloudinary'],
    role: 'Design and full-stack development',
    featured: true,
    published: true,
    order: 1,
  },
  {
    slug: 'ledgerflow',
    title: 'LedgerFlow',
    category: 'Finance application',
    status: 'in-progress',
    summary:
      'A MERN-based ledger and transaction management application focused on modeling accounts, transactions and financial records.',
    description:
      'LedgerFlow models the core of a financial system: accounts, the transactions that move value between them, and the records that keep the ledger consistent. The emphasis is on correctness of the data layer and a clear API.',
    purpose:
      'Personal and small-team finances are often tracked in spreadsheets that silently break. LedgerFlow treats every transaction as validated, structured data.',
    features: [
      'Account and transaction models',
      'Server-side transaction validation',
      'Ledger consistency rules',
      'Authenticated API access',
    ],
    implementationNotes: [
      'MERN stack with Mongoose schemas for accounts and transactions.',
      'Request validation with Zod at the API boundary.',
    ],
    technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'Mongoose', 'Zod'],
    role: 'Full-stack development',
    featured: true,
    published: true,
    order: 2,
  },
  {
    slug: 'abandoned-but-not-forgotten',
    title: 'Abandoned but not Forgotten',
    category: 'Interactive 3D experience',
    status: 'prototype',
    summary:
      'An interactive 3D experience about human-made equipment left on the Moon and Mars, exploring mission sites and the stories behind the hardware.',
    description:
      'Decades of exploration have left landers, rovers and instruments scattered across the Moon and Mars. This project turns that history into an explorable scene: rotate a planet, pick a landing site, and learn what was left there and why it mattered.',
    purpose:
      'Space history is usually told through text and archival photos. An explorable 3D map makes the geography of exploration tangible and invites curiosity.',
    features: [
      'Rotatable planetary scenes',
      'Clickable landing and mission sites',
      'Source-backed mission information panels',
      '3D hardware models and educational storytelling',
    ],
    implementationNotes: [
      'Scenes are built with Three.js inside a React application.',
      'Content is structured so each site links back to its sources.',
    ],
    technologies: ['React', 'Three.js', 'JavaScript'],
    role: 'Concept, 3D scene and front-end development',
    featured: true,
    published: true,
    order: 3,
  },
]

export const force = process.argv.includes('--force')

/** Returns counts; callable from tests as well as the CLI. */
export async function seedProjects({ force: overwrite = false } = {}) {
  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const project of projects) {
    const existing = await Project.findOne({ slug: project.slug }).select('_id').lean()
    if (existing && !overwrite) {
      skipped += 1
      continue
    }
    await Project.findOneAndUpdate({ slug: project.slug }, { $set: project }, { upsert: true, runValidators: true })
    if (existing) updated += 1
    else inserted += 1
  }
  return { inserted, updated, skipped }
}

async function run() {
  const { env } = await import('../src/config/env.js')
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  console.info(`[seed] Connected to ${mongoose.connection.name} (${force ? 'force' : 'insert-only'} mode)`)

  const { inserted, updated, skipped } = await seedProjects({ force })

  console.info(`[seed] Done: ${inserted} inserted, ${updated} updated, ${skipped} skipped.`)
  await mongoose.disconnect()
}

const invokedDirectly = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url

if (invokedDirectly) {
  run().catch(async (error) => {
    console.error('[seed] Failed:', error.message)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
  })
}
