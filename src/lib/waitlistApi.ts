export interface WaitlistData {
  emails: string[];
  count: number;
}

interface WaitlistResponse {
  ok: boolean;
  message?: string;
  data: WaitlistData;
}

async function parseResponse(response: Response): Promise<WaitlistResponse> {
  const payload = (await response.json()) as Partial<WaitlistResponse>;

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload as WaitlistResponse;
}

export async function fetchWaitlist(): Promise<WaitlistData> {
  const response = await fetch('/api/waitlist', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const parsed = await parseResponse(response);
  return parsed.data;
}

export async function joinWaitlist(email: string, turnstileToken?: string): Promise<WaitlistData> {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, turnstileToken }),
  });

  const parsed = await parseResponse(response);
  return parsed.data;
}
