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

// Robust finder — handles URL encoding, case differences, and whitespace
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
      <div className="min-h-screen aurora-bg p-8 text-center flex items-center justify-center relative overflow-hidden">
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="relative z-10 max-w-md">
          <h1 className="text-2xl font-bold text-red-300 mb-4">Chapter not found!</h1>
          <p className="text-yellow-200 text-sm mb-2">
            Looking for: <code className="bg-white/10 px-2 py-1 rounded">{subjectName} / {chapterName}</code>
          </p>
          <p className="text-blue-200 text-xs mb-6 break-all">{debugInfo}</p>
          <Link to="/" className="text-yellow-200 underline inline-block">Go Home</Link>
        </div>
        <style>{`
          @keyframes auroraShift { 0% { background-position: 0% 30%; } 50% { background-position: 100% 70%; } 100% { background-position: 0% 30%; } }
          .aurora-bg { background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%); background-size: 260% 260%; animation: auroraShift 16s ease-in-out infinite; }
          .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
          .aurora-blob.b1 { width: 320px; height: 320px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.5), transparent 70%); }
          .aurora-blob.b2 { width: 380px; height: 380px; top: 160px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.45), transparent 70%); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen aurora-bg overflow-hidden p-3 md:p-6">
      <style>{`
        @keyframes auroraShift { 0% { background-position: 0% 30%; } 50% { background-position: 100% 70%; } 100% { background-position: 0% 30%; } }
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,26px) scale(1.08); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-22px,18px) scale(0.94); } }
        @keyframes floatC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-20px) scale(1.05); } }
        .aurora-bg { background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%); background-size: 260% 260%; animation: auroraShift 16s ease-in-out infinite; }
        .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
        .aurora-blob.b1 { width: 320px; height: 320px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.5), transparent 70%); animation: floatA 13s ease-in-out infinite; }
        .aurora-blob.b2 { width: 380px; height: 380px; top: 160px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.45), transparent 70%); animation: floatB 17s ease-in-out infinite; }
        .aurora-blob.b3 { width: 340px; height: 340px; bottom: 40px; left: -100px; background: radial-gradient(circle, rgba(255,214,120,0.35), transparent 70%); animation: floatC 15s ease-in-out infinite; }
        .aurora-blob.b4 { width: 300px; height: 300px; bottom: -100px; right: -60px; background: radial-gradient(circle, rgba(151,255,214,0.35), transparent 70%); animation: floatA 19s ease-in-out infinite reverse; }
        .aurora-card { background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06)); backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%); border: 1px solid rgba(255,255,255,0.28); box-shadow: 0 12px 34px rgba(15,8,45,0.28), inset 0 1px 0 rgba(255,255,255,0.3); }
        .aurora-title { background: linear-gradient(90deg, #ffffff, #ffe9ff 40%, #d8f2ff); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: 0 8px 40px rgba(69,104,220,0.4); }
        .aurora-back { background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; transition: background .2s ease, transform .2s ease; }
        .aurora-back:hover { background: rgba(255,255,255,0.22); transform: translateX(-2px); }
        .aurora-input { background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; font-weight: 600; transition: all .2s ease; }
        .aurora-input:focus { outline: none; border-color: rgba(255,255,255,0.6); box-shadow: 0 0 0 3px rgba(255,255,255,0.15); }
        .aurora-input option { background: #3a1c71; color: #ffffff; }
        .aurora-chip { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; transition: all .2s ease; }
        .aurora-chip:hover { background: rgba(255,255,255,0.22); }
        .aurora-chip-active { background: linear-gradient(135deg, #ffffff, #f1eaff); color: #3a1c71; border: 1px solid transparent; box-shadow: 0 4px 12px rgba(69,104,220,0.3); }
        .aurora-chip-disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); cursor: not-allowed; border: 1px solid rgba(255,255,255,0.1); }
        .aurora-btn-start { background: linear-gradient(135deg, #0fb8ad, #35e0c4); color: #102a43; box-shadow: 0 6px 18px rgba(15,184,173,0.4); transition: box-shadow .2s ease, transform .2s ease; }
        .aurora-btn-start:hover { box-shadow: 0 8px 22px rgba(15,184,173,0.6); transform: translateY(-1px); }
      `}</style>

      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="aurora-blob b4" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <Link to={`/subject/${encodeURIComponent(subject.name)}`} className="aurora-back mb-6 inline-block px-4 py-2 rounded-lg font-semibold text-sm">
          &larr; Back to {subject.name}
        </Link>
        
        {/* New Header Section matching the image */}
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight aurora-title">
              Build Your Perfect Test
            </h1>
            <p className="text-sm md:text-base font-medium mt-2 text-indigo-100">
              Customize your test and start practicing smartly.
            </p>
            <p className="text-sm md:text-lg font-semibold italic mt-3" style={{ color: '#ffe9a8' }}>
              ✦ {chapter.questions?.length || 0} Total MCQs in {chapter.name} ✦
            </p>
          </div>
          
          {/* 3D-style Illustration */}
          <div className="hidden md:flex relative w-44 h-44 items-center justify-center flex-shrink-0">
            {/* Books Stack */}
            <div className="absolute bottom-2 left-2 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 opacity-90 shadow-xl flex items-center justify-center transform rotate-6 border border-white/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            
            {/* Stopwatch */}
            <div className="absolute top-0 right-2 w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-red-500 opacity-90 shadow-xl flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M9 2h6"></path><path d="M12 2v3"></path></svg>
            </div>
            
            {/* Clipboard with Checklist */}
            <div className="w-28 h-28 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl flex items-center justify-center transform -rotate-3">
              <svg className="w-14 h-14 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"></path>
                <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
          </div>
        </header>

        <div className="aurora-card rounded-2xl p-6 sm:p-8 space-y-8">
          
          {/* Subject Category */}
          {isSpecialPaper && availableSubjects.length > 2 && (
            <div>
              <label className="flex items-center gap-2 text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                <span>📚</span> Subject Category
              </label>
              <select 
                value={paperSubject}
                onChange={(e) => setPaperSubject(e.target.value)}
                className="aurora-input w-full p-2.5 rounded-lg focus:outline-none"
              >
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>
                    {sub === 'All' ? 'All Subjects' : `${sub} Only`}
                  </option>
                ))}
              </select>
              {paperSubject !== 'All' && (
                <p className="text-xs mt-1.5" style={{ color: '#b8d4ff', opacity: 0.8 }}>
                  Showing {maxQuestions} {paperSubject} MCQs
                </p>
              )}
            </div>
          )}

          {/* Chapter Filter */}
          {hasMultipleChapters && (
            <div>
              <label className="flex items-center gap-2 text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                <span>📖</span> Chapter Filter
              </label>
              <select 
                value={chapterFilter}
                onChange={(e) => setChapterFilter(e.target.value)}
                className="aurora-input w-full p-2.5 rounded-lg focus:outline-none"
              >
                {availableChapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              {chapterFilter !== 'All Chapters' && (
                <p className="text-xs mt-1.5" style={{ color: '#b8d4ff', opacity: 0.8 }}>
                  Showing {maxQuestions} MCQs from chapter: {chapterFilter}
                </p>
              )}
            </div>
          )}

          {/* Question Filter */}
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              <span>🔍</span> Question Filter
            </label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="aurora-input w-full p-2.5 rounded-lg focus:outline-none"
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
            <label className="flex items-center gap-2 text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              <span>🎯</span> Difficulty Level
            </label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
                <button 
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    difficulty === level ? 'aurora-chip-active' : 'aurora-chip'
                  }`}
                >
                  {level === 'All' ? 'All Levels' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              <span>🔢</span> Number of Questions
              <span className="ml-2 text-sm font-medium" style={{ color: '#eee9ff', opacity: 0.8 }}>({maxQuestions} available for this filter)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 50, 75, 100].map(num => (
                <button 
                  key={num}
                  onClick={() => handleNumQuestionsClick(num)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    numQuestions === num ? 'aurora-chip-active' : 
                    num > maxQuestions ? 'aurora-chip-disabled' : 'aurora-chip'
                  }`}
                  disabled={num > maxQuestions}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex items-center mt-4">
              <input 
                type="number" min="1" max={maxQuestions} value={numQuestions}
                onChange={handleCustomInputChange}
                disabled={maxQuestions === 0}
                className="aurora-input w-32 p-2 rounded-lg focus:outline-none font-bold disabled:opacity-50"
              />
              <span className="ml-2 text-sm" style={{ color: '#eee9ff', opacity: 0.8 }}>Custom (Max: {maxQuestions})</span>
            </div>
          </div>

          {/* Timer Mode */}
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              <span>⏱️</span> Timer Mode
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setTimerMode('Practice')}
                className={`px-4 py-2 rounded-lg font-semibold ${timerMode === 'Practice' ? 'aurora-chip-active' : 'aurora-chip'}`}
              >Practice Mode (No Timer)</button>
              <button 
                onClick={() => setTimerMode('Timed')}
                className={`px-4 py-2 rounded-lg font-semibold ${timerMode === 'Timed' ? 'aurora-chip-active' : 'aurora-chip'}`}
              >Timed Mode</button>
            </div>
            {timerMode === 'Timed' && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center">
                  <input 
                    type="number" min="1" max="300" value={timerMinutes}
                    onChange={handleCustomTimeChange}
                    className="aurora-input w-24 p-2 rounded-lg focus:outline-none font-bold text-center"
                    placeholder="Min"
                  />
                  <span className="ml-2 text-sm" style={{ color: '#eee9ff', opacity: 0.8 }}>Minutes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60, 90].map(min => (
                    <button 
                      key={min}
                      onClick={() => setTimerMinutes(min)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        timerMinutes === min ? 'aurora-chip-active' : 'aurora-chip'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {maxQuestions === 0 ? (
            <div className="w-full py-4 rounded-xl font-bold text-lg text-center" style={{ background: 'rgba(255,100,100,0.15)', color: '#ffcccc', border: '1px solid rgba(255,100,100,0.3)' }}>
              No questions match this filter yet!
            </div>
          ) : (
            <button onClick={startTest} className="aurora-btn-start w-full py-4 rounded-xl font-bold text-lg transition-colors">
              Start Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}