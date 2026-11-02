function AboutPage({ navigate }) {
  return (
    <div className="content-page">
      <div className="content-card wide-card">
        <h1>About Cafe Connect</h1>
        <p>
          Cafe Connect makes campus dining easier for students and staff. Browse the menu,
          place quick orders, and pick up food without standing in long queues.
        </p>
        <div className="info-grid">
          <div>
            <h3>Fresh meals</h3>
            <p>We prepare food daily with quality ingredients and fast service.</p>
          </div>
          <div>
            <h3>Quick pickup</h3>
            <p>Orders are ready for collection quickly so students can get back to class.</p>
          </div>
          <div>
            <h3>Student friendly</h3>
            <p>Affordable meal options and easy online ordering for the whole campus community.</p>
          </div>
        </div>
        <button type="button" className="primary-btn" onClick={() => navigate('/menu')}>Explore menu</button>
      </div>
    </div>
  );
}

export default AboutPage;
