import { useState, useMemo } from 'react';
import EventsHero from '../../components/public/events/EventsHero';
import EventFilters from '../../components/public/events/EventFilters';
import EventCard from '../../components/public/events/EventCard';
import Pagination from '../../components/public/shared/Pagination';
import CTABanner from '../../components/public/shared/CTABanner';
import { Container, Section } from '../../components/public/ui';
import { CardGridSkeleton, ErrorState, EmptyState } from '../../components/public/shared/ApiStates';
import usePublicApi from '../../hooks/usePublicApi';
import { getUpcomingEvents, getPastEvents } from '../../services/publicApi';

const PAGE_SIZE = 6;

function EventsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [city, setCity] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: upcoming, loading: loadingUp, error: errorUp, refetch: refetchUp } = usePublicApi(
    (signal) => getUpcomingEvents(signal),
    [],
  );

  const { data: past, loading: loadingPast, error: errorPast, refetch: refetchPast } = usePublicApi(
    (signal) => getPastEvents(signal),
    [],
  );

  const source = tab === 'upcoming' ? upcoming : past;
  const loading = tab === 'upcoming' ? loadingUp : loadingPast;
  const error = tab === 'upcoming' ? errorUp : errorPast;
  const refetch = tab === 'upcoming' ? refetchUp : refetchPast;

  // Derive unique cities from the current tab's data for the city dropdown
  const availableCities = useMemo(() => {
    const cities = Array.from(new Set((source ?? []).map((e) => e.city))).sort();
    return cities;
  }, [source]);

  const filtered = useMemo(() => {
    if (!source) return [];
    const q = search.toLowerCase();
    return source.filter((e) => {
      const matchCity = city === 'All' || e.city === city;
      const matchSearch = !q || e.name.toLowerCase().includes(q);
      return matchCity && matchSearch;
    });
  }, [source, city, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (t: 'upcoming' | 'past') => { setTab(t); setPage(1); setCity('All'); setSearch(''); };
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
          {loading && <CardGridSkeleton count={6} />}

          {!loading && error && (
            <ErrorState
              message="Could not load events. Please check your connection and try again."
              onRetry={refetch}
            />
          )}

          {!loading && !error && paged.length === 0 && (
            <EmptyState
              title={search || city !== 'All' ? 'No matching events' : `No ${tab} events`}
              subtitle={search || city !== 'All' ? 'Try adjusting your filters.' : 'Check back soon — new events are added regularly.'}
            />
          )}

          {!loading && !error && paged.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {paged.map((ev) => <EventCard key={ev.slug} event={ev} />)}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </Container>
      </Section>
      <CTABanner
        title="Organise Your Next Race"
        subtitle="Get in touch and let Runnatics handle timing, registration, and results."
        ctaLabel="Talk to Us"
      />
    </>
  );
}

export default EventsPage;
