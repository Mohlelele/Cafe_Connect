// One-time Supabase setup, done through Supabase's settings API.
//
//  1. Password policy (needs SUPABASE_ACCESS_TOKEN): passwords must be at least
//     8 characters and use letters and numbers. The forms check more than this
//     (common passwords, the email name), but this rule is enforced by Supabase
//     itself, so it cannot be skipped by calling Supabase directly.
//  2. Emails (also needs RESEND_API_KEY and EMAIL_FROM): Supabase sends its emails
//     through Resend, and the password-reset email shows a one-time code.
//
// Run with: npm run setup:supabase   (reads .env.local; no key is ever printed)

import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

const { RESEND_API_KEY, EMAIL_FROM, SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_URL } = process.env;

if (!SUPABASE_ACCESS_TOKEN || !NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Add SUPABASE_ACCESS_TOKEN to .env.local first (supabase.com/dashboard/account/tokens).');
  process.exit(1);
}

const projectRef = new URL(NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];

async function updateAuthSettings(settings, description) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    const reason = await response.text();
    console.error(`Supabase refused the ${description} (status ${response.status}): ${reason.slice(0, 300)}`);
    process.exit(1);
  }
  console.log(`Supabase: ${description} saved.`);
}

// ----- 1. Password policy -----
await updateAuthSettings({
  password_min_length: 8,
  // Supabase's "letters and digits" option.
  password_required_characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789',
}, 'password policy (8+ characters, letters and numbers)');

// ----- 2. Emails through Resend -----
if (!RESEND_API_KEY || !EMAIL_FROM) {
  console.log('Emails skipped: add RESEND_API_KEY and EMAIL_FROM to .env.local, then run this again.');
  process.exit(0);
}

// Until the sender's domain is verified, Resend only delivers to your own
// Resend account address, so students would get nothing.
const senderDomain = EMAIL_FROM.split('@')[1] ?? '';
const domainsResponse = await fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${RESEND_API_KEY}` } });
if (domainsResponse.status === 401 || domainsResponse.status === 403) {
  console.log('Note: this Resend key can only send, so the domain check was skipped. Make sure the domain shows "Verified" in Resend.');
} else if (domainsResponse.ok) {
  const { data = [] } = await domainsResponse.json();
  const domain = data.find((item) => item.name === senderDomain);
  if (!domain) {
    console.error(`"${senderDomain}" is not added in Resend yet. Add it under Domains, then run this again.`);
    process.exit(1);
  }
  if (domain.status !== 'verified') {
    console.error(`"${senderDomain}" is in Resend but its status is "${domain.status}". Finish the DNS records, then run this again.`);
    process.exit(1);
  }
  console.log(`Resend: ${senderDomain} is verified.`);
} else {
  console.error(`Resend did not accept the API key (status ${domainsResponse.status}). Check RESEND_API_KEY.`);
  process.exit(1);
}

const RESET_EMAIL = `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #14232f;">
  <h2 style="margin: 0 0 12px;">Reset your Cafe Connect password</h2>
  <p>Enter this code on the reset page, together with your new password:</p>
  <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 20px 0; color: #12293b;">{{ .Token }}</p>
  <p>The code expires in one hour. If you did not ask to reset your password, you can ignore this email.</p>
  <p style="color: #55636f; font-size: 13px;">Cafe Connect, Richfield Polokwane campus</p>
</div>`;

await updateAuthSettings({
  smtp_host: 'smtp.resend.com',
  smtp_port: '465',
  smtp_user: 'resend',
  smtp_pass: RESEND_API_KEY,
  smtp_admin_email: EMAIL_FROM,
  smtp_sender_name: 'Cafe Connect',
  mailer_subjects_recovery: 'Your Cafe Connect password reset code',
  mailer_templates_recovery_content: RESET_EMAIL,
  // Supabase's own sender allows only a few emails an hour. With Resend this can be higher.
  rate_limit_email_sent: 100,
}, `email settings (sent through Resend from ${EMAIL_FROM}, reset email shows a code)`);

console.log('Done. Try "Forgot password" on the site with your own email.');
