interface Env {
  WAITLIST_DB: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  RESEND_REPLY_TO?: string;
}

type JsonRecord = Record<string, unknown>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RESPONSE_EMAILS = 80;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_SEND_URL = 'https://api.resend.com/emails';
const DEFAULT_RESEND_FROM = 'Roman from Yokva <ceo@yokva.com>';
const DEFAULT_RESEND_REPLY_TO = 'ceo@yokva.com';

function json(status: number, body: JsonRecord): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function readEmails(db: D1Database): Promise<string[]> {
  const result = await db
    .prepare(
      `SELECT email
       FROM waitlist_emails
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
    )
    .bind(MAX_RESPONSE_EMAILS)
    .all<{ email: string }>();

  const rows = result.results ?? [];
  return rows.map((row) => row.email).reverse();
}

async function readCount(db: D1Database): Promise<number> {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM waitlist_emails')
    .first<{ count: number | string }>();

  if (!result) {
    return 0;
  }

  return Number(result.count ?? 0);
}

async function readPayload(db: D1Database) {
  const [emails, count] = await Promise.all([readEmails(db), readCount(db)]);
  return { count, emails };
}

function notConfiguredResponse() {
  return json(500, {
    ok: false,
    message: 'WAITLIST_DB is not configured',
    data: { count: 0, emails: [] },
  });
}

async function verifyTurnstile(secret: string, token: string, remoteIp: string | null): Promise<boolean> {
  const payload = new URLSearchParams();
  payload.set('secret', secret);
  payload.set('response', token);
  if (remoteIp) {
    payload.set('remoteip', remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload.toString(),
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { success?: boolean };
  return Boolean(data.success);
}

async function sendWelcomeEmail(env: Env, email: string): Promise<void> {
  const resendApiKey = String(env.RESEND_API_KEY ?? '').trim();
  if (!resendApiKey) {
    console.warn('[waitlist] RESEND_API_KEY is not configured; skipping email sending');
    return;
  }

  const from = String(env.RESEND_FROM ?? '').trim() || DEFAULT_RESEND_FROM;
  const replyTo = String(env.RESEND_REPLY_TO ?? '').trim() || DEFAULT_RESEND_REPLY_TO;
  const text = `Hey, Roman here. I'm the founder of Yokva.

You're on the waitlist for our private beta. I'm building this because I saw how much money landlords lose just because listing photos look dark and messy.

Quick question:
What's the hardest part about getting good photos for your listings right now?

Just reply to this email. I read every message.

Best,
Roman
Founder, Yokva`;

  try {
    const resendResponse = await fetch(RESEND_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'You are on the Yokva waitlist',
        reply_to: replyTo,
        text,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text().catch(() => 'unknown resend error');
      console.error(`[waitlist] Resend API failed for ${email}: ${errorBody}`);
    }
  } catch (error) {
    console.error('[waitlist] Failed to call Resend API:', error);
  }
}

export async function onRequestGet(context: EventContext<Env, string, unknown>) {
  const db = context.env.WAITLIST_DB;
  if (!db) {
    return notConfiguredResponse();
  }

  try {
    const data = await readPayload(db);
    return json(200, { ok: true, data });
  } catch {
    return json(500, {
      ok: false,
      message: 'Internal server error',
      data: { count: 0, emails: [] },
    });
  }
}

export async function onRequestPost(context: EventContext<Env, string, unknown>) {
  const db = context.env.WAITLIST_DB;
  if (!db) {
    return notConfiguredResponse();
  }

  try {
    const body = (await context.request.json().catch(() => ({}))) as { email?: string; turnstileToken?: string };
    const email = String(body.email ?? '').trim().toLowerCase();
    const turnstileToken = String(body.turnstileToken ?? '').trim();
    const turnstileSecret = String(context.env.TURNSTILE_SECRET_KEY ?? '').trim();

    if (!EMAIL_REGEX.test(email)) {
      return json(400, {
        ok: false,
        message: 'Invalid email',
        data: { count: 0, emails: [] },
      });
    }

    if (!turnstileSecret) {
      return json(500, {
        ok: false,
        message: 'Turnstile secret is not configured',
        data: { count: 0, emails: [] },
      });
    }

    if (!turnstileToken) {
      return json(400, {
        ok: false,
        message: 'Security check missing',
        data: { count: 0, emails: [] },
      });
    }

    const remoteIp = context.request.headers.get('CF-Connecting-IP');
    const isHuman = await verifyTurnstile(turnstileSecret, turnstileToken, remoteIp);
    if (!isHuman) {
      return json(400, {
        ok: false,
        message: 'Security check failed',
        data: { count: 0, emails: [] },
      });
    }

    const insertResult = await db
      .prepare(
        `INSERT INTO waitlist_emails (email)
         VALUES (?)
         ON CONFLICT(email) DO NOTHING`,
      )
      .bind(email)
      .run();

    const isNewEmail = Number(insertResult.meta?.changes ?? 0) > 0;
    if (isNewEmail) {
      await sendWelcomeEmail(context.env, email);
    }

    const data = await readPayload(db);
    return json(200, { ok: true, data });
  } catch {
    return json(500, {
      ok: false,
      message: 'Internal server error',
      data: { count: 0, emails: [] },
    });
  }
}
