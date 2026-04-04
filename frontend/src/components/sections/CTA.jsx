import Button from '../ui/Button';

const CTA = () => {
  return (
    <section className="bg-green-600 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Start managing your finances today
          </h2>

          <p className="text-xl text-green-100 leading-relaxed">
            Track, analyze, and control your financial data with ease.
            Join thousands of users who trust our platform.
          </p>

          <div className="pt-4">
            <Button
              href="/register"
              variant="secondary"
              size="lg"
              className="bg-white text-green-600 border-white hover:bg-green-50 hover:border-green-200 shadow-lg"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
