import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasInitialized, setHasInitialized] = useState(false);

  // PWA Auto-Update: Forces the app to download new MCQs when reopened
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('PWA Registered');
    },
  });

  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true); // Silently refresh the app to load new MCQs
    }
  }, [needRefresh]);

  useEffect(() => {
    // If we are online, mark as initialized so they can use it even if they go offline later
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

  // Only block if they are offline AND haven't initialized (i.e., just opened the app offline)
  if (!isOnline && !hasInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 text-center">
        <div>
          <div className="text-6xl mb-4">📡</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">No Internet Connection</h1>
          <p className="text-gray-500">AK Academy requires an active internet connection to load the latest MCQs and sync your progress. Please connect to Wi-Fi or mobile data and reopen the app.</p>
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