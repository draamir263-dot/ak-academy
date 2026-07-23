import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, isPremium, expiryDate, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  // Calculate days remaining
  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Extract name from email (e.g., "draamir308" from "draamir308@gmail.com")
  const userName = currentUser?.email ? currentUser.email.split('@')[0] : 'Account';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🩺</span>
            <span className="font-extrabold text-xl text-blue-900 hidden sm:block">AK Academy</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Dashboard
            </Link>
            
            {/* SECRET ADMIN BUTTON */}
            {currentUser && currentUser.email?.toLowerCase() === "draamir308@gmail.com" && (
              <Link 
                to="/admin" 
                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Admin
              </Link>
            )}
            
            {/* PROFILE DROPDOWN */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-gray-100 text-gray-800 px-3 sm:px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  {/* Profile Avatar */}
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs uppercase">
                    {userName.charAt(0)}
                  </span>
                  <span className="hidden sm:block capitalize">{userName}</span>
                  <span className="text-xs">▼</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50">
                    <p className="text-xs text-gray-400 font-semibold uppercase">Logged in as</p>
                    <p className="font-bold text-gray-800 mb-4 break-all">{currentUser.email}</p>
                    
                    {/* Premium Status Box */}
                    {isPremium ? (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4 text-center">
                        <p className="text-sm font-bold text-green-700">⭐ Premium Active</p>
                        <p className="text-xs text-gray-500 mt-1">{daysLeft} days remaining</p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-center">
                        <p className="text-sm font-bold text-red-700">Account Expired</p>
                        <Link to="/payment" onClick={() => setShowDropdown(false)} className="block mt-1 text-xs text-blue-600 underline font-semibold">
                          Click here to recharge
                        </Link>
                      </div>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-500 text-white py-2 rounded-md text-sm font-semibold hover:bg-red-600"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
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