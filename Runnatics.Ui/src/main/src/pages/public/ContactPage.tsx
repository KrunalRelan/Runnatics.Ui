import { useState } from 'react';
import { Mail, MapPin, Clock } from 'lucide-react';
import { Section, Container, Heading } from '../../components/public/ui';
import CTABanner from '../../components/public/shared/CTABanner';
import { submitContactForm, type ContactFormPayload } from '../../services/publicApi';

const subjectOptions = ['General Enquiry', 'Event Timing', 'Registration', 'Sponsorship', 'Technical Support', 'Other'];

interface FormState {
  name: string; email: string; phone: string; subject: string; event: string; message: string;
}

interface FormErrors {
  name?: string; email?: string; subject?: string; message?: string;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

function Toast({ status }: { status: SubmitStatus }) {
  const visible = status === 'success' || status === 'error';
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
        backgroundColor: status === 'error' ? 'var(--color-error)' : 'var(--color-success)',
        color: '#fff',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '0.9375rem',
        padding: '0.75rem 1.75rem',
        borderRadius: '9999px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        transition: 'top 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {status === 'error' ? 'Failed to send. Please try again.' : "Message sent! We'll get back to you shortly."}
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

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', subject: '', event: '', message: '' };

function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitStatus('submitting');
    try {
      const payload: ContactFormPayload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        event: form.event || undefined,
        message: form.message,
      };
      await submitContactForm(payload);
      setSubmitStatus('success');
      setForm(EMPTY_FORM);
    } catch {
      setSubmitStatus('error');
    } finally {
      setTimeout(() => setSubmitStatus('idle'), 4000);
    }
  };

  const field = (label: string, error?: string, children: React.ReactNode = null) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.375rem', color: 'var(--color-text)' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-error)', marginTop: '0.25rem', margin: '0.25rem 0 0' }}>{error}</p>}
    </div>
  );

  const submitting = submitStatus === 'submitting';

  return (
    <>
      <Toast status={submitStatus} />

      {/* Hero */}
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
        <Container>
          <Heading level={1} style={{ color: '#fff' }}>Get in Touch</Heading>
          <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', marginTop: '0.75rem' }}>
            For event enquiry, click below or email us at{' '}
            <a
              href="mailto:support@racetik.com"
              style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
            >
              support@racetik.com
            </a>
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
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Arjun Sharma"
                  disabled={submitting}
                  style={{ ...inputStyle, borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border)' }}
                />
              )}
              {field('Email Address *', errors.email,
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="arjun@example.com"
                  disabled={submitting}
                  style={{ ...inputStyle, borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border)' }}
                />
              )}
              {field('Phone Number', undefined,
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 98765 43210"
                  disabled={submitting}
                  style={inputStyle}
                />
              )}
              {field('Subject *', errors.subject,
                <select
                  value={form.subject}
                  onChange={set('subject')}
                  disabled={submitting}
                  style={{ ...inputStyle, borderColor: errors.subject ? 'var(--color-error)' : 'var(--color-border)' }}
                >
                  <option value="">Select a subject</option>
                  {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {field('Event (Optional)', undefined,
                <input
                  value={form.event}
                  onChange={set('event')}
                  placeholder="Event name (optional)"
                  disabled={submitting}
                  style={inputStyle}
                />
              )}
              {field('Message *', errors.message,
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  rows={5}
                  placeholder="Tell us about your event or enquiry..."
                  disabled={submitting}
                  style={{ ...inputStyle, resize: 'vertical', borderColor: errors.message ? 'var(--color-error)' : 'var(--color-border)' }}
                />
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: submitting ? 'var(--color-text-muted)' : 'var(--color-accent)',
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  width: '100%',
                }}
                onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)'; }}
              >
                {submitting ? 'Sending…' : 'For event enquiry'}
              </button>
            </form>

            {/* Contact info */}
            <div>
              <Heading level={2} style={{ marginBottom: '1.5rem' }}>Contact Information</Heading>
              {[
                {
                  icon: <Mail size={20} color="var(--color-accent)" />,
                  label: 'Email',
                  value: 'support@racetik.com',
                  href: 'mailto:support@racetik.com',
                },
                // TODO: Address pending from client — update when provided.
                {
                  icon: <MapPin size={20} color="var(--color-accent)" />,
                  label: 'Address',
                  value: 'Address coming soon',
                },
                {
                  icon: <Clock size={20} color="var(--color-accent)" />,
                  label: 'Hours',
                  value: 'Mon–Fri, 9 AM – 6 PM IST',
                },
              ].map(({ icon, label, value, href }) => (
                <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '10px', backgroundColor: 'rgba(232,93,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    {href ? (
                      <a
                        href={href}
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', color: 'var(--color-accent)', marginTop: '0.2rem', textDecoration: 'none', display: 'inline-block' }}
                      >
                        {value}
                      </a>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <CTABanner title="Ready to Power Your Event?" subtitle="Join 1000+ events that trust Racetik for precision timing and management." />
    </>
  );
}

export default ContactPage;
