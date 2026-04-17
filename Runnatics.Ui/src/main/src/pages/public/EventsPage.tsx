import { useState } from 'react';
import EventsHero from '../../components/public/events/EventsHero';
import EventFilters from '../../components/public/events/EventFilters';
import EventCard, { type EventData } from '../../components/public/events/EventCard';
import Pagination from '../../components/public/shared/Pagination';
import CTABanner from '../../components/public/shared/CTABanner';
import { Container, Section } from '../../components/public/ui';

const upcomingEvents: EventData[] = [
  { slug: 'airtel-delhi-half-marathon-2026', name: 'Airtel Delhi Half Marathon 2026', date: '15 Oct 2026', city: 'Delhi', categories: ['Half Marathon', '10K', '5K'], registrationOpen: true, isPast: false },
  { slug: 'mumbai-marathon-2027', name: 'Tata Mumbai Marathon 2027', date: '19 Jan 2027', city: 'Mumbai', categories: ['Full Marathon', 'Half Marathon', 'Dream Run'], registrationOpen: false, isPast: false },
  { slug: 'bengaluru-10k-2026', name: 'Bengaluru 10K Challenge', date: '8 Nov 2026', city: 'Bangalore', categories: ['10K', '5K'], registrationOpen: true, isPast: false },
  { slug: 'hyderabad-marathon-2026', name: 'Hyderabad Marathon 2026', date: '22 Nov 2026', city: 'Hyderabad', categories: ['Full Marathon', '21K'], registrationOpen: true, isPast: false },
  { slug: 'pune-monsoon-run-2026', name: 'Pune Monsoon Run 2026', date: '12 Jul 2026', city: 'Pune', categories: ['10K', '5K'], registrationOpen: false, isPast: false },
  { slug: 'gurgaon-night-run-2026', name: 'Gurgaon Night Run 2026', date: '20 Sep 2026', city: 'Gurgaon', categories: ['10K', '5K', '3K'], registrationOpen: true, isPast: false },
];

const pastEvents: EventData[] = [
  { slug: 'airtel-delhi-half-marathon-2025', name: 'Airtel Delhi Half Marathon 2025', date: '20 Oct 2025', city: 'Delhi', categories: ['Half Marathon', '10K', '5K'], registrationOpen: false, isPast: true },
  { slug: 'mumbai-marathon-2026', name: 'Tata Mumbai Marathon 2026', date: '20 Jan 2026', city: 'Mumbai', categories: ['Full Marathon', 'Half Marathon'], registrationOpen: false, isPast: true },
  { slug: 'bengaluru-10k-2025', name: 'Bengaluru 10K 2025', date: '12 Nov 2025', city: 'Bangalore', categories: ['10K', '5K'], registrationOpen: false, isPast: true },
  { slug: 'devils-circuit-delhi-2025', name: "Devil's Circuit Delhi 2025", date: '6 Dec 2025', city: 'Delhi', categories: ['Obstacle 5K', 'Obstacle 10K'], registrationOpen: false, isPast: true },
  { slug: 'pune-half-marathon-2025', name: 'Pune Half Marathon 2025', date: '8 Mar 2025', city: 'Pune', categories: ['21K', '10K'], registrationOpen: false, isPast: true },
  { slug: '7hills-marathon-2025', name: '7Hills Marathon 2025', date: '14 Sep 2025', city: 'Hyderabad', categories: ['Full Marathon', '21K'], registrationOpen: false, isPast: true },
];

const PAGE_SIZE = 6;

function EventsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [city, setCity] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const source = tab === 'upcoming' ? upcomingEvents : pastEvents;

  const filtered = source.filter((e) => {
    const matchCity = city === 'All' || e.city === city;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (t: 'upcoming' | 'past') => { setTab(t); setPage(1); };
  const handleCityChange = (c: string) => { setCity(c); setPage(1); };
  const handleSearchChange = (s: string) => { setSearch(s); setPage(1); };

  return (
    <>
      <EventsHero />
      <EventFilters
        tab={tab}
        city={city}
        search={search}
        onTabChange={handleTabChange}
        onCityChange={handleCityChange}
        onSearchChange={handleSearchChange}
      />
      <Section tone="light">
        <Container>
          {paged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              No events found matching your filters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {paged.map((ev) => <EventCard key={ev.slug} event={ev} />)}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </Container>
      </Section>
      <CTABanner title="Organise Your Next Race" subtitle="Get in touch and let Runnatics handle timing, registration, and results." ctaLabel="Talk to Us" />
    </>
  );
}

export default EventsPage;
