import { Link } from 'react-router-dom';

const AuthLayout = ({ children, sideContent }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side - Info card (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-green-600 items-center justify-center p-12">
        {sideContent}
      </div>
    </div>
  );
};

export default AuthLayout;
