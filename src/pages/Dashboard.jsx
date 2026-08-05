import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { structuredData } from '../services/questionLoader';

// Reusable Circular Progress Component
const CircularProgress = ({ percentage, size = 80, stroke = 7, color = "#4f46e5", trackColor = "#e2e8f0", label }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center flex-shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke}></circle>
          <circle 
            cx={size/2} cy={size/2} r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth={stroke} 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-extrabold text-slate-800" style={{ fontSize: size / 4.5 }}>{percentage}%</span>
        </div>
      </div>
      {label && <span className="mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{label}</span>}
    </div>
  );
};

export default function Dashboard() {
  const { isPremium, expiryDate } = useAuth();
  const { progress, resetChapterProgress, resetSubjectProgress } = useProgress();
  const [openSubject, setOpenSubject] = useState(null);
  const navigate = useNavigate();

  // Overall Stats
  const totalUsed = progress.used.length;
  const totalCorrect = progress.correct.length;
  const totalIncorrect = progress.incorrect.length;
  const totalFavourites = progress.favourites.length;
  const overallAccuracy = totalUsed > 0 ? Math.round((totalCorrect / totalUsed) * 100) : 0;
  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  const handleResetChapter = (chapterName) => {
    if (window.confirm(`Are you sure you want to reset all progress for "${chapterName}"?`)) {
      resetChapterProgress(chapterName);
    }
  };

  const handleResetSubject = (subjectName) => {
    if (window.confirm(`Are you sure you want to reset ALL progress for "${subjectName}"?`)) {
      resetSubjectProgress(subjectName);
    }
  };

  const handleLibraryClick = () => {
    const lastPath = localStorage.getItem('lastOpenedPath');
    navigate(lastPath || '/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors text-sm font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
        
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">Performance Dashboard</h1>
          <p className="text-base text-slate-500 mt-2">Track your MDCAT preparation progress here.</p>
        </header>

        {/* Premium Status - With Upgrade Button */}
        <div className={`rounded-2xl shadow-sm border p-6 mb-8 ${isPremium ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className={`text-xl font-bold ${isPremium ? 'text-green-800' : 'text-red-800'}`}>
                {isPremium ? "⭐ Premium Account Active" : "🔒 Account Expired"}
              </h2>
              <p className="text-slate-600 mt-1 text-sm">
                {isPremium ? "Your premium access will expire in:" : "Your premium access has ended."}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isPremium && (
                <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-green-100">
                  <span className="text-2xl font-extrabold text-green-600">{daysLeft}</span>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Days Left</p>
                </div>
              )}
              
              {/* Upgrade / Recharge Button */}
              <Link 
                to="/payment" 
                className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                {isPremium ? "Upgrade Plan" : "Recharge Now"}
              </Link>
            </div>
          </div>
        </div>

        {/* Overall Stats Card with Large Circle */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <CircularProgress 
              percentage={overallAccuracy} 
              size={120} 
              stroke={10} 
              color={overallAccuracy >= 50 ? '#10b981' : '#ef4444'} 
            />
            <div>
              <h3 className="text-lg font-bold text-slate-800">Overall Accuracy</h3>
              <p className="text-sm text-slate-500 mt-1">Based on {totalUsed} solved MCQs</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto">
            <div className="px-4">
              <p className="text-2xl font-bold text-green-500">{totalCorrect}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">Correct</p>
            </div>
            <div className="px-4 border-l border-r border-slate-100">
              <p className="text-2xl font-bold text-red-500">{totalIncorrect}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">Incorrect</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-bold text-yellow-500">{totalFavourites}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">Favorites</p>
            </div>
          </div>
        </div>

        {/* Subject & Chapter Breakdown */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Subject-wise Analysis</h2>
        <div className="space-y-4 mb-8">
          {structuredData.map((subject) => {
            const subjectIds = subject.chapters.flatMap(c => c.questions.map(q => q.id));
            const sUsed = subjectIds.filter(id => progress.used.includes(id)).length;
            const sCorrect = subjectIds.filter(id => progress.correct.includes(id)).length;
            const sAcc = sUsed > 0 ? Math.round((sCorrect / sUsed) * 100) : 0;
            const isOpen = openSubject === subject.name;
            const subjectColor = sAcc >= 60 ? '#10b981' : sAcc > 0 ? '#ef4444' : '#cbd5e1';

            return (
              <div key={subject.name} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Subject Header */}
                <div 
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenSubject(isOpen ? null : subject.name)}
                >
                  <div className="flex items-center gap-5">
                    <CircularProgress percentage={sAcc} size={64} stroke={6} color={subjectColor} />
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{subject.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {sUsed} / {subject.totalMcqs} MCQs Done
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {sUsed > 0 && sAcc < 60 && (
                      <span className="hidden sm:block text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Needs Work</span>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleResetSubject(subject.name); }}
                      className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 px-2 py-1 rounded transition-colors"
                    >
                      Reset All
                    </button>
                    <span className="text-slate-400">
                      <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </div>

                {/* Chapter Breakdown (Collapsible) */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
                    {subject.chapters.map(chapter => {
                      const cIds = chapter.questions.map(q => q.id);
                      const cUsed = cIds.filter(id => progress.used.includes(id)).length;
                      const cCorrect = cIds.filter(id => progress.correct.includes(id)).length;
                      const cIncorrect = cIds.filter(id => progress.incorrect.includes(id)).length;
                      const cAcc = cUsed > 0 ? Math.round((cCorrect / cUsed) * 100) : 0;
                      const progressWidth = chapter.totalMcqs > 0 ? Math.round((cUsed / chapter.totalMcqs) * 100) : 0;
                      const chapterColor = cAcc >= 60 ? '#10b981' : cAcc > 0 ? '#ef4444' : '#cbd5e1';

                      return (
                        <div key={chapter.name} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm">{chapter.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {cUsed} Attempted | {cCorrect} Correct | {cIncorrect} Incorrect
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {cUsed > 0 && cAcc < 60 ? (
                                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">Weak</span>
                              ) : cUsed > 0 ? (
                                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Good</span>
                              ) : null}
                              <span className="text-[10px] font-semibold text-slate-400">Completion: {progressWidth}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {cUsed > 0 && (
                              <button 
                                onClick={() => handleResetChapter(chapter.name)}
                                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                title="Reset Chapter"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              </button>
                            )}
                            {/* Chapter Accuracy Circle */}
                            <CircularProgress percentage={cAcc} size={56} stroke={5} color={chapterColor} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around py-3 px-5 rounded-t-2xl shadow-2xl z-50">
        <Link to="/" className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <button onClick={handleLibraryClick} className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="text-[10px] mt-1 font-medium">Library</span>
        </button>
        <Link to="/dashboard" className="flex flex-col items-center text-indigo-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
          <span className="text-[10px] mt-1 font-bold">Stats</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </div>

    </div>
  );
}