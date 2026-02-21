import { mkdir, readFile, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dirname, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

const WAITLIST_FILE = resolve(process.cwd(), 'data/waitlist-emails.txt')
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_RESPONSE_EMAILS = 80
const POSTHOG_PROXY_TARGET = process.env.POSTHOG_PROXY_TARGET?.trim()

type Json = Record<string, unknown>

async function ensureWaitlistFile() {
  await mkdir(dirname(WAITLIST_FILE), { recursive: true })

  try {
    await readFile(WAITLIST_FILE, 'utf8')
  } catch {
    await writeFile(WAITLIST_FILE, '', 'utf8')
  }
}

async function readEmails() {
  await ensureWaitlistFile()

  const raw = await readFile(WAITLIST_FILE, 'utf8')
  const unique = new Set<string>()

  for (const line of raw.split(/\r?\n/)) {
    const email = line.trim().toLowerCase()
    if (email && EMAIL_REGEX.test(email)) {
      unique.add(email)
    }
  }

  return [...unique]
}

async function writeEmails(emails: string[]) {
  await ensureWaitlistFile()
  const payload = emails.join('\n')
  await writeFile(WAITLIST_FILE, payload ? `${payload}\n` : '', 'utf8')
}

function sendJson(res: ServerResponse, status: number, body: Json) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (!chunks.length) {
    return {}
  }

  const text = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(text) as Json
  } catch {
    return {}
  }
}

async function waitlistHandler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    const emails = await readEmails()
    return sendJson(res, 200, {
      ok: true,
      data: {
        count: emails.length,
        emails: emails.slice(-MAX_RESPONSE_EMAILS),
      },
    })
  }

  if (req.method === 'POST') {
    const body = await readJsonBody(req)
    const candidate = String(body.email ?? '').trim().toLowerCase()

    if (!EMAIL_REGEX.test(candidate)) {
      return sendJson(res, 400, {
        ok: false,
        message: 'Invalid email',
        data: { count: 0, emails: [] },
      })
    }

    const emails = await readEmails()
    if (!emails.includes(candidate)) {
      emails.push(candidate)
      await writeEmails(emails)
    }

    return sendJson(res, 200, {
      ok: true,
      data: {
        count: emails.length,
        emails: emails.slice(-MAX_RESPONSE_EMAILS),
      },
    })
  }

  return sendJson(res, 405, {
    ok: false,
    message: 'Method not allowed',
    data: { count: 0, emails: [] },
  })
}

async function safeWaitlistHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    await waitlistHandler(req, res)
  } catch {
    return sendJson(res, 500, {
      ok: false,
      message: 'Internal server error',
      data: { count: 0, emails: [] },
    })
  }
}

function waitlistApiPlugin(): Plugin {
  return {
    name: 'local-waitlist-api',
    configureServer(server) {
      server.middlewares.use('/api/waitlist', (req, res) => {
        void safeWaitlistHandler(req, res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/waitlist', (req, res) => {
        void safeWaitlistHandler(req, res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), waitlistApiPlugin()],
  server: POSTHOG_PROXY_TARGET
    ? {
        proxy: {
          '/ph': {
            target: POSTHOG_PROXY_TARGET,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ph/, ''),
          },
        },
      }
    : undefined,
  preview: POSTHOG_PROXY_TARGET
    ? {
        proxy: {
          '/ph': {
            target: POSTHOG_PROXY_TARGET,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ph/, ''),
          },
        },
      }
    : undefined,
})
