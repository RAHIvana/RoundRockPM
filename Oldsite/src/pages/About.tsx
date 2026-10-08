const team = [
  {
    name: 'Rajul Amin',
    role: 'Founder & CEO',
    detail: '18+ years in Austin real estate. Licensed realtor and Property Manager.',
    avatar: 'RA',
  },
  {
    name: 'Sejal Amin',
    role: 'Director of Operations',
    detail: 'Licensed realtor and property manager overseeing day-to-day operations and our trusted vendor network.',
    avatar: 'SA',
  },
];

export default function About() {
  return (
    <section className="page">
      <h1>About Us</h1>

      {/* Story */}
      <h2>Our Story</h2>
      <p>
        Founded in Austin, TX in 2010, Round Rock Property Management was born from a simple idea:
        property ownership should be rewarding, not stressful. We set out to build a company
        that treats every property as if it were our own — with the care, responsiveness, and
        financial discipline that owners truly deserve.
      </p>
      <p style={{ marginTop: '1rem', color: '#475569', fontSize: '1.05rem' }}>
        Over the past 15 years we have grown to manage hundreds of residential and commercial
        properties across the Greater Austin metro, earning a reputation for transparency,
        reliability, and outstanding tenant experiences.
      </p>

      {/* Mission */}
      <h2>Our Mission</h2>
      <p>
        To deliver transparent, technology-driven property management that protects owner
        assets, minimizes vacancy, and creates exceptional living experiences for tenants —
        all while giving owners back their time.
      </p>

      {/* Stats */}
      <div className="card-grid stats-grid">
        {[
          { value: '50+', label: 'Properties Managed' },
          { value: '98%', label: 'Tenant Retention Rate' },
          { value: '15 yrs', label: 'Austin Experience' },
          { value: '24 / 7', label: 'Emergency Support' },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Team */}
      <h2>Meet Our Team</h2>
      <div className="card-grid">
        {team.map((member) => (
          <div key={member.name} className="card team-card">
            <div className="avatar">{member.avatar}</div>
            <h3>{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <p>{member.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
