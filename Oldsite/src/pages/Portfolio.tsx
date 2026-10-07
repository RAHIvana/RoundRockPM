import { useState } from 'react';

type Category = 'All' | 'Single-Family' | 'Multi-Family' | 'Condo';

const properties = [
  {
    title: 'South Congress Ave Home',
    category: 'Single-Family' as Category,
    location: 'Austin, TX 78704',
    beds: 3,
    baths: 2,
    sqft: 1850,
    color: '#0D2B45',
    icon: '🏠',
  },
  {
    title: 'Domain Area Condo',
    category: 'Condo' as Category,
    location: 'Austin, TX 78758',
    beds: 2,
    baths: 2,
    sqft: 1100,
    color: '#C8922A',
    icon: '🏢',
  },
  {
    title: 'Round Rock Duplex',
    category: 'Multi-Family' as Category,
    location: 'Round Rock, TX 78664',
    beds: 4,
    baths: 3,
    sqft: 2400,
    color: '#1d6b4e',
    icon: '🏘️',
  },
  {
    title: 'Cedar Park Family Home',
    category: 'Single-Family' as Category,
    location: 'Cedar Park, TX 78613',
    beds: 4,
    baths: 2,
    sqft: 2200,
    color: '#6b3a1d',
    icon: '🏡',
  },
  {
    title: 'East Austin Townhome',
    category: 'Multi-Family' as Category,
    location: 'Austin, TX 78702',
    beds: 3,
    baths: 2,
    sqft: 1650,
    color: '#1d4a6b',
    icon: '🏘️',
  },
  {
    title: 'Georgetown Estate',
    category: 'Single-Family' as Category,
    location: 'Georgetown, TX 78626',
    beds: 5,
    baths: 3,
    sqft: 3400,
    color: '#4a1d6b',
    icon: '🏠',
  },
];

const categories: Category[] = ['All', 'Single-Family', 'Multi-Family', 'Condo'];

export default function Properties() {
  const [active, setActive] = useState<Category>('All');

  const filtered = active === 'All' ? properties : properties.filter((p) => p.category === active);

  return (
    <section className="page">
      <h1>Properties We Manage</h1>
      <p>
        A representative sample of the residential properties we currently manage across
        the Greater Austin metro area.
      </p>

      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${active === cat ? ' active' : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {filtered.map((p) => (
          <div key={p.title} className="card project-card" style={{ borderTop: `4px solid ${p.color}` }}>
            <div className="project-thumb" style={{ background: p.color + '18' }}>
              <span style={{ fontSize: '2.5rem' }}>{p.icon}</span>
            </div>
            <h3>{p.title}</h3>
            <p className="property-location">📍 {p.location}</p>
            <p className="property-details">
              🛏 {p.beds} bd &nbsp;·&nbsp; 🛁 {p.baths} ba &nbsp;·&nbsp; 📐 {p.sqft.toLocaleString()} sqft
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <span className="badge" style={{ background: p.color + '22', color: p.color }}>
                {p.category}
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
