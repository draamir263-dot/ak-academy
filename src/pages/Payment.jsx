import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Payment() {
  const { user, submitPayment } = useAuth(); 
  const navigate = useNavigate();
  
  const [trxId, setTrxId] = useState('');
  const [plan, setPlan] = useState('6_months');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    async function fetchPaymentInfo() {
      try {
        const docRef = doc(db, 'appConfig', 'paymentInfo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPaymentInfo(docSnap.data());
        }
      } catch (err) {
        console.error('Error loading payment info:', err);
      }
    }
    fetchPaymentInfo();
  }, []);

  const PLANS = {
    '15_days': { price: 999, days: 15, label: '15 Days', desc: 'Quick revision' },
    '1_month': { price: 1999, days: 30, label: '1 Month', desc: 'Focused preparation' },
    '3_months': { price: 4999, days: 90, label: '3 Months', desc: 'Repeated practice' },
    '3_Months': { price: 4999, days: 90, label: '3 Months', desc: 'Repeated practice' },
    '6_months': { price: 8999, days: 180, label: '6 Months', desc: 'Comprehensive study' },
    '1_year': { price: 15999, days: 365, label: '1 Year', desc: 'Full academic year' }
  };

  const { amountToPay, isUpgrade, daysSpent, remainingValue } = useMemo(() => {
    if (!user || !user.currentPlan || user.currentPlan === 'none' || user.paymentStatus !== 'approved') {
      return { amountToPay: PLANS[plan].price, isUpgrade: false, daysSpent: 0, remainingValue: 0 };
    }

    const currentPlanConfig = PLANS[user.currentPlan];
    const newPlanConfig = PLANS[plan];

    if (user.currentPlan === plan || newPlanConfig.price <= currentPlanConfig.price) {
      return { amountToPay: newPlanConfig.price, isUpgrade: false, daysSpent: 0, remainingValue: 0 };
    }

    const startDate = new Date(user.planStartDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const daysSpentCalc = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const safeDaysSpent = Math.min(daysSpentCalc, currentPlanConfig.days);
    const dailyRate = currentPlanConfig.price / currentPlanConfig.days;
    const remainingValueCalc = dailyRate * (currentPlanConfig.days - safeDaysSpent);
    
    let upgradeCost = newPlanConfig.price - remainingValueCalc;
    if (upgradeCost < 0) upgradeCost = 0;

    return { 
      amountToPay: Math.round(upgradeCost), 
      isUpgrade: true, 
      daysSpent: safeDaysSpent, 
      remainingValue: Math.round(remainingValueCalc) 
    };
  }, [user, plan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await submitPayment(trxId, plan, amountToPay);
      setMessage('Payment submitted successfully! Please wait up to 24 hours for admin verification. You will be logged out automatically.');
      setTrxId('');
      
      setTimeout(() => {
        navigate('/');
        window.location.reload(); 
      }, 5000);

    } catch (err) {
      setMessage('Error submitting payment. Please try again.');
    }
    setLoading(false);
  };

  const bankInfo = paymentInfo?.faySalBank || paymentInfo?.faysalBank || null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors text-sm font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 mb-1">Unlock MedLife</h1>
            <p className="text-sm text-slate-500">Get access to 50,000+ MCQs, Mock Exams, and Performance Analytics.</p>
          </div>

          {isUpgrade && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm">
              <p className="font-bold mb-1">Upgrade Calculation</p>
              <p>You've used <strong>{daysSpent} days</strong> of your current plan.</p>
              <p>Remaining value: <strong>{remainingValue} PKR</strong></p>
              <p className="mt-2 text-green-600 font-bold">Amount due for upgrade: {amountToPay} PKR</p>
            </div>
          )}

          {/* Plans Grid - Compact for Mobile */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Select a Plan</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {Object.entries(PLANS)
                .filter(([key]) => key !== '3_Months') 
                .map(([key, config]) => (
                <div 
                  key={key}
                  className={`p-3 rounded-xl cursor-pointer flex flex-col justify-between transition-all ${plan === key ? 'bg-indigo-50 border-2 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-slate-50 border border-slate-200 hover:border-indigo-400'}`} 
                  onClick={() => setPlan(key)}
                >
                  <h3 className={`font-bold text-sm ${plan === key ? 'text-indigo-700' : 'text-slate-700'}`}>{config.label}</h3>
                  <p className={`text-lg font-extrabold mt-1 ${plan === key ? 'text-indigo-800' : 'text-slate-800'}`}>{config.price} PKR</p>
                  <p className={`text-[10px] mt-1 ${plan === key ? 'text-indigo-500' : 'text-slate-400'}`}>{config.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Transfer {isUpgrade ? 'the upgrade amount' : 'the amount'} to:</h3>
            
            {paymentInfo?.jazzCashSadapay && (
              <div className="border-b border-slate-200 pb-3">
                <p className="font-semibold text-slate-700 text-sm">JazzCash / SadaPay</p>
                <p className="text-slate-500 text-xs mt-1">Title: {paymentInfo.jazzCashSadapay.accountName}</p>
                <p className="text-slate-500 text-xs">Number: {paymentInfo.jazzCashSadapay.accountNumber}</p>
              </div>
            )}

            {bankInfo && (
              <div>
                <p className="font-semibold text-slate-700 text-sm">Faysal Bank</p>
                <p className="text-slate-500 text-xs mt-1">Title: {bankInfo.accountName}</p>
                <p className="text-slate-500 text-xs">Account Number: {bankInfo.accountNumber}</p>
              </div>
            )}

            <p className="text-xs text-red-500 mt-2">*After transferring <strong>{amountToPay} PKR</strong>, enter your Transaction ID below.</p>
          </div>

          {/* Contact Admin */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-center">
            <p className="text-xs text-blue-800">Having issues with payments or upgrades?</p>
            <p className="text-xs text-blue-800 mt-1">
              Contact Admin: <a href={`mailto:${paymentInfo?.contactEmail || ''}`} className="font-bold text-blue-600 hover:text-blue-700 underline">{paymentInfo?.contactEmail || 'Loading...'}</a>
            </p>
          </div>

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center">
              {message}
            </div>
          )}

          {user?.paymentStatus === 'rejected' && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center font-bold">
              Your previous payment request was rejected (Invalid Transaction ID).<br /> 
              Please verify and submit the correct Transaction ID below.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">JazzCash / Bank Transaction ID</label>
              <input 
                type="text" 
                required 
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="e.g. TXN123456789"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Submitting...' : `Submit Payment Request (${amountToPay} PKR)`}
            </button>
          </form>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around py-3 px-5 rounded-t-2xl shadow-2xl z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </button>
        <button onClick={() => navigate('/')} className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="text-[10px] mt-1 font-medium">Library</span>
        </button>
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Stats</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}