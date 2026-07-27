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
      <div className="min-h-screen aurora-bg p-8 text-center flex items-center justify-center relative overflow-hidden">
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-red-300">No test data found!</h1>
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
        .aurora-title {
          background: linear-gradient(90deg, #ffffff, #ffe9ff 40%, #d8f2ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 8px 40px rgba(69,104,220,0.4);
        }
        .aurora-stat-blue { background: rgba(69, 104, 220, 0.2); border: 1px solid rgba(69, 104, 220, 0.4); }
        .aurora-stat-green { background: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.4); }
        .aurora-stat-red { background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.4); }
        .aurora-stat-gray { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); }
        .aurora-btn {
          background: linear-gradient(135deg, #ffffff, #f1eaff);
          box-shadow: 0 6px 18px rgba(69,104,220,0.35);
          color: #3a1c71;
          transition: all .2s ease;
        }
        .aurora-btn:hover { box-shadow: 0 8px 22px rgba(69,104,220,0.5); transform: translateY(-1px); }
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
        .aurora-review-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .aurora-opt-default { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #eee9ff; }
        .aurora-opt-correct { background: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); color: #ffffff; font-weight: bold; }
        .aurora-opt-wrong { background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); color: #ffffff; font-weight: bold; }
        .aurora-exp-box {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-left: 4px solid #ffe9a8;
        }
      `}</style>

      {/* Floating aurora blobs (decorative, behind content) */}
      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="aurora-blob b4" />

      {/* Content sits above the blobs */}
      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight aurora-title">Test Results</h1>
          <p className="text-sm md:text-lg font-semibold italic mt-2" style={{ color: '#ffe9a8' }}>
            ✦ {subjectName} - {chapterName} ✦
          </p>
        </div>

        {/* Score Card */}
        <div className="aurora-card rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-around items-center gap-6 mb-8">
            <div className="text-center">
              <div className={`text-6xl font-extrabold ${percentage >= 50 ? 'text-green-300' : 'text-red-300'}`} style={{ textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                {percentage}%
              </div>
              <p className="text-gray-300 font-semibold mt-2">Overall Score</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="aurora-stat-blue p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-white">{total}</p>
                <p className="text-sm text-gray-300 mt-1">Total</p>
              </div>
              <div className="aurora-stat-green p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-300">{correct}</p>
                <p className="text-sm text-gray-300 mt-1">Correct</p>
              </div>
              <div className="aurora-stat-red p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-red-300">{incorrect}</p>
                <p className="text-sm text-gray-300 mt-1">Incorrect</p>
              </div>
              <div className="aurora-stat-gray p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-gray-200">{skipped}</p>
                <p className="text-sm text-gray-300 mt-1">Skipped</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => navigate(`/subject/${subjectName}`)}
              className="aurora-btn flex-1 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Chapters
            </button>
            <button 
              onClick={() => navigate('/')}
              className="aurora-chip flex-1 py-3 rounded-lg font-semibold"
            >
              Go Home
            </button>
          </div>
        </div>

        {/* Review Section */}
        <div className="aurora-card rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>Review Questions</h2>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'all' ? 'aurora-chip-active' : 'aurora-chip'}`}
            >
              All ({total})
            </button>
            <button 
              onClick={() => setFilter('correct')} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'correct' ? 'aurora-chip-active' : 'aurora-chip'}`}
            >
              Correct ({correct})
            </button>
            <button 
              onClick={() => setFilter('incorrect')} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'incorrect' ? 'aurora-chip-active' : 'aurora-chip'}`}
            >
              Incorrect ({incorrect})
            </button>
            <button 
              onClick={() => setFilter('skipped')} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'skipped' ? 'aurora-chip-active' : 'aurora-chip'}`}
            >
              Skipped ({skipped})
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {filteredQuestions.map((q, index) => {
              const userAnswer = userAnswers[q.id];
              return (
                <div key={q.id} className="aurora-review-card rounded-xl p-5">
                  <p className="font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2 mb-4">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      let bgClass = "aurora-opt-default";
                      if (opt === q.correctAnswer) bgClass = "aurora-opt-correct";
                      else if (opt === userAnswer) bgClass = "aurora-opt-wrong";
                      
                      return (
                        <div key={opt} className={`p-3 rounded-lg flex items-center ${bgClass}`}>
                          <span className="w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold mr-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            {opt}
                          </span>
                          {q[`option${opt}`]}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="aurora-exp-box p-4 rounded-lg">
                    <p className="text-sm text-gray-200"><strong className="text-yellow-200">Explanation:</strong> {q.explanation}</p>
                    <p className="text-sm text-gray-400 mt-2"><strong className="text-yellow-200">Summary:</strong> {q.summary}</p>
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