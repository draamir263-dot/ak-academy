import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, user, isPremium, expiryDate, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
    setShowProfile(false);
    navigate('/', { replace: true });
  };

  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const userName = currentUser?.email ? currentUser.email.split('@')[0] : 'Account';
  const canUpgrade = user?.currentPlan && user.currentPlan !== '1_year' && user.currentPlan !== 'none';

  const isAdmin = currentUser?.email?.toLowerCase() === "draamir308@gmail.com";

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('.hamburger-btn')) {
        setShowMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target) && !e.target.closest('.profile-btn')) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setShowMenu(false);
    setShowProfile(false);
  }, [navigate]);

  return (
    <nav className="bg-blue-900 shadow-sm border-b border-blue-800 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" replace className="flex items-center space-x-2">
            <span className="text-2xl">🩺</span>
            <span className="font-extrabold text-xl text-white">MedLife</span>
          </Link>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">

            {/* Admin button — only for admin email, always visible (outside hamburger) */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Admin
              </Link>
            )}

            {/* Profile / Login button */}
            {currentUser ? (
              <button
                onClick={() => { setShowProfile(!showProfile); setShowMenu(false); }}
                className="profile-btn bg-blue-800 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span className="w-6 h-6 bg-white text-blue-900 rounded-full flex items-center justify-center text-xs uppercase">
                  {userName.charAt(0)}
                </span>
                <span className="hidden sm:block capitalize">{userName}</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="bg-yellow-400 text-blue-900 px-3 py-2 rounded-md text-sm font-bold hover:bg-yellow-500 transition-colors"
              >
                Log In
              </Link>
            )}

            {/* Hamburger Menu Button (3 lines) */}
            <button
              onClick={() => { setShowMenu(!showMenu); setShowProfile(false); }}
              className="hamburger-btn flex flex-col justify-center items-center w-10 h-10 rounded-md hover:bg-blue-800 transition-colors gap-1.5"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${showMenu ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== HAMBURGER DROPDOWN MENU ===== */}
      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute right-4 sm:right-8 top-14 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          style={{ animation: 'menuSlideIn 0.2s ease-out' }}
        >
          <div className="p-2">
            <Link
              to="/"
              replace
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-lg">🏠</span>
              <span>Home</span>
            </Link>
            <Link
              to="/dashboard"
              replace
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/about"
              replace
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-lg">ℹ️</span>
              <span>About</span>
            </Link>
          </div>

          {/* Logged-in only: account section */}
          {currentUser && (
            <>
              <div className="border-t border-gray-100" />
              <div className="p-2">
                <button
                  onClick={() => { setShowMenu(false); navigate('/dashboard'); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium w-full"
                >
                  <span className="text-lg">👤</span>
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium w-full"
                >
                  <span className="text-lg">🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}

          {/* Not logged in */}
          {!currentUser && (
            <>
              <div className="border-t border-gray-100" />
              <div className="p-2">
                <Link
                  to="/login"
                  replace
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors font-medium"
                  onClick={() => setShowMenu(false)}
                >
                  <span className="text-lg">🔐</span>
                  <span>Log In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== PROFILE DROPDOWN (for account info / premium / payment) ===== */}
      {showProfile && currentUser && (
        <div 
          ref={profileRef}
          className="absolute right-4 sm:right-8 top-14 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50"
          style={{ animation: 'menuSlideIn 0.2s ease-out' }}
        >
          <p className="text-xs text-gray-400 font-semibold uppercase">Logged in as</p>
          <p className="font-bold text-gray-800 mb-4 break-all">{currentUser.email}</p>
          
          {isPremium ? (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4 text-center">
              <p className="text-sm font-bold text-green-700">⭐ Premium Active</p>
              <p className="text-xs text-gray-500 mt-1">{daysLeft} days remaining</p>
              {canUpgrade && (
                <Link 
                  to="/payment" 
                  onClick={() => setShowProfile(false)} 
                  className="block mt-3 bg-blue-600 text-white text-xs font-bold py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Upgrade your plan
                </Link>
              )}
            </div>
          ) : (
            user?.paymentStatus === 'rejected' ? (
              <div className="bg-red-50 border border-red-500 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm font-bold text-red-700">Payment Rejected ❌</p>
                <p className="text-xs text-gray-700 mt-1 font-medium">Wrong Transaction ID.</p>
                <Link to="/payment" onClick={() => setShowProfile(false)} className="block mt-2 text-xs text-blue-600 underline font-semibold">
                  Submit correct ID here
                </Link>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm font-bold text-red-700">Account Expired</p>
                <Link to="/payment" onClick={() => setShowProfile(false)} className="block mt-1 text-xs text-blue-600 underline font-semibold">
                  Click here to recharge
                </Link>
              </div>
            )
          )}
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-md text-sm font-semibold hover:bg-red-600"
          >
            Log Out
          </button>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes menuSlideIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </nav>
  );
}