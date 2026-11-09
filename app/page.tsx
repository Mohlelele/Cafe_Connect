import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRightIcon, ClockIcon, LogoMark, UtensilsIcon, BasketIcon } from '@/components/Icons';
import { getCurrentProfile } from '@/lib/session';

const STEPS = [
  { title: 'Browse', body: "See today's menu and prices before you leave class.", icon: <UtensilsIcon /> },
  { title: 'Order', body: 'Build your basket and send it to the kitchen in a few taps.', icon: <BasketIcon /> },
  { title: 'Collect', body: 'Follow your order live and pick it up when it is ready.', icon: <ClockIcon /> },
];

export default async function WelcomePage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(profile.role === 'admin' ? '/admin' : '/menu');

  return (
    <div className="welcome">
      <header className="welcome-header">
        <span className="brand"><LogoMark /><span>Cafe Connect</span></span>
        <nav aria-label="Main">
          <Link href="/announcements" className="text-link-quiet">Announcements</Link>
          <Link href="/about" className="text-link-quiet">About</Link>
          <Link href="/login" className="btn btn-secondary btn-sm">Log in</Link>
        </nav>
      </header>

      <main className="welcome-hero">
        <div className="welcome-copy">
          <p className="eyebrow">Richfield Campus cafeteria</p>
          <h1>Order ahead. Skip the queue.</h1>
          <p className="welcome-lead">
            Choose your meal, place your order from anywhere on campus, and collect it the moment it is ready.
          </p>
          <div className="welcome-actions">
            <Link href="/register" className="btn btn-primary btn-lg">Create an account <ArrowRightIcon /></Link>
            <Link href="/login" className="btn btn-secondary btn-lg">Student login</Link>
          </div>
          <p className="welcome-staff">Cafeteria staff? <Link href="/admin-login" className="text-link">Sign in here</Link></p>
        </div>
        <img
          className="welcome-image"
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80"
          alt="A freshly made burger on a wooden board"
        />
      </main>

      <section className="welcome-steps" aria-label="How it works">
        {STEPS.map((step) => (
          <div key={step.title} className="welcome-step">
            <span className="welcome-step-icon">{step.icon}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
