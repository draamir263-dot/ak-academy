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

  // Calculate total MCQs dynamically if the property is missing in the JSON
  const totalMcqsCount = subject.totalMcqs || subject.chapters.reduce((acc, ch) => acc + (ch.questions?.length || 0), 0);

  // SORTING LOGIC: Bring "Demo" to the top, and sort the rest alphabetically & numerically
  const sortedChapters = [...subject.chapters].sort((a, b) => {
    const aIsDemo = a.name.toLowerCase().includes("demo");
    const bIsDemo = b.name.toLowerCase().includes("demo");
    
    if (aIsDemo && !bIsDemo) return -1; // a (Demo) comes first
    if (!aIsDemo && bIsDemo) return 1;  // b (Demo) comes first
    
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="min-h-screen bg-blue-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-yellow-400 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white">{subject.name}</h1>
          <p className="text-lg text-blue-300 mt-2">{totalMcqsCount} Total MCQs | {subject.chapters.length} Chapters</p>
        </header>

        {/* GRID LAYOUT: 2 columns on mobile, 3 columns on larger screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {sortedChapters.map((chapter, index) => {
            const isLocked = !chapter.name.toLowerCase().includes("demo") && (!currentUser || !isPremium);
            // Dynamic chapter MCQ count fallback
            const chapterMcqCount = chapter.totalMcqs || chapter.questions?.length || 0;

            return (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-lg border border-blue-800 p-4 flex flex-col justify-between transition-all ${isLocked ? 'opacity-80' : 'hover:scale-[1.02]'}`}
              >
                <div className="flex items-start gap-2 mb-3">
                  {isLocked ? <span className="text-lg mt-0.5">🔒</span> : <span className="text-lg mt-0.5">📘</span>}
                  <h2 className="text-sm font-bold text-blue-900 leading-tight">{chapter.name}</h2>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-3">{chapterMcqCount} MCQs</p>
                  
                  {isLocked ? (
                    <Link 
                      to={currentUser ? "/payment" : "/login"} 
                      className="block text-center bg-gray-800 text-white px-2 py-2 rounded-md font-semibold hover:bg-gray-900 transition-colors text-xs"
                    >
                      {currentUser ? "Unlock" : "Login"}
                    </Link>
                  ) : (
                    <Link 
                      to={`/test-builder/${subject.name}/${chapter.name}`} 
                      className="block text-center bg-blue-600 text-white px-2 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors text-xs"
                    >
                      Start
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}