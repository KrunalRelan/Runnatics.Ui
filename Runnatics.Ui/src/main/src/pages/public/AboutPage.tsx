import AboutHero from '../../components/public/about/AboutHero';
import OurStory from '../../components/public/about/OurStory';
import TeamSection from '../../components/public/about/TeamSection';
import CTABanner from '../../components/public/shared/CTABanner';
import usePublicApi from '../../hooks/usePublicApi';
import { getAboutContent } from '../../services/publicApi';

// Story copy, story image and the Team tiles are admin-managed (About Page
// editor). OurStory falls back to built-in copy while loading / on error, so
// the page is never blank; TeamSection hides itself when there are no members.
function AboutPage() {
  const { data } = usePublicApi((signal) => getAboutContent(signal), []);

  return (
    <>
      <AboutHero />
      <OurStory
        whoWeAre={data?.whoWeAre}
        mission={data?.mission}
        storyImageBase64={data?.storyImageBase64}
      />
      <TeamSection members={data?.founders ?? []} />
      <CTABanner />
    </>
  );
}

export default AboutPage;
