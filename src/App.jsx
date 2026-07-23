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