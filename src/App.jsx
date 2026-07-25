import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
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

function App() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasInitialized, setHasInitialized] = useState(false);

  // --- SILENT BACKGROUND UPDATE LOGIC ---
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('PWA Registered for silent updates');
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  // 1. Download new updates in the background, but DO NOT reload yet.
  useEffect(() => {
    if (needRefresh) {
      console.log('New updates found. Downloading in background...');
      updateServiceWorker(false); 
    }
  }, [needRefresh, updateServiceWorker]);

  // 2. SAFELY RELOAD: Only apply the update when the user is on the Home page
  useEffect(() => {
    if (needRefresh && location.pathname === '/') {
      console.log('User reached Home page. Applying updates safely.');
      updateServiceWorker(true); // This triggers the seamless reload
      setNeedRefresh(false);
    }
  }, [location.pathname, needRefresh, updateServiceWorker, setNeedRefresh]);

  // --- ONLINE/OFFLINE LOGIC ---
  useEffect(() => {
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

  if (!isOnline && !hasInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900 p-8 text-center">
        <div>
          <div className="text-6xl mb-4">📡</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">No Internet Connection</h1>
          <p className="text-blue-200">AK Academy requires an active internet connection to load the latest MCQs and sync your progress. Please connect to Wi-Fi or mobile data and reopen the app.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;