import Card from '../ui/Card';

const Insights = () => {
  const bulletPoints = [
    'Real-time income & expense tracking',
    'Category-wise breakdown',
    'Monthly analytics and trends',
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image Placeholder */}
          <div className="flex justify-center md:justify-start">
            <Card
              className="w-full max-w-lg aspect-video bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center"
              padding="none"
            >
              <div className="text-center p-8">
                <svg
                  className="w-24 h-24 mx-auto text-green-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-green-700 font-medium">Financial Analytics</p>
                <p className="text-sm text-green-600 mt-2">
                  Charts and insights visualization
                </p>
              </div>
            </Card>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Powerful Financial Insights
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              Understand your financial data with clear summaries and trends.
              Make high-stakes decisions with clarity.
            </p>

            <ul className="space-y-3">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insights;
