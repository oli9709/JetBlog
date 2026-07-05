import Hero from './_PageSections/Hero';
import LogoMarquee from './_PageSections/LogoMarquee';
import Feature from './_PageSections/Feature';
import FeatureList from './_PageSections/FeatureList';
import CTA from './_PageSections/CTA';

export default function Landing() {
  return (
    <div className="space-y-4 md:space-y-8">
      <Hero />
      <LogoMarquee />
      <Feature />
      <FeatureList />
      <CTA />
    </div>
  );
}
