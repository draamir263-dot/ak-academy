import { useParams, Link, useNavigate } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';

export default function TestBuilder() {
  const { subjectName, chapterName } = useParams();
  const navigate = useNavigate();
  const { progress } = useProgress();
  
  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === chapterName);

  const [numQuestions, setNumQuestions] = useState(10);
  const [filter, setFilter] = useState('Unused');
  const [timerMode, setTimerMode] = useState('Practice');
  const [paperSubject, setPaperSubject] = useState('All'); // NEW: Subject Category state

  const calculateMaxQuestions = () => {
    if (!chapter) return 0;
    return chapter.questions.filter(q => {
      if (paperSubject !== 'All' && q.category !== paperSubject) return false; // NEW: Filter by category
      
      if (filter === 'Mixed') return true;
      if (filter === 'Used') return progress.used.includes(q.id);
      if (filter === 'Unused') return !progress.used.includes(q.id);
      if (filter === 'Correct') return progress.correct.includes(q.id);
      if (filter === 'Incorrect') return progress.incorrect.includes(q.id);
      if (filter === 'Favourite') return progress.favourites.includes(q.id);
      return true;
    }).length;
  };

  const maxQuestions = calculateMaxQuestions();

  useEffect(() => {
    if (numQuestions > maxQuestions) {
      setNumQuestions(maxQuestions > 0 ? maxQuestions : 1);
    }
  }, [filter, maxQuestions, paperSubject]);

  const handleNumQuestionsClick = (num) => {
    setNumQuestions(Math.min(num, maxQuestions));
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    if (val === '') setNumQuestions('');
    else setNumQuestions(Math.min(parseInt(val), maxQuestions));
  };

  const startTest = () => {
    if (maxQuestions === 0) return;
    navigate(`/test-engine/${subjectName}/${chapterName}/${numQuestions}`, { state: { filter, paperSubject } });
  };

  if (!chapter) {
    return (
      <div className="min-h-screen bg-blue-900 p-8 text-center flex items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold text-red-400">Chapter not found!</h1>
          <Link to="/" className="text-yellow-400 underline mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/subject/${subjectName}`} className="text-yellow-400 mb-6 inline-block">&larr; Back to {subjectName}</Link>
        
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white">{chapter.name}</h1>
          <p className="text-lg text-blue-300 mt-2">{chapter.totalMcqs} Total MCQs in Chapter</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-800 p-8 space-y-8">
          
          {/* NEW: Subject Category Filter */}
          <div>
            <label className="block text-lg font-bold text-blue-900 mb-3">Subject Category</label>
            <select 
              value={paperSubject}
              onChange={(e) => setPaperSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-900 font-semibold"
            >
              <option value="All">All Subjects (Full Paper)</option>
              <option value="Biology">Biology Only</option>
              <option value="Chemistry">Chemistry Only</option>
              <option value="Physics">Physics Only</option>
              <option value="English">English Only</option>
              <option value="Logical Reasoning">Logical Reasoning Only</option>
            </select>
          </div>

          {/* Question Filter */}
          <div>
            <label className="block text-lg font-bold text-blue-900 mb-3">Question Filter</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-900 font-semibold"
            >
              <option value="Mixed">Mixed (All Questions)</option>
              <option value="Unused">Unused Questions (Default)</option>
              <option value="Used">Used Questions</option>
              <option value="Correct">Correct Questions</option>
              <option value="Incorrect">Incorrect Questions</option>
              <option value="Favourite">Favourite Questions</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-lg font-bold text-blue-900 mb-3">
              Number of Questions
              <span className="ml-2 text-sm font-medium text-gray-500">({maxQuestions} available for this filter)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 50, 75, 100].map(num => (
                <button 
                  key={num}
                  onClick={() => handleNumQuestionsClick(num)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    numQuestions === num ? 'bg-blue-600 text-white' : 
                    num > maxQuestions ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={num > maxQuestions}
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
              onChange={handleCustomInputChange}
              className="mt-4 w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-900 font-bold"
            />
            <span className="ml-2 text-sm text-gray-500">Custom (Max: {maxQuestions})</span>
          </div>

          {/* Timer Mode */}
          <div>
            <label className="block text-lg font-bold text-blue-900 mb-3">Timer Mode</label>
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
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-900 font-semibold">
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
          {maxQuestions === 0 ? (
            <div className="w-full bg-red-100 text-red-700 py-4 rounded-xl font-bold text-lg text-center border border-red-200">
              No questions match this filter yet!
            </div>
          ) : (
            <button 
              onClick={startTest}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Start Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}