import { Hero } from '../components/landing/Hero';
import { Features, HowItWorks, Categories, Testimonials, FAQ, CTA } from '../components/landing/Sections';

export default function Landing() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Categories />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
