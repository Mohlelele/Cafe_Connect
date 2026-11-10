import 'server-only';

// Sends an email through Resend (resend.com). Needs RESEND_API_KEY and
// EMAIL_FROM on the server. If they are missing, nothing is sent and the app
// carries on as normal: an email must never stop an order from being updated.

const RESEND_URL = process.env.RESEND_API_URL ?? 'https://api.resend.com/emails';

export async function sendEmail(message: { to: string; subject: string; html: string; text: string; idempotencyKey?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn('Email not sent: RESEND_API_KEY or EMAIL_FROM is not set.');
    return false;
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Resend ignores a repeat with the same key, so one event sends one email.
        ...(message.idempotencyKey ? { 'Idempotency-Key': message.idempotencyKey } : {}),
      },
      body: JSON.stringify({ from: `Cafe Connect <${from}>`, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
    });
    if (!response.ok) {
      console.error('Email failed', response.status, (await response.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email failed', error);
    return false;
  }
}

// The site's public address, used for links and the logo in emails.
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}
