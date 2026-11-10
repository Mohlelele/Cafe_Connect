// Facts about the cafeteria shown in the footer and information pages.
// Anything set to null shows as "To be confirmed" until the real detail is added here.

export const SITE = {
  name: 'Cafe Connect',
  campus: 'Richfield Polokwane campus',
  description: 'Order campus meals ahead, skip the queue and collect when your food is ready.',
  phone: '015 817 2600' as string | null,
  email: 'CafeConnect@richfield.ac.za' as string | null,
  address: '61 Hans Van Rensburg St, Library Gardens, Polokwane, 0699' as string | null,
  // weekdays: 0 is Sunday, 1 is Monday ... 6 is Saturday.
  openingHours: [
    { days: 'Monday to Friday', weekdays: [1, 2, 3, 4, 5], time: '8:00 am – 4:30 pm' },
    { days: 'Saturday', weekdays: [6], time: '8:00 am – 12:30 pm' },
    { days: 'Sunday', weekdays: [0], time: 'Closed' },
  ] as { days: string; weekdays: number[]; time: string }[] | null,
};

export const NOT_CONFIRMED = 'To be confirmed';

// Today's hours on campus, e.g. "Open today 8:00 am – 4:30 pm" or "Closed today".
export function todaysHours(now = new Date()): string | null {
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    now.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Africa/Johannesburg' }),
  );
  const today = SITE.openingHours?.find((entry) => entry.weekdays.includes(weekday));
  if (!today) return null;
  return today.time === 'Closed' ? 'Closed today' : `Open today ${today.time}`;
}

// "015 817 2600" becomes "+27158172600" for tap-to-call links.
export const phoneLink = (phone: string) => `tel:+27${phone.replace(/\D/g, '').replace(/^0/, '')}`;
