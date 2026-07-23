// Provisional-results disclaimer shown on the public results surfaces
// (Results landing page + event leaderboard).
function ResultsDisclaimer() {
  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.25rem 1.5rem',
        borderLeft: '3px solid var(--color-border)',
        backgroundColor: '#F7F8FA',
        borderRadius: '6px',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
        lineHeight: 1.7,
        color: 'var(--color-text-muted)',
      }}
    >
      <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
        Results Disclaimer
      </div>
      <p style={{ margin: '0 0 0.75rem' }}>
        The race results displayed on this website are provisional and are subject to verification.
        The organizer reserves the right to modify, amend, or update the results without prior notice
        in the event of any discrepancies or technical validations.
      </p>
      <p style={{ margin: 0 }}>
        If you believe there is any discrepancy in your race timing or results, please contact our
        support team at{' '}
        <a
          href="mailto:care@racetik.com"
          style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
        >
          care@racetik.com
        </a>
        . All queries will be reviewed in accordance with the event's timing and result verification process.
      </p>
    </div>
  );
}

export default ResultsDisclaimer;
