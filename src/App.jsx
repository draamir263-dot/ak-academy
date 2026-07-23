import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

  useEffect(() => {
    // Update network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If no internet, show this screen and block access
  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 text-center">
        <div>
          <div className="text-6xl mb-4">📡</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">No Internet Connection</h1>
          <p className="text-gray-500">AK Academy requires an active internet connection to load MCQs and sync your progress. Please connect to Wi-Fi or mobile data.</p>
        </div>
      </div>
    );
  }

  // If online, show the normal app
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