const announcements = [
  {
    title: 'Today\'s special',
    text: 'Free box of fries when you order above R150.',
  },
  {
    title: 'Campus lunch deal',
    text: 'Enjoy 10% off all combo meals between 12:00 and 14:00.',
  },
  {
    title: 'Fresh menu update',
    text: 'New vegan burger and smoothie options are now available.',
  },
];

function AnnouncementsPage() {
  return (
    <div className="content-page">
      <div className="content-card wide-card">
        <h1>Announcements</h1>
        <div className="announcement-list">
          {announcements.map((item) => (
            <div className="announcement-item" key={item.title}>
              <span className="announcement-tag">New</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementsPage;
