import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Subject from './pages/Subject';
import TestBuilder from './pages/TestBuilder';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subject/:subjectName" element={<Subject />} />
        <Route path="/test-builder/:subjectName/:chapterName" element={<TestBuilder />} />
      </Routes>
    </div>
  );
}

export default App;