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

const resolveSubject = (q) => {
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
    return cat;
  }

  const text = `${q.question} ${q.optionA} ${q.optionB} ${q.optionC} ${q.optionD} ${q.explanation}`.toLowerCase();

  if (text.includes('photosynthesis') || text.includes('mitosis') || text.includes('dna') || text.includes('rna') || text.includes('enzyme') || text.includes('bacteria') || text.includes('virus') || text.includes('ecosystem')) return 'Biology';
  if (text.includes('periodic') || text.includes('mole') || text.includes('oxidation') || text.includes('alkane') || text.includes('titration') || text.includes('catalyst')) return 'Chemistry';
  if (text.includes('velocity') || text.includes('momentum') || text.includes('newton') || text.includes('circuit') || text.includes('kinematics') || text.includes('projectile')) return 'Physics';
  if (text.includes('tense') || text.includes('preposition') || text.includes('synonym') || text.includes('grammar') || text.includes('antonym')) return 'English';
  if (text.includes('syllogism') || text.includes('deductive') || text.includes('logical') || text.includes('premise')) return 'Logical Reasoning';

  return 'Uncategorized';
};

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

  const filter = location.state?.filter || 'Mixed';
  const paperSubject = location.state?.paperSubject || 'All';
  const difficulty = location.state?.difficulty || 'All';
  const selectedOriginalChapters = location.state?.selectedOriginalChapters || null;

  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === chapterName);
  
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [showExplanation, setShowExplanation] = useState(false); 

  useEffect(() => {
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
        parsed.testQuestions.forEach(q => subjectCache.set(q.id, resolveSubject(q)));
        return;
      }
    }

    let pool = chapter ? [...chapter.questions] : [];

    if (selectedOriginalChapters && selectedOriginalChapters.length > 0) {
      pool = pool.filter(q => selectedOriginalChapters.includes(q.originalChapter));
    }

    if (paperSubject !== 'All') {
      pool = pool.filter(q => getCachedSubject(q) === paperSubject);
    }

    if (difficulty !== 'All') {
      pool = pool.filter(q => {
        if (!q.difficulty) return false;
        return q.difficulty.toLowerCase() === difficulty.toLowerCase();
      });
    }

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

    const finalPool = shuffleArray(pool).slice(0, parseInt(numQuestions) || 0);

    finalPool.forEach(q => subjectCache.set(q.id, resolveSubject(q)));

    setTestQuestions(finalPool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="min-h-screen bg-slate-50 p-8 text-center flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md">
          <h1 className="text-xl font-bold text-slate-800 mb-2">No questions found for this filter!</h1>
          <p className="text-slate-500 text-sm mt-2 mb-4">
            {selectedOriginalChapters ? `${selectedOriginalChapters.length} chapters selected | ` : ''}
            {paperSubject !== 'All' && `Subject: ${paperSubject} | `}
            {difficulty !== 'All' && `Difficulty: ${difficulty} | `}
            Filter: {filter}
          </p>
          <Link to={`/test-builder/${subjectName}/${chapterName}`} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 inline-block">
            Go Back
          </Link>
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
    subjectCache.clear();
    navigate('/results', { replace: true, state: { testQuestions, userAnswers, subjectName, chapterName } });
  };

  const handleExitTest = () => {
    localStorage.removeItem('ak_academy_active_test');
    subjectCache.clear();
    navigate(`/test-builder/${subjectName}/${chapterName}`, { replace: true });
  };

  const getOptionClass = (option) => {
    if (!selectedOption) {
      return "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-800";
    }
    if (option === currentQuestion.correctAnswer) {
      return "bg-green-50 border-green-500 text-green-800 font-semibold"; 
    }
    if (option === selectedOption) {
      return "bg-red-50 border-red-500 text-red-800 font-semibold"; 
    }
    return "bg-white border-slate-200 text-slate-400 opacity-70"; 
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Sticky Top Header */}
      <div className="sticky top-0 bg-white z-10 shadow-sm border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <button onClick={handleExitTest} className="text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          
          {/* Chapter Name Title */}
          <h1 className="font-bold text-slate-800 text-sm sm:text-base truncate flex-1 text-center">
            {chapterName}
          </h1>
          
          {/* End Test Button */}
          <button 
            onClick={handleEndTest}
            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100 flex-shrink-0"
          >
            End Test
          </button>
        </div>
        
        {/* Progress Bar & Counter */}
        <div className="max-w-3xl mx-auto px-4 pb-2 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {currentIndex + 1} / {testQuestions.length}
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${((currentIndex + 1) / testQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6">
        
        {/* MCQ Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 relative">
          
          {/* Favorite Button - Top Right Corner inside the box */}
          <button 
            onClick={() => toggleFavourite(currentQuestion.id)} 
            className={`absolute top-5 right-5 md:top-7 md:right-7 ${isFavourite(currentQuestion.id) ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400'} transition-colors z-10`}
            title="Mark as Favorite"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavourite(currentQuestion.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </button>

          <div className="mb-6 pr-10"> {/* Added pr-10 to prevent question text from overlapping the icon */}
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">
              Question {currentIndex + 1}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mt-3 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={!!selectedOption}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${getOptionClass(option)}`}
              >
                <div className="flex items-center">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold mr-4 transition-colors ${
                    selectedOption && option === currentQuestion.correctAnswer ? 'bg-green-500 text-white' :
                    selectedOption && option === selectedOption ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {option}
                  </span>
                  <span className="text-sm md:text-base">{currentQuestion[`option${option}`]}</span>
                </div>

                {/* Checkmark & Cross Icons */}
                {selectedOption && option === currentQuestion.correctAnswer && (
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
                {selectedOption && option === selectedOption && option !== currentQuestion.correctAnswer && (
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </button>
            ))}
          </div>

          {/* Explanation Section */}
          {showExplanation && (
            <div className="mt-6 space-y-4">
              <div className="p-5 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="font-bold text-indigo-900">Explanation</h3>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{currentQuestion.explanation}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 text-sm px-1">Option Breakdown:</h4>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className={`p-3 rounded-xl border ${opt === currentQuestion.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`font-bold text-sm ${opt === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                        Option {opt}: {currentQuestion[`option${opt}`]}
                      </p>
                      {opt === currentQuestion.correctAnswer ? (
                         <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Correct</span>
                      ) : (
                         <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">Incorrect</span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-1.5 leading-relaxed pl-1">
                      {currentQuestion[`explanation${opt}`] || "No specific explanation provided for this option."}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Summary</p>
                <p className="text-sm text-slate-700">{currentQuestion.summary}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Previous
          </button>
          
          {currentIndex < testQuestions.length - 1 ? (
            <button 
              onClick={handleNext}
              className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <button 
              onClick={handleEndTest}
              className="flex-1 bg-green-500 text-white py-3.5 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-500/20"
            >
              Finish Test
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}