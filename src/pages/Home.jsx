import { Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-900 p-4 md:p-8 text-center">
      
      {/* Header Section matching the Poster */}
      <header className="mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">AK Academy</h1>
        <p className="text-sm md:text-base font-bold text-blue-300 tracking-[0.3em] uppercase mt-3">MDCAT Preparation App</p>
        <p className="text-xl md:text-2xl font-semibold text-yellow-400 italic mt-4">Make MDCAT on your fingertips.</p>
      </header>

      {/* 50,000+ MCQs Highlight Section */}
      <div className="mb-12">
        <h2 className="text-5xl md:text-6xl font-extrabold text-white">50,000+</h2>
        <p className="text-lg md:text-xl text-blue-200 mt-3 font-medium">High-Yield MCQs with Detailed Explanations</p>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {structuredData.map((subject) => (
          <div 
            key={subject.name} 
            className="bg-white rounded-2xl shadow-xl border border-blue-800 p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-300"
          >
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">{subject.name}</h2>
              <div className="flex justify-around gap-4 mb-6 bg-blue-50 py-4 rounded-xl">
                <div>
                  <p className="text-3xl font-extrabold text-blue-600">{subject.totalMcqs}</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Total MCQs</p>
                </div>
                <div className="border-l border-gray-200"></div>
                <div>
                  <p className="text-3xl font-extrabold text-blue-600">{subject.chapters.length}</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Chapters</p>
                </div>
              </div>
            </div>
            
            <Link 
              to={`/subject/${subject.name}`} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors text-center text-lg shadow-md"
            >
              Start Practice
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}