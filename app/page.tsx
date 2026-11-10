import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AddToBasket from '@/components/AddToBasket';
import { ArrowRightIcon, BasketIcon, CATEGORY_ICONS, ClockIcon, ReceiptIcon, ShieldIcon, TimerIcon, UtensilsIcon, WalletIcon } from '@/components/Icons';
import { MenuImage } from '@/components/ui';
import { getMenu } from '@/lib/data';
import { formatRand, MENU_CATEGORIES } from '@/lib/menu';
import { getCurrentProfile } from '@/lib/session';
import { SITE } from '@/lib/site-info';
import type { MenuItem } from '@/lib/types';

const HERO_PHOTO = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80';

const STEPS = [
  { title: 'Browse the menu', body: 'See what is available and what it costs before you leave class.', Icon: UtensilsIcon },
  { title: 'Place your order', body: 'Build your basket, choose how you will pay and get an order number.', Icon: BasketIcon },
  { title: 'Collect it', body: 'Follow your order as it is prepared and pick it up when it is ready.', Icon: ClockIcon },
];

const BENEFITS = [
  { title: 'Skip the queue', body: 'Order before you arrive and spend your break eating.', Icon: TimerIcon },
  { title: 'Clear prices', body: 'Every item shows its price, so your total holds no surprises.', Icon: ReceiptIcon },
  { title: 'Pay at the counter', body: 'Nothing is charged online. Staff confirm your payment in person.', Icon: WalletIcon },
  { title: 'Your own account', body: 'Your orders are private and only visible to you and the cafeteria.', Icon: ShieldIcon },
];

// One item from each category first, so the home page shows some variety.
function pickFeatured(menu: MenuItem[]): MenuItem[] {
  const available = menu.filter((item) => item.available);
  const firstOfEach = MENU_CATEGORIES.flatMap((category) => available.find((item) => item.category === category) ?? []);
  return [...firstOfEach, ...available.filter((item) => !firstOfEach.includes(item))].slice(0, 4);
}

export default async function LandingPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(profile.role === 'admin' ? '/admin' : '/menu');

  const menu = await getMenu();
  const featured = pickFeatured(menu);

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="eyebrow">{SITE.campus} cafeteria</p>
            <h1><span>Order ahead.</span><span>Skip the queue.</span></h1>
            <p className="hero-lead">Choose your meal, place your order from anywhere on campus, and collect it when it is ready.</p>
            <div className="hero-actions">
              <Link href="/menu" className="btn btn-primary btn-lg">See the menu <ArrowRightIcon /></Link>
              <Link href="/register" className="btn btn-ghost-light btn-lg">Create an account</Link>
            </div>
            <p className="hero-staff">Cafeteria staff? <Link href="/admin-login">Sign in here</Link></p>
          </div>
          <div className="hero-image">
            <Image src={HERO_PHOTO} alt="A freshly made burger on a wooden board" fill priority sizes="(max-width: 760px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="categories-heading">
        <div className="section-heading">
          <h2 id="categories-heading">What are you in the mood for?</h2>
        </div>
        <div className="category-tiles">
          {MENU_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const count = menu.filter((item) => item.category === category && item.available).length;
            return (
              <Link key={category} href={`/menu?category=${category}`} className="category-tile">
                <span className="tile-icon"><Icon /></span>
                <span><strong>{category}</strong><small>{count} {count === 1 ? 'item' : 'items'}</small></span>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="landing-section" aria-labelledby="featured-heading">
          <div className="section-heading">
            <h2 id="featured-heading">Featured on the menu</h2>
            <Link href="/menu" className="btn btn-secondary">View full menu</Link>
          </div>
          <div className="menu-grid">
            {featured.map((item) => (
              <article className="food-card" key={item.id}>
                <Link href={`/menu/${item.id}`} className="food-card-link" aria-label={`View details of ${item.name}`}>
                  <MenuImage item={item} alt="" className="food-card-image" sizes="(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 25vw" />
                </Link>
                <div className="food-card-body">
                  <h3><Link href={`/menu/${item.id}`}>{item.name}</Link></h3>
                  <p>{item.description}</p>
                  <div className="food-card-footer">
                    <strong>{formatRand(item.price)}</strong>
                    <AddToBasket item={item} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="landing-section" aria-labelledby="how-heading">
        <div className="section-heading"><h2 id="how-heading">How ordering works</h2></div>
        <ol className="feature-grid">
          {STEPS.map(({ title, body, Icon }, index) => (
            <li key={title} className="feature">
              <span className="feature-icon"><Icon /></span>
              <h3><span className="feature-step">Step {index + 1}</span><br />{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section" aria-labelledby="benefits-heading">
        <div className="benefits">
          <div className="section-heading"><h2 id="benefits-heading">Made for a busy campus day</h2></div>
          <div className="feature-grid four" style={{ marginTop: 24 }}>
            {BENEFITS.map(({ title, body, Icon }) => (
              <div key={title} className="feature">
                <span className="feature-icon"><Icon /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
