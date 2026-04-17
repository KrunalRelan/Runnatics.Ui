import { Section, Container } from '../../components/public/ui';

const prose = { fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '1rem' } as const;
const h2 = { fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--color-text)', marginTop: '2.5rem', marginBottom: '0.75rem' } as const;

function PrivacyPage() {
  return (
    <Section tone="light">
      <Container>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
            Last updated: April 2026
          </p>

          <h2 style={h2}>1. Information We Collect</h2>
          <p style={prose}>We collect information you provide when registering for an event (name, email, phone, date of birth, gender, emergency contact), processing payments (handled by third-party providers — we do not store card details), and using our platform features. We also collect technical data such as browser type, IP address, and usage analytics through cookies.</p>

          <h2 style={h2}>2. How We Use Your Information</h2>
          <p style={prose}>Your data is used to process event registrations and timing results, generate finisher certificates, communicate race updates and results, personalise your experience on the Runnatics platform, comply with legal obligations, and improve our services through aggregate analytics.</p>

          <h2 style={h2}>3. Data Sharing</h2>
          <p style={prose}>We share data with event organisers who use the Runnatics platform for their event (limited to participant data relevant to their event), payment processors (Razorpay, Stripe) under their respective privacy policies, photography partners for race photo delivery, and authorities where required by law. We do not sell your personal data to third parties.</p>

          <h2 style={h2}>4. Cookies</h2>
          <p style={prose}>We use essential cookies for authentication and session management, analytics cookies to understand platform usage, and preference cookies to remember your settings. You can manage cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.</p>

          <h2 style={h2}>5. Data Security</h2>
          <p style={prose}>We implement industry-standard security measures including TLS encryption for data in transit, encrypted storage for sensitive data, and regular security audits. While we take reasonable precautions, no system is 100% secure and we cannot guarantee absolute security.</p>

          <h2 style={h2}>6. Your Rights</h2>
          <p style={prose}>Under applicable Indian data protection laws, you have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@runnatics.com. We will respond within 30 days. You may also opt out of marketing communications at any time via the unsubscribe link in our emails.</p>

          <h2 style={h2}>7. Contact</h2>
          <p style={prose}>For privacy-related enquiries, contact our Data Protection Officer at <strong>privacy@runnatics.com</strong> or write to: Runnatics Privacy, Connaught Place, New Delhi 110001, India.</p>
        </div>
      </Container>
    </Section>
  );
}

export default PrivacyPage;
