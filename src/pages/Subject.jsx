import { useParams, Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useAuth } from '../context/AuthContext';

export default function Subject() {
  const { subjectName } = useParams();
  const { currentUser, isPremium } = useAuth();
  
  const subject = structuredData.find(s => s.name === subjectName);

  if (!subject) {
    return (
      <div className="min-h-screen bg-blue-900 p-8 text-center flex items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold text-red-400">Subject not found!</h1>
          <Link to="/" className="text-yellow-400 underline mt-4 inline-block">Go Back Home</Link>
        </div>
      </div>
    );
  }

  const sortedChapters = [...subject.chapters].sort((a, b) => {
    const aIsDemo = a.name.toLowerCase().includes("demo");
    const bIsDemo = b.name.toLowerCase().includes("demo");
    if (aIsDemo && !bIsDemo) return -1; 
    if (!aIsDemo && bIsDemo) return 1;  
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="min-h-screen bg-blue-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-yellow-400 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white">{subject.name}</h1>
          <p className="text-lg text-blue-300 mt-2">{subject.totalMcqs} Total MCQs | {subject.chapters.length} Chapters</p>
        </header>

        <div className="space-y-4">
          {sortedChapters.map((chapter, index) => {
            const isLocked = !chapter.name.toLowerCase().includes("demo") && (!currentUser || !isPremium);

            return (
              <div key={index} className={`bg-white rounded-xl shadow-xl border border-blue-800 p-6 flex justify-between items-center transition-all ${isLocked ? 'opacity-80' : 'hover:scale-[1.02]'}`}>
                <div className="flex items-center gap-3">
                  {isLocked ? <span className="text-2xl">🔒</span> : <span className="text-2xl">📘</span>}
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">{chapter.name}</h2>
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