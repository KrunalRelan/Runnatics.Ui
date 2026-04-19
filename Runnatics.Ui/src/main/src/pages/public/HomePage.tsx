import Hero from '../../components/public/home/Hero';
import PastEventResults from '../../components/public/home/PastEventResults';
import PlatformOverview from '../../components/public/home/PlatformOverview';
import UpcomingRaces from '../../components/public/home/UpcomingRaces';
import ParticipantInsights from '../../components/public/home/ParticipantInsights';
import RaceMoments from '../../components/public/home/RaceMoments';
import Sponsorship from '../../components/public/home/Sponsorship';
import CTABanner from '../../components/public/shared/CTABanner';

function HomePage() {
  return (
    <>
      <Hero />
      <PastEventResults />
      <PlatformOverview />
      <UpcomingRaces />
      <ParticipantInsights />
      <RaceMoments />
      <Sponsorship />
      <CTABanner />
    </>
  );
}

export default HomePage;
