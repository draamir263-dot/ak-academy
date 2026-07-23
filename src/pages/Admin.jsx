import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Tab state: 'pending' or 'all'
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch all users from database
  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUsers(usersList);
      } catch (err) {
        console.error("Error fetching users: ", err);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [message]);

  // Handle Approve Button Click
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

  // Handle Cancel Access Button Click
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

  // SECURITY CHECK
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

  // Filter users based on active tab
  const pendingUsers = allUsers.filter(u => u.paymentStatus === 'pending');
  const premiumUsers = allUsers.filter(u => u.isPremium === true);
  const otherUsers = allUsers.filter(u => u.isPremium !== true && u.paymentStatus !== 'pending');

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">Manage student accounts and payments.</p>
        </header>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-semibold">
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
            /* PENDING PAYMENTS TAB */
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Payments</h2>
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500 italic">No pending payments right now.</p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            /* ALL STUDENTS TAB */
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">All Registered Students</h2>
              {allUsers.length === 0 ? (
                <p className="text-gray-500 italic">No students registered yet.</p>
              ) : (
                <div className="space-y-4">
                  
                  {/* Active Premium Users */}
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

                  {/* Expired / Canceled Users */}
                  {otherUsers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Inactive / Expired</h3>
                      <div className="space-y-4">
                        {otherUsers.map(user => (
                          <div key={user.id} className="border border-gray-200 bg-gray-50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-75">
                            <div>
                              <p className="font-bold text-gray-700">{user.email}</p>
                              <p className="text-sm text-gray-400 mt-1">
                                <strong>Status:</strong> {user.paymentStatus === 'canceled' ? 'Canceled by Admin' : 'Expired/Not Paid'}
                              </p>
                            </div>
                            {user.paymentStatus === 'pending' && (
                               <button 
                               onClick={() => handleApprove(user.id, user.plan)}
                               className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full md:w-auto"
                             >
                               Approve
                             </button>
                            )}
                          </div>
                        ))}
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