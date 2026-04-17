import AboutHero from '../../components/public/about/AboutHero';
import OurStory from '../../components/public/about/OurStory';
import OurServices from '../../components/public/about/OurServices';
import Clients from '../../components/public/shared/Clients';
import CTABanner from '../../components/public/shared/CTABanner';

function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <OurServices />
      <Clients />
      <CTABanner />
    </>
  );
}

export default AboutPage;
