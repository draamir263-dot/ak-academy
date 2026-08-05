import { useParams, Link, useNavigate } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useState, useEffect, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';

const getQuestionSubjectFromText = (q) => {
  const text = `${q.question} ${q.optionA} ${q.optionB} ${q.optionC} ${q.optionD} ${q.explanation}`.toLowerCase();
  if (text.includes('photosynthesis') || text.includes('mitosis') || text.includes('dna') || text.includes('rna') || text.includes('enzyme') || text.includes('bacteria') || text.includes('virus') || text.includes('ecosystem')) return 'Biology';
  if (text.includes('periodic') || text.includes('mole') || text.includes('oxidation') || text.includes('alkane') || text.includes('titration') || text.includes('catalyst')) return 'Chemistry';
  if (text.includes('velocity') || text.includes('momentum') || text.includes('newton') || text.includes('circuit') || text.includes('kinematics') || text.includes('projectile')) return 'Physics';
  if (text.includes('tense') || text.includes('preposition') || text.includes('synonym') || text.includes('grammar') || text.includes('antonym')) return 'English';
  if (text.includes('syllogism') || text.includes('deductive') || text.includes('logical') || text.includes('premise')) return 'Logical Reasoning';
  return 'Uncategorized';
};

const getQuestionSubject = (q) => {
  const cat = (q.category && q.category.toString().trim() !== '') ? q.category.toString().trim() : '';
  if (cat) {
    const c = cat.toLowerCase();
    if (c.includes('bio'))     return 'Biology';
    if (c.includes('chem'))    return 'Chemistry';
    if (c.includes('phys'))    return 'Physics';
    if (c.includes('eng'))     return 'English';
    if (c.includes('log') || c.includes('reason')) return 'Logical Reasoning';
    return cat;
  }
  return getQuestionSubjectFromText(q);
};

const findSubject = (name) => {
  if (!name) return null;
  let found = structuredData.find(s => s.name === name);
  if (found) return found;
  found = structuredData.find(s => s.name === decodeURIComponent(name));
  if (found) return found;
  found = structuredData.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  found = structuredData.find(s => decodeURIComponent(s.name).toLowerCase() === decodeURIComponent(name).toLowerCase());
  if (found) return found;
  found = structuredData.find(s => s.name.trim().toLowerCase() === name.trim().toLowerCase());
  return found;
};

const findChapter = (subject, name) => {
  if (!subject || !subject.chapters || !name) return null;
  let found = subject.chapters.find(c => c.name === name);
  if (found) return found;
  found = subject.chapters.find(c => c.name === decodeURIComponent(name));
  if (found) return found;
  found = subject.chapters.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  found = subject.chapters.find(c => decodeURIComponent(c.name).toLowerCase() === decodeURIComponent(name).toLowerCase());
  if (found) return found;
  found = subject.chapters.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
  return found;
};

export default function TestBuilder() {
  const { subjectName, chapterName } = useParams();
  const navigate = useNavigate();
  const { progress } = useProgress();
  
  const subject = findSubject(subjectName);
  const chapter = findChapter(subject, chapterName);

  const [numQuestions, setNumQuestions] = useState(10);
  const [filter, setFilter] = useState('Mixed');
  const [timerMode, setTimerMode] = useState('Practice');
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [paperSubject, setPaperSubject] = useState('All'); 
  const [difficulty, setDifficulty] = useState('All');
  const [chapterFilter, setChapterFilter] = useState('All Chapters');

  const CORE_SUBJECTS = ['biology', 'chemistry', 'physics', 'english', 'logical reasoning'];
  const isSpecialPaper = !CORE_SUBJECTS.some(core => subjectName?.toLowerCase().trim() === core);

  const questionSubjects = useMemo(() => {
    if (!chapter?.questions) return [];
    return chapter.questions.map(getQuestionSubject);
  }, [chapter]);

  const availableSubjects = useMemo(() => {
    const set = new Set(questionSubjects);
    set.delete('Uncategorized');
    return ['All', ...Array.from(set).sort()];
  }, [questionSubjects]);

  const availableChapters = useMemo(() => {
    if (!chapter?.questions) return [];
    const chapters = new Set();
    chapter.questions.forEach((q, idx) => {
      if (paperSubject !== 'All') {
        const qSubject = questionSubjects[idx];
        if (qSubject !== paperSubject) return;
      }
      if (q.originalChapter) chapters.add(q.originalChapter);
    });
    return ['All Chapters', ...Array.from(chapters).sort()];
  }, [chapter, paperSubject, questionSubjects]);

  const hasMultipleChapters = availableChapters.length > 2;

  useEffect(() => {
    setChapterFilter('All Chapters');
  }, [paperSubject]);

  const calculateMaxQuestions = () => {
    if (!chapter || !chapter.questions) return 0;
    return chapter.questions.filter((q, idx) => {
      if (hasMultipleChapters && chapterFilter !== 'All Chapters') {
        if (q.originalChapter !== chapterFilter) return false;
      }
      if (paperSubject !== 'All') {
        const qSubject = questionSubjects[idx];
        if (qSubject !== paperSubject) return false;
      }
      if (difficulty !== 'All') {
        if (!q.difficulty || q.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
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
  }, [filter, maxQuestions, paperSubject, numQuestions, difficulty, chapterFilter]);

  useEffect(() => {
    if (!isSpecialPaper) setPaperSubject('All');
  }, [isSpecialPaper]);

  const handleNumQuestionsClick = (num) => {
    setNumQuestions(Math.min(num, maxQuestions));
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    if (val === '') { setNumQuestions(''); return; }
    const num = parseInt(val, 10);
    if (isNaN(num)) { setNumQuestions(''); }
    else { setNumQuestions(Math.min(Math.max(1, num), maxQuestions)); }
  };

  const handleCustomTimeChange = (e) => {
    const val = e.target.value;
    if (val === '') { setTimerMinutes(''); return; }
    const num = parseInt(val, 10);
    if (isNaN(num)) { setTimerMinutes(''); }
    else { setTimerMinutes(Math.max(1, num)); }
  };

  const startTest = () => {
    if (maxQuestions === 0 || !numQuestions || numQuestions < 1) return;
    const selectedChapters = (hasMultipleChapters && chapterFilter !== 'All Chapters') 
      ? [chapterFilter] 
      : null;

    navigate(`/test-engine/${encodeURIComponent(subjectName)}/${encodeURIComponent(chapterName)}/${numQuestions}`, {
      state: {
        filter,
        paperSubject,
        difficulty,
        selectedOriginalChapters: selectedChapters,
        timerMode,
        timerMinutes: timerMode === 'Timed' ? timerMinutes : null
      }
    });
  };

  if (!subject || !chapter) {
    const debugInfo = subject 
      ? `Chapters available: ${subject.chapters.map(c => `"${c.name}"`).join(', ')}`
      : `Subjects available: ${structuredData.map(s => `"${s.name}"`).join(', ')}`;
    
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center flex items-center justify-center text-white">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Chapter not found!</h1>
          <p className="text-slate-400 text-sm mb-2">Looking for: {subjectName} / {chapterName}</p>
          <p className="text-slate-500 text-xs mb-6 break-all">{debugInfo}</p>
          <Link to="/" className="text-indigo-400 underline inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      
      <div className="max-w-3xl mx-auto">
        <Link to={`/subject/${encodeURIComponent(subject.name)}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to {subject.name}
        </Link>
        
        {/* Header Section matching the image */}
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Build Your Perfect Test
            </h1>
            <p className="text-base md:text-lg font-medium mt-3 text-slate-400">
              Customize your test and start practicing smartly.
            </p>
            <p className="text-lg font-semibold italic mt-4 text-indigo-400">
              ✦ {chapter.questions?.length || 0} Total MCQs in {chapter.name} ✦
            </p>
          </div>
          
          {/* 3D-style Illustration */}
          <div className="hidden md:flex relative w-52 h-44 items-center justify-center flex-shrink-0">
            {/* Books Stack */}
            <div className="absolute bottom-4 left-4 w-24 h-10 rounded-lg bg-indigo-600 shadow-2xl flex items-center justify-center transform rotate-6 border border-indigo-400/50 z-10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div className="absolute bottom-12 left-0 w-24 h-10 rounded-lg bg-purple-600 shadow-2xl flex items-center justify-center transform -rotate-6 border border-purple-400/50 z-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            
            {/* Stopwatch */}
            <div className="absolute top-0 right-2 w-20 h-20 rounded-full bg-red-500 shadow-2xl flex items-center justify-center border-4 border-red-300 z-20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="13" r="8"></circle>
                <path d="M12 9v4l2 2"></path>
                <path d="M9 2h6"></path>
                <path d="M12 2v3"></path>
              </svg>
            </div>
            
            {/* Clipboard with Checklist */}
            <div className="absolute top-12 right-8 w-28 h-32 rounded-xl bg-white shadow-2xl flex flex-col items-center p-3 border border-slate-200 transform rotate-3 z-10">
              <div className="w-14 h-4 bg-slate-200 rounded mb-3"></div>
              <div className="w-full flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="w-12 h-2 bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="w-10 h-2 bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <div className="w-14 h-2 bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <div className="w-8 h-2 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Configuration Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl">
          
          {/* Subject Category */}
          {isSpecialPaper && availableSubjects.length > 2 && (
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-slate-200 mb-3">
                <span>📚</span> Subject Category
              </label>
              <select 
                value={paperSubject}
                onChange={(e) => setPaperSubject(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>
                    {sub === 'All' ? 'All Subjects' : `${sub} Only`}
                  </option>
                ))}
              </select>
              {paperSubject !== 'All' && (
                <p className="text-xs mt-2 text-indigo-300">
                  Showing {maxQuestions} {paperSubject} MCQs
                </p>
              )}
            </div>
          )}

          {/* Chapter Filter */}
          {hasMultipleChapters && (
            <div>
              <label className="flex items-center gap-2 text-base font-bold text-slate-200 mb-3">
                <span>📖</span> Chapter Filter
              </label>
              <select 
                value={chapterFilter}
                onChange={(e) => setChapterFilter(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {availableChapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              {chapterFilter !== 'All Chapters' && (
                <p className="text-xs mt-2 text-indigo-300">
                  Showing {maxQuestions} MCQs from chapter: {chapterFilter}
                </p>
              )}
            </div>
          )}

          {/* Question Filter */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-slate-200 mb-3">
              <span>🔍</span> Question Filter
            </label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="Mixed">Mixed (All Questions)</option>
              <option value="Unused">Unused Questions</option>
              <option value="Used">Used Questions</option>
              <option value="Correct">Correct Questions</option>
              <option value="Incorrect">Incorrect Questions</option>
              <option value="Favourite">Favourite Questions</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-slate-200 mb-3">
              <span>🎯</span> Difficulty Level
            </label>
            <div className="flex flex-wrap gap-3">
              {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
                <button 
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                    difficulty === level 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                  }`}
                >
                  {level === 'All' ? 'All Levels' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-slate-200 mb-3">
              <span>🔢</span> Number of Questions
              <span className="ml-2 text-xs font-medium text-slate-400">({maxQuestions} available for this filter)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {[10, 20, 30, 50, 75, 100].map(num => (
                <button 
                  key={num}
                  onClick={() => handleNumQuestionsClick(num)}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                    numQuestions === num 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : num > maxQuestions 
                        ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                  }`}
                  disabled={num > maxQuestions}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex items-center mt-4 gap-3">
              <input 
                type="number" min="1" max={maxQuestions} value={numQuestions}
                onChange={handleCustomInputChange}
                disabled={maxQuestions === 0}
                className="w-32 p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <span className="text-sm text-slate-400">Custom (Max: {maxQuestions})</span>
            </div>
          </div>

          {/* Timer Mode */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-slate-200 mb-3">
              <span>⏱️</span> Timer Mode
            </label>
            <div className="flex flex-wrap gap-3 mb-4">
              <button 
                onClick={() => setTimerMode('Practice')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  timerMode === 'Practice' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                }`}
              >Practice Mode (No Timer)</button>
              <button 
                onClick={() => setTimerMode('Timed')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  timerMode === 'Timed' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                }`}
              >Timed Mode</button>
            </div>
            {timerMode === 'Timed' && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="number" min="1" max="300" value={timerMinutes}
                    onChange={handleCustomTimeChange}
                    className="w-24 p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Min"
                  />
                  <span className="text-sm text-slate-400">Minutes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60, 90].map(min => (
                    <button 
                      key={min}
                      onClick={() => setTimerMinutes(min)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        timerMinutes === min 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Start Button or Error */}
          {maxQuestions === 0 ? (
            <div className="w-full py-4 rounded-xl font-bold text-lg text-center bg-red-500/10 text-red-400 border border-red-500/30">
              No questions match this filter yet!
            </div>
          ) : (
            <button 
              onClick={startTest} 
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Start Test
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}