import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Payment() {
  const { submitPayment } = useAuth();
  const navigate = useNavigate();
  
  const [trxId, setTrxId] = useState('');
  const [plan, setPlan] = useState('6_months');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await submitPayment(trxId, plan);
      setMessage('Payment submitted! Please wait 1-12 hours for admin approval. You will be logged out automatically.');
      setTrxId('');
      
      // Automatically log them out after 5 seconds so they know they have to wait
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
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Unlock AK Academy</h1>
          <p className="text-gray-500 mb-6">Get access to 50,000+ MCQs, Mock Exams, and Performance Analytics.</p>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className={`p-6 rounded-xl border-2 cursor-pointer ${plan === '6_months' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setPlan('6_months')}>
              <h3 className="font-bold text-xl text-gray-800">6 Months</h3>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">5,000 PKR</p>
              <p className="text-sm text-gray-500 mt-1">Perfect for MDCAT preparation</p>
            </div>
            <div className={`p-6 rounded-xl border-2 cursor-pointer ${plan === '1_year' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setPlan('1_year')}>
              <h3 className="font-bold text-xl text-gray-800">1 Year</h3>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">10,000 PKR</p>
              <p className="text-sm text-gray-500 mt-1">Best value for repeated practice</p>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Transfer the amount to:</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Bank:</strong> Bank Alfalah / JazzCash / EasyPaisa</p>
              <p><strong>Account Title:</strong> Aamir Khan</p> {/* Change this to your name */}
              <p><strong>Account Number:</strong> 0300-1234567</p> {/* Change this to your real number */}
              <p className="text-sm text-red-500 mt-2">*After transferring, enter your Transaction ID below.</p>
            </div>
          </div>

          {/* Submit Form */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">JazzCash / Bank Transaction ID</label>
              <input 
                type="text" 
                required 
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. TXN123456789"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Payment Request'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}