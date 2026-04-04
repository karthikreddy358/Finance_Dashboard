import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
