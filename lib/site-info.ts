// Facts about the cafeteria shown in the footer and information pages.
// Anything set to null shows as "To be confirmed" until the real detail is added here.

export const SITE = {
  name: 'Cafe Connect',
  campus: 'Richfield Polokwane campus',
  description: 'Order campus meals ahead, skip the queue and collect when your food is ready.',
  phone: '015 817 2600' as string | null,
  email: 'CafeConnect@richfield.ac.za' as string | null,
  address: '61 Hans Van Rensburg St, Library Gardens, Polokwane, 0699' as string | null,
  openingHours: [
    { days: 'Monday to Friday', time: '8:00 am – 4:30 pm' },
    { days: 'Saturday', time: '8:00 am – 12:30 pm' },
    { days: 'Sunday', time: 'Closed' },
  ] as { days: string; time: string }[] | null,
};

export const NOT_CONFIRMED = 'To be confirmed';

// "015 817 2600" becomes "+27158172600" for tap-to-call links.
export const phoneLink = (phone: string) => `tel:+27${phone.replace(/\D/g, '').replace(/^0/, '')}`;
