import { useParams, Link, useNavigate } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';

// --- AI-STYLE ADVANCED AUTO-CATEGORIZATION ---
const getAdvancedAutoCategory = (q) => {
  // 1. Gather ALL text from the MCQ to analyze
  const fullText = [
    q.chapter, q.subject, q.question, 
    q.optionA, q.optionB, q.optionC, q.optionD, 
    q.explanation, q.explanationA, q.explanationB, q.explanationC, q.explanationD, 
    q.summary
  ].join(' ').toLowerCase();

  // 2. Define comprehensive keyword lists for each subject
  const keywords = {
    'Physics': ['physic', 'force', 'velocity', 'energy', 'momentum', 'circuit', 'optics', 'wave', 'motion', 'gravity', 'friction', 'torque', 'magnet', 'electric', 'charge', 'mass', 'acceleration', 'lens', 'mirror', 'heat', 'temperature', 'quantum', 'nuclear', 'projectile', 'fluid', 'pressure', 'newton', 'einstein', 'volt', 'ampere', 'ohm', 'faraday', 'kinetic', 'potential', 'resistor', 'capacitor', 'inductor', 'mechanics', 'dynamics'],
    'Chemistry': ['chem', 'mole', 'bond', 'reaction', 'acid', 'organic', 'base', 'salt', 'atom', 'molecule', 'electron', 'proton', 'neutron', 'periodic', 'element', 'compound', 'oxidation', 'reduction', 'titration', 'catalyst', 'halogen', 'alkali', 'valency', 'isotope', 'entropy', 'enthalpy', 'ph', 'buffer', 'hydrocarbon', 'functional group'],
    'Biology': ['bio', 'cell', 'genetic', 'anatom', 'plant', 'organism', 'tissue', 'organ', 'blood', 'dna', 'rna', 'protein', 'enzyme', 'photosynthesis', 'respiration', 'ecosystem', 'evolution', 'bacteria', 'virus', 'mitosis', 'meiosis', 'membrane', 'nucleus', 'chromosome', 'taxonomy', 'physiology'],
    'English': ['english', 'tense', 'preposition', 'verb', 'grammar', 'sentence', 'noun', 'pronoun', 'adjective', 'adverb', 'punctuation', 'synonym', 'antonym', 'analogy', 'vocab', 'passive', 'active', 'clause', 'phrase', 'idiom', 'voice'],
    'Logical Reasoning': ['logical', 'deductive', 'inductive reasoning', 'syllogism', 'reasoning', 'argument', 'premise', 'conclusion', 'fallacy', 'assumption', 'deduce', 'infer', 'statement', 'truth value', 'conditional']
  };

  // 3. Calculate a score for each subject based on keyword frequency
  const scores = { 'Physics': 0, 'Chemistry': 0, 'Biology': 0, 'English': 0, 'Logical Reasoning': 0 };
  
  for (const [subject, words] of Object.entries(keywords)) {
    words.forEach(word => {
      // Count how many times the word appears
      const regex = new RegExp(word, 'g');
      const matches = fullText.match(regex);
      if (matches) scores[subject] += matches.length;
    });
  }

  // 4. Respect the original JSON subject, but only as a 2-point baseline
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
    scores[originalSubject] += 2; // Baseline advantage for the JSON tag
  }

  // 5. Find the subject with the highest score
  let maxScore = 0;
  let bestCategory = originalSubject || 'Uncategorized';

  for (const [subject, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = subject;
    }
  }

  // If the text has strong evidence (score > 2), it overrides the JSON subject
  if (maxScore > 2) {
    return bestCategory;
  }
  
  return bestCategory;
};

export default function TestBuilder() {
  const { subjectName, chapterName } = useParams();
  const navigate = useNavigate();
  const { progress } = useProgress();
  
  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === chapterName);

  const [numQuestions, setNumQuestions] = useState(10);
  const [filter, setFilter] = useState('Unused');
  const [timerMode, setTimerMode] = useState('Practice');
  const [paperSubject, setPaperSubject] = useState('All'); 

  const isPastPaper = subjectName?.toLowerCase().includes('past');

  const calculateMaxQuestions = () => {
    if (!chapter || !chapter.questions) return 0;
    return chapter.questions.filter(q => {
      if (paperSubject !== 'All') {
        const qCategory = getAdvancedAutoCategory(q);
        if (qCategory !== paperSubject) return false; 
      }
      
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
    if (maxQuestions === 0) {
      setNumQuestions(0);
    } else if (numQuestions > maxQuestions || numQuestions === 0) {
      setNumQuestions(maxQuestions);
    }
  }, [filter, maxQuestions, paperSubject, numQuestions]);

  useEffect(() => {
    if (!isPastPaper) {
      setPaperSubject('All');
    }
  }, [isPastPaper]);

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
          <p className="text-lg text-blue-300 mt-2">{chapter.questions?.length || 0} Total MCQs in Chapter</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-800 p-8 space-y-8">
          
          {isPastPaper && (
            <div>
              <label className="block text-lg font-bold text-blue-900 mb-3">Subject Category (Smart AI Detection)</label>
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
          )}

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