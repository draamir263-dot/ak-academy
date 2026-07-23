import { useParams, Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useAuth } from '../context/AuthContext';

export default function Subject() {
  const { subjectName } = useParams();
  const { currentUser, isPremium } = useAuth();
  
  const subject = structuredData.find(s => s.name === subjectName);

  if (!subject) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Subject not found!</h1>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Back Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">{subject.name}</h1>
          <p className="text-lg text-gray-500 mt-2">{subject.totalMcqs} Total MCQs | {subject.chapters.length} Chapters</p>
        </header>

        <div className="space-y-4">
          {subject.chapters.map((chapter, index) => {
            // LOCK LOGIC: First chapter is free. Others require login + premium.
            const isLocked = index > 0 && (!currentUser || !isPremium);

            return (
              <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center transition-all ${isLocked ? 'opacity-75' : 'hover:shadow-md'}`}>
                <div className="flex items-center gap-3">
                  {isLocked && <span className="text-2xl">🔒</span>}
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{chapter.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{chapter.totalMcqs} MCQs available</p>
                  </div>
                </div>
                
                {isLocked ? (
                  <Link 
                    to={currentUser ? "/payment" : "/login"} 
                    className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors text-sm"
                  >
                    {currentUser ? "Pay to Unlock" : "Login to Unlock"}
                  </Link>
                ) : (
                  <Link 
                    to={`/test-builder/${subject.name}/${chapter.name}`} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Start
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}