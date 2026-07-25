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

// --- BULLETPROOF AUTO-CATEGORIZATION LOGIC ---
const getAutoCategory = (q) => {
  const subjectField = (q.subject || q.category || '').toLowerCase();
  
  if (subjectField.includes('bio')) return 'Biology';
  if (subjectField.includes('chem')) return 'Chemistry';
  if (subjectField.includes('phys')) return 'Physics';
  if (subjectField.includes('eng')) return 'English';
  if (subjectField.includes('log') || subjectField.includes('reason')) return 'Logical Reasoning';
  
  const textToSearch = `${q.chapter || ''} ${q.question || ''} ${q.summary || ''}`.toLowerCase();
  
  const physicsKeywords = ['physic', 'force', 'velocity', 'energy', 'momentum', 'circuit', 'optics', 'wave', 'motion', 'gravity', 'friction', 'torque', 'magnet', 'electric', 'charge', 'mass', 'acceleration', 'lens', 'mirror', 'heat', 'temperature', 'quantum', 'nuclear', 'projectile', 'fluid', 'pressure', 'newton', 'einstein', 'volt', 'ampere', 'ohm', 'faraday', 'kinetic', 'potential', 'resistor', 'capacitor', 'inductor'];
  if (physicsKeywords.some(keyword => textToSearch.includes(keyword))) return 'Physics';
  
  const bioKeywords = ['bio', 'cell', 'genetic', 'anatom', 'plant', 'organism', 'tissue', 'organ', 'blood', 'dna', 'rna', 'protein', 'enzyme', 'photosynthesis', 'respiration', 'ecosystem', 'evolution', 'bacteria', 'virus', 'mitosis', 'meiosis'];
  if (bioKeywords.some(keyword => textToSearch.includes(keyword))) return 'Biology';
  
  const chemKeywords = ['chem', 'mole', 'bond', 'reaction', 'acid', 'organic', 'base', 'salt', 'atom', 'molecule', 'electron', 'proton', 'neutron', 'periodic', 'element', 'compound', 'oxidation', 'reduction', 'titration', 'catalyst', 'halogen', 'alkali'];
  if (chemKeywords.some(keyword => textToSearch.includes(keyword))) return 'Chemistry';
  
  const engKeywords = ['english', 'tense', 'preposition', 'verb', 'grammar', 'sentence', 'noun', 'pronoun', 'adjective', 'adverb', 'punctuation', 'synonym', 'antonym', 'analogy', 'vocab', 'passive', 'active'];
  if (engKeywords.some(keyword => textToSearch.includes(keyword))) return 'English';
  
  const lrKeywords = ['logical', 'deductive', 'inductive reasoning', 'syllogism', 'reasoning', 'argument', 'premise', 'conclusion', 'fallacy', 'assumption'];
  if (lrKeywords.some(keyword => textToSearch.includes(keyword))) return 'Logical Reasoning';
  
  return 'Uncategorized';
};

export default function TestEngine() {
  const { subjectName, chapterName, numQuestions } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { progress, recordAnswer, toggleFavourite, isFavourite } = useProgress();

  const filter = location.state?.filter || 'Unused';
  const paperSubject = location.state?.paperSubject || 'All';
  const selectedTopic = location.state?.selectedTopic || chapterName;

  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === selectedTopic);
  
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [showExplanation, setShowExplanation] = useState(false); 

  useEffect(() => {
    const savedTest = localStorage.getItem('ak_academy_active_test');
    if (savedTest) {
      const parsed = JSON.parse(savedTest);
      if (parsed.subjectName === subjectName && parsed.chapterName === chapterName && parsed.numQuestions === numQuestions && parsed.paperSubject === paperSubject && parsed.filter === filter) {
        setTestQuestions(parsed.testQuestions);
        setCurrentIndex(parsed.currentIndex);
        setUserAnswers(parsed.userAnswers);
        setShowExplanation(!!parsed.userAnswers[parsed.testQuestions[parsed.currentIndex]?.id]);
        return;
      }
    }

    let pool = [];
    if (selectedTopic === 'All') {
      pool = subject ? subject.chapters.flatMap(c => c.questions) : [];
    } else {
      pool = chapter ? [...chapter.questions] : [];
    }
    
    if (paperSubject !== 'All') {
      pool = pool.filter(q => getAutoCategory(q) === paperSubject);
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

    setTestQuestions(shuffleArray(pool).slice(0, parseInt(numQuestions) || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (testQuestions.length > 0) {
      localStorage.setItem('ak_academy_active_test', JSON.stringify({
        subjectName, chapterName, numQuestions, paperSubject, filter, testQuestions, currentIndex, userAnswers
      }));
    }
  }, [testQuestions, currentIndex, userAnswers, subjectName, chapterName, numQuestions, paperSubject, filter]);

  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-blue-900 p-8 text-center flex items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold text-red-400">No questions found for this filter!</h1>
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
    navigate('/results', { replace: true, state: { testQuestions, userAnswers, subjectName, chapterName } });
  };

  const handleExitTest = () => {
    localStorage.removeItem('ak_academy_active_test');
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavourite(currentQuestion.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 leading-relaxed">
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