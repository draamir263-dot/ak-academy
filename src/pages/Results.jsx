import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
  const reviewRef = useRef(null);

  // Get the data passed from the Test Engine
  const { testQuestions = [], userAnswers = {}, subjectName = "", chapterName = "" } = location.state || {};

  // If someone tries to visit /results directly without taking a test, send them home
  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center flex flex-col items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">No test data found!</h1>
          <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Scores
  let correct = 0;
  let incorrect = 0;
  let skipped = 0; // Unattempted

  testQuestions.forEach(q => {
    const userAnswer = userAnswers[q.id];
    if (!userAnswer) {
      skipped++;
    } else if (userAnswer === q.correctAnswer) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const total = testQuestions.length;
  const percentage = Math.round((correct / total) * 100);
  const incorrectPercentage = Math.round((incorrect / total) * 100);
  const skippedPercentage = Math.round((skipped / total) * 100);

  // Circle Math
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (percentage / 100) * circumference;

  // State for Review Filter
  const [filter, setFilter] = useState('all'); // 'all', 'correct', 'incorrect', 'skipped'

  // Filter questions based on review selection
  const filteredQuestions = testQuestions.filter(q => {
    const userAnswer = userAnswers[q.id];
    if (filter === 'correct') return userAnswer === q.correctAnswer;
    if (filter === 'incorrect') return userAnswer && userAnswer !== q.correctAnswer;
    if (filter === 'skipped') return !userAnswer;
    return true; // 'all'
  });

  const handleShowReview = () => {
    setShowReview(true);
    setTimeout(() => {
      reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl font-extrabold text-green-400">Test Completed!</h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">{subjectName} - {chapterName}</p>
        </div>

        {/* Score & Accuracy Card (Dark Theme matches picture) */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left: Circular Progress */}
            <div className="flex flex-col items-center justify-center text-center flex-shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#334155" strokeWidth="3"></circle>
                  <circle 
                    cx="18" cy="18" r="16" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  ></circle>
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">{percentage}%</span>
                </div>
              </div>
              <span className="mt-2 text-slate-400 text-sm font-semibold uppercase tracking-wider">Your Score</span>
            </div>

            {/* Right: Stats Breakdown */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-baseline border-b border-slate-700 pb-3 mb-4">
                <span className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Total Score</span>
                <span className="text-2xl font-bold text-white">{correct} / {total}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-medium">Correct</span>
                  <span className="font-bold text-white">{correct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-400 font-medium">Incorrect</span>
                  <span className="font-bold text-white">{incorrect}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Unattempted</span>
                  <span className="font-bold text-white">{skipped}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-400 font-medium">Accuracy</span>
                  <span className="font-bold text-white">{percentage}%</span>
                </div>
              </div>

              {/* Review Answers Button (Right Side) */}
              <div className="mt-6 text-right">
                <button 
                  onClick={handleShowReview}
                  className="text-sm font-bold text-white bg-indigo-600 px-5 py-2.5 rounded-lg hover:bg-indigo-500 transition-colors inline-flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  Review Answers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview (4 Module Grid) */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h2 className="font-bold text-slate-200 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
              <p className="text-2xl font-bold text-green-400">{correct}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">Correct</p>
              <p className="text-[10px] text-slate-600 mt-1">{percentage}%</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
              <p className="text-2xl font-bold text-red-400">{incorrect}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">Incorrect</p>
              <p className="text-[10px] text-slate-600 mt-1">{incorrectPercentage}%</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
              <p className="text-2xl font-bold text-slate-400">{skipped}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">Unattempted</p>
              <p className="text-[10px] text-slate-600 mt-1">{skippedPercentage}%</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
              <p className="text-2xl font-bold text-indigo-400">{total}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">Total Questions</p>
              <p className="text-[10px] text-slate-600 mt-1">100%</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <button 
            onClick={() => navigate('/')}
            className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Back to Home
          </button>
          <button 
            onClick={() => navigate(`/subject/${subjectName}`)}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 py-3.5 rounded-xl font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            Back to Chapters
          </button>
        </div>

        {/* Review Section (Conditionally Rendered) */}
        {showReview && (
          <div ref={reviewRef} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 scroll-mt-8">
            <h2 className="text-lg font-bold text-white mb-4">Review Answers</h2>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setFilter('all')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'all' ? 'bg-slate-200 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>All ({total})</button>
              <button onClick={() => setFilter('correct')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'correct' ? 'bg-green-500 text-white' : 'bg-green-900/50 text-green-300 hover:bg-green-800'}`}>Correct ({correct})</button>
              <button onClick={() => setFilter('incorrect')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'incorrect' ? 'bg-red-500 text-white' : 'bg-red-900/50 text-red-300 hover:bg-red-800'}`}>Incorrect ({incorrect})</button>
              <button onClick={() => setFilter('skipped')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'skipped' ? 'bg-slate-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Skipped ({skipped})</button>
            </div>

            {/* Question List */}
            <div className="space-y-6">
              {filteredQuestions.map((q, index) => {
                const userAnswer = userAnswers[q.id];
                return (
                  <div key={q.id} className="border border-slate-700 rounded-xl p-5 bg-slate-900/50">
                    <p className="font-bold text-slate-100 mb-4 text-sm">{index + 1}. {q.question}</p>
                    <div className="space-y-2 mb-4">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        let bgClass = "bg-slate-800 border-slate-700 text-slate-400";
                        if (opt === q.correctAnswer) bgClass = "bg-green-900/30 border-green-500 text-green-300 font-semibold";
                        else if (opt === userAnswer) bgClass = "bg-red-900/30 border-red-500 text-red-300 font-semibold";
                        
                        return (
                          <div key={opt} className={`p-3 rounded-lg border text-sm flex items-center ${bgClass}`}>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-slate-200 font-bold mr-3 text-xs flex-shrink-0">{opt}</span>
                            {q[`option${opt}`]}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="bg-indigo-900/20 border-l-4 border-indigo-500 p-4 rounded-lg">
                      <p className="text-sm text-slate-300"><strong className="text-indigo-400">Explanation:</strong> {q.explanation}</p>
                      <p className="text-sm text-slate-400 mt-2"><strong className="text-indigo-400">Summary:</strong> {q.summary}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}