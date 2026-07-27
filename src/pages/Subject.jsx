import { useParams, Link } from 'react-router-dom';
import { structuredData } from '../services/questionLoader';
import { useAuth } from '../context/AuthContext';

export default function Subject() {
  const { subjectName } = useParams();
  const { currentUser, isPremium } = useAuth();
  
  const subject = structuredData.find(s => s.name === subjectName);

  if (!subject) {
    return (
      <div className="min-h-screen aurora-bg p-8 text-center flex items-center justify-center relative overflow-hidden">
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-red-300">Subject not found!</h1>
          <Link to="/" className="text-yellow-200 underline mt-4 inline-block">Go Back Home</Link>
        </div>
        <style>{`
          @keyframes auroraShift {
            0%   { background-position: 0% 30%; }
            50%  { background-position: 100% 70%; }
            100% { background-position: 0% 30%; }
          }
          .aurora-bg {
            background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%);
            background-size: 260% 260%;
            animation: auroraShift 16s ease-in-out infinite;
          }
          .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
          .aurora-blob.b1 { width: 320px; height: 320px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.5), transparent 70%); }
          .aurora-blob.b2 { width: 380px; height: 380px; top: 160px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.45), transparent 70%); }
        `}</style>
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
    <div className="relative min-h-screen aurora-bg overflow-hidden p-3 md:p-6">
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
          color: #3a1c71;
        }
        .aurora-btn:hover { box-shadow: 0 8px 22px rgba(69,104,220,0.5); transform: translateY(-1px); }
        .aurora-btn-locked {
          background: linear-gradient(135deg, rgba(40,30,70,0.7), rgba(30,20,60,0.7));
          border: 1px solid rgba(255,255,255,0.2);
          color: #ffe9a8;
          transition: box-shadow .2s ease, transform .2s ease;
        }
        .aurora-btn-locked:hover { box-shadow: 0 8px 22px rgba(15,8,45,0.5); transform: translateY(-1px); }
        .aurora-back {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          transition: background .2s ease, transform .2s ease;
        }
        .aurora-back:hover { background: rgba(255,255,255,0.22); transform: translateX(-2px); }
      `}</style>

      {/* Floating aurora blobs (decorative, behind content) */}
      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="aurora-blob b4" />

      {/* Content sits above the blobs */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <Link to="/" className="aurora-back mb-6 inline-block px-4 py-2 rounded-lg font-semibold text-sm">
          &larr; Back to Home
        </Link>
        
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight aurora-title">{subject.name}</h1>
          <p className="text-sm md:text-lg font-semibold italic mt-2" style={{ color: '#ffe9a8' }}>
            ✦ {totalMcqsCount} Total MCQs | {subject.chapters.length} Chapters ✦
          </p>
        </header>

        {/* GRID LAYOUT: 2 columns on mobile, 3 columns on larger screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {sortedChapters.map((chapter, index) => {
            const isLocked = !chapter.name.toLowerCase().includes("demo") && (!currentUser || !isPremium);
            // Dynamic chapter MCQ count fallback
            const chapterMcqCount = chapter.totalMcqs || chapter.questions?.length || 0;

            return (
              <div 
                key={index} 
                className={`aurora-card rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-all ${isLocked ? 'opacity-90' : 'hover:scale-105'}`}
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-lg mt-0.5">{isLocked ? '🔒' : '📘'}</span>
                  <h2 className="text-sm font-bold text-white leading-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                    {chapter.name}
                  </h2>
                </div>
                
                <div>
                  <p className="text-xs mb-3" style={{ color: '#eee9ff', opacity: 0.85 }}>{chapterMcqCount} MCQs</p>
                  
                  {isLocked ? (
                    <Link 
                      to={currentUser ? "/payment" : "/login"} 
                      className="aurora-btn-locked block text-center px-2 py-2 rounded-md font-semibold text-xs"
                    >
                      {currentUser ? "Unlock" : "Login"}
                    </Link>
                  ) : (
                    <Link 
                      to={`/test-builder/${subject.name}/${chapter.name}`} 
                      className="aurora-btn block text-center px-2 py-2 rounded-md font-semibold text-xs"
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