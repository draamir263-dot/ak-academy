import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Subject from './pages/Subject';
import TestBuilder from './pages/TestBuilder';
import TestEngine from './pages/TestEngine';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import { ProgressProvider } from './context/ProgressContext';

function App() {
  return (
    <ProgressProvider>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subject/:subjectName" element={<Subject />} />
          <Route path="/test-builder/:subjectName/:chapterName" element={<TestBuilder />} />
          <Route path="/test-engine/:subjectName/:chapterName/:numQuestions" element={<TestEngine />} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </ProgressProvider>
  );
}

export default App;