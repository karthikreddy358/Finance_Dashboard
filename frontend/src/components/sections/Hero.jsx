import Button from '../ui/Button';

const Hero = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              Finance Management System
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Smart Finance{' '}
              <span className="text-green-600">Dashboard</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Track your income, expenses, and financial insights in one place.
              Manage transactions, monitor analytics, and control access with
              role-based security.
            </p>

            <div className="pt-2">
              <p className="text-sm text-gray-500">
                Use the buttons in the top right corner to get started.
              </p>
            </div>
          </div>

          {/* Right Side - Card */}
          <div className="flex justify-center md:justify-end">
            <div className="relative max-w-md w-full">
              {/* Main Balance Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Total Balance
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900">$0.00</div>

                  {/* Chart Placeholder - Simple visualization */}
                  <div className="h-32 flex items-end justify-between space-x-2 pt-4">
                    {[40, 65, 45, 80, 55, 70, 60].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-green-400 to-green-500 rounded-t-sm"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Encrypted Badge */}
              <div className="absolute -bottom-3 -left-4 bg-white rounded-lg shadow-md px-4 py-2 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Encrypted
                  </span>
                </div>
              </div>

              {/* Sample Data Label */}
              <div className="absolute -top-3 -right-4 bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">
                Sample Data
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
