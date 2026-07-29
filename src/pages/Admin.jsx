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
  
  const [activeTab, setActiveTab] = useState('pending');
  const previousPendingCount = useRef(0);
  const notificationTimeoutRef = useRef(null); // Fixes memory leak for setTimeout

  // REAL-TIME LISTENER
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (querySnapshot) => {
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(usersList);
      
      const pendingUsers = usersList.filter(u => u.paymentStatus === 'pending');
      
      // NOTIFICATION LOGIC: Fixed to trigger even if going from 0 to 1
      if (pendingUsers.length > previousPendingCount.current) {
        setShowNotification(true);
        
        // Clear existing timeout to prevent flickering if multiple requests come in
        if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
        
        notificationTimeoutRef.current = setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
      previousPendingCount.current = pendingUsers.length;
      
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users: ", err);
      setLoading(false);
    });

    // Cleanup the listener AND the timeout
    return () => {
      unsubscribe();
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

  const handleApprove = async (userId, plan) => {
    setMessage('');
    try {
      const expiryDate = new Date();
      if (plan === '6_months') {
        expiryDate.setDate(expiryDate.getDate() + 180);
      } else if (plan === '1_year') {
        expiryDate.setDate(expiryDate.getDate() + 365);
      }

      await updateDoc(doc(db, 'users', userId), {
        isPremium: true,
        expiryDate: expiryDate.toISOString(),
        paymentStatus: "approved"
      });

      setMessage(`Success! User approved until ${expiryDate.toLocaleDateString()}.`);
    } catch (err) {
      console.error("Error approving user: ", err);
      setMessage('Error approving user. Check Firestore rules.');
    }
  };

  const handleCancelAccess = async (userId, email) => {
    setMessage('');
    if (window.confirm(`Are you sure you want to cancel premium access for ${email}?`)) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isPremium: false,
          paymentStatus: "canceled"
        });
        setMessage(`Success! Premium access canceled for ${email}.`);
      } catch (err) {
        console.error("Error canceling user: ", err);
        setMessage('Error canceling user.');
      }
    }
  };

  const adminEmail = "draamir308@gmail.com"; 

  if (!currentUser || currentUser.email?.toLowerCase() !== adminEmail) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
        <Link to="/" className="text-blue-600 underline mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const pendingUsers = allUsers.filter(u => u.paymentStatus === 'pending');
  
  // Fixed logic: Premium users must have a future expiry date. 
  // If isPremium is true but date is passed, they fall into "otherUsers"
  const premiumUsers = allUsers.filter(u => 
    u.isPremium === true && u.expiryDate && new Date(u.expiryDate) > new Date()
  );
  
  const otherUsers = allUsers.filter(u => {
    // If they are pending, exclude (they show in pending tab)
    if (u.paymentStatus === 'pending') return false;
    
    // If they are premium but expired, include them here as inactive
    if (u.isPremium === true && (!u.expiryDate || new Date(u.expiryDate) <= new Date())) {
      return true;
    }
    
    // Include anyone who is not premium
    return u.isPremium !== true;
  });

  return (
    <div className="min-h-screen p-8 relative">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">Manage student accounts and payments in real-time.</p>
        </header>

        {/* Real-time Notification Popup */}
        {showNotification && (
          <div className="fixed top-20 right-8 bg-green-600 text-white p-4 rounded-xl shadow-2xl animate-bounce z-50 flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-bold">New Payment Request!</p>
              <p className="text-sm">A student just submitted their Transaction ID.</p>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-semibold">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Pending Payments ({pendingUsers.length})
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            All Registered Students ({allUsers.length})
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : activeTab === 'pending' ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Payments</h2>
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500 italic">No pending payments right now. Keep this page open to get instant notifications!</p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-yellow-50">
                      <div>
                        <p className="font-bold text-gray-800">{user.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Plan:</strong> {user.plan === '6_months' ? '6 Months (5,000 PKR)' : '1 Year (10,000 PKR)'}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Transaction ID:</strong> {user.trxId}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleApprove(user.id, user.plan)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full md:w-auto"
                      >
                        Approve & Unlock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">All Registered Students</h2>
              {allUsers.length === 0 ? (
                <p className="text-gray-500 italic">No students registered yet.</p>
              ) : (
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
                                <p className="text-sm text-gray-500 mt-1">
                                  <strong>Status:</strong> Active for {daysLeft} more days
                                </p>
                              </div>
                              <button 
                                onClick={() => handleCancelAccess(user.id, user.email)}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors w-full md:w-auto"
                              >
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
                          // Calculate if they were expired
                          const isExpired = user.isPremium === true && user.expiryDate && new Date(user.expiryDate) <= new Date();
                          
                          return (
                            <div key={user.id} className="border border-gray-200 bg-gray-50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-75">
                              <div>
                                <p className="font-bold text-gray-700">{user.email}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  <strong>Status:</strong> {isExpired ? 'Expired' : user.paymentStatus === 'canceled' ? 'Canceled by Admin' : 'Not Paid'}
                                </p>
                              </div>
                              {/* Removed the dead 'pending' check code from here */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}