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
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">No test data found!</h1>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Home</Link>
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">Test Results</h1>
          <p className="text-lg text-gray-500 mt-2">{subjectName} - {chapterName}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-around items-center gap-6 mb-8">
            <div className="text-center">
              <div className={`text-6xl font-extrabold ${percentage >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {percentage}%
              </div>
              <p className="text-gray-500 font-semibold mt-2">Overall Score</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-600">{total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-600">{correct}</p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-red-600">{incorrect}</p>
                <p className="text-sm text-gray-500">Incorrect</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-xl text-center">
                <p className="text-3xl font-bold text-gray-500">{skipped}</p>
                <p className="text-sm text-gray-500">Skipped</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => navigate(`/subject/${subjectName}`)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Back to Chapters
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Go Home
            </button>
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Questions</h2>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All ({total})</button>
            <button onClick={() => setFilter('correct')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'correct' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>Correct ({correct})</button>
            <button onClick={() => setFilter('incorrect')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'incorrect' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>Incorrect ({incorrect})</button>
            <button onClick={() => setFilter('skipped')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'skipped' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Skipped ({skipped})</button>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {filteredQuestions.map((q, index) => {
              const userAnswer = userAnswers[q.id];
              return (
                <div key={q.id} className="border border-gray-200 rounded-xl p-5">
                  <p className="font-bold text-gray-800 mb-4">{index + 1}. {q.question}</p>
                  <div className="space-y-2 mb-4">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      let bgClass = "bg-white border-gray-200 text-gray-600";
                      if (opt === q.correctAnswer) bgClass = "bg-green-50 border-green-500 text-green-800 font-semibold";
                      else if (opt === userAnswer) bgClass = "bg-red-50 border-red-500 text-red-800 font-semibold";
                      
                      return (
                        <div key={opt} className={`p-3 rounded-lg border-2 flex items-center ${bgClass}`}>
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold mr-3 text-sm">{opt}</span>
                          {q[`option${opt}`]}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700"><strong>Explanation:</strong> {q.explanation}</p>
                    <p className="text-sm text-gray-500 mt-2"><strong>Summary:</strong> {q.summary}</p>
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