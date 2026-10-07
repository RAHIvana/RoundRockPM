import type { PageId } from '../types';
import logo from '../assets/rrpm_logo.png';

interface HomeProps {
  onNavigate?: (page: PageId) => void;
}

const valueProps = [
  {
    icon: '🏠',
    title: 'Local Expertise',
    desc: 'Deep knowledge of Austin metro market trends, neighborhoods, rental rates, and Texas landlord-tenant law.',
  },
  {
    icon: '💼',
    title: 'Full-Service Management',
    desc: 'From tenant screening and lease signing to repairs and monthly reporting — we handle absolutely everything.',
  },
  {
    icon: '📈',
    title: 'Maximize Your ROI',
    desc: 'Optimized pricing strategy, low vacancy rates, and transparent monthly financials to protect your investment.',
  },
];

const areas = [
  'Austin', 'Round Rock', 'Cedar Park', 'Pflugerville',
  'Georgetown', 'Leander', 'Kyle', 'Buda',
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <section className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-logo-col">
            <img src={logo} alt="Round Rock Property Management logo" className="hero-logo" />
          </div>
          <div className="hero-text-col">
            <h1>Austin's Trusted<br />Property Management Partner</h1>
            <p className="hero-sub">
              End-to-end property management for residential and commercial owners across
              Austin, TX and surrounding communities. Let us protect your investment while
              you enjoy true passive income.
            </p>
            {onNavigate && (
              <button className="btn-primary btn-hero" onClick={() => onNavigate('contact')}>
                Get a Free Consultation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Value Props */}
      <h2>Why Round Rock Property Management?</h2>
      <div className="card-grid">
        {valueProps.map((v) => (
          <div key={v.title} className="card">
            <span className="card-icon">{v.icon}</span>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Service Areas */}
      <h2>Areas We Serve</h2>
      <p>
        Proudly managing properties throughout the Greater Austin metro area:
      </p>
      <div className="area-chips">
        {areas.map((a) => (
          <span key={a} className="area-chip">{a}</span>
        ))}
      </div>
    </section>
  );
}
