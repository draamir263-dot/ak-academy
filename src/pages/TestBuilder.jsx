import { useParams, Link, useNavigate } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useState, useEffect, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';

// --- REFINED FALLBACK SCANNER (Only used if q.category AND q.subject are both missing) ---
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

  return getQuestionSubjectFromText(q);
};

export default function TestBuilder() {
  const { subjectName, chapterName } = useParams();
  const navigate = useNavigate();
  const { progress } = useProgress();
  
  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === chapterName);

  // ✅ NEW — Detect if this is a Mix/All folder AND we're in multi-chapter mode
  const isMixOrAll = subjectName && (subjectName.toLowerCase().includes('mix') || subjectName.toLowerCase().includes('all'));
  const isMultiChapter = isMixOrAll && chapterName === '__all__';

  // ✅ NEW — Chapter selection state (only used in multi-chapter mode)
  const [selectedChapters, setSelectedChapters] = useState([]);

  // ✅ NEW — Initialize selectedChapters when subject loads
  useEffect(() => {
    if (isMultiChapter && subject && selectedChapters.length === 0) {
      setSelectedChapters(subject.chapters.map(c => c.name));
    }
  }, [isMultiChapter, subject]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ NEW — Toggle helpers for chapter selection
  const allChapterNames = subject?.chapters.map(c => c.name) || [];
  const allChaptersSelected = selectedChapters.length === allChapterNames.length && allChapterNames.length > 0;
  const someChaptersSelected = selectedChapters.length > 0 && !allChaptersSelected;

  const toggleAllChapters = () => {
    if (allChaptersSelected) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...allChapterNames]);
    }
  };

  const toggleChapter = (name) => {
    setSelectedChapters(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const [numQuestions, setNumQuestions] = useState(10);
  const [filter, setFilter] = useState('Mixed');
  const [timerMode, setTimerMode] = useState('Practice');
  const [paperSubject, setPaperSubject] = useState('All'); 
  const [difficulty, setDifficulty] = useState('All'); 

  const CORE_SUBJECTS = ['biology', 'chemistry', 'physics', 'english', 'logical reasoning'];
  const isSpecialPaper = !CORE_SUBJECTS.some(
    core => subjectName?.toLowerCase().trim() === core
  );

  // ✅ CHANGED — Build question pool from selected chapters (multi-chapter) or single chapter
  const allQuestions = useMemo(() => {
    if (!subject) return [];
    if (isMultiChapter) {
      return subject.chapters
        .filter(ch => selectedChapters.includes(ch.name))
        .flatMap(ch => ch.questions || []);
    }
    return chapter?.questions || [];
  }, [subject, chapter, isMultiChapter, selectedChapters]);

  const questionSubjects = useMemo(() => {
    return allQuestions.map(getQuestionSubject);
  }, [allQuestions]);

  const availableSubjects = useMemo(() => {
    const set = new Set(questionSubjects);
    set.delete('Uncategorized');
    return ['All', ...Array.from(set).sort()];
  }, [questionSubjects]);

  // ✅ CHANGED — Uses allQuestions instead of chapter.questions
  const calculateMaxQuestions = () => {
    if (allQuestions.length === 0) return 0;
    return allQuestions.filter((q, idx) => {
      if (difficulty !== 'All') {
        if (!q.difficulty || q.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
      }

      if (paperSubject !== 'All') {
        const qSubject = questionSubjects[idx];
        if (qSubject !== paperSubject) return false; 
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
  }, [filter, maxQuestions, paperSubject, numQuestions, difficulty]);

  useEffect(() => {
    if (!isSpecialPaper) {
      setPaperSubject('All');
    }
  }, [isSpecialPaper]);

  const handleNumQuestionsClick = (num) => {
    setNumQuestions(Math.min(num, maxQuestions));
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setNumQuestions('');
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setNumQuestions('');
    } else {
      setNumQuestions(Math.min(Math.max(1, num), maxQuestions));
    }
  };

  // ✅ CHANGED — Pass selectedChapters to TestEngine when in multi-chapter mode
  const startTest = () => {
    if (maxQuestions === 0 || !numQuestions || numQuestions < 1) return;
    navigate(`/test-engine/${subjectName}/${chapterName}/${numQuestions}`, {
      state: {
        filter,
        paperSubject,
        difficulty,
        selectedChapters: isMultiChapter ? selectedChapters : null
      }
    });
  };

  // ✅ CHANGED — Handle both "subject not found" and "chapter not found", but allow __all__
  if (!subject || (!chapter && !isMultiChapter)) {
    return (
      <div className="min-h-screen aurora-bg p-8 text-center flex items-center justify-center relative overflow-hidden">
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-red-300">{!subject ? 'Subject not found!' : 'Chapter not found!'}</h1>
          <Link to="/" className="text-yellow-200 underline mt-4 inline-block">Go Home</Link>
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

  // ✅ CHANGED — Show "All Chapters" or chapter name in header
  const displayTitle = isMultiChapter ? 'All Chapters' : chapter.name;
  const displayCount = allQuestions.length;

  return (
    <div className="relative min-h-screen aurora-bg overflow-hidden p-3 md:p-6">
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
        .aurora-title {
          background: linear-gradient(90deg, #ffffff, #ffe9ff 40%, #d8f2ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 8px 40px rgba(69,104,220,0.4);
        }
        .aurora-back {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          transition: background .2s ease, transform .2s ease;
        }
        .aurora-back:hover { background: rgba(255,255,255,0.22); transform: translateX(-2px); }
        .aurora-input {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          font-weight: 600;
          transition: all .2s ease;
        }
        .aurora-input:focus { 
          outline: none; 
          border-color: rgba(255,255,255,0.6); 
          box-shadow: 0 0 0 3px rgba(255,255,255,0.15); 
        }
        .aurora-input option {
          background: #3a1c71;
          color: #ffffff;
        }
        .aurora-chip {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          transition: all .2s ease;
        }
        .aurora-chip:hover { background: rgba(255,255,255,0.22); }
        .aurora-chip-active {
          background: linear-gradient(135deg, #ffffff, #f1eaff);
          color: #3a1c71;
          border: 1px solid transparent;
          box-shadow: 0 4px 12px rgba(69,104,220,0.3);
        }
        .aurora-chip-disabled {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.4);
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .aurora-btn-start {
          background: linear-gradient(135deg, #0fb8ad, #35e0c4);
          color: #102a43;
          box-shadow: 0 6px 18px rgba(15,184,173,0.4);
          transition: box-shadow .2s ease, transform .2s ease;
        }
        .aurora-btn-start:hover { box-shadow: 0 8px 22px rgba(15,184,173,0.6); transform: translateY(-1px); }
        /* ✅ NEW — Custom checkbox styling for chapter selector */
        .chapter-checkbox {
          accent-color: #0fb8ad;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .chapter-scroll::-webkit-scrollbar { width: 6px; }
        .chapter-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
        .chapter-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        .chapter-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>

      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="aurora-blob b4" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <Link to={`/subject/${subjectName}`} className="aurora-back mb-6 inline-block px-4 py-2 rounded-lg font-semibold text-sm">
          &larr; Back to {subjectName}
        </Link>
        
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight aurora-title">{displayTitle}</h1>
          <p className="text-sm md:text-lg font-semibold italic mt-2" style={{ color: '#ffe9a8' }}>
            ✦ {displayCount} Total MCQs{isMultiChapter && selectedChapters.length > 0 ? ` (${selectedChapters.length} chapters selected)` : ''} ✦
          </p>
        </header>

        <div className="aurora-card rounded-2xl p-6 sm:p-8 space-y-8">
          
          {/* ✅ NEW — Chapter Selector (only shown for Mix/All folders in multi-chapter mode) */}
          {isMultiChapter && (
            <div>
              <label className="block text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>Select Chapters</label>
              <div className="chapter-scroll max-h-56 overflow-y-auto space-y-1.5 pr-1 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {/* Select All / Deselect All */}
                <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <input 
                    type="checkbox"
                    checked={allChaptersSelected}
                    ref={el => { if (el) el.indeterminate = someChaptersSelected; }}
                    onChange={toggleAllChapters}
                    className="chapter-checkbox"
                  />
                  <span className="text-white font-semibold text-sm">
                    {allChaptersSelected ? 'Deselect All' : 'Select All'}
                  </span>
                  <span className="ml-auto text-xs" style={{ color: '#eee9ff', opacity: 0.7 }}>
                    {subject.chapters.reduce((acc, ch) => acc + (ch.questions?.length || 0), 0)} MCQs
                  </span>
                </label>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '4px 0' }} />

                {/* Individual chapters */}
                {subject.chapters.map(ch => {
                  const isChecked = selectedChapters.includes(ch.name);
                  const chCount = ch.questions?.length || 0;
                  return (
                    <label 
                      key={ch.name} 
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? '' : 'opacity-60'}`}
                      style={{ background: isChecked ? 'rgba(15,184,173,0.12)' : 'transparent' }}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChapter(ch.name)}
                        className="chapter-checkbox"
                      />
                      <span className="text-white text-sm flex-1">{ch.name}</span>
                      <span className="text-xs" style={{ color: '#eee9ff', opacity: 0.7 }}>{chCount}</span>
                    </label>
                  );
                })}
              </div>
              {selectedChapters.length === 0 && (
                <p className="text-xs mt-2" style={{ color: '#ffcccc' }}>
                  Please select at least one chapter
                </p>
              )}
            </div>
          )}

          {/* Subject Category — now shown for ALL non-core-subject folders */}
          {isSpecialPaper && availableSubjects.length > 2 && (
            <div>
              <label className="block text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>Subject Category</label>
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
                  Showing {maxQuestions} {paperSubject} MCQs in this chapter
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>Question Filter</label>
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

          <div>
            <label className="block text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>Difficulty Level</label>
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

          <div>
            <label className="block text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              Number of Questions
              <span className="ml-2 text-sm font-medium" style={{ color: '#eee9ff', opacity: 0.8 }}>({maxQuestions} available for this filter)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 50, 75, 100].map(num => (
                <button 
                  key={num}
                  onClick={() => handleNumQuestionsClick(num)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    numQuestions === num ? 'aurora-chip-active' : 
                    num > maxQuestions ? 'aurora-chip-disabled' : 
                    'aurora-chip'
                  }`}
                  disabled={num > maxQuestions}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex items-center mt-4">
              <input 
                type="number" 
                min="1" 
                max={maxQuestions} 
                value={numQuestions}
                onChange={handleCustomInputChange}
                disabled={maxQuestions === 0}
                className="aurora-input w-32 p-2 rounded-lg focus:outline-none font-bold disabled:opacity-50"
              />
              <span className="ml-2 text-sm" style={{ color: '#eee9ff', opacity: 0.8 }}>Custom (Max: {maxQuestions})</span>
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>Timer Mode</label>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setTimerMode('Practice')}
                className={`px-4 py-2 rounded-lg font-semibold ${timerMode === 'Practice' ? 'aurora-chip-active' : 'aurora-chip'}`}
              >
                Practice Mode (No Timer)
              </button>
              <button 
                onClick={() => setTimerMode('Timed')}
                className={`px-4 py-2 rounded-lg font-semibold ${timerMode === 'Timed' ? 'aurora-chip-active' : 'aurora-chip'}`}
              >
                Timed Mode
              </button>
            </div>
            {timerMode === 'Timed' && (
              <select className="aurora-input w-full p-2.5 rounded-lg focus:outline-none">
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
            <div className="w-full py-4 rounded-xl font-bold text-lg text-center" style={{ background: 'rgba(255,100,100,0.15)', color: '#ffcccc', border: '1px solid rgba(255,100,100,0.3)' }}>
              No questions match this filter yet!
            </div>
          ) : (
            <button 
              onClick={startTest}
              className="aurora-btn-start w-full py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Start Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}