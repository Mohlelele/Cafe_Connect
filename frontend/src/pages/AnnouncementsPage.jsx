import { useState } from 'react';

const emptyAnnouncement = { title: '', text: '' };

function AnnouncementsPage({ announcements = [], setAnnouncements, isAdmin = false }) {
  const [draft, setDraft] = useState(emptyAnnouncement);

  const handleSave = () => {
    if (!setAnnouncements) return;

    const cleanTitle = draft.title.trim();
    const cleanText = draft.text.trim();

    if (!cleanTitle || !cleanText) return;

    const nextAnnouncement = { id: Date.now(), title: cleanTitle, text: cleanText };
    setAnnouncements((current = []) => [nextAnnouncement, ...current.filter((item) => item.title !== cleanTitle)]);
    setDraft(emptyAnnouncement);
  };

  return (
    <div className="content-page">
      <div className="content-card wide-card">
        <h1>Announcements</h1>
        <div className="announcement-list">
          {announcements.map((item) => (
            <div className="announcement-item" key={item.id || item.title}>
              <span className="announcement-tag">New</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="admin-form" style={{ marginTop: '1.5rem' }}>
            <h3>Add announcement</h3>
            <input type="text" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Title" />
            <textarea rows="3" value={draft.text} onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))} placeholder="Announcement text" />
            <button type="button" className="primary-btn" onClick={handleSave}>Save announcement</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementsPage;
