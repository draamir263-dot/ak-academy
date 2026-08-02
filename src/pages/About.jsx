import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ padding: '24px 16px 48px' }}>
      <div className="max-w-xl mx-auto">

        {/* Profile Header */}
        <div style={{
          textAlign: 'center', background: '#ffffff', borderRadius: '20px',
          padding: '32px 24px', marginBottom: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb'
        }}>
          <img
            src="/profile.jpg"
            alt="Dr Aamir Uddin"
            style={{
              width: 120, height: 120, borderRadius: '50%',
              objectFit: 'cover', display: 'block', margin: '0 auto 16px',
              border: '4px solid #e0e7ff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div style={{
            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4568dc, #0fb8ad)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            fontSize: '48px', border: '4px solid #e0e7ff'
          }}>
            🩺
          </div>
          <h1 style={{ color: '#1e293b', fontSize: '26px', fontWeight: 800, margin: 0 }}>
            Dr Aamir Uddin
          </h1>
          <p style={{ color: '#0d9488', fontSize: '16px', fontStyle: 'italic', marginTop: '6px', fontWeight: 600, marginBottom: 0 }}>
            Final Year MBBS Student
          </p>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '10px', lineHeight: 1.7 }}>
            Federal Medical College, Islamabad<br />
            Teaching Hospital: PIMS, Islamabad
          </p>
          <span style={{
            display: 'inline-block', marginTop: '12px',
            background: '#eff6ff', borderRadius: '20px',
            padding: '6px 16px', fontSize: '13px', color: '#1e40af', fontWeight: 600,
            border: '1px solid #bfdbfe'
          }}>
            South Waziristan Agency
          </span>
        </div>

        {/* Mission */}
        <div style={{
          background: '#ffffff', borderRadius: '20px', padding: '24px',
          marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ color: '#0d9488', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
            Why I Built This App
          </h2>
          <p style={{ color: '#334155', fontSize: '15px', lineHeight: 1.9 }}>
            As a medical student myself, I know how overwhelming it can be to carry stacks of heavy textbooks everywhere.
            I built this app to replace that burden with a single, lightweight mobile application packed with comprehensive
            study material for medical and MDCAT students. My goal is to make quality education accessible to everyone,
            anywhere, anytime — without the weight of physical books holding you back.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          background: '#ffffff', borderRadius: '20px', padding: '24px',
          marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ color: '#0d9488', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
            What's Inside
          </h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#1e293b', fontSize: '26px', fontWeight: 800 }}>5000+</div>
              <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>MCQs</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: '#e2e8f0', marginTop: '4px' }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#1e293b', fontSize: '26px', fontWeight: 800 }}>5</div>
              <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Subjects</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: '#e2e8f0', marginTop: '4px' }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#1e293b', fontSize: '26px', fontWeight: 800 }}>Free</div>
              <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Access</div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div style={{
          background: '#ffffff', borderRadius: '20px', padding: '24px',
          marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ color: '#0d9488', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
            Connect With Me
          </h2>

          <a href="https://www.facebook.com/share/1E7srFhDDm/" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', padding: '12px 10px',
              borderRadius: '12px', textDecoration: 'none', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              background: '#eff6ff', flexShrink: 0
            }}>📘</div>
            <div>
              <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: 700 }}>Facebook Page</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>AK Academy</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#1877F2', fontWeight: 700, fontSize: '18px' }}>→</span>
          </a>

          <a href="https://www.tiktok.com/@medlife458" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', padding: '12px 10px',
              borderRadius: '12px', textDecoration: 'none', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              background: '#fef2f2', flexShrink: 0
            }}>🎵</div>
            <div>
              <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: 700 }}>TikTok</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>@medlife458</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#ff0050', fontWeight: 700, fontSize: '18px' }}>→</span>
          </a>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', background: '#ffffff', borderRadius: '20px',
          padding: '16px', marginBottom: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#475569', fontSize: '14px' }}>
            For any query or feedback, reach out via our social media pages.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
            MedLife App v1.0.0 — Made with care for Medical Students
          </p>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/" replace className="inline-block px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: '#1e293b', color: '#ffffff',
              border: 'none', textDecoration: 'none'
            }}>
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}