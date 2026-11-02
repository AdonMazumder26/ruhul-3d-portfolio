import http from 'node:http'
import { env } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/db.js'
import { createApp } from './app.js'

async function main() {
  try {
    await connectDatabase()
  } catch (error) {
    // Start anyway so /api/health can report the degraded state; data routes return 503.
    console.error('[db] Initial MongoDB connection failed:', error.message)
  }

  const server = http.createServer(createApp())
  server.listen(env.PORT, () => {
    console.info(`[server] Listening on http://localhost:${env.PORT} (${env.NODE_ENV})`)
    console.info(`[server] Allowed origins: ${env.CLIENT_ORIGIN.join(', ')}`)
  })

  const shutdown = (signal) => {
    console.info(`[server] ${signal} received, shutting down…`)
    server.close(async () => {
      await disconnectDatabase().catch(() => {})
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 8000).unref()
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main()
