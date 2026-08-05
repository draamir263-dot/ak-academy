import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { structuredData } from '../services/questionLoader';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

// Helper component for the Circular Progress Ring
const CircularProgress = ({ percentage, isLocked }) => {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (percentage / 100) * c;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3"></circle>
        {!isLocked && (
          <circle 
            cx="18" cy="18" r="16" 
            fill="none" 
            strokeDasharray={c} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            strokeWidth="3" 
            className="text-indigo-600"
            style={{ stroke: 'currentColor' }}
          ></circle>
        )}
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700">
        {isLocked ? '🔒' : `${percentage}%`}
      </span>
    </div>
  );
};

export default function Subject() {
  const { subjectName } = useParams();
  const { currentUser, isPremium } = useAuth();
  const { progress } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');

  // Save the last opened subject path to localStorage for the "Library" button on Home
  useEffect(() => {
    if (subjectName) {
      localStorage.setItem('lastOpenedPath', `/subject/${subjectName}`);
    }
  }, [subjectName]);

  // Safely extract the 'used' array which contains all answered question IDs
  const used = progress?.used || [];

  const subject = structuredData.find(s => s.name === subjectName);

  // Fallback colors for different subjects
  const subjectConfig = {
    "Biology": { bg: "from-green-500 to-emerald-600", text: "text-green-600", bgLight: "bg-green-50", ring: "text-green-500" },
    "Chemistry": { bg: "from-orange-500 to-amber-600", text: "text-orange-600", bgLight: "bg-orange-50", ring: "text-orange-500" },
    "Physics": { bg: "from-blue-500 to-indigo-600", text: "text-blue-600", bgLight: "bg-blue-50", ring: "text-blue-500" },
    "English": { bg: "from-purple-500 to-fuchsia-600", text: "text-purple-600", bgLight: "bg-purple-50", ring: "text-purple-500" },
    "Logical": { bg: "from-pink-500 to-rose-600", text: "text-pink-600", bgLight: "bg-pink-50", ring: "text-pink-500" },
  };
  const config = subjectConfig[subjectName] || { bg: "from-slate-700 to-slate-900", text: "text-slate-600", bgLight: "bg-slate-100", ring: "text-slate-500" };

  if (!subject) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Subject not found!</h1>
        <Link to="/" className="text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-lg">Go Back Home</Link>
      </div>
    );
  }

  const totalMcqsCount = subject.totalMcqs || subject.chapters.reduce((acc, ch) => acc + (ch.questions?.length || 0), 0);
  
  // Calculate ACTUAL Overall Subject Progress
  let totalSolvedInSubject = 0;
  let totalQuestionsInSubject = 0;

  subject.chapters.forEach(ch => {
    const total = ch.questions?.length || 0;
    const solved = ch.questions?.filter(q => used.includes(q.id)).length || 0;
    totalSolvedInSubject += solved;
    totalQuestionsInSubject += total;
  });

  const overallProgress = totalQuestionsInSubject > 0 ? Math.round((totalSolvedInSubject / totalQuestionsInSubject) * 100) : 0;

  const sortedChapters = [...subject.chapters].sort((a, b) => {
    const aIsDemo = a.name.toLowerCase().includes("demo");
    const bIsDemo = b.name.toLowerCase().includes("demo");
    if (aIsDemo && !bIsDemo) return -1;
    if (!aIsDemo && bIsDemo) return 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Filter logic for search only
  const filteredChapters = sortedChapters.filter(chapter => {
    return chapter.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper to get ACTUAL chapter progress
  const getActualChapterProgress = (chapter) => {
    if (!chapter.questions || chapter.questions.length === 0) return 0;
    const solved = chapter.questions.filter(q => used.includes(q.id)).length;
    return Math.round((solved / chapter.questions.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* Header Section */}
      <div className={`bg-gradient-to-br ${config.bg} px-5 pt-10 pb-16 rounded-b-[2.5rem] text-white relative overflow-hidden shadow-xl`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="flex items-center text-white text-sm font-semibold">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <button className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-3xl">
              📚
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
              <p className="text-sm opacity-90 mt-1">{totalMcqsCount.toLocaleString()} MCQs | {subject.chapters.length} Chapters</p>
            </div>
          </div>

          {/* Overall Progress - Actual */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="opacity-90">Overall Progress</span>
              <span className="font-bold">{overallProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Floating Card */}
      <div className="px-5 -mt-8 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
          <div className="relative">
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search chapters..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="px-5 mt-6 space-y-3">
        {filteredChapters.length > 0 ? (
          filteredChapters.map((chapter, index) => {
            const isLocked = !chapter.name.toLowerCase().includes("demo") && (!currentUser || !isPremium);
            const chapterMcqCount = chapter.totalMcqs || chapter.questions?.length || 0;
            // Get actual progress
            const actualProgress = getActualChapterProgress(chapter);

            return (
              <Link
                key={index} 
                to={isLocked ? (currentUser ? "/payment" : "/login") : `/test-builder/${encodeURIComponent(subject.name)}/${encodeURIComponent(chapter.name)}`}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow w-full text-left"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${config.bgLight} ${config.text} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{chapter.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{chapterMcqCount} MCQs</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-2">
                  <div className={config.ring}>
                    <CircularProgress percentage={actualProgress} isLocked={isLocked} />
                  </div>
                  {!isLocked && (
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">No chapters found matching your search.</div>
        )}
      </div>

      {/* Bottom Banner */}
      <div className="px-5 mt-8">
        <div className={`bg-gradient-to-r ${config.bg} rounded-2xl p-5 text-center text-white shadow-md relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
          <h3 className="font-bold text-base relative z-10">Master {subject.name}</h3>
          <p className="text-white/80 text-xs mt-1 relative z-10">Unlock all chapters to maximize your score!</p>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around py-3 px-5 rounded-t-2xl shadow-2xl z-50">
        <Link to="/" className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <button className="flex flex-col items-center text-indigo-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
          <span className="text-[10px] mt-1 font-bold">Library</span>
        </button>
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Stats</span>
        </Link>
        <button className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </button>
      </div>

    </div>
  );
}