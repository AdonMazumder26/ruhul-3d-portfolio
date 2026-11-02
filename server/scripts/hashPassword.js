/**
 * Generates a bcrypt hash for ADMIN_PASSWORD_HASH.
 *   npm run admin:hash -- "your strong password"
 * or run without an argument to be prompted (input is hidden).
 */
import bcrypt from 'bcryptjs'
import { createInterface } from 'node:readline'

async function readHidden(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const write = rl._writeToOutput
    process.stdout.write(prompt)
    rl._writeToOutput = () => {}
    rl.question('', (answer) => {
      rl._writeToOutput = write
      process.stdout.write('\n')
      rl.close()
      resolve(answer)
    })
  })
}

const password = process.argv[2] ?? (await readHidden('Password: '))

if (!password || password.length < 12) {
  console.error('Please use a password of at least 12 characters.')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)
console.log('\nAdd this line to server/.env:\n')
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`)
