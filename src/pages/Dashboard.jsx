import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { structuredData } from '../services/questionLoader';

export default function Dashboard() {
  const { isPremium, expiryDate } = useAuth();
  const { progress, resetChapterProgress, resetSubjectProgress } = useProgress();
  const [openSubject, setOpenSubject] = useState(null);

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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">Performance Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">Track your MDCAT preparation progress here.</p>
        </header>

        {/* Premium Status */}
        <div className={`rounded-2xl shadow-md border p-6 mb-8 ${isPremium ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className={`text-2xl font-bold ${isPremium ? 'text-green-800' : 'text-red-800'}`}>
                {isPremium ? "⭐ Premium Account Active" : "🔒 Account Expired"}
              </h2>
              {isPremium ? (
                <p className="text-gray-600 mt-1">Your premium access will expire in:</p>
              ) : (
                <p className="text-gray-600 mt-1">Your premium access has ended.</p>
              )}
            </div>
            {isPremium ? (
              <div className="text-center mt-4 md:mt-0 bg-white px-6 py-3 rounded-xl shadow-sm border border-green-100">
                <span className="text-4xl font-extrabold text-green-600">{daysLeft}</span>
                <p className="text-sm font-semibold text-gray-500">Days Remaining</p>
              </div>
            ) : (
              <Link to="/payment" className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Recharge Now
              </Link>
            )}
          </div>
        </div>

        {/* Overall Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-4xl font-extrabold text-blue-600">{totalUsed}</p>
            <p className="text-sm text-gray-500 font-semibold mt-1">Total MCQs Done</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-4xl font-extrabold text-green-600">{totalCorrect}</p>
            <p className="text-sm text-gray-500 font-semibold mt-1">Total Correct</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-4xl font-extrabold text-red-600">{totalIncorrect}</p>
            <p className="text-sm text-gray-500 font-semibold mt-1">Total Incorrect</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className={`text-4xl font-extrabold ${overallAccuracy >= 50 ? 'text-green-600' : 'text-red-600'}`}>{overallAccuracy}%</p>
            <p className="text-sm text-gray-500 font-semibold mt-1">Overall Accuracy</p>
          </div>
        </div>

        {/* Subject & Chapter Breakdown */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Subject-wise Analysis</h2>
        <div className="space-y-4 mb-8">
          {structuredData.map((subject) => {
            const subjectIds = subject.chapters.flatMap(c => c.questions.map(q => q.id));
            const sUsed = subjectIds.filter(id => progress.used.includes(id)).length;
            const sCorrect = subjectIds.filter(id => progress.correct.includes(id)).length;
            const sAcc = sUsed > 0 ? Math.round((sCorrect / sUsed) * 100) : 0;
            const isOpen = openSubject === subject.name;

            return (
              <div key={subject.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Subject Header */}
                <div 
                  className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => setOpenSubject(isOpen ? null : subject.name)}
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{subject.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {sUsed} / {subject.totalMcqs} MCQs Done | Accuracy: {sAcc}%
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {sUsed > 0 && sAcc < 60 && (
                      <span className="hidden sm:block text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Needs Work</span>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleResetSubject(subject.name); }}
                      className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-1 rounded"
                    >
                      Reset All
                    </button>
                    <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Chapter Breakdown (Collapsible) */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {subject.chapters.map(chapter => {
                      const cIds = chapter.questions.map(q => q.id);
                      const cUsed = cIds.filter(id => progress.used.includes(id)).length;
                      const cCorrect = cIds.filter(id => progress.correct.includes(id)).length;
                      const cIncorrect = cIds.filter(id => progress.incorrect.includes(id)).length;
                      const cAcc = cUsed > 0 ? Math.round((cCorrect / cUsed) * 100) : 0;
                      const progressWidth = chapter.totalMcqs > 0 ? (cUsed / chapter.totalMcqs) * 100 : 0;

                      return (
                        <div key={chapter.name} className="bg-white p-4 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm">{chapter.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {cUsed} Attempted | {cCorrect} Correct | {cIncorrect} Incorrect
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {cUsed > 0 && cAcc < 60 ? (
                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Weak</span>
                              ) : cUsed > 0 ? (
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Good</span>
                              ) : null}
                              {cUsed > 0 && (
                                <button 
                                  onClick={() => handleResetChapter(chapter.name)}
                                  className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-1 rounded"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                            <div 
                              className={`h-1.5 rounded-full ${cAcc >= 60 ? 'bg-green-500' : 'bg-red-500'}`} 
                              style={{ width: `${progressWidth}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Progress: {Math.round(progressWidth)}%</span>
                            <span>Accuracy: {cAcc}%</span>
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
    </div>
  );
}