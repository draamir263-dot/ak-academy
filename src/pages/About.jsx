import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="relative min-h-screen aurora-bg overflow-hidden">
      <style>{`
        @keyframes aboutAuroraShift {
          0%   { background-position: 0% 30%; }
          50%  { background-position: 100% 70%; }
          100% { background-position: 0% 30%; }
        }
        @keyframes aboutFloatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,26px) scale(1.08); } }
        @keyframes aboutFloatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-22px,18px) scale(0.94); } }
        @keyframes aboutFloatC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-20px) scale(1.05); } }
        @keyframes cardIn {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .about-bg {
          background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%);
          background-size: 260% 260%;
          animation: aboutAuroraShift 16s ease-in-out infinite;
          min-height: 100vh;
          padding: 24px 16px 48px;
          position: relative;
        }
        .about-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
        .about-blob.b1 { width: 280px; height: 280px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.45), transparent 70%); animation: aboutFloatA 13s ease-in-out infinite; }
        .about-blob.b2 { width: 320px; height: 320px; top: 180px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.4), transparent 70%); animation: aboutFloatB 17s ease-in-out infinite; }
        .about-blob.b3 { width: 260px; height: 260px; bottom: 40px; left: -100px; background: radial-gradient(circle, rgba(255,214,120,0.3), transparent 70%); animation: aboutFloatC 15s ease-in-out infinite; }
        .about-blob.b4 { width: 240px; height: 240px; bottom: -80px; right: -60px; background: radial-gradient(circle, rgba(151,255,214,0.3), transparent 70%); animation: aboutFloatA 19s ease-in-out infinite reverse; }
        .about-card {
          background: linear-gradient(160deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10));
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.40);
          box-shadow: 0 12px 34px rgba(15,8,45,0.28), inset 0 1px 0 rgba(255,255,255,0.4);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          animation: cardIn 0.5s ease-out both;
        }
        .about-card:nth-child(1) { animation-delay: 0.05s; }
        .about-card:nth-child(2) { animation-delay: 0.15s; }
        .about-card:nth-child(3) { animation-delay: 0.25s; }
        .about-card:nth-child(4) { animation-delay: 0.35s; }
        .about-card:nth-child(5) { animation-delay: 0.45s; }
        .about-title {
          background: linear-gradient(90deg, #ffffff, #ffe9ff 40%, #d8f2ff);
          -webkit-background-clip: text; background-clip: text;
          color: transparent;
        }
        .about-link-row {
          display: flex; align-items: center;
          padding: 12px 10px; border-radius: 12px;
          cursor: pointer; transition: background 0.2s ease;
          text-decoration: none;
        }
        .about-link-row:hover { background: rgba(255,255,255,0.15); }
        .about-social-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .about-stat-box { text-align: center; flex: 1; }
        .about-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.25); margin-top: 4px; }
        .about-profile-img {
          width: 120px; height: 120px; border-radius: 50%;
          object-fit: cover;
          border: 4px solid rgba(255,255,255,0.5);
          box-shadow: 0 8px 28px rgba(0,0,0,0.35);
        }
      `}</style>

      <div className="about-blob b1" />
      <div className="about-blob b2" />
      <div className="about-blob b3" />
      <div className="about-blob b4" />

      <div className="relative z-10 max-w-xl mx-auto">

        {/* Profile Header */}
        <div className="about-card" style={{ textAlign: 'center' }}>
          <img
            src="/profile.jpg"
            alt="Dr Aamir Uddin"
            className="about-profile-img"
            style={{ margin: '0 auto 16px', display: 'block' }}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback in case image doesn't load */}
          <div style={{
            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4568dc, #0fb8ad)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            fontSize: '48px',
            border: '4px solid rgba(255,255,255,0.5)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.35)'
          }}>
            🩺
          </div>
          <h1 className="about-title text-2xl sm:text-3xl font-extrabold">Dr Aamir Uddin</h1>
          <p style={{ color: '#ffe9a8', fontSize: '16px', fontStyle: 'italic', marginTop: '6px', fontWeight: 700 }}>
            Final Year MBBS Student
          </p>
          <p style={{ color: '#ffffff', fontSize: '14px', marginTop: '10px', lineHeight: 1.7, fontWeight: 500 }}>
            Federal Medical College, Islamabad<br />
            Teaching Hospital: PIMS, Islamabad
          </p>
          <div style={{
            marginTop: '12px', display: 'inline-block',
            background: 'rgba(255,255,255,0.15)', borderRadius: '20px',
            padding: '6px 16px', fontSize: '13px', color: '#ffffff', fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            South Waziristan Agency
          </div>
        </div>

        {/* Mission */}
        <div className="about-card">
          <h2 style={{ color: '#35e0c4', fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>
            Why I Built This App
          </h2>
          <p style={{ color: '#ffffff', fontSize: '15px', lineHeight: 1.9, fontWeight: 400 }}>
            As a medical student myself, I know how overwhelming it can be to carry stacks of heavy textbooks everywhere.
            I built this app to replace that burden with a single, lightweight mobile application packed with comprehensive
            study material for medical and MDCAT students. My goal is to make quality education accessible to everyone,
            anywhere, anytime — without the weight of physical books holding you back.
          </p>
        </div>

        {/* Stats */}
        <div className="about-card">
          <h2 style={{ color: '#35e0c4', fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
            What's Inside
          </h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="about-stat-box">
              <div style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800 }}>5000+</div>
              <div style={{ color: '#ffe9a8', fontSize: '13px', fontWeight: 600 }}>MCQs</div>
            </div>
            <div className="about-stat-divider" />
            <div className="about-stat-box">
              <div style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800 }}>5</div>
              <div style={{ color: '#ffe9a8', fontSize: '13px', fontWeight: 600 }}>Subjects</div>
            </div>
            <div className="about-stat-divider" />
            <div className="about-stat-box">
              <div style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800 }}>Free</div>
              <div style={{ color: '#ffe9a8', fontSize: '13px', fontWeight: 600 }}>Access</div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="about-card">
          <h2 style={{ color: '#35e0c4', fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
            Connect With Me
          </h2>

          <a href="https://www.facebook.com/share/1E7srFhDDm/" target="_blank" rel="noopener noreferrer" className="about-link-row">
            <div className="about-social-icon" style={{ background: 'rgba(24,119,242,0.3)' }}>📘</div>
            <div>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>Facebook Page</div>
              <div style={{ color: '#ffe9a8', fontSize: '13px', fontWeight: 500 }}>AK Academy</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#ffffff', fontWeight: 700, fontSize: '18px' }}>→</span>
          </a>

          <a href="https://www.tiktok.com/@medlife458" target="_blank" rel="noopener noreferrer" className="about-link-row">
            <div className="about-social-icon" style={{ background: 'rgba(255,0,80,0.2)' }}>🎵</div>
            <div>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>TikTok</div>
              <div style={{ color: '#ffe9a8', fontSize: '13px', fontWeight: 500 }}>@medlife458</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#ffffff', fontWeight: 700, fontSize: '18px' }}>→</span>
          </a>
        </div>

        {/* Footer */}
        <div className="about-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)' }}>
          <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
            For any query or feedback, reach out via our social media pages.
          </p>
          <p style={{ color: '#ffe9a8', fontSize: '13px', marginTop: '8px', fontWeight: 500 }}>
            MedLife App v1.0.0 — Made with care for Medical Students
          </p>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: '8px', animation: 'cardIn 0.5s ease-out 0.55s both' }}>
          <Link to="/" replace className="inline-block px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#ffffff', fontWeight: 700
            }}>
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}