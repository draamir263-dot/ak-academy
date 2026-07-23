import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Home Link */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🩺</span>
            <span className="font-extrabold text-xl text-blue-900">AK Academy</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Dashboard
            </Link>
            
            {/* SECRET ADMIN BUTTON - Only shows for draamir308@gmail.com */}
            {currentUser && currentUser.email?.toLowerCase() === "draamir308@gmail.com" && (
              <Link 
                to="/admin" 
                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Admin
              </Link>
            )}
            
            {/* Auth Buttons */}
            {currentUser ? (
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Log Out
              </button>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Log In
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}