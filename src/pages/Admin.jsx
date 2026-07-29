import { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  
  const [cancelModal, setCancelModal] = useState({ isOpen: false, userId: null, email: '' });
  const [reactivateModal, setReactivateModal] = useState({ isOpen: false, userId: null, email: '' });
  
  const [activeTab, setActiveTab] = useState('pending');
  const previousPendingCount = useRef(0);
  const notificationTimeoutRef = useRef(null); 

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (querySnapshot) => {
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(usersList);
      
      const pendingUsers = usersList.filter(u => u.paymentStatus === 'pending');
      
      if (pendingUsers.length > previousPendingCount.current) {
        setShowNotification(true);
        if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => setShowNotification(false), 5000);
      }
      previousPendingCount.current = pendingUsers.length;
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users: ", err);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

  const handleApprove = async (userId, plan) => {
    setMessage('');
    try {
      const expiryDate = new Date();
      const startDate = new Date(); 

      if (plan === '6_months') {
        expiryDate.setDate(expiryDate.getDate() + 180);
      } else if (plan === '3_Months') {
        expiryDate.setDate(expiryDate.getDate() + 90);
      }

      await updateDoc(doc(db, 'users', userId), {
        isPremium: true,
        expiryDate: expiryDate.toISOString(),
        paymentStatus: "approved",
        currentPlan: plan,                         
        planStartDate: startDate.toISOString()     
      });

      setMessage(`Success! User approved until ${expiryDate.toLocaleDateString()}.`);
    } catch (err) {
      setMessage('Error approving user. Check Firestore rules.');
    }
  };

  const confirmCancellation = async () => {
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', cancelModal.userId), {
        isPremium: false,
        paymentStatus: "canceled"
      });
      setMessage(`Success! Premium access canceled for ${cancelModal.email}.`);
    } catch (err) {
      setMessage('Error canceling user.');
    }
    setCancelModal({ isOpen: false, userId: null, email: '' });
  };

  const confirmReactivation = async () => {
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', reactivateModal.userId), {
        isPremium: true,
        paymentStatus: "approved"
      });
      setMessage(`Success! Premium access restored for ${reactivateModal.email}.`);
    } catch (err) {
      setMessage('Error restoring user access.');
    }
    setReactivateModal({ isOpen: false, userId: null, email: '' });
  };

  const adminEmail = "draamir308@gmail.com"; 

  if (!currentUser || currentUser.email?.toLowerCase() !== adminEmail) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const pendingUsers = allUsers.filter(u => u.paymentStatus === 'pending');
  const premiumUsers = allUsers.filter(u => u.isPremium === true && u.expiryDate && new Date(u.expiryDate) > new Date());
  const otherUsers = allUsers.filter(u => {
    if (u.paymentStatus === 'pending') return false;
    if (u.isPremium === true && (!u.expiryDate || new Date(u.expiryDate) <= new Date())) return true;
    return u.isPremium !== true;
  });

  return (
    <div className="min-h-screen p-8 relative">
      
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Premium?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to revoke premium access for <strong>{cancelModal.email}</strong>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCancelModal({ isOpen: false, userId: null, email: '' })} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">No, Go Back</button>
              <button onClick={confirmCancellation} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Yes, Cancel Access</button>
            </div>
          </div>
        </div>
      )}

      {reactivateModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Restore Access?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to reopen premium access for <strong>{reactivateModal.email}</strong>? They will regain their remaining days.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setReactivateModal({ isOpen: false, userId: null, email: '' })} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={confirmReactivation} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Yes, Restore Access</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">Admin Dashboard</h1>
        </header>

        {showNotification && (
          <div className="fixed top-20 right-8 bg-green-600 text-white p-4 rounded-xl shadow-2xl animate-bounce z-50 flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div><p className="font-bold">New Payment Request!</p></div>
          </div>
        )}

        {message && <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-semibold">{message}</div>}

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pending Payments ({pendingUsers.length})</button>
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>All Registered Students ({allUsers.length})</button>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          {loading ? <p className="text-gray-500">Loading...</p> : activeTab === 'pending' ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Payments</h2>
              {pendingUsers.length === 0 ? <p className="text-gray-500 italic">No pending payments right now.</p> : (
                <div className="space-y-4">
                  {pendingUsers.map(user => {
                    const isUpgrade = user.currentPlan && user.currentPlan !== 'none' && user.currentPlan !== user.plan && user.isPremium;
                    return (
                      <div key={user.id} className={`border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isUpgrade ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <div>
                          <p className="font-bold text-gray-800">{user.email}</p>
                          {isUpgrade ? (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">UPGRADE REQUEST</span>
                          ) : (
                            <span className="inline-block mt-1 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">NEW SUBSCRIPTION</span>
                          )}
                          <p className="text-sm text-gray-700 mt-2"><strong>Requested Plan:</strong> {user.plan === '6_months' ? '6 Months' : '3 Months'}</p>
                          <p className="text-sm text-gray-700"><strong>Amount to Verify:</strong> {user.amountPaid ? `${user.amountPaid} PKR` : 'Full Price'}</p>
                          <p className="text-sm text-gray-700"><strong>Transaction ID:</strong> <span className="font-mono bg-white px-1 border border-gray-200 rounded">{user.trxId}</span></p>
                        </div>
                        <button onClick={() => handleApprove(user.id, user.plan)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 w-full md:w-auto">
                          Approve & Unlock
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">All Registered Students</h2>
              <div className="space-y-4">
                {premiumUsers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-green-600 uppercase mb-2">Premium Active</h3>
                    <div className="space-y-4">
                      {premiumUsers.map(user => {
                        const daysLeft = user.expiryDate ? Math.ceil((new Date(user.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                        return (
                          <div key={user.id} className="border border-green-200 bg-green-50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <p className="font-bold text-gray-800">{user.email}</p>
                              <p className="text-sm text-gray-500 mt-1"><strong>Status:</strong> Active for {daysLeft} more days</p>
                            </div>
                            <button onClick={() => setCancelModal({ isOpen: true, userId: user.id, email: user.email })} className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 w-full md:w-auto">
                              Cancel Access
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {otherUsers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Inactive / Expired</h3>
                    <div className="space-y-4">
                      {otherUsers.map(user => {
                        const isExpired = user.isPremium === true && user.expiryDate && new Date(user.expiryDate) <= new Date();
                        const isCanceled = user.paymentStatus === 'canceled';
                        
                        return (
                          <div key={user.id} className="border border-gray-200 bg-gray-50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-90">
                            <div>
                              <p className="font-bold text-gray-700">{user.email}</p>
                              <p className="text-sm text-gray-400 mt-1">
                                <strong>Status:</strong> {isExpired ? 'Expired' : isCanceled ? 'Canceled by Admin' : 'Not Paid'}
                              </p>
                            </div>
                            {(isCanceled || isExpired) && (
                               <button 
                                 onClick={() => setReactivateModal({ isOpen: true, userId: user.id, email: user.email })} 
                                 className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm w-full md:w-auto"
                               >
                                 Reopen Access
                               </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}