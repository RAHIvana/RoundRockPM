const services = [
  {
    icon: '🔍',
    title: 'Tenant Screening',
    desc: 'Comprehensive background checks, credit reports, employment verification, and rental history review to place only qualified tenants.',
  },
  {
    icon: '📋',
    title: 'Lease Management',
    desc: 'Texas-compliant lease drafting, e-signatures, renewals, rent adjustments, and move-in / move-out documentation.',
  },
  {
    icon: '🔧',
    title: 'Maintenance & Repairs',
    desc: '24/7 emergency response line, a vetted network of licensed contractors, and proactive preventive maintenance programs.',
  },
  {
    icon: '💰',
    title: 'Rent Collection',
    desc: 'Automated online payment portal, consistent late-fee enforcement, and prompt owner disbursements each month.',
  },
  {
    icon: '📊',
    title: 'Financial Reporting',
    desc: 'Detailed monthly owner statements, year-end 1099 tax documents, and 24/7 access to your owner portal dashboard.',
  },
  {
    icon: '🏡',
    title: 'Property Marketing',
    desc: 'Professional photography, compelling listings on MLS, Zillow, Apartments.com, and social media to minimize vacancy.',
  },
];

export default function Services() {
  return (
    <section className="page">
      <h1>Our Services</h1>
      <p>
        We provide truly end-to-end property management across Austin, TX and surrounding areas.
        From the moment your property is listed to the day a tenant moves out — we've got every
        detail covered.
      </p>
      <div className="card-grid">
        {services.map((s) => (
          <div key={s.title} className="card service-card">
            <span className="card-icon">{s.icon}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="cta-banner">
        <div>
          <h3>Ready to make your property work for you?</h3>
          <p>Get a free, no-obligation property management consultation today.</p>
        </div>
        <a href="#contact" className="btn-primary">Contact Us</a>
      </div>
    </section>
  );
}
