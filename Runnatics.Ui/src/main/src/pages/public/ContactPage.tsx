import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Section, Container, Heading } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';

const subjectOptions = ['General Enquiry', 'Event Timing', 'Registration', 'Sponsorship', 'Technical Support', 'Other'];
const eventOptions = ['Airtel Delhi Half Marathon', 'Tata Mumbai Marathon', 'Bengaluru 10K', 'Other'];

interface FormState {
  name: string; email: string; phone: string; subject: string; event: string; message: string;
}

interface FormErrors {
  name?: string; email?: string; phone?: string; subject?: string; message?: string;
}

function Toast({ visible }: { visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: visible ? '1.5rem' : '-5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        backgroundColor: 'var(--color-success)',
        color: '#fff',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '0.9375rem',
        padding: '0.75rem 1.75rem',
        borderRadius: '9999px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        transition: 'top 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'none',
      }}
    >
      Message sent! We'll get back to you shortly.
    </div>
  );
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email';
  if (!form.subject) errors.subject = 'Please select a subject';
  if (!form.message.trim()) errors.message = 'Message is required';
  else if (form.message.length > 2000) errors.message = 'Max 2000 characters';
  return errors;
}

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s',
};

function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', subject: '', event: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      console.log('Contact form submission:', form);
      setForm({ name: '', email: '', phone: '', subject: '', event: '', message: '' });
      setToast(true);
      setTimeout(() => setToast(false), 3500);
    }
  };

  const field = (label: string, error?: string, children: React.ReactNode = null) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.375rem', color: 'var(--color-text)' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-error)', marginTop: '0.25rem', margin: 0 }}>{error}</p>}
    </div>
  );

  return (
    <>
      <Toast visible={toast} />

      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
        <Container>
          <Heading level={1} style={{ color: '#fff' }}>Get in Touch</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', marginTop: '0.75rem' }}>
            We'd love to hear from you. Let's create something great together.
          </p>
        </Container>
      </Section>

      {/* Form + Info */}
      <Section tone="light">
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <Heading level={2} style={{ marginBottom: '1.5rem' }}>Send a Message</Heading>
              {field('Full Name *', errors.name,
                <input value={form.name} onChange={set('name')} placeholder="Arjun Sharma" style={{ ...inputStyle, borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border)' }} />
              )}
              {field('Email Address *', errors.email,
                <input type="email" value={form.email} onChange={set('email')} placeholder="arjun@example.com" style={{ ...inputStyle, borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border)' }} />
              )}
              {field('Phone Number',
                undefined,
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" style={inputStyle} />
              )}
              {field('Subject *', errors.subject,
                <select value={form.subject} onChange={set('subject')} style={{ ...inputStyle, borderColor: errors.subject ? 'var(--color-error)' : 'var(--color-border)' }}>
                  <option value="">Select a subject</option>
                  {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {field('Event (Optional)',
                undefined,
                <select value={form.event} onChange={set('event')} style={inputStyle}>
                  <option value="">Select an event</option>
                  {eventOptions.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              )}
              {field('Message *', errors.message,
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  rows={5}
                  placeholder="Tell us about your event or enquiry..."
                  style={{ ...inputStyle, resize: 'vertical', borderColor: errors.message ? 'var(--color-error)' : 'var(--color-border)' }}
                />
              )}
              <button
                type="submit"
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: 'var(--color-accent)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  width: '100%',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)'; }}
              >
                Send Message
              </button>
            </form>

            {/* Contact info */}
            <div>
              <Heading level={2} style={{ marginBottom: '1.5rem' }}>Contact Information</Heading>
              {[
                { icon: <Mail size={20} color="var(--color-accent)" />, label: 'Email', value: 'info@runnatics.com' },
                { icon: <Phone size={20} color="var(--color-accent)" />, label: 'Phone', value: '+91 98765 43210' },
                { icon: <MapPin size={20} color="var(--color-accent)" />, label: 'Address', value: 'Connaught Place, New Delhi 110001' },
                { icon: <Clock size={20} color="var(--color-accent)" />, label: 'Hours', value: 'Mon–Fri, 9 AM – 6 PM IST' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '10px', backgroundColor: 'rgba(232,93,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <CTABanner title="Ready to Power Your Event?" subtitle="Join 1000+ events that trust Runnatics for precision timing and management." />
    </>
  );
}

export default ContactPage;
