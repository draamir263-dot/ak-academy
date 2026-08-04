import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';

const shuffleArray = (array) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ---------------------------------------------------------------------------
// SUBJECT RESOLVER — matches TestBuilder logic exactly
// ---------------------------------------------------------------------------
// questionLoader overwrites q.subject with the folder-level name (e.g.
// "Past-papers") and stores the question's REAL academic subject in q.category.
// So q.category must be checked FIRST; q.subject is the folder name and means
// nothing about the academic subject.
//
// This resolver is used for subject-based filtering in mixed papers.
// It does NOT attempt to re-classify questions — it trusts the explicit data.
const resolveSubject = (q) => {
  // 1. q.category = the question's real academic subject (set by questionLoader)
  const cat = (q.category && q.category.toString().trim() !== '')
    ? q.category.toString().trim()
    : '';

  if (cat) {
    const c = cat.toLowerCase();
    if (c.includes('bio'))     return 'Biology';
    if (c.includes('chem'))    return 'Chemistry';
    if (c.includes('phys'))    return 'Physics';
    if (c.includes('eng'))     return 'English';
    if (c.includes('log') || c.includes('reason')) return 'Logical Reasoning';
    return cat; // non-standard subject, return as-is
  }

  // 2. No category at all — last-resort text scan (same keywords as TestBuilder)
  const text = `${q.question} ${q.optionA} ${q.optionB} ${q.optionC} ${q.optionD} ${q.explanation}`.toLowerCase();

  if (text.includes('photosynthesis') || text.includes('mitosis') || text.includes('dna') || text.includes('rna') || text.includes('enzyme') || text.includes('bacteria') || text.includes('virus') || text.includes('ecosystem')) return 'Biology';
  if (text.includes('periodic') || text.includes('mole') || text.includes('oxidation') || text.includes('alkane') || text.includes('titration') || text.includes('catalyst')) return 'Chemistry';
  if (text.includes('velocity') || text.includes('momentum') || text.includes('newton') || text.includes('circuit') || text.includes('kinematics') || text.includes('projectile')) return 'Physics';
  if (text.includes('tense') || text.includes('preposition') || text.includes('synonym') || text.includes('grammar') || text.includes('antonym')) return 'English';
  if (text.includes('syllogism') || text.includes('deductive') || text.includes('logical') || text.includes('premise')) return 'Logical Reasoning';

  return 'Uncategorized';
};

// ---------------------------------------------------------------------------
// RESOLVED SUBJECT CACHE — avoid re-scanning on every filter check
// Maps question ID → resolved subject (memoized inside useEffect)
// ---------------------------------------------------------------------------
let subjectCache = new Map();

const getCachedSubject = (q) => {
  if (subjectCache.has(q.id)) return subjectCache.get(q.id);
  const resolved = resolveSubject(q);
  subjectCache.set(q.id, resolved);
  return resolved;
};

export default function TestEngine() {
  const { subjectName, chapterName, numQuestions } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { progress, recordAnswer, toggleFavourite, isFavourite } = useProgress();

  // FIX: Default filter is 'Mixed' (matching TestBuilder), NOT 'Unused'
  const filter = location.state?.filter || 'Mixed';
  const paperSubject = location.state?.paperSubject || 'All';
  // FIX: Now actually using the difficulty from TestBuilder
  const difficulty = location.state?.difficulty || 'All';

  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === chapterName);
  
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [showExplanation, setShowExplanation] = useState(false); 

  useEffect(() => {
    // Try to restore a saved test session first
    const savedTest = localStorage.getItem('ak_academy_active_test');
    if (savedTest) {
      const parsed = JSON.parse(savedTest);
      if (
        parsed.subjectName === subjectName &&
        parsed.chapterName === chapterName &&
        parsed.numQuestions === numQuestions &&
        parsed.paperSubject === paperSubject &&
        parsed.filter === filter &&
        parsed.difficulty === difficulty
      ) {
        setTestQuestions(parsed.testQuestions);
        setCurrentIndex(parsed.currentIndex);
        setUserAnswers(parsed.userAnswers);
        setShowExplanation(!!parsed.userAnswers[parsed.testQuestions[parsed.currentIndex]?.id]);
        // Rebuild subject cache from saved questions
        parsed.testQuestions.forEach(q => subjectCache.set(q.id, resolveSubject(q)));
        return;
      }
    }

    // --- BUILD QUESTION POOL ---
    let pool = chapter ? [...chapter.questions] : [];

    // 1. Subject filter — uses q.category (the real academic subject), NOT q.subject
    if (paperSubject !== 'All') {
      pool = pool.filter(q => getCachedSubject(q) === paperSubject);
    }

    // 2. Difficulty filter — was completely missing before!
    if (difficulty !== 'All') {
      pool = pool.filter(q => {
        if (!q.difficulty) return false;
        return q.difficulty.toLowerCase() === difficulty.toLowerCase();
      });
    }

    // 3. Usage / accuracy filter
    if (filter === 'Used') {
      pool = pool.filter(q => progress.used.includes(q.id));
    } else if (filter === 'Unused') {
      pool = pool.filter(q => !progress.used.includes(q.id));
    } else if (filter === 'Correct') {
      pool = pool.filter(q => progress.correct.includes(q.id));
    } else if (filter === 'Incorrect') {
      pool = pool.filter(q => progress.incorrect.includes(q.id));
    } else if (filter === 'Favourite') {
      pool = pool.filter(q => progress.favourites.includes(q.id));
    }
    // filter === 'Mixed' → no filtering needed, keep all

    // Shuffle and slice to the requested number
    const finalPool = shuffleArray(pool).slice(0, parseInt(numQuestions) || 0);

    // Pre-build the subject cache for all selected questions
    finalPool.forEach(q => subjectCache.set(q.id, resolveSubject(q)));

    setTestQuestions(finalPool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save test progress to localStorage
  useEffect(() => {
    if (testQuestions.length > 0) {
      localStorage.setItem('ak_academy_active_test', JSON.stringify({
        subjectName, chapterName, numQuestions, paperSubject, filter, difficulty,
        testQuestions, currentIndex, userAnswers
      }));
    }
  }, [testQuestions, currentIndex, userAnswers, subjectName, chapterName, numQuestions, paperSubject, filter, difficulty]);

  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-blue-900 p-8 text-center flex items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold text-red-400">No questions found for this filter!</h1>
          <p className="text-blue-200 mt-2">
            {paperSubject !== 'All' && `Subject filter: ${paperSubject} | `}
            {difficulty !== 'All' && `Difficulty: ${difficulty} | `}
            Filter: {filter}
          </p>
          <Link to={`/test-builder/${subjectName}/${chapterName}`} className="text-yellow-400 underline mt-4 inline-block">Go Back</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentIndex];
  const selectedOption = userAnswers[currentQuestion.id];

  const handleSelectOption = (option) => {
    if (selectedOption) return; 

    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: option
    });
    setShowExplanation(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    recordAnswer(currentQuestion.id, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(!!userAnswers[testQuestions[currentIndex + 1].id]); 
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(!!userAnswers[testQuestions[currentIndex - 1].id]); 
    }
  };

  const handleEndTest = () => {
    localStorage.removeItem('ak_academy_active_test');
    subjectCache.clear(); // Clear cache when test ends
    navigate('/results', { replace: true, state: { testQuestions, userAnswers, subjectName, chapterName } });
  };

  const handleExitTest = () => {
    localStorage.removeItem('ak_academy_active_test');
    subjectCache.clear();
    navigate(`/test-builder/${subjectName}/${chapterName}`, { replace: true });
  };

  const getOptionClass = (option) => {
    if (!selectedOption) {
      return "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800";
    }
    if (option === currentQuestion.correctAnswer) {
      return "bg-green-50 border-green-500 text-green-800 font-semibold"; 
    }
    if (option === selectedOption) {
      return "bg-red-50 border-red-500 text-red-800 font-semibold"; 
    }
    return "bg-white border-gray-200 text-gray-400 opacity-60"; 
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleExitTest} className="text-yellow-400 text-sm font-medium">&larr; Exit Test</button>
          <button 
            onClick={handleEndTest}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 text-sm"
          >
            End Test
          </button>
        </div>

        <div className="w-full bg-blue-700 rounded-full h-2.5 mb-6">
          <div 
            className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / testQuestions.length) * 100}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-800 p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-gray-400">
              Question {currentIndex + 1} of {testQuestions.length}
            </span>
            
            <button 
              onClick={() => toggleFavourite(currentQuestion.id)} 
              className={`${isFavourite(currentQuestion.id) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavourite(currentQuestion.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>

          <h1 className="text-base md:text-lg font-bold text-blue-900 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h1>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={!!selectedOption}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ${getOptionClass(option)}`}
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold mr-4">
                  {option}
                </span>
                <span>{currentQuestion[`option${option}`]}</span>
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="mt-6 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl space-y-4">
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Explanation</h3>
                <p className="text-gray-700">{currentQuestion.explanation}</p>
              </div>
              
              <div className="border-t border-blue-200 pt-3 space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm">Option Breakdown:</h4>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className={`p-3 rounded-lg ${opt === currentQuestion.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`font-bold text-sm ${opt === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                      {opt}. {currentQuestion[`option${opt}`]} {opt === currentQuestion.correctAnswer ? '(Correct)' : ''}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {currentQuestion[`explanation${opt}`] || "No specific explanation provided for this option."}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-500">Summary:</p>
                <p className="text-sm text-gray-700">{currentQuestion.summary}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>
          
          {currentIndex < testQuestions.length - 1 ? (
            <button 
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Next &rarr;
            </button>
          ) : (
            <button 
              onClick={handleEndTest}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Finish Test
            </button>
          )}
        </div>

      </div>
    </div>
  );
}