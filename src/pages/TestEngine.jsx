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

// --- AI-STYLE ADVANCED AUTO-CATEGORIZATION ---
const getAdvancedAutoCategory = (q) => {
  const fullText = [
    q.chapter, q.subject, q.question, 
    q.optionA, q.optionB, q.optionC, q.optionD, 
    q.explanation, q.explanationA, q.explanationB, q.explanationC, q.explanationD, 
    q.summary
  ].join(' ').toLowerCase();

  const keywords = {
    'Physics': ['physic', 'force', 'velocity', 'energy', 'momentum', 'circuit', 'optics', 'wave', 'motion', 'gravity', 'friction', 'torque', 'magnet', 'electric', 'charge', 'mass', 'acceleration', 'lens', 'mirror', 'heat', 'temperature', 'quantum', 'nuclear', 'projectile', 'fluid', 'pressure', 'newton', 'einstein', 'volt', 'ampere', 'ohm', 'faraday', 'kinetic', 'potential', 'resistor', 'capacitor', 'inductor', 'mechanics', 'dynamics'],
    'Chemistry': ['chem', 'mole', 'bond', 'reaction', 'acid', 'organic', 'base', 'salt', 'atom', 'molecule', 'electron', 'proton', 'neutron', 'periodic', 'element', 'compound', 'oxidation', 'reduction', 'titration', 'catalyst', 'halogen', 'alkali', 'valency', 'isotope', 'entropy', 'enthalpy', 'ph', 'buffer', 'hydrocarbon', 'functional group'],
    'Biology': ['bio', 'cell', 'genetic', 'anatom', 'plant', 'organism', 'tissue', 'organ', 'blood', 'dna', 'rna', 'protein', 'enzyme', 'photosynthesis', 'respiration', 'ecosystem', 'evolution', 'bacteria', 'virus', 'mitosis', 'meiosis', 'membrane', 'nucleus', 'chromosome', 'taxonomy', 'physiology'],
    'English': ['english', 'tense', 'preposition', 'verb', 'grammar', 'sentence', 'noun', 'pronoun', 'adjective', 'adverb', 'punctuation', 'synonym', 'antonym', 'analogy', 'vocab', 'passive', 'active', 'clause', 'phrase', 'idiom', 'voice'],
    'Logical Reasoning': ['logical', 'deductive', 'inductive reasoning', 'syllogism', 'reasoning', 'argument', 'premise', 'conclusion', 'fallacy', 'assumption', 'deduce', 'infer', 'statement', 'truth value', 'conditional']
  };

  const scores = { 'Physics': 0, 'Chemistry': 0, 'Biology': 0, 'English': 0, 'Logical Reasoning': 0 };
  
  for (const [subject, words] of Object.entries(keywords)) {
    words.forEach(word => {
      const regex = new RegExp(word, 'g');
      const matches = fullText.match(regex);
      if (matches) scores[subject] += matches.length;
    });
  }

  let originalSubject = null;
  if (q.subject) {
    const sLower = q.subject.toLowerCase();
    if (sLower.includes('bio')) originalSubject = 'Biology';
    else if (sLower.includes('chem')) originalSubject = 'Chemistry';
    else if (sLower.includes('phys')) originalSubject = 'Physics';
    else if (sLower.includes('eng')) originalSubject = 'English';
    else if (sLower.includes('log') || sLower.includes('reason')) originalSubject = 'Logical Reasoning';
  }
  
  if (originalSubject) {
    scores[originalSubject] += 2;
  }

  let maxScore = 0;
  let bestCategory = originalSubject || 'Uncategorized';

  for (const [subject, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = subject;
    }
  }

  if (maxScore > 2) {
    return bestCategory;
  }
  
  return bestCategory;
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
      pool = pool.filter(q => getAdvancedAutoCategory(q) === paperSubject);
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
      <div className="min-h-screen aurora-bg p-8 text-center flex items-center justify-center relative overflow-hidden">
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-red-300">No questions found for this filter!</h1>
          <Link to={`/test-builder/${subjectName}/${chapterName}`} className="text-yellow-200 underline mt-4 inline-block">Go Back</Link>
        </div>
        <style>{`
          @keyframes auroraShift {
            0%   { background-position: 0% 30%; }
            50%  { background-position: 100% 70%; }
            100% { background-position: 0% 30%; }
          }
          .aurora-bg {
            background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%);
            background-size: 260% 260%;
            animation: auroraShift 16s ease-in-out infinite;
          }
          .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
          .aurora-blob.b1 { width: 320px; height: 320px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.5), transparent 70%); }
          .aurora-blob.b2 { width: 380px; height: 380px; top: 160px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.45), transparent 70%); }
        `}</style>
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
      return "aurora-opt";
    }
    if (option === currentQuestion.correctAnswer) {
      return "aurora-opt-correct"; 
    }
    if (option === selectedOption) {
      return "aurora-opt-wrong"; 
    }
    return "aurora-opt-disabled"; 
  };

  return (
    <div className="relative min-h-screen aurora-bg overflow-hidden p-3 md:p-6">
      {/* Glass Aurora theme — animated gradient + floating blurred color blobs */}
      <style>{`
        @keyframes auroraShift {
          0%   { background-position: 0% 30%; }
          50%  { background-position: 100% 70%; }
          100% { background-position: 0% 30%; }
        }
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,26px) scale(1.08); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-22px,18px) scale(0.94); } }
        @keyframes floatC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-20px) scale(1.05); } }
        .aurora-bg {
          background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%);
          background-size: 260% 260%;
          animation: auroraShift 16s ease-in-out infinite;
        }
        .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
        .aurora-blob.b1 { width: 320px; height: 320px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.5), transparent 70%); animation: floatA 13s ease-in-out infinite; }
        .aurora-blob.b2 { width: 380px; height: 380px; top: 160px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.45), transparent 70%); animation: floatB 17s ease-in-out infinite; }
        .aurora-blob.b3 { width: 340px; height: 340px; bottom: 40px; left: -100px; background: radial-gradient(circle, rgba(255,214,120,0.35), transparent 70%); animation: floatC 15s ease-in-out infinite; }
        .aurora-blob.b4 { width: 300px; height: 300px; bottom: -100px; right: -60px; background: radial-gradient(circle, rgba(151,255,214,0.35), transparent 70%); animation: floatA 19s ease-in-out infinite reverse; }
        .aurora-card {
          background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06));
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 12px 34px rgba(15,8,45,0.28), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .aurora-back {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          transition: background .2s ease, transform .2s ease;
        }
        .aurora-back:hover { background: rgba(255,255,255,0.22); transform: translateX(-2px); }
        .aurora-btn-danger {
          background: linear-gradient(135deg, #ff5f6d, #ff9966);
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 6px 18px rgba(255,95,109,0.35);
          transition: all .2s ease;
        }
        .aurora-btn-danger:hover { box-shadow: 0 8px 22px rgba(255,95,109,0.5); transform: translateY(-1px); }
        .aurora-progress { background: rgba(255,255,255,0.2); }
        .aurora-progress-fill { background: linear-gradient(90deg, #ffe9a8, #35e0c4); box-shadow: 0 0 12px rgba(255,233,168,0.5); }
        .aurora-opt {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          transition: all .2s ease;
        }
        .aurora-opt:hover { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.5); }
        .aurora-opt-correct {
          background: rgba(46, 204, 113, 0.25);
          border: 1px solid rgba(46, 204, 113, 0.7);
          color: #ffffff;
          font-weight: bold;
        }
        .aurora-opt-wrong {
          background: rgba(231, 76, 60, 0.25);
          border: 1px solid rgba(231, 76, 60, 0.7);
          color: #ffffff;
          font-weight: bold;
        }
        .aurora-opt-disabled {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
        }
        .aurora-exp-box {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-left: 4px solid #ffe9a8;
        }
        .aurora-exp-opt-correct { background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.3); }
        .aurora-exp-opt-wrong { background: rgba(231, 76, 60, 0.15); border: 1px solid rgba(231, 76, 60, 0.3); }
        .aurora-exp-summary { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); }
        .aurora-chip {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          transition: all .2s ease;
        }
        .aurora-chip:hover { background: rgba(255,255,255,0.22); }
        .aurora-btn {
          background: linear-gradient(135deg, #ffffff, #f1eaff);
          box-shadow: 0 6px 18px rgba(69,104,220,0.35);
          color: #3a1c71;
          transition: all .2s ease;
        }
        .aurora-btn:hover { box-shadow: 0 8px 22px rgba(69,104,220,0.5); transform: translateY(-1px); }
        .aurora-btn-start {
          background: linear-gradient(135deg, #0fb8ad, #35e0c4);
          color: #102a43;
          box-shadow: 0 6px 18px rgba(15,184,173,0.4);
          transition: all .2s ease;
        }
        .aurora-btn-start:hover { box-shadow: 0 8px 22px rgba(15,184,173,0.6); transform: translateY(-1px); }
      `}</style>

      {/* Floating aurora blobs (decorative, behind content) */}
      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="aurora-blob b4" />

      {/* Content sits above the blobs */}
      <div className="relative z-10 max-w-3xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleExitTest} className="aurora-back px-4 py-2 rounded-lg font-semibold text-sm">&larr; Exit Test</button>
          <button 
            onClick={handleEndTest}
            className="aurora-btn-danger px-4 py-2 rounded-lg font-semibold text-sm"
          >
            End Test
          </button>
        </div>

        <div className="w-full aurora-progress rounded-full h-2.5 mb-6">
          <div 
            className="aurora-progress-fill h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / testQuestions.length) * 100}%` }}
          ></div>
        </div>

        <div className="aurora-card rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-gray-300">
              Question {currentIndex + 1} of {testQuestions.length}
            </span>
            
            <button 
              onClick={() => toggleFavourite(currentQuestion.id)} 
              className={`${isFavourite(currentQuestion.id) ? 'text-yellow-300' : 'text-gray-400 hover:text-yellow-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavourite(currentQuestion.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
            {currentQuestion.question}
          </h1>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={!!selectedOption}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center ${getOptionClass(option)}`}
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mr-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  {option}
                </span>
                <span>{currentQuestion[`option${option}`]}</span>
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="aurora-exp-box mt-6 p-5 rounded-xl space-y-4">
              <div>
                <h3 className="font-bold text-yellow-200 mb-1">Explanation</h3>
                <p className="text-gray-200">{currentQuestion.explanation}</p>
              </div>
              
              <div className="border-t border-white/20 pt-3 space-y-3">
                <h4 className="font-semibold text-gray-300 text-sm">Option Breakdown:</h4>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className={`p-3 rounded-lg ${opt === currentQuestion.correctAnswer ? 'aurora-exp-opt-correct' : 'aurora-exp-opt-wrong'}`}>
                    <p className={`font-bold text-sm ${opt === currentQuestion.correctAnswer ? 'text-green-300' : 'text-red-300'}`}>
                      {opt}. {currentQuestion[`option${opt}`]} {opt === currentQuestion.correctAnswer ? '(Correct)' : ''}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {currentQuestion[`explanation${opt}`] || "No specific explanation provided for this option."}
                    </p>
                  </div>
                ))}
              </div>

              <div className="aurora-exp-summary p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-400">Summary:</p>
                <p className="text-sm text-gray-200">{currentQuestion.summary}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="aurora-chip px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>
          
          {currentIndex < testQuestions.length - 1 ? (
            <button 
              onClick={handleNext}
              className="aurora-btn px-6 py-3 rounded-lg font-semibold"
            >
              Next &rarr;
            </button>
          ) : (
            <button 
              onClick={handleEndTest}
              className="aurora-btn-start px-6 py-3 rounded-lg font-semibold"
            >
              Finish Test
            </button>
          )}
        </div>

      </div>
    </div>
  );
}