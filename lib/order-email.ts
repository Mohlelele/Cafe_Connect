import { formatRand } from './menu.ts';
import { SITE } from './site-info.ts';

// The "your order is ready" email. Email apps only understand simple HTML,
// so it uses tables and inline styles. A <style> block adds a dark theme for
// apps that support it (Apple Mail, Outlook, some Gmail apps); the others
// show the light theme.

export type ReadyOrder = {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  paid: boolean;
};

// Names and items are typed by people, so they are escaped before going into HTML.
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] as string
));

const COLORS = { navy: '#12293b', amber: '#f5a524', amberDeep: '#8a5300', amberTint: '#fdf2de', ivory: '#faf7f2', ink: '#14232f', soft: '#55636f', line: '#e6e0d6', green: '#17693f', greenTint: '#e0f3e8' };

export function buildOrderReadyEmail(order: ReadyOrder, siteUrl: string) {
  const firstName = escapeHtml(order.customerName.trim().split(/\s+/)[0] || 'there');
  const orderNumber = escapeHtml(order.orderNumber);
  const orderUrl = `${siteUrl}/orders/${encodeURIComponent(order.orderNumber)}`;
  const toPay = formatRand(order.total);

  const subject = `Your order ${order.orderNumber} is ready to collect`;

  const itemRows = order.items.map((item) => `
          <tr>
            <td class="ink" style="padding: 10px 0; border-bottom: 1px solid ${COLORS.line}; color: ${COLORS.ink}; font-size: 15px;">
              <strong>${item.quantity} &times;</strong> ${escapeHtml(item.name)}
            </td>
            <td class="ink" align="right" style="padding: 10px 0; border-bottom: 1px solid ${COLORS.line}; color: ${COLORS.ink}; font-size: 15px; white-space: nowrap;">
              ${formatRand(item.unitPrice * item.quantity)}
            </td>
          </tr>`).join('');

  const steps = ['Ordered', 'Preparing', 'Ready', 'Collected'].map((step, index) => {
    const done = index < 2;
    const current = index === 2;
    const dot = current ? COLORS.amber : done ? COLORS.green : COLORS.line;
    const label = current ? COLORS.ink : COLORS.soft;
    return `
              <td align="center" width="25%" style="padding: 0 2px;">
                <div style="height: 6px; border-radius: 3px; background: ${dot};"></div>
                <div class="${current ? 'ink' : 'soft'}" style="margin-top: 8px; font-size: 12px; font-weight: ${current ? 700 : 500}; color: ${label};">${current ? '&#9679; ' : done ? '&#10003; ' : ''}${step}</div>
              </td>`;
  }).join('');

  const paymentBox = order.paid
    ? `<div class="paid" style="padding: 14px 16px; border-radius: 12px; background: ${COLORS.greenTint}; color: ${COLORS.green}; font-size: 15px;"><strong>Paid.</strong> Nothing more to pay, just collect your food.</div>`
    : `<div class="pay" style="padding: 14px 16px; border-radius: 12px; background: ${COLORS.amberTint}; color: ${COLORS.amberDeep}; font-size: 15px;"><strong>Pay ${toPay} in cash</strong> at the counter when you collect.</div>`;

  const hours = (SITE.openingHours ?? []).map(({ days, time }) => `${escapeHtml(days)}: ${escapeHtml(time)}`).join('<br>');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(subject)}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .page { background: #0b1823 !important; }
      .card { background: #15293a !important; border-color: #24405a !important; }
      .ink { color: #f4f1ea !important; }
      .soft { color: #a9b8c4 !important; }
      .ticket { background: #1d3850 !important; border-color: ${COLORS.amber} !important; }
      .ticket-number { color: ${COLORS.amber} !important; }
      .pay { background: #3a2a0c !important; color: #ffd28a !important; }
      .paid { background: #12362a !important; color: #9fe0bd !important; }
      td { border-color: #24405a !important; }
    }
    @media (max-width: 480px) {
      .inner { padding: 24px 20px !important; }
      .ticket-number { font-size: 30px !important; letter-spacing: 3px !important; }
    }
  </style>
</head>
<body class="page" style="margin: 0; padding: 0; background: ${COLORS.ivory}; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">Order ${orderNumber} is ready. Show this number at the counter to collect it.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="page" style="background: ${COLORS.ivory};">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding: 26px 24px; background: ${COLORS.navy}; border-radius: 18px 18px 0 0;">
              <img src="${siteUrl}/brand/email-logo.png" width="180" height="72" alt="Cafe Connect" style="display: block; width: 180px; height: auto; border: 0;">
            </td>
          </tr>
          <tr>
            <td class="card inner" style="padding: 32px 36px; background: #ffffff; border: 1px solid ${COLORS.line}; border-top: 0; border-radius: 0 0 18px 18px;">
              <p class="soft" style="margin: 0 0 6px; color: ${COLORS.amberDeep}; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Ready to collect</p>
              <h1 class="ink" style="margin: 0 0 10px; color: ${COLORS.ink}; font-size: 26px; line-height: 1.25;">Your food is ready, ${firstName}!</h1>
              <p class="soft" style="margin: 0 0 24px; color: ${COLORS.soft}; font-size: 16px; line-height: 1.5;">Head to the cafeteria counter and show this order number so staff can confirm it is yours.</p>

              <div class="ticket" style="padding: 22px 16px; border: 2px dashed ${COLORS.amber}; border-radius: 14px; background: ${COLORS.amberTint}; text-align: center;">
                <div class="soft" style="color: ${COLORS.soft}; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Order number</div>
                <div class="ticket-number" style="margin-top: 6px; color: ${COLORS.navy}; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 5px;">${orderNumber}</div>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 26px 0 8px;">
                <tr>${steps}
                </tr>
              </table>

              <h2 class="ink" style="margin: 28px 0 4px; color: ${COLORS.ink}; font-size: 17px;">Your order</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}
                <tr>
                  <td class="ink" style="padding: 14px 0 0; color: ${COLORS.ink}; font-size: 16px; font-weight: 700;">Total</td>
                  <td class="ink" align="right" style="padding: 14px 0 0; color: ${COLORS.ink}; font-size: 18px; font-weight: 700;">${toPay}</td>
                </tr>
              </table>

              <div style="margin: 22px 0 26px;">${paymentBox}</div>

              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background: ${COLORS.amber};">
                    <a href="${orderUrl}" style="display: inline-block; padding: 14px 28px; color: ${COLORS.navy}; font-size: 16px; font-weight: 700; text-decoration: none;">View your order</a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; border-top: 1px solid ${COLORS.line};">
                <tr>
                  <td class="soft" valign="top" style="padding: 18px 8px 0 0; color: ${COLORS.soft}; font-size: 13px; line-height: 1.6;">
                    <strong class="ink" style="color: ${COLORS.ink};">Where</strong><br>
                    ${escapeHtml(SITE.campus)} cafeteria<br>${escapeHtml(SITE.address ?? '')}
                  </td>
                  <td class="soft" valign="top" style="padding: 18px 0 0 8px; color: ${COLORS.soft}; font-size: 13px; line-height: 1.6;">
                    <strong class="ink" style="color: ${COLORS.ink};">Opening hours</strong><br>${hours}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="soft" style="padding: 18px 24px; color: ${COLORS.soft}; font-size: 12px; line-height: 1.6;">
              You are getting this email because you ordered from ${escapeHtml(SITE.name)}.<br>
              Questions? Call ${escapeHtml(SITE.phone ?? '')} or email ${escapeHtml(SITE.email ?? '')}.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text version for email apps that do not show HTML.
  const text = [
    `Your food is ready, ${order.customerName.trim().split(/\s+/)[0] || 'there'}!`,
    '',
    `Order number: ${order.orderNumber}`,
    'Show this number at the cafeteria counter to collect your order.',
    '',
    ...order.items.map((item) => `${item.quantity} x ${item.name}  ${formatRand(item.unitPrice * item.quantity)}`),
    `Total: ${toPay}`,
    order.paid ? 'Paid. Nothing more to pay.' : `Pay ${toPay} in cash at the counter when you collect.`,
    '',
    `View your order: ${orderUrl}`,
    '',
    `${SITE.campus} cafeteria, ${SITE.address ?? ''}`,
  ].join('\n');

  return { subject, html, text };
}
