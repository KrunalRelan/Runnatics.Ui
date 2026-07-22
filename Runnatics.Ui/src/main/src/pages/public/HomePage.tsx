import Hero from '../../components/public/home/Hero';
import PastEventResults from '../../components/public/home/PastEventResults';
import PlatformOverview from '../../components/public/home/PlatformOverview';
import UpcomingRaces from '../../components/public/home/UpcomingRaces';
import ParticipantInsights from '../../components/public/home/ParticipantInsights';
import RaceMoments from '../../components/public/home/RaceMoments';
import CTABanner from '../../components/public/shared/CTABanner';

function HomePage() {
  return (
    <>
      <Hero />
      <PastEventResults />
      <UpcomingRaces />
      <PlatformOverview />
      <ParticipantInsights />
      <RaceMoments />
      <CTABanner />
    </>
  );
}

export default HomePage;
