import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';

export default function Dashboard() {
  const { progress } = useProgress();

  // Calculate Stats
  const totalUsed = progress.used.length;
  const totalCorrect = progress.correct.length;
  const totalIncorrect = progress.incorrect.length;
  const totalFavourites = progress.favourites.length;
  
  // Calculate Accuracy (prevent dividing by zero)
  const accuracy = totalUsed > 0 ? Math.round((totalCorrect / totalUsed) * 100) : 0;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">Performance Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">Track your MDCAT preparation progress here.</p>
        </header>

        {/* Accuracy Circle */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8 text-center">
          <div className="relative inline-flex items-center justify-center">
            {/* Simple Circular Progress using SVG */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
              <circle 
                cx="80" cy="80" r="70" 
                stroke={accuracy >= 50 ? '#10b981' : '#ef4444'} 
                strokeWidth="12" 
                fill="none"
                strokeDasharray={`${(accuracy / 100) * 440} 440`} 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold text-gray-800">{accuracy}%</span>
              <p className="text-sm text-gray-500 font-semibold">Accuracy</p>
            </div>
          </div>
          <p className="text-gray-500 mt-4">Based on {totalUsed} answered questions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Used Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-blue-800">Total Answered</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </div>
            <p className="text-4xl font-extrabold text-blue-600">{totalUsed}</p>
            <p className="text-sm text-blue-400 mt-1">Questions Attempted</p>
          </div>

          {/* Correct Card */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-green-800">Correct</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p className="text-4xl font-extrabold text-green-600">{totalCorrect}</p>
            <p className="text-sm text-green-400 mt-1">Right Answers</p>
          </div>

          {/* Incorrect Card */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-red-800">Incorrect</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <p className="text-4xl font-extrabold text-red-600">{totalIncorrect}</p>
            <p className="text-sm text-red-400 mt-1">Wrong Answers</p>
          </div>

          {/* Favourites Card */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-yellow-800">Bookmarked</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <p className="text-4xl font-extrabold text-yellow-600">{totalFavourites}</p>
            <p className="text-sm text-yellow-400 mt-1">Saved for Later</p>
          </div>

        </div>

        {/* Motivational Message / Next Steps */}
        <div className="bg-blue-600 rounded-2xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Keep Practicing!</h2>
          <p className="text-blue-100 mb-6">The more questions you solve, the higher your accuracy will become. Consistency is the key to cracking MDCAT.</p>
          <Link to="/" className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Back to Subjects
          </Link>
        </div>

      </div>
    </div>
  );
}