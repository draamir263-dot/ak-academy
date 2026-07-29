import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Payment() {
  // We now have access to both 'user' (the database document) and 'submitPayment'
  const { user, submitPayment } = useAuth(); 
  const navigate = useNavigate();
  
  const [trxId, setTrxId] = useState('');
  const [plan, setPlan] = useState('6_months');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Plan configurations (Names exactly match Admin.jsx now)
  const PLANS = {
    '3_Months': { price: 4999, days: 90, label: '3 Months' },
    '6_months': { price: 9999, days: 180, label: '6 Months' }
  };

  // Calculate the upgrade amount dynamically
  const { amountToPay, isUpgrade, daysSpent, remainingValue } = useMemo(() => {
    // SECURITY UPDATE: If no user, no current plan, or their status is canceled/expired, 
    // they do NOT get an upgrade discount. They pay fresh.
    if (!user || !user.currentPlan || user.currentPlan === 'none' || user.paymentStatus !== 'approved') {
      return { amountToPay: PLANS[plan].price, isUpgrade: false, daysSpent: 0, remainingValue: 0 };
    }

    const currentPlanConfig = PLANS[user.currentPlan];
    const newPlanConfig = PLANS[plan];

    // If they select the same plan they already have, or downgrading, just show full price
    if (user.currentPlan === plan || newPlanConfig.price <= currentPlanConfig.price) {
      return { amountToPay: newPlanConfig.price, isUpgrade: false, daysSpent: 0, remainingValue: 0 };
    }

    // Calculate days spent
    const startDate = new Date(user.planStartDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const daysSpentCalc = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Prevent division by zero or negative days
    const safeDaysSpent = Math.min(daysSpentCalc, currentPlanConfig.days);

    // Calculate remaining value
    const dailyRate = currentPlanConfig.price / currentPlanConfig.days;
    const remainingValueCalc = dailyRate * (currentPlanConfig.days - safeDaysSpent);

    // Calculate final upgrade cost
    let upgradeCost = newPlanConfig.price - remainingValueCalc;
    
    // Ensure it doesn't go negative
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
      // Passes the calculated amountToPay to AuthContext so the Admin can see it
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

  return (
    <div className="relative min-h-screen aurora-bg overflow-hidden p-3 md:p-6">
      <style>{`
        @keyframes auroraShift { 0% { background-position: 0% 30%; } 50% { background-position: 100% 70%; } 100% { background-position: 0% 30%; } }
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,26px) scale(1.08); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-22px,18px) scale(0.94); } }
        @keyframes floatC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-20px) scale(1.05); } }
        .aurora-bg { background: linear-gradient(135deg, #1b0f42 0%, #3a1c71 28%, #4568dc 58%, #0fb8ad 88%, #35e0c4 100%); background-size: 260% 260%; animation: auroraShift 16s ease-in-out infinite; }
        .aurora-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
        .aurora-blob.b1 { width: 320px; height: 320px; top: -60px; left: -80px; background: radial-gradient(circle, rgba(255,138,216,0.5), transparent 70%); animation: floatA 13s ease-in-out infinite; }
        .aurora-blob.b2 { width: 380px; height: 380px; top: 160px; right: -120px; background: radial-gradient(circle, rgba(90,224,255,0.45), transparent 70%); animation: floatB 17s ease-in-out infinite; }
        .aurora-blob.b3 { width: 340px; height: 340px; bottom: 40px; left: -100px; background: radial-gradient(circle, rgba(255,214,120,0.35), transparent 70%); animation: floatC 15s ease-in-out infinite; }
        .aurora-blob.b4 { width: 300px; height: 300px; bottom: -100px; right: -60px; background: radial-gradient(circle, rgba(151,255,214,0.35), transparent 70%); animation: floatA 19s ease-in-out infinite reverse; }
        .aurora-card { background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06)); backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%); border: 1px solid rgba(255,255,255,0.28); box-shadow: 0 12px 34px rgba(15,8,45,0.28), inset 0 1px 0 rgba(255,255,255,0.3); }
        .aurora-title { background: linear-gradient(90deg, #ffffff, #ffe9ff 40%, #d8f2ff); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: 0 8px 40px rgba(69,104,220,0.4); }
        .aurora-back { background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; transition: background .2s ease, transform .2s ease; }
        .aurora-back:hover { background: rgba(255,255,255,0.22); transform: translateX(-2px); }
        .aurora-input { background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; font-weight: 600; transition: all .2s ease; }
        .aurora-input::placeholder { color: rgba(255,255,255,0.6); }
        .aurora-input:focus { outline: none; border-color: rgba(255,255,255,0.6); box-shadow: 0 0 0 3px rgba(255,255,255,0.15); }
        .aurora-plan-inactive { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); transition: all .2s ease; }
        .aurora-plan-inactive:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.3); }
        .aurora-plan-active { background: linear-gradient(135deg, #ffffff, #f1eaff); border: 2px solid transparent; box-shadow: 0 8px 24px rgba(69,104,220,0.4); }
        .aurora-btn-submit { background: linear-gradient(135deg, #0fb8ad, #35e0c4); color: #102a43; box-shadow: 0 6px 18px rgba(15,184,173,0.4); transition: all .2s ease; }
        .aurora-btn-submit:hover { box-shadow: 0 8px 22px rgba(15,184,173,0.6); transform: translateY(-1px); }
      `}</style>

      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="aurora-blob b4" />

      <div className="relative z-10 max-w-2xl mx-auto py-6">
        <Link to="/" className="aurora-back mb-6 inline-block px-4 py-2 rounded-lg font-semibold text-sm">
          &larr; Back to Home
        </Link>
        
        <div className="aurora-card rounded-2xl p-6 sm:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight aurora-title mb-2">Unlock MedLife</h1>
          <p className="text-gray-300 mb-6">Get access to 50,000+ MCQs, Mock Exams, and Performance Analytics.</p>

          {/* Upgrade Notification Banner */}
          {isUpgrade && (
            <div className="mb-6 p-4 bg-blue-500/15 border border-blue-400/30 text-blue-100 rounded-lg text-sm">
              <p className="font-bold mb-1">Upgrade Calculation</p>
              <p>You've used <strong>{daysSpent} days</strong> of your 3-Month plan.</p>
              <p>Remaining value: <strong>{remainingValue} PKR</strong></p>
              <p className="mt-2 text-green-300 font-bold">Amount due for 6-Month upgrade: {amountToPay} PKR</p>
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div 
              className={`p-6 rounded-xl cursor-pointer ${plan === '6_months' ? 'aurora-plan-active' : 'aurora-plan-inactive'}`} 
              onClick={() => setPlan('6_months')}
            >
              <h3 className={`font-bold text-xl ${plan === '6_months' ? 'text-gray-800' : 'text-white'}`}>6 Months</h3>
              <p className={`text-3xl font-extrabold mt-2 ${plan === '6_months' ? 'text-blue-800' : 'text-blue-300'}`}>9,999 PKR</p>
              <p className={`text-sm mt-1 ${plan === '6_months' ? 'text-gray-600' : 'text-gray-300'}`}>Perfect for MDCAT preparation</p>
            </div>
            <div 
              className={`p-6 rounded-xl cursor-pointer ${plan === '3_Months' ? 'aurora-plan-active' : 'aurora-plan-inactive'}`} 
              onClick={() => setPlan('3_Months')}
            >
              <h3 className={`font-bold text-xl ${plan === '3_Months' ? 'text-gray-800' : 'text-white'}`}>3 Months</h3>
              <p className={`text-3xl font-extrabold mt-2 ${plan === '3_Months' ? 'text-blue-800' : 'text-blue-300'}`}>4,999 PKR</p>
              <p className={`text-sm mt-1 ${plan === '3_Months' ? 'text-gray-600' : 'text-gray-300'}`}>Best value for repeated practice</p>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white/5 border border-white/15 p-6 rounded-xl mb-8 space-y-4">
            <h3 className="font-bold text-white mb-2">Transfer {isUpgrade ? 'the upgrade amount' : 'the amount'} to any of the following:</h3>
            
            <div className="border-b border-white/15 pb-4">
              <p className="font-semibold text-white">JazzCash / Raast ID</p>
              <p className="text-gray-300">Title: Aamir uldeen</p>
              <p className="text-gray-300">Number: 03069747445</p>
            </div>

            <div>
              <p className="font-semibold text-white">Faysal Bank</p>
              <p className="text-gray-300">Title: Aamir uddin</p>
              <p className="text-gray-300">Account Number: 3341383000001976</p>
            </div>

            <p className="text-sm text-red-300 mt-2">*After transferring <strong>{amountToPay} PKR</strong>, enter your Transaction ID below.</p>
          </div>

          {/* Submit Form */}
          {message && (
            <div className="mb-4 p-3 bg-green-500/15 border border-green-400/30 text-green-100 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">JazzCash / Bank Transaction ID</label>
              <input 
                type="text" 
                required 
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="aurora-input w-full p-3 rounded-lg focus:outline-none"
                placeholder="e.g. TXN123456789"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="aurora-btn-submit w-full py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Submitting...' : `Submit Payment Request (${amountToPay} PKR)`}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}