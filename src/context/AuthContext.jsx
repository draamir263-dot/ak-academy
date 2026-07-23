import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      isPremium: false,
      trxId: "",
      expiryDate: null
    });
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function submitPayment(trxId, plan) {
    if (!currentUser) return;
    await setDoc(doc(db, 'users', currentUser.uid), {
      trxId: trxId,
      plan: plan,
      paymentStatus: "pending"
    }, { merge: true });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const expiry = userData.expiryDate ? new Date(userData.expiryDate) : null;
          setExpiryDate(expiry);
          
          // AUTO-EXPIRY LOGIC: Check if expiry date is in the past
          if (userData.isPremium && expiry && expiry > new Date()) {
            setIsPremium(true);
          } else {
            // If date is passed, lock the account
            setIsPremium(false);
            if (userData.isPremium) {
              // Update database to reflect expiration
              await updateDoc(doc(db, 'users', user.uid), { isPremium: false });
            }
          }
        } else {
          setIsPremium(false);
          setExpiryDate(null);
        }
      } else {
        setIsPremium(false);
        setExpiryDate(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isPremium,
    expiryDate,
    signup,
    login,
    logout,
    submitPayment
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}