import { useParams, Link, useNavigate } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useState } from 'react';

export default function TestEngine() {
  const { subjectName, chapterName, numQuestions } = useParams();
  const navigate = useNavigate();

  // Find the questions
  const subject = structuredData.find(s => s.name === subjectName);
  const chapter = subject?.chapters.find(c => c.name === chapterName);
  
  // Get the requested number of questions (convert string to number)
  const testQuestions = chapter ? chapter.questions.slice(0, parseInt(numQuestions)) : [];

  // App State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Stores the selected option for each question
  const [showExplanation, setShowExplanation] = useState(false); // Shows explanation after answering

  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">No questions found!</h1>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentIndex];
  const selectedOption = userAnswers[currentQuestion.id];

  // Handle clicking an option
  const handleSelectOption = (option) => {
    if (selectedOption) return; // Prevent changing answer after clicking

    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: option
    });
    setShowExplanation(true);
  };

  // Navigation functions
  const handleNext = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(!!userAnswers[testQuestions[currentIndex + 1].id]); // Show explanation if already answered
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(!!userAnswers[testQuestions[currentIndex - 1].id]);
    }
  };

  const handleEndTest = () => {
    // We will send them to the Results page in Milestone 7!
    alert("Test Ended! (Results page coming next)");
    navigate(`/subject/${subjectName}`);
  };

  // Helper function to determine button color
  const getOptionClass = (option) => {
    if (!selectedOption) {
      return "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800";
    }
    if (option === currentQuestion.correctAnswer) {
      return "bg-green-50 border-green-500 text-green-800 font-semibold"; // Correct answer
    }
    if (option === selectedOption) {
      return "bg-red-50 border-red-500 text-red-800 font-semibold"; // User's wrong answer
    }
    return "bg-white border-gray-200 text-gray-400 opacity-60"; // Other options
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <Link to={`/test-builder/${subjectName}/${chapterName}`} className="text-blue-600 text-sm font-medium">&larr; Exit Test</Link>
          <button 
            onClick={handleEndTest}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 text-sm"
          >
            End Test
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / testQuestions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-gray-400">
              Question {currentIndex + 1} of {testQuestions.length}
            </span>
            <button className="text-yellow-400 hover:text-yellow-500">
              {/* Bookmark Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h1>

          {/* Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={!!selectedOption}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ${getOptionClass(option)}`}
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold mr-4">
                  {option}
                </span>
                <span>{currentQuestion[`option${option}`]}</span>
              </button>
            ))}
          </div>

          {/* Explanation Box (Only shows after answering) */}
          {showExplanation && (
            <div className="mt-6 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
              <h3 className="font-bold text-blue-900 mb-2">Explanation:</h3>
              <p className="text-gray-700 mb-4">{currentQuestion.explanation}</p>
              
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-500">Summary:</p>
                <p className="text-sm text-gray-700">{currentQuestion.summary}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>
          
          {currentIndex < testQuestions.length - 1 ? (
            <button 
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Next &rarr;
            </button>
          ) : (
            <button 
              onClick={handleEndTest}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Finish Test
            </button>
          )}
        </div>

      </div>
    </div>
  );
}