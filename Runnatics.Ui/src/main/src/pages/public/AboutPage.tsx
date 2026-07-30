import AboutHero from '../../components/public/about/AboutHero';
import OurStory from '../../components/public/about/OurStory';
import Founders from '../../components/public/about/Founders';
import CTABanner from '../../components/public/shared/CTABanner';
import usePublicApi from '../../hooks/usePublicApi';
import { getAboutContent } from '../../services/publicApi';

// Story copy, story image and the Founders tiles are admin-managed (About Page
// editor). OurStory falls back to built-in copy while loading / on error, so
// the page is never blank; Founders hides itself when there are none.
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
      <Founders founders={data?.founders ?? []} />
      <CTABanner />
    </>
  );
}

export default AboutPage;
