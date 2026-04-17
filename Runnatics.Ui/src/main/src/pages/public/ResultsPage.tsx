import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Section, Container, Heading } from '../../components/public/ui';
import ResultFilters from '../../components/public/results/ResultFilters';
import ResultsTable from '../../components/public/results/ResultsTable';
import Pagination from '../../components/public/shared/Pagination';

export interface ResultRow {
  rank: number; bib: string; name: string; race: string; gender: string;
  gunTime: string; netTime: string; catRank: number; genderRank: number;
  splits: { checkpoint: string; time: string; rank: number }[];
}

const demoResults: ResultRow[] = [
  { rank: 1, bib: 'A001', name: 'Arjun Sharma', race: 'Half Marathon', gender: 'M', gunTime: '1:07:12', netTime: '1:07:05', catRank: 1, genderRank: 1, splits: [{ checkpoint: '5K', time: '0:18:45', rank: 2 }, { checkpoint: '10K', time: '0:37:55', rank: 1 }, { checkpoint: '15K', time: '0:57:10', rank: 1 }] },
  { rank: 2, bib: 'A002', name: 'Priya Mehta', race: 'Half Marathon', gender: 'F', gunTime: '1:13:44', netTime: '1:13:38', catRank: 1, genderRank: 1, splits: [{ checkpoint: '5K', time: '0:20:10', rank: 4 }, { checkpoint: '10K', time: '0:40:44', rank: 2 }, { checkpoint: '15K', time: '1:01:05', rank: 2 }] },
  { rank: 3, bib: 'A003', name: 'Rohit Verma', race: 'Half Marathon', gender: 'M', gunTime: '1:15:30', netTime: '1:15:22', catRank: 2, genderRank: 2, splits: [{ checkpoint: '5K', time: '0:21:30', rank: 5 }, { checkpoint: '10K', time: '0:43:00', rank: 3 }, { checkpoint: '15K', time: '1:04:10', rank: 3 }] },
  { rank: 4, bib: 'B101', name: 'Kavya Reddy', race: '10K', gender: 'F', gunTime: '0:46:22', netTime: '0:46:15', catRank: 1, genderRank: 1, splits: [{ checkpoint: '5K', time: '0:23:05', rank: 1 }] },
  { rank: 5, bib: 'B102', name: 'Suresh Nair', race: '10K', gender: 'M', gunTime: '0:47:55', netTime: '0:47:48', catRank: 1, genderRank: 1, splits: [{ checkpoint: '5K', time: '0:23:50', rank: 2 }] },
  { rank: 6, bib: 'A004', name: 'Anita Singh', race: 'Half Marathon', gender: 'F', gunTime: '1:28:10', netTime: '1:27:58', catRank: 2, genderRank: 2, splits: [{ checkpoint: '5K', time: '0:24:30', rank: 8 }, { checkpoint: '10K', time: '0:49:45', rank: 6 }, { checkpoint: '15K', time: '1:14:20', rank: 5 }] },
  { rank: 7, bib: 'B103', name: 'Dinesh Kumar', race: '10K', gender: 'M', gunTime: '0:52:40', netTime: '0:52:31', catRank: 2, genderRank: 2, splits: [{ checkpoint: '5K', time: '0:26:10', rank: 3 }] },
  { rank: 8, bib: 'A005', name: 'Meera Joshi', race: 'Half Marathon', gender: 'F', gunTime: '1:35:22', netTime: '1:35:10', catRank: 3, genderRank: 3, splits: [{ checkpoint: '5K', time: '0:26:45', rank: 9 }, { checkpoint: '10K', time: '0:53:30', rank: 7 }, { checkpoint: '15K', time: '1:20:10', rank: 7 }] },
  { rank: 9, bib: 'B104', name: 'Pooja Krishnan', race: '10K', gender: 'F', gunTime: '0:55:18', netTime: '0:55:10', catRank: 2, genderRank: 2, splits: [{ checkpoint: '5K', time: '0:27:30', rank: 4 }] },
  { rank: 10, bib: 'A006', name: 'Vikram Patel', race: 'Half Marathon', gender: 'M', gunTime: '1:42:05', netTime: '1:41:48', catRank: 3, genderRank: 3, splits: [{ checkpoint: '5K', time: '0:28:20', rank: 10 }, { checkpoint: '10K', time: '0:57:00', rank: 9 }, { checkpoint: '15K', time: '1:26:30', rank: 9 }] },
];

const PAGE_SIZE = 10;

function ResultsPage() {
  const { slug } = useParams();
  const [search, setSearch] = useState('');
  const [race, setRace] = useState('All');
  const [gender, setGender] = useState('All');
  const [page, setPage] = useState(1);

  const races = Array.from(new Set(demoResults.map((r) => r.race)));

  const filtered = demoResults.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.bib.toLowerCase().includes(q);
    const matchRace = race === 'All' || r.race === race;
    const matchGender = gender === 'All' || r.gender === gender;
    return matchSearch && matchRace && matchGender;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (s: string) => { setSearch(s); setPage(1); };
  const handleRace = (r: string) => { setRace(r); setPage(1); };
  const handleGender = (g: string) => { setGender(g); setPage(1); };

  return (
    <>
      <Section tone="dark" style={{ padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <Container>
          <div style={{ marginBottom: '0.75rem' }}>
            <Link to={`/events/${slug ?? ''}`} style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              ← Back to Event
            </Link>
          </div>
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
        races={races}
        onSearchChange={handleSearch}
        onRaceChange={handleRace}
        onGenderChange={handleGender}
      />

      <Section tone="light">
        <Container>
          <ResultsTable results={paged} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </Container>
      </Section>
    </>
  );
}

export default ResultsPage;
