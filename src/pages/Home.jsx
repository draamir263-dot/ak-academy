import { Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import PullToRefresh from '../components/PullToRefresh';

// 10 Motivational Quranic Verses about Hard Work & Knowledge
const quranVerses = [
  { arabic: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ", english: "And that there is not for man except that [good] for which he strives." },
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", english: "Indeed, with hardship [will be] ease." },
  { arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", english: "Allah does not charge a soul except [with that within] its capacity." },
  { arabic: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ", english: "Indeed, Allah will not change the condition of a people until they change what is in themselves." },
  { arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", english: "And say, My Lord, increase me in knowledge." },
  { arabic: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ", english: "Allah will raise those who have believed among you and those who were given knowledge, by degrees." },
  { arabic: "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ", english: "And for this let the competitors compete." },
  { arabic: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ", english: "And that there is not for man except that [good] for which he strives, and that his effort is going to be seen." },
  { arabic: "اسْتَجِيبُوا لِلَّهِ وَلِلرَّسُولِ إِذَا دَعَاكُمْ لِمَا يُحْيِيكُمْ", english: "Respond to Allah and to the Messenger when he calls you to that which gives you life." },
  { arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا", english: "And those who strive for Us - We will surely guide them to Our ways." }
];

export default function Home() {
  // Pick a random verse on every app refresh
  const randomVerse = quranVerses[Math.floor(Math.random() * quranVerses.length)];

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-blue-900 p-4 md:p-8 text-center">
        
        {/* Compact Header Section */}
        <header className="mb-6 mt-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">AK Academy</h1>
          
          {/* Quranic Verse Section (Shuffles on refresh) */}
          <div className="mt-3 mb-2 px-4 max-w-xl mx-auto">
            <p 
              className="text-lg md:text-2xl font-bold text-yellow-400 mb-1" 
              style={{ fontFamily: 'serif', direction: 'rtl' }}
            >
              {randomVerse.arabic}
            </p>
            <p className="text-xs md:text-sm text-blue-200 italic">
              "{randomVerse.english}"
            </p>
          </div>

          <p className="text-base md:text-xl font-semibold text-white italic mt-2">Make MDCAT on your fingertips.</p>
        </header>

        {/* Subject Grid - 2 columns on mobile, 3 columns on laptop */}
        {/* Bulletproof rendering: prevents crash if JSON is broken */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto">
          {structuredData && structuredData.length > 0 ? (
            structuredData.map((subject) => (
              <div 
                key={subject.name} 
                className="bg-white rounded-xl shadow-xl border border-blue-800 p-4 sm:p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-300"
              >
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-blue-900 mb-2 sm:mb-4">{subject.name}</h2>
                  <div className="flex justify-around gap-2 mb-4 sm:mb-6 bg-blue-50 py-3 sm:py-4 rounded-xl">
                    <div>
                      <p className="text-xl sm:text-3xl font-extrabold text-blue-600">{subject.totalMcqs}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase mt-1">Total MCQs</p>
                    </div>
                    <div className="border-l border-gray-200"></div>
                    <div>
                      <p className="text-xl sm:text-3xl font-extrabold text-blue-600">{subject.chapters.length}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase mt-1">Chapters</p>
                    </div>
                  </div>
                </div>
                
                <Link 
                  to={`/subject/${subject.name}`} 
                  className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors text-center text-sm sm:text-lg shadow-md"
                >
                  Start Practice
                </Link>
              </div>
            ))
          ) : (
            <p className="text-white col-span-full text-center py-10">Loading subjects... If this stays, check your JSON files for errors.</p>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}