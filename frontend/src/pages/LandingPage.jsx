
import LandingNavbar from '../components/layout/LandingNavbar';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Insights from '../components/sections/Insights';
import CTA from '../components/sections/CTA';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LandingNavbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Insights />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
