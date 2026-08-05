import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the data passed from the Test Engine
  const { testQuestions = [], userAnswers = {}, subjectName = "", chapterName = "" } = location.state || {};

  // If someone tries to visit /results directly without taking a test, send them home
  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">No test data found!</h1>
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
  let skipped = 0;

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
  const accuracyColor = percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500';
  const accuracyStroke = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#eab308' : '#ef4444';

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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl font-extrabold text-green-500">Test Completed!</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">{subjectName} - {chapterName}</p>
        </div>

        {/* Score & Accuracy Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Score</span>
            <span className="text-5xl font-extrabold text-slate-800">
              {correct}<span className="text-2xl text-slate-400">/{total}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 w-full">
            <div className="bg-green-50 p-3 rounded-xl text-center flex flex-col justify-center">
              <p className="text-2xl font-bold text-green-600">{correct}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Correct</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-center flex flex-col justify-center">
              <p className="text-2xl font-bold text-red-600">{incorrect}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Incorrect</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-xl text-center flex flex-col justify-center">
              <p className="text-2xl font-bold text-slate-500">{skipped}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Skipped</p>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3"></circle>
              <circle 
                cx="18" cy="18" r="16" 
                fill="none" 
                stroke={accuracyStroke} 
                strokeWidth="3" 
                strokeDasharray="100" 
                strokeDashoffset={100 - percentage} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              ></circle>
            </svg>
            <div className="absolute text-center">
              <span className={`text-xl font-extrabold ${accuracyColor}`}>{percentage}%</span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Performance Overview</h2>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${(correct/total)*100}%` }}></div>
            <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${(incorrect/total)*100}%` }}></div>
            <div className="h-full bg-slate-300 transition-all duration-700" style={{ width: `${(skipped/total)*100}%` }}></div>
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span> Correct ({correct})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Incorrect ({incorrect})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span> Skipped ({skipped})</span>
          </div>
        </div>

        {/* Subject & Chapter Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Subject & Chapter Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-700">{subjectName}</span>
                <span className="text-slate-500 font-medium">{percentage}% Accuracy</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-700">{chapterName}</span>
                <span className="text-slate-500 font-medium">{percentage}% Accuracy</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Strengths & Weaknesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <h3 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Strengths
              </h3>
              <ul className="text-sm text-green-700 space-y-1.5 list-disc list-inside">
                {percentage >= 70 ? (
                  <li>{chapterName}</li>
                ) : (
                  <li className="text-slate-400 italic list-none">Needs more practice to build strengths.</li>
                )}
              </ul>
            </div>
            
            {/* Needs Improvement */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Needs Improvement
              </h3>
              <ul className="text-sm text-red-700 space-y-1.5 list-disc list-inside">
                {percentage < 70 ? (
                  <li>{chapterName}</li>
                ) : (
                  <li className="text-slate-400 italic list-none">Great job! Keep up the good work.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons (Download Report Removed) */}
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
            className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            Back to Chapters
          </button>
        </div>

        {/* Review Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Review Answers</h2>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilter('all')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All ({total})</button>
            <button onClick={() => setFilter('correct')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'correct' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>Correct ({correct})</button>
            <button onClick={() => setFilter('incorrect')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'incorrect' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>Incorrect ({incorrect})</button>
            <button onClick={() => setFilter('skipped')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'skipped' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Skipped ({skipped})</button>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {filteredQuestions.map((q, index) => {
              const userAnswer = userAnswers[q.id];
              return (
                <div key={q.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                  <p className="font-bold text-slate-800 mb-4 text-sm">{index + 1}. {q.question}</p>
                  <div className="space-y-2 mb-4">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      let bgClass = "bg-white border-slate-200 text-slate-600";
                      if (opt === q.correctAnswer) bgClass = "bg-green-50 border-green-400 text-green-800 font-semibold";
                      else if (opt === userAnswer) bgClass = "bg-red-50 border-red-400 text-red-800 font-semibold";
                      
                      return (
                        <div key={opt} className={`p-3 rounded-lg border text-sm flex items-center ${bgClass}`}>
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold mr-3 text-xs flex-shrink-0">{opt}</span>
                          {q[`option${opt}`]}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-sm text-slate-700"><strong>Explanation:</strong> {q.explanation}</p>
                    <p className="text-sm text-slate-500 mt-2"><strong>Summary:</strong> {q.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}