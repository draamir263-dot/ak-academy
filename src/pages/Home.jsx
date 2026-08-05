import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
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

// Subject icon lookup
const subjectIcons = {
  "Past Papers": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="4" width="13" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" />
    </svg>
  ),
  "Biology": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4c4.5 0 4.5 4.5 8 4.5S15.5 4 20 4" />
      <path d="M4 20c4.5 0 4.5-4.5 8-4.5s3.5 4.5 8 4.5" />
      <path d="M6.3 6.3l2 2M17.7 6.3l-2 2M6.3 17.7l2-2M17.7 17.7l2-2" />
      <path d="M12 9v6" />
    </svg>
  ),
  "Chemistry": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2.5v6.2L4.8 17a2.1 2.1 0 0 0 1.9 3.1h10.6a2.1 2.1 0 0 0 1.9-3.1L14.5 8.7V2.5" />
      <path d="M9.5 2.5h5M8.2 14.3h7.6" />
    </svg>
  ),
  "English": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.2C10.4 4.8 7.8 4 4 4v14.2c3.8 0 6.4.8 8 2.2M12 6.2c1.6-1.4 4.2-2.2 8-2.2v14.2c-3.8 0-6.4.8-8 2.2M12 6.2v14.2" />
    </svg>
  ),
  "Logical": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.8 3.2a2.3 2.3 0 0 1 2.3 2.3v2.9h2.9a2.3 2.3 0 1 1 0 4.6H12.1v2.9a2.3 2.3 0 1 1-4.6 0v-2.9H4.6a2.3 2.3 0 1 1 0-4.6h2.9V5.5a2.3 2.3 0 0 1 2.3-2.3z" />
    </svg>
  ),
  "Physics": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(120 12 12)" />
    </svg>
  ),
};

const fallbackIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6.2C10.4 4.8 7.8 4 4 4v14.2c3.8 0 6.4.8 8 2.2M12 6.2c1.6-1.4 4.2-2.2 8-2.2v14.2c-3.8 0-6.4.8-8 2.2M12 6.2v14.2" />
  </svg>
);

export default function Home() {
  const [showAll, setShowAll] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(50);
  
  // FIX: Only pick a random verse ONCE when the component mounts
  const [randomVerse] = useState(() => quranVerses[Math.floor(Math.random() * quranVerses.length)]);

  const { progress } = useProgress();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    streak: 0,
    dailyGoalTarget: 50,
    dailyGoalCurrent: 0,
  });

  const [liveStudySeconds, setLiveStudySeconds] = useState(0);
  
  // Get name from localStorage or fallback to email username
  const [userName, setUserName] = useState(() => {
    const savedName = localStorage.getItem('user_custom_name');
    const emailName = user?.email ? user.email.split('@')[0] : 'Student';
    return savedName || emailName;
  });

  // Update name if user context changes (e.g., on login)
  useEffect(() => {
    const savedName = localStorage.getItem('user_custom_name');
    const emailName = user?.email ? user.email.split('@')[0] : 'Student';
    setUserName(savedName || emailName);
  }, [user]);

  // Live Study Timer
  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem('user_stats')) || {};
    let totalSeconds = savedStats.studySeconds || 0;
    setLiveStudySeconds(totalSeconds);

    const timerInterval = setInterval(() => {
      totalSeconds += 1;
      setLiveStudySeconds(totalSeconds);
      
      // Save to localStorage every 5 seconds to avoid performance issues
      if (totalSeconds % 5 === 0) {
        const updatedStats = JSON.parse(localStorage.getItem('user_stats')) || {};
        updatedStats.studySeconds = totalSeconds;
        localStorage.setItem('user_stats', JSON.stringify(updatedStats));
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Format live timer into Hours and Minutes
  const formatStudyTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('lastActiveDate');
    let currentStreak = parseInt(localStorage.getItem('streak') || '0');

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastActive === yesterday) {
        currentStreak += 1;
      } else if (lastActive !== yesterday) {
        currentStreak = 1;
      }
      localStorage.setItem('lastActiveDate', today);
      localStorage.setItem('streak', currentStreak);
    }

    const savedStats = JSON.parse(localStorage.getItem('user_stats')) || {};
    setStats({
      streak: currentStreak,
      dailyGoalTarget: savedStats.dailyGoalTarget || 50,
      dailyGoalCurrent: progress?.used?.length || 0, 
    });
    setGoalInput(savedStats.dailyGoalTarget || 50);
  }, [progress]);

  const used = progress?.used || [];
  const correct = progress?.correct || [];
  const accuracy = used.length > 0 ? Math.round((correct.length / used.length) * 100) : 0;
  const dailyGoalPercentage = stats.dailyGoalTarget > 0 ? (stats.dailyGoalCurrent / stats.dailyGoalTarget) * 100 : 0;

  const saveDailyGoal = () => {
    const newTarget = Math.max(1, Math.min(500, goalInput));
    const savedStats = JSON.parse(localStorage.getItem('user_stats')) || {};
    savedStats.dailyGoalTarget = newTarget;
    localStorage.setItem('user_stats', JSON.stringify(savedStats));
    setStats(prev => ({ ...prev, dailyGoalTarget: newTarget }));
    setIsEditingGoal(false);
  };

  const findContinueLearning = () => {
    for (const subject of structuredData) {
      for (const chapter of subject.chapters) {
        if (!chapter.questions) continue;
        const total = chapter.questions.length;
        const solved = chapter.questions.filter(q => used.includes(q.id)).length;
        if (solved > 0 && solved < total) {
          return { subjectName: subject.name, chapterName: chapter.name, solved, total };
        }
      }
    }
    return null;
  };
  const continueLearning = findContinueLearning();

  const visibleSubjects = showAll ? structuredData : structuredData.slice(0, 6);

  const handleLibraryClick = () => {
    const lastPath = localStorage.getItem('lastOpenedPath');
    navigate(lastPath || '/');
  };

  return (
    <>
      {/* Main Scrollable Content wrapped in PullToRefresh */}
      <PullToRefresh>
        <div className="min-h-screen bg-slate-50 font-sans pb-28">
          
          {/* Header Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 pt-8 pb-14 rounded-b-[2.5rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-10 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-indigo-200 text-xs font-medium">Good Evening,</p>
                  <h1 className="text-xl font-bold tracking-tight capitalize">{userName} 👋</h1>
                </div>
                <Link to="/profile" className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 relative">
                  <span className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                    {userName.charAt(0)}
                  </span>
                </Link>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl">
                <p className="text-right text-base font-bold mb-1 leading-relaxed" style={{ fontFamily: 'serif', direction: 'rtl', color: '#ffe9a8' }}>
                  {randomVerse.arabic}
                </p>
                <p className="text-[11px] italic text-indigo-100 opacity-90">"{randomVerse.english}"</p>
              </div>
            </div>
          </div>

          {/* Floating Stats Card - With Live Study Timer */}
          <div className="px-5 -mt-10 relative z-20">
            <div className="bg-white p-3 rounded-2xl shadow-lg grid grid-cols-4 gap-2 border border-slate-100">
              <div className="flex flex-col items-center text-center">
                <span className="text-lg">🔥</span>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">{stats.streak}</p>
                <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5 leading-tight">Day Streak</p>
              </div>
              <div className="flex flex-col items-center text-center border-l border-slate-100">
                <span className="text-lg">🎯</span>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">{accuracy}%</p>
                <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5 leading-tight">Accuracy</p>
              </div>
              <div className="flex flex-col items-center text-center border-l border-slate-100">
                <span className="text-lg">📝</span>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">{used.length}</p>
                <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5 leading-tight">MCQs Solved</p>
              </div>
              <div className="flex flex-col items-center text-center border-l border-slate-100">
                <span className="text-lg">⏱️</span>
                {/* Live updating Study Time */}
                <p className="text-base font-extrabold text-slate-800 mt-0.5">{formatStudyTime(liveStudySeconds)}</p>
                <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5 leading-tight">Study Time</p>
              </div>
            </div>
          </div>

          <div className="px-5 mt-4">
            {/* Daily Goal (Editable) */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-800 text-sm">Daily Goal</h2>
                  <button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-slate-400 hover:text-indigo-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                </div>
                {!isEditingGoal ? (
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{stats.dailyGoalCurrent} / {stats.dailyGoalTarget} MCQs</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={goalInput} 
                      onChange={(e) => setGoalInput(parseInt(e.target.value) || 0)}
                      className="w-14 px-2 py-1 border border-indigo-200 rounded-lg text-xs text-center text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button onClick={saveDailyGoal} className="text-xs font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-lg">Set</button>
                  </div>
                )}
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(dailyGoalPercentage, 100)}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {stats.dailyGoalTarget - stats.dailyGoalCurrent > 0 
                  ? `Just ${stats.dailyGoalTarget - stats.dailyGoalCurrent} MCQs left to hit your target.`
                  : "Amazing! You've smashed your daily goal! 🎉"
                }
              </p>
            </div>

            {/* Continue Learning */}
            {continueLearning ? (
              <div className="mb-4">
                <h2 className="font-bold text-slate-800 text-sm mb-2">Continue Learning</h2>
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-2xl text-white shadow-lg flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] bg-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{continueLearning.subjectName}</span>
                    <h3 className="text-base font-bold mt-1.5 truncate">{continueLearning.chapterName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{continueLearning.total - continueLearning.solved} left</span>
                      <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                      <span>{Math.round((continueLearning.solved / continueLearning.total) * 100)}% Done</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(continueLearning.solved / continueLearning.total) * 100}%` }}></div>
                    </div>
                  </div>
                  <Link to={`/test-builder/${encodeURIComponent(continueLearning.subjectName)}/${encodeURIComponent(continueLearning.chapterName)}`} className="ml-3 w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white text-indigo-600 rounded-full shadow-md hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-4 bg-indigo-50 p-4 rounded-2xl text-center">
                <h3 className="font-bold text-indigo-800 text-sm">Ready to start?</h3>
                <p className="text-[11px] text-indigo-500 mt-0.5">Pick a subject below to begin your journey!</p>
              </div>
            )}

            {/* Subjects Grid */}
            <div className="mb-2">
              <h2 className="font-bold text-slate-800 text-sm mb-2">Subjects</h2>
              <div className="grid grid-cols-3 gap-3">
                {visibleSubjects && visibleSubjects.length > 0 ? (
                  visibleSubjects.map((subject) => {
                    const colors = {
                      "Biology": "bg-green-100 text-green-600",
                      "Chemistry": "bg-orange-100 text-orange-600",
                      "Physics": "bg-blue-100 text-blue-600",
                      "English": "bg-purple-100 text-purple-600",
                      "Logical": "bg-pink-100 text-pink-600",
                      "Past Papers": "bg-slate-100 text-slate-600"
                    };
                    const iconColor = colors[subject.name] || "bg-indigo-100 text-indigo-600";

                    return (
                      <div key={subject.name} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${iconColor}`}>
                          <div className="w-5 h-5">{subjectIcons[subject.name] || fallbackIcon}</div>
                        </div>
                        <h3 className="font-bold text-slate-800 text-xs mb-2 leading-tight">{subject.name}</h3>
                        <div className="flex justify-between w-full py-1.5 border-t border-slate-100 text-center">
                          <div className="flex-1">
                            <p className="text-xs font-extrabold text-slate-800">{subject.totalMcqs}</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">MCQs</p>
                          </div>
                          <div className="w-px bg-slate-100 mx-1"></div>
                          <div className="flex-1">
                            <p className="text-xs font-extrabold text-slate-800">{subject.chapters.length}</p>
                            <p className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5">Chapters</p>
                          </div>
                        </div>
                        <Link to={`/subject/${subject.name}`} className="mt-2 w-full py-1.5 rounded-lg font-bold text-center text-[10px] bg-slate-800 text-white hover:bg-slate-900 transition-colors">Start</Link>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 col-span-full text-center py-10">Loading subjects...</p>
                )}
              </div>

              {structuredData && structuredData.length > 6 && (
                <button onClick={() => setShowAll(!showAll)} className="mt-3 w-full text-center text-xs font-bold text-indigo-600 bg-indigo-50 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                  {showAll ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>

            <div className="mt-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-center text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
                <h3 className="font-bold text-base relative z-10">Make MDCAT on your Fingerprint</h3>
                <p className="text-indigo-100 text-[11px] mt-1 relative z-10">Consistency is the key to success. Keep going!</p>
              </div>
            </div>
          </div>
        </div>
      </PullToRefresh>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around py-3 px-5 rounded-t-2xl shadow-2xl z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center text-indigo-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          <span className="text-[10px] mt-1 font-bold">Home</span>
        </button>
        <button onClick={handleLibraryClick} className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="text-[10px] mt-1 font-medium">Library</span>
        </button>
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Stats</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </>
  );
}