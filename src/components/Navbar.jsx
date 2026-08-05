import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { currentUser, isPremium, expiryDate, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const menuRef = useRef(null);
  const themeMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
    navigate('/', { replace: true });
  };

  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const userName = currentUser?.email ? currentUser.email.split('@')[0] : 'Account';
  const canUpgrade = currentUser?.currentPlan && currentUser.currentPlan !== '1_year' && currentUser.currentPlan !== 'none';

  useEffect(() => {
    if (currentUser) {
      currentUser.getIdTokenResult().then((token) => {
        setIsAdmin(!!token.claims.admin);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('.hamburger-btn')) {
        setShowMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target) && !e.target.closest('.theme-btn')) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowMenu(false);
    setShowThemeMenu(false);
  }, [navigate]);

  return (
    <nav className="bg-blue-900 dark:bg-slate-900 shadow-sm border-b border-blue-800 dark:border-slate-800 sticky top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link to="/" replace className="flex items-center space-x-2">
            <span className="text-2xl">🩺</span>
            <span className="font-extrabold text-xl text-white">MedLife</span>
          </Link>

          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Link 
                to="/admin" 
                className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Admin
              </Link>
            )}

            {!currentUser && (
              <Link 
                to="/login" 
                className="bg-yellow-400 text-blue-900 px-3 py-2 rounded-md text-sm font-bold hover:bg-yellow-500 transition-colors"
              >
                Log In
              </Link>
            )}

            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="theme-btn flex items-center justify-center w-10 h-10 rounded-md hover:bg-blue-800 dark:hover:bg-slate-800 transition-colors text-white"
                title="Select Theme"
              >
                {theme === 'light' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
                {theme === 'dark' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
                {theme === 'auto' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </button>

              {showThemeMenu && (
                <div 
                  ref={themeMenuRef}
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
                >
                  <button onClick={() => { changeTheme('light'); setShowThemeMenu(false); }} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm ${theme === 'light' ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    ☀️ Light Mode
                  </button>
                  <button onClick={() => { changeTheme('dark'); setShowThemeMenu(false); }} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm ${theme === 'dark' ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    🌙 Dark Mode
                  </button>
                  <button onClick={() => { changeTheme('auto'); setShowThemeMenu(false); }} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm ${theme === 'auto' ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    🕒 Auto (Day/Night)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hamburger-btn flex flex-col justify-center items-center w-10 h-10 rounded-md hover:bg-blue-800 dark:hover:bg-slate-800 transition-colors gap-1.5"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${showMenu ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${showMenu ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute right-4 sm:right-8 top-14 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 transition-colors duration-300"
          style={{ animation: 'menuSlideIn 0.2s ease-out' }}
        >
          <div className="p-2">
            <Link to="/" replace className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => setShowMenu(false)}>
              <span className="text-lg">🏠</span>
              <span>Home</span>
            </Link>
            <Link to="/dashboard" replace className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => setShowMenu(false)}>
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/about" replace className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium" onClick={() => setShowMenu(false)}>
              <span className="text-lg">ℹ️</span>
              <span>About</span>
            </Link>
          </div>

          {currentUser && (
            <>
              <div className="border-t border-gray-100 dark:border-slate-700" />
              <div className="p-2">
                <button onClick={() => { setShowMenu(false); navigate('/profile'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium w-full text-left">
                  <span className="text-lg">👤</span>
                  <span>Profile</span>
                </button>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium w-full text-left">
                  <span className="text-lg">🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}

          {!currentUser && (
            <>
              <div className="border-t border-gray-100 dark:border-slate-700" />
              <div className="p-2">
                <Link to="/login" replace className="flex items-center gap-3 px-4 py-3 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors font-medium" onClick={() => setShowMenu(false)}>
                  <span className="text-lg">🔐</span>
                  <span>Log In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes menuSlideIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </nav>
  );
}