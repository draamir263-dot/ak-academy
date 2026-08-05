import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'; // <-- Added ThemeProvider import
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
      </div>
    </ThemeProvider>
  );
}

export default App;