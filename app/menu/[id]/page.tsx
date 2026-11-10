import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AddToBasket from '@/components/AddToBasket';
import { ArrowLeftIcon, BasketIcon, CATEGORY_ICONS, ChatIcon, ClockIcon, LeafIcon, LightningIcon, MegaphoneIcon, ReceiptIcon, StarIcon, UtensilsIcon, WalletIcon, WarningIcon } from '@/components/Icons';
import LiveUpdates from '@/components/LiveUpdates';
import { DietaryTags, MenuImage, Stars, StatusBadge } from '@/components/ui';
import { getItemInsights, getMenu, getMenuItem } from '@/lib/data';
import { formatOrderTime, formatRand } from '@/lib/menu';
import { getCurrentProfile } from '@/lib/session';
import { SITE, todaysHours } from '@/lib/site-info';
import { suggestItems } from '@/lib/suggestions';

type Props = { params: Promise<{ id: string }> };

// Shown as "Popular" once a dish has been ordered this many times.
const POPULAR_AFTER = 10;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getMenuItem((await params).id);
  return item ? { title: item.name, description: item.description } : { title: 'Menu item' };
}

export default async function MenuItemPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (profile?.role === 'admin') redirect('/admin');

  const { id } = await params;
  const [item, menu, insights] = await Promise.all([getMenuItem(id), getMenu(), getItemInsights(id)]);
  if (!item) notFound();

  const CategoryIcon = CATEGORY_ICONS[item.category];
  const pairings = suggestItems(menu, [item.id], 3);
  const hoursToday = todaysHours();
  const isPopular = insights.timesOrdered >= POPULAR_AFTER;

  return (
    <main className="page item-page">
      <LiveUpdates tables={['menu_items']} />
      <Link href="/menu" className="back-link"><ArrowLeftIcon /> Back to menu</Link>

      {/* ----- The dish ----- */}
      <article className="panel item-detail">
        <div className="item-detail-media">
          <MenuImage item={item} alt={item.name} className="item-detail-image" sizes="(max-width: 760px) 100vw, 600px" priority />
          <span className="item-chip"><CategoryIcon /> {item.category}</span>
          {isPopular ? <span className="item-chip item-chip-hot"><LightningIcon /> Popular</span> : null}
        </div>

        <div className="item-detail-body">
          <div className="item-meta">
            <StatusBadge status={item.available ? 'Available' : 'Unavailable'} />
            {insights.ratingCount > 0 ? (
              <a href="#reviews" className="item-rating">
                <Stars value={insights.rating} />
                <strong>{insights.rating.toFixed(1)}</strong>
                <span>({insights.ratingCount} {insights.ratingCount === 1 ? 'rating' : 'ratings'})</span>
              </a>
            ) : null}
          </div>

          <h1>{item.name}</h1>
          <DietaryTags labels={item.dietary} />
          <p className="item-description">{item.description}</p>

          {insights.timesOrdered > 0 ? (
            <p className="item-stat"><BasketIcon /> Ordered {insights.timesOrdered} {insights.timesOrdered === 1 ? 'time' : 'times'} by students</p>
          ) : null}

          <div className="item-buy">
            <div>
              <span className="item-buy-label">Price</span>
              <strong className="item-detail-price">{formatRand(item.price)}</strong>
            </div>
            <AddToBasket item={item} />
          </div>
          {profile && item.available ? <Link href="/cart" className="btn btn-secondary btn-block">View basket</Link> : null}

          <ul className="item-facts">
            <li><WalletIcon /> <span><strong>Pay cash</strong> at the counter when you collect</span></li>
            <li><MegaphoneIcon /> <span><strong>We email you</strong> the moment it is ready</span></li>
            {hoursToday ? <li><ClockIcon /> <span><strong>{hoursToday}</strong> · {SITE.campus}</span></li> : null}
          </ul>
        </div>
      </article>

      {/* ----- What is in it ----- */}
      <div className="item-info-grid">
        <section className="panel item-info" aria-labelledby="ingredients-heading">
          <h2 id="ingredients-heading"><LeafIcon /> What&apos;s inside</h2>
          {item.ingredients.length ? (
            <ul className="ingredient-list">
              {item.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
            </ul>
          ) : (
            <p className="item-info-empty">The kitchen has not listed the ingredients yet. Ask at the counter if you would like to know.</p>
          )}
        </section>

        <section className={item.allergens.length ? 'panel item-info allergen-box' : 'panel item-info'} aria-labelledby="allergens-heading">
          <h2 id="allergens-heading"><WarningIcon /> Allergens</h2>
          {item.allergens.length ? (
            <p className="item-allergens">Contains {item.allergens.join(', ')}</p>
          ) : (
            <p className="item-info-empty">No allergens listed for this dish.</p>
          )}
          <p className="allergy-note">Have an allergy? Please check with cafeteria staff before ordering.</p>
        </section>
      </div>

      {/* ----- What students say ----- */}
      <section className="item-section-block" id="reviews" aria-labelledby="reviews-heading">
        <div className="section-heading">
          <h2 id="reviews-heading"><ChatIcon /> What students say</h2>
          {insights.ratingCount > 0 ? (
            <span className="item-rating"><Stars value={insights.rating} /> <strong>{insights.rating.toFixed(1)}</strong> <span>from {insights.ratingCount} {insights.ratingCount === 1 ? 'rating' : 'ratings'}</span></span>
          ) : null}
        </div>
        {insights.reviews.length ? (
          <ul className="review-list">
            {insights.reviews.map((review) => (
              <li key={`${review.firstName}-${review.date}`} className="panel review">
                <Stars value={review.rating} />
                <p>{review.comment}</p>
                <footer><strong>{review.firstName}</strong> · {formatOrderTime(review.date)}</footer>
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel review-empty">
            <StarIcon />
            <p>{insights.ratingCount > 0 ? 'Students have rated this dish but not left comments yet.' : 'No ratings yet. Order it, collect it, and be the first to say how it was.'}</p>
          </div>
        )}
      </section>

      {/* ----- Goes well with ----- */}
      {pairings.length ? (
        <section className="item-section-block" aria-labelledby="pairings-heading">
          <div className="section-heading">
            <h2 id="pairings-heading"><UtensilsIcon /> Goes well with</h2>
            <Link href="/menu" className="text-link">See the full menu</Link>
          </div>
          <div className="suggestion-grid pairing-grid">
            {pairings.map((pairing) => (
              <article className="food-card suggestion-card" key={pairing.id}>
                <Link href={`/menu/${pairing.id}`} className="food-card-link" aria-label={`View details of ${pairing.name}`}>
                  <MenuImage item={pairing} alt="" className="food-card-image" sizes="(max-width: 760px) 50vw, 300px" />
                </Link>
                <div className="food-card-body">
                  <h3><Link href={`/menu/${pairing.id}`}>{pairing.name}</Link></h3>
                  <div className="food-card-footer">
                    <strong>{formatRand(pairing.price)}</strong>
                    <AddToBasket item={pairing} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* ----- How it works ----- */}
      <section className="panel item-steps" aria-label="How ordering works">
        <div><span><BasketIcon /></span><strong>Add it to your basket</strong><p>Choose how many and place your order.</p></div>
        <div><span><MegaphoneIcon /></span><strong>We email you</strong><p>You get your order number when it is ready.</p></div>
        <div><span><ReceiptIcon /></span><strong>Show your number</strong><p>Pay cash at the counter and enjoy.</p></div>
      </section>
    </main>
  );
}
