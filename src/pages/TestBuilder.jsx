import { useParams, Link, useNavigate } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useState } from 'react';

export default function TestBuilder() {
  const { subjectName, chapterName } = useParams();
  const navigate = useNavigate();
  
  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === chapterName);
  
  const maxQuestions = chapter ? chapter.totalMcqs : 0;

  const [numQuestions, setNumQuestions] = useState(10);
  const [filter, setFilter] = useState('Mixed');
  const [timerMode, setTimerMode] = useState('Practice');

  const startTest = () => {
    // Pass the filter to the Test Engine via React Router state
    navigate(`/test-engine/${subjectName}/${chapterName}/${numQuestions}`, { state: { filter } });
  };

  if (!chapter) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Chapter not found!</h1>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/subject/${subjectName}`} className="text-blue-600 mb-6 inline-block">&larr; Back to {subjectName}</Link>
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900">{chapter.name}</h1>
          <p className="text-lg text-gray-500 mt-2">{maxQuestions} MCQs Available</p>
        </header>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-8">
          
          {/* Number of Questions */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Number of Questions</label>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 50, 75, 100].map(num => (
                <button 
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  className={`px-4 py-2 rounded-lg font-semibold ${numQuestions === num ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <input 
              type="number" 
              min="1" 
              max={maxQuestions} 
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.min(e.target.value, maxQuestions))}
              className="mt-4 w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="ml-2 text-sm text-gray-500">Custom (Max: {maxQuestions})</span>
          </div>

          {/* Question Filter */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Question Filter</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Mixed">Mixed (All Questions)</option>
              <option value="Used">Used Questions</option>
              <option value="Unused">Unused Questions</option>
              <option value="Correct">Correct Questions</option>
              <option value="Incorrect">Incorrect Questions</option>
              <option value="Favourite">Favourite Questions</option>
            </select>
          </div>

          {/* Timer Mode */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Timer Mode</label>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setTimerMode('Practice')}
                className={`px-4 py-2 rounded-lg font-semibold ${timerMode === 'Practice' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Practice Mode (No Timer)
              </button>
              <button 
                onClick={() => setTimerMode('Timed')}
                className={`px-4 py-2 rounded-lg font-semibold ${timerMode === 'Timed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Timed Mode
              </button>
            </div>
            
            {timerMode === 'Timed' && (
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
                <option value="120">120 Minutes</option>
              </select>
            )}
          </div>

          {/* Start Test Button */}
          <button 
            onClick={startTest}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Start Test
          </button>

        </div>
      </div>
    </div>
  );
}