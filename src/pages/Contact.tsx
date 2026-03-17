import { useState, type FormEvent } from 'react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}

const initialForm: FormState = { name: '', email: '', phone: '', address: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="page">
        <h1>Let's Manage Your Property</h1>
        <div className="success-box">
          <span style={{ fontSize: '3rem' }}>✅</span>
          <h2>Request Received!</h2>
          <p>
            Thank you, <strong>{form.name}</strong>! A licensed property manager will contact
            you at <strong>{form.email}</strong> within 24 hours.
          </p>
          <button className="btn-primary" onClick={() => { setForm(initialForm); setSubmitted(false); }}>
            Submit Another Request
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Let's Manage Your Property</h1>
      <p>
        Serving Austin, Round Rock, Cedar Park, Pflugerville, Georgetown, Leander, Kyle &amp; Buda.
        Reach out today for a free, no-obligation consultation.
      </p>

      <div className="contact-layout">
        {/* Contact Info */}
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <ul className="info-list">
            <li>
              <span className="info-icon">📍</span>
              <div>
                <strong>Office</strong>
                <br />1234 Congress Ave, Suite 400<br />Austin, TX 78701
              </div>
            </li>
            <li>
              <span className="info-icon">📞</span>
              <div>
                <strong>Phone</strong>
                <br />(512) 555-0190
              </div>
            </li>
            <li>
              <span className="info-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <br />info@roundrockpm.com
              </div>
            </li>
            <li>
              <span className="info-icon">🕐</span>
              <div>
                <strong>Office Hours</strong>
                <br />Mon – Fri: 9 AM – 6 PM<br />Sat: 10 AM – 2 PM
              </div>
            </li>
          </ul>
        </div>

        {/* Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Full Name *
            <input
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Email Address *
            <input
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Phone Number
            <input
              type="tel"
              placeholder="(512) 555-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Property Address
            <input
              type="text"
              placeholder="123 Main St, Austin, TX 78701"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label>
            Message *
            <textarea
              rows={5}
              placeholder="Tell us about your property and how we can help..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </label>
          <button type="submit" className="btn-primary">Request Free Consultation</button>
        </form>
      </div>
    </section>
  );
}
