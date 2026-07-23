import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch all users from database
  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter to only show users who have a pending payment
        const pendingUsers = usersList.filter(u => u.paymentStatus === 'pending');
        setUsers(pendingUsers);
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
      // Calculate Expiry Date based on plan
      const expiryDate = new Date();
      if (plan === '6_months') {
        expiryDate.setDate(expiryDate.getDate() + 180); // Add 180 days
      } else if (plan === '1_year') {
        expiryDate.setDate(expiryDate.getDate() + 365); // Add 365 days
      }

      // Update database: set premium to true, save expiry date, change status
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

  // SECURITY: Only allow your specific admin email to see this page
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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 mb-6 inline-block">&larr; Back to Home</Link>
        
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">Approve pending student payments.</p>
        </header>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-semibold">
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Payments ({users.length})</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500 italic">No pending payments right now.</p>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
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
        </div>
      </div>
    </div>
  );
}