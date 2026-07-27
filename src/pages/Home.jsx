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

// Subject icon lookup — falls back to a generic book icon for any subject
// name that isn't explicitly listed, so this stays safe with dynamic JSON data.
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
      <path d="M6.3 6.3l2 2M17.7 6.3l-2 2M6.3 17.7l2-2M17.7 17.7l-2-2" />
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

const logoIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 3v6.2a4.5 4.5 0 0 0 9 0V3" />
    <path d="M9 3h0M4.5 3h0" />
    <path d="M13.5 6.8v2.4a6 6 0 0 0 6 6" />
    <circle cx="19.5" cy="15.7" r="2.3" />
  </svg>
);

export default function Home() {
  // Pick a random verse on every app refresh
  const randomVerse = quranVerses[Math.floor(Math.random() * quranVerses.length)];

  return (
    <PullToRefresh>
      {/* Glass Aurora theme — animated gradient + floating blurred color blobs */}
      <style>{`
        @keyframes auroraShift {
          0%   { background-position: 0% 30%; }
          50%  { background-position: 100% 70%; }
          100% { background-position: 0% 30%; }
        }
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,26px) scale(1.08); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-22px,18px) scale(0.94); } }
        @keyframes floatC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-20px) scale(1.05); } }
        .aurora-bg {
          background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%);
          background-size: 260% 260%;
          animation: auroraShift 16s ease-in-out infinite;
        }
        .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
        .aurora-blob.b1 { width: 320px; height: 320px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.5), transparent 70%); animation: floatA 13s ease-in-out infinite; }
        .aurora-blob.b2 { width: 380px; height: 380px; top: 160px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.45), transparent 70%); animation: floatB 17s ease-in-out infinite; }
        .aurora-blob.b3 { width: 340px; height: 340px; bottom: 40px; left: -100px; background: radial-gradient(circle, rgba(255,214,120,0.35), transparent 70%); animation: floatC 15s ease-in-out infinite; }
        .aurora-blob.b4 { width: 300px; height: 300px; bottom: -100px; right: -60px; background: radial-gradient(circle, rgba(151,255,214,0.35), transparent 70%); animation: floatA 19s ease-in-out infinite reverse; }
        .aurora-card {
          background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06));
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 12px 34px rgba(15,8,45,0.28), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .aurora-versebox {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow: 0 10px 30px rgba(20,10,60,0.25), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .aurora-title {
          background: linear-gradient(90deg, #ffffff, #ffe9ff 40%, #d8f2ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 8px 40px rgba(69,104,220,0.4);
        }
        .aurora-badge {
          background: linear-gradient(150deg, rgba(255,255,255,0.32), rgba(255,255,255,0.1));
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 10px 26px rgba(20,10,60,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .aurora-btn {
          background: linear-gradient(135deg, #ffffff, #f1eaff);
          box-shadow: 0 6px 18px rgba(69,104,220,0.35);
          transition: box-shadow .2s ease, transform .2s ease;
        }
        .aurora-btn:hover { box-shadow: 0 8px 22px rgba(69,104,220,0.5); transform: translateY(-1px); }
      `}</style>

      <div className="relative min-h-screen aurora-bg overflow-hidden p-4 md:p-8 text-center">
        {/* Floating aurora blobs (decorative, behind content) */}
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="aurora-blob b3" />
        <div className="aurora-blob b4" />

        {/* Content sits above the blobs */}
        <div className="relative z-10">

          {/* Header Section */}
          <header className="mb-6 mt-4">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white aurora-badge">
              <div className="w-7 h-7">{logoIcon}</div>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight aurora-title">AK Academy</h1>

            {/* Quranic Verse Section (Shuffles on refresh) */}
            <div className="mt-4 mb-2 px-4 max-w-xl mx-auto">
              <div className="aurora-versebox rounded-2xl px-4 py-4">
                <p
                  className="text-lg md:text-2xl font-bold mb-1"
                  style={{ fontFamily: 'serif', direction: 'rtl', color: '#ffe9a8', textShadow: '0 2px 12px rgba(255,214,120,0.35)' }}
                >
                  {randomVerse.arabic}
                </p>
                <p className="text-xs md:text-sm italic" style={{ color: '#eee9ff' }}>
                  "{randomVerse.english}"
                </p>
              </div>
            </div>

            <p className="flex items-center justify-center gap-2 text-base md:text-xl font-semibold text-white italic mt-3">
              <span style={{ color: '#ffe9a8' }}>✦</span>
              Make MDCAT on your fingertips.
              <span style={{ color: '#ffe9a8' }}>✦</span>
            </p>
          </header>

          {/* Subject Grid - 2 columns on mobile, 3 columns on laptop */}
          {/* Bulletproof rendering: prevents crash if JSON is broken */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto">
            {structuredData && structuredData.length > 0 ? (
              structuredData.map((subject) => (
                <div
                  key={subject.name}
                  className="aurora-card rounded-2xl p-4 sm:p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
                >
                  <div>
                    <div className="w-11 h-11 mx-auto mb-3 rounded-xl flex items-center justify-center text-white aurora-badge">
                      <div className="w-5 h-5">{subjectIcons[subject.name] || fallbackIcon}</div>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                      {subject.name}
                    </h2>
                    <div
                      className="flex justify-around gap-2 mb-4 sm:mb-6 py-3 sm:py-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.18)' }}
                    >
                      <div>
                        <p className="text-xl sm:text-3xl font-extrabold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                          {subject.totalMcqs}
                        </p>
                        <p className="text-[10px] sm:text-xs font-semibold uppercase mt-1" style={{ color: '#eee9ff', opacity: 0.85 }}>
                          Total MCQs
                        </p>
                      </div>
                      <div style={{ borderLeft: '1px solid rgba(255,255,255,0.25)' }}></div>
                      <div>
                        <p className="text-xl sm:text-3xl font-extrabold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                          {subject.chapters.length}
                        </p>
                        <p className="text-[10px] sm:text-xs font-semibold uppercase mt-1" style={{ color: '#eee9ff', opacity: 0.85 }}>
                          Chapters
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/subject/${subject.name}`}
                    className="aurora-btn w-full py-2 sm:py-3 rounded-lg font-bold text-center text-sm sm:text-lg"
                    style={{ color: '#3a1c71' }}
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
      </div>
    </PullToRefresh>
  );
}