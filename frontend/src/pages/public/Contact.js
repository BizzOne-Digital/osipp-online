import { useState } from 'react';
import { PhoneIcon, WhatsAppIcon, InstagramIcon, MailIcon, CheckIcon, ArrowIcon } from '../../components/Icons';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', msg: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-title">Contact Us</div>
          <div className="section-sub">We're here to help — reach us on any channel</div>
        </div>
        <div className="contact-grid">
          <div>
            <div className="contact-info-item">
              <div className="contact-icon gold"><PhoneIcon /></div>
              <div><div className="contact-info-label">Phone</div><div className="contact-info-val">+1 905 462 2160</div></div>
            </div>
            <div className="contact-info-item" onClick={() => window.open('https://wa.me/19054622160', '_blank')} style={{ cursor: 'pointer' }}>
              <div className="contact-icon green"><WhatsAppIcon /></div>
              <div><div className="contact-info-label">WhatsApp</div><div className="contact-info-val">+1 905 462 2160</div></div>
            </div>
            <div className="contact-info-item" onClick={() => window.open('https://www.instagram.com/osipp_delivery', '_blank')} style={{ cursor: 'pointer' }}>
              <div className="contact-icon purple"><InstagramIcon /></div>
              <div><div className="contact-info-label">Instagram</div><div className="contact-info-val">@osipp_delivery</div></div>
            </div>
            <div className="contact-info-item">
              <div className="contact-icon gold"><MailIcon /></div>
              <div><div className="contact-info-label">Email</div><div className="contact-info-val">info741@osipp.ca</div></div>
            </div>
            <div className="hours-box">
              <div className="hours-title">Delivery Hours</div>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                <div>Mon – Thu: 11am – 11pm</div>
                <div>Fri – Sat: 11am – 1am</div>
                <div>Sunday: 12pm – 10pm</div>
              </div>
            </div>
          </div>
          <div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 16px' }}>
                  <circle cx="28" cy="28" r="28" fill="#DCFCE7" /><path d="M17 28l8 8 14-14" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Message Sent!</div>
                <div style={{ color: 'var(--gray)', fontSize: 14 }}>We'll get back to you within 24 hours.</div>
                <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => { setSent(false); setForm({ name: '', email: '', msg: '' }); }}>Send Another</button>
              </div>
            ) : (
              <div className="contact-form">
                <div className="contact-form-title">Send a Message</div>
                <div className="form-group"><label className="form-label">Your Name</label><input className="form-input" value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Smith" /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="john@email.com" type="email" /></div>
                <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" value={form.msg} onChange={e => upd('msg', e.target.value)} placeholder="How can we help?" rows={5} /></div>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { if (form.name && form.email && form.msg) setSent(true); }}>
                  Send Message <ArrowIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
