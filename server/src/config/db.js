import mongoose from 'mongoose'
import { env } from './env.js'

mongoose.set('strictQuery', true)
// Fail fast instead of queueing queries for 10s when the database is down.
mongoose.set('bufferCommands', false)

let listenersAttached = false

export async function connectDatabase() {
  if (!listenersAttached) {
    listenersAttached = true
    mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'))
    mongoose.connection.on('reconnected', () => console.info('[db] MongoDB reconnected'))
  }

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    autoIndex: !env.isProduction,
  })
  console.info(`[db] Connected to MongoDB (${mongoose.connection.name})`)
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']

export function databaseStatus() {
  const state = mongoose.connection.readyState
  return { state: STATES[state] ?? 'unknown', connected: state === 1 }
}
