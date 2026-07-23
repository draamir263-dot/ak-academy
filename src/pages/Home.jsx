import { Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-900">AK Academy</h1>
        <p className="text-lg text-gray-500 mt-2">Make MDCAT on Your Fingertips</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {structuredData.map((subject) => (
          <div key={subject.name} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl hover:border-blue-200 transition-all">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{subject.name}</h2>
              <div className="flex gap-8 mb-6">
                <div>
                  <p className="text-3xl font-extrabold text-blue-600">{subject.totalMcqs}</p>
                  <p className="text-sm text-gray-400 font-medium">Total MCQs</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-blue-600">{subject.chapters.length}</p>
                  <p className="text-sm text-gray-400 font-medium">Chapters</p>
                </div>
              </div>
            </div>
            
            {/* This makes the button navigate to the Subject page! */}
            <Link to={`/subject/${subject.name}`} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">
              Start Practice
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}