import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Subject from './pages/Subject';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subject/:subjectName" element={<Subject />} />
      </Routes>
    </div>
  );
}

export default App;