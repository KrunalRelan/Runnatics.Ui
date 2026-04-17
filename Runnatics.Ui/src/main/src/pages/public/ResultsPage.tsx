import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Section, Container, Heading } from '../../components/public/ui';
import ResultFilters from '../../components/public/results/ResultFilters';
import ResultsTable from '../../components/public/results/ResultsTable';
import Pagination from '../../components/public/shared/Pagination';
import { ErrorState, TableSkeleton } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { getEventResults } from '../../services/publicApi';
import type { ResultRow } from '../../services/publicApi';

export type { ResultRow };

const PAGE_SIZE = 20;

function ResultsPage() {
  const { slug } = useParams();
  const [search, setSearch] = useState('');
  const [race, setRace] = useState('All');
  const [gender, setGender] = useState('All');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      getEventResults(
        slug ?? '',
        { race, gender, search: debouncedSearch, page, pageSize: PAGE_SIZE },
        signal,
      ),
    [slug, race, gender, debouncedSearch, page],
  );

  const results = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;
  const availableRaces = data?.races ?? [];

  const handleSearch = (s: string) => { setSearch(s); setPage(1); };
  const handleRace = (r: string) => { setRace(r); setPage(1); };
  const handleGender = (g: string) => { setGender(g); setPage(1); };

  return (
    <>
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <Container>
          {slug && (
            <div style={{ marginBottom: '0.75rem' }}>
              <Link
                to={`/events/${slug}`}
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                ← Back to Event
              </Link>
            </div>
          )}
          <Heading level={1} style={{ color: '#fff' }}>Race Results</Heading>
          {slug && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', textTransform: 'capitalize' }}>
              {slug.replace(/-/g, ' ')}
            </p>
          )}
        </Container>
      </Section>

      <ResultFilters
        search={search}
        race={race}
        gender={gender}
        races={availableRaces}
        onSearchChange={handleSearch}
        onRaceChange={handleRace}
        onGenderChange={handleGender}
      />

      <Section tone="light">
        <Container>
          {error && <ErrorState message={error} onRetry={refetch} />}

          {!error && (
            <>
              {loading ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                        {['Rank', 'Bib', 'Name', 'Race', 'Gender', 'Gun Time', 'Net Time', 'Cat Rank', 'Gen Rank', ''].map((h) => (
                          <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <TableSkeleton rows={10} cols={10} />
                  </table>
                </div>
              ) : (
                <ResultsTable results={results} />
              )}

              {!loading && totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}

export default ResultsPage;
