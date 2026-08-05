import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, isPremium, expiryDate, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [displayName, setDisplayName] = useState('');

  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const emailUserName = user?.email ? user.email.split('@')[0] : 'Student';
  const email = user?.email || 'Not logged in';

  useEffect(() => {
    const savedName = localStorage.getItem('user_custom_name');
    if (savedName) setDisplayName(savedName);
    else setDisplayName(emailUserName);
  }, [emailUserName]);

  const handleSaveName = () => {
    const newName = nameInput.trim() || emailUserName;
    localStorage.setItem('user_custom_name', newName);
    setDisplayName(newName);
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-300">
      
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 pt-10 pb-20 rounded-b-[2.5rem] text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-10 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center text-white text-sm font-semibold">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
            </Link>
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="w-6"></div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white/20 border-4 border-white/30 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 uppercase shadow-lg">{displayName.charAt(0)}</div>
            
            {isEditingName ? (
              <div className="flex flex-col items-center gap-2 mt-1 w-full max-w-xs">
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full px-3 py-2 text-center text-slate-800 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white" autoFocus />
                <button onClick={handleSaveName} className="bg-white text-indigo-600 px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">Save Name</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <h2 className="text-2xl font-bold capitalize">{displayName}</h2>
                <button onClick={() => { setNameInput(displayName); setIsEditingName(true); }} className="text-white/80 hover:text-white transition-colors" title="Edit Name">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              </div>
            )}
            <p className="text-sm text-indigo-100 mt-1 break-all">{email}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 relative z-20">
        <div className={`rounded-2xl border p-5 mb-6 shadow-md bg-white dark:bg-slate-800 transition-colors ${isPremium ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`font-bold text-lg ${isPremium ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{isPremium ? "⭐ Premium Active" : "🔒 Account Expired"}</h3>
              {isPremium ? <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{daysLeft} days remaining</p> : <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Recharge to unlock all features</p>}
            </div>
            {isPremium ? (
              <Link to="/payment" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">Upgrade</Link>
            ) : (
              <Link to="/payment" className="text-xs font-bold text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Recharge</Link>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-6 transition-colors">
          <Link to="/dashboard" className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Performance Dashboard</span>
            </div>
            <svg className="w-5 h-5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
          <Link to="/payment" className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">💳</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Payment & Plans</span>
            </div>
            <svg className="w-5 h-5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚪</span>
              <span className="font-semibold text-red-500 text-sm">Log Out</span>
            </div>
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-around py-3 px-5 rounded-t-2xl shadow-2xl z-50 transition-colors duration-300">
        <Link to="/" className="flex flex-col items-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <button onClick={() => navigate('/')} className="flex flex-col items-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="text-[10px] mt-1 font-medium">Library</span>
        </button>
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Stats</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-indigo-600 dark:text-indigo-400">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
          <span className="text-[10px] mt-1 font-bold">Profile</span>
        </Link>
      </div>
    </div>
  );
}