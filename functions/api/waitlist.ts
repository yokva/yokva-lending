interface Env {
  WAITLIST_DB: D1Database;
}

type JsonRecord = Record<string, unknown>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RESPONSE_EMAILS = 80;

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
    const body = (await context.request.json().catch(() => ({}))) as { email?: string };
    const email = String(body.email ?? '').trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return json(400, {
        ok: false,
        message: 'Invalid email',
        data: { count: 0, emails: [] },
      });
    }

    await db
      .prepare(
        `INSERT INTO waitlist_emails (email)
         VALUES (?)
         ON CONFLICT(email) DO NOTHING`,
      )
      .bind(email)
      .run();

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
