import { useState, useMemo } from 'react';
import EventsHero from '../../components/public/events/EventsHero';
import EventFilters from '../../components/public/events/EventFilters';
import EventCard from '../../components/public/events/EventCard';
import Pagination from '../../components/public/shared/Pagination';
import CTABanner from '../../components/public/shared/CTABanner';
import { Container, Section } from '../../components/public/ui';
import { CardGridSkeleton, ErrorState, EmptyState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import useDebounce from '../../hooks/useDebounce';
import { publicApi } from '../../../../api/publicApi';

const PAGE_SIZE = 6;

function EventsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [city, setCity] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  const { data, loading, error, refetch } = usePublicApi(
    (signal) =>
      publicApi.searchEvents(
        {
          status: tab,
          city: city !== 'All' ? city : undefined,
          searchString: debouncedSearch || undefined,
          pageNumber: page,
          pageSize: PAGE_SIZE,
        },
        signal,
      ),
    [tab, city, debouncedSearch, page],
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Derive unique cities from current results for the dropdown
  const availableCities = useMemo(
    () => [...new Set(items.map((e) => e.city).filter(Boolean))].sort(),
    [items],
  );

  const handleTabChange = (t: 'upcoming' | 'past') => {
    setTab(t);
    setPage(1);
    setCity('All');
    setSearch('');
  };
  const handleCityChange = (c: string) => { setCity(c); setPage(1); };
  const handleSearchChange = (s: string) => { setSearch(s); setPage(1); };

  return (
    <>
      <EventsHero />
      <EventFilters
        tab={tab}
        city={city}
        search={search}
        availableCities={availableCities}
        onTabChange={handleTabChange}
        onCityChange={handleCityChange}
        onSearchChange={handleSearchChange}
      />
      <Section tone="light">
        <Container>
          {loading && <CardGridSkeleton count={PAGE_SIZE} />}

          {!loading && error && (
            <ErrorState
              message="Could not load events. Please check your connection and try again."
              onRetry={refetch}
            />
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              title={debouncedSearch || city !== 'All' ? 'No matching events' : `No ${tab} events`}
              subtitle={
                debouncedSearch || city !== 'All'
                  ? 'Try adjusting your filters.'
                  : 'Check back soon — new events are added regularly.'
              }
            />
          )}

          {!loading && !error && items.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {items.map((ev) => (
                <EventCard key={ev.encryptedId || ev.slug} event={ev} />
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </Container>
      </Section>
      <CTABanner
        title="Organise Your Next Race"
        subtitle="Get in touch and let Racetik handle timing, registration, and results."
        ctaLabel="Talk to Us"
      />
    </>
  );
}

export default EventsPage;
