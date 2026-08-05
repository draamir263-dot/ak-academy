import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, isPremium, expiryDate, logout } = useAuth();
  const navigate = useNavigate();

  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const userName = user?.email ? user.email.split('@')[0] : 'Student';
  const email = user?.email || 'Not logged in';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 pt-10 pb-20 rounded-b-[2.5rem] text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-10 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center text-white text-sm font-semibold">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="w-6"></div> {/* Spacer to center title */}
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white/20 border-4 border-white/30 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 uppercase shadow-lg">
              {userName.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold capitalize">{userName}</h2>
            <p className="text-sm text-indigo-100 mt-1 break-all">{email}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 -mt-10 relative z-20">
        
        {/* Premium Status Card */}
        <div className={`rounded-2xl border p-5 mb-6 shadow-md bg-white ${isPremium ? 'border-green-200' : 'border-red-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`font-bold text-lg ${isPremium ? 'text-green-700' : 'text-red-700'}`}>
                {isPremium ? "⭐ Premium Active" : "🔒 Account Expired"}
              </h3>
              {isPremium ? (
                <p className="text-sm text-slate-500 mt-1">{daysLeft} days remaining</p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Recharge to unlock all features</p>
              )}
            </div>
            {isPremium ? (
              <Link to="/payment" className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                Upgrade
              </Link>
            ) : (
              <Link to="/payment" className="text-xs font-bold text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Recharge
              </Link>
            )}
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <Link to="/dashboard" className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-slate-700 text-sm">Performance Dashboard</span>
            </div>
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
          <Link to="/payment" className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">💳</span>
              <span className="font-semibold text-slate-700 text-sm">Payment & Plans</span>
            </div>
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚪</span>
              <span className="font-semibold text-red-500 text-sm">Log Out</span>
            </div>
          </button>
        </div>

      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around py-3 px-5 rounded-t-2xl shadow-2xl z-50">
        <Link to="/" className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <button onClick={() => navigate('/')} className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="text-[10px] mt-1 font-medium">Library</span>
        </button>
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Stats</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-indigo-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
          <span className="text-[10px] mt-1 font-bold">Profile</span>
        </Link>
      </div>

    </div>
  );
}