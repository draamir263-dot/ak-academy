import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Subject from './pages/Subject';
import TestBuilder from './pages/TestBuilder';
import TestEngine from './pages/TestEngine';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Payment from './pages/Payment';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import About from './pages/About';
import Profile from './pages/Profile';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }

    if (navigator.onLine) {
      setHasInitialized(true);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setHasInitialized(true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle physical back button to show Exit App popup on Home
  useEffect(() => {
    const handlePopState = (e) => {
      // If we are on the home page, intercept the back button
      if (window.location.pathname === '/') {
        // Push state back so the app doesn't close immediately
        window.history.pushState(null, null, window.location.href);
        setShowExitModal(true);
      }
    };
    
    // Add a dummy state on Home so we can catch the back button
    if (location.pathname === '/') {
      window.history.pushState(null, null, window.location.href);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location]);

  if (!isOnline && !hasInitialized) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-blue-900 dark:bg-slate-900 p-8 text-center transition-colors duration-300">
          <div>
            <div className="text-6xl mb-4">📡</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">No Internet Connection</h1>
            <p className="text-blue-200 dark:text-slate-300">AK Academy requires an active internet connection to load the latest MCQs and sync your progress.</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/subject/:subjectName" element={<Subject />} />
          <Route path="/test-builder/:subjectName/:chapterName" element={<TestBuilder />} />
          <Route path="/test-engine/:subjectName/:chapterName/:numQuestions" element={<TestEngine />} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Exit App Modal */}
        {showExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowExitModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full text-center transition-colors" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 mx-auto bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Exit App?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to close the application?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowExitModal(false);
                    // Attempt to close window (works in Android WebViews / Cordova / Capacitor)
                    window.close();
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;