import { useParams, Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';

export default function Subject() {
  // Get the subject name from the URL
  const { subjectName } = useParams();
  
  // Find the subject in our data
  const subject = structuredData.find(s => s.name === subjectName);

  // If someone types a wrong URL, show this
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
          {subject.chapters.map((chapter, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center hover:shadow-md transition-all">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{chapter.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{chapter.totalMcqs} MCQs available</p>
              </div>
              
              {/* This makes the button navigate to the Test Builder page! */}
              <Link 
                to={`/test-builder/${subject.name}/${chapter.name}`} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}