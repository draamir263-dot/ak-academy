import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create a user document in Firebase Database
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

  // Function to submit payment request
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
        // Check if user is premium in database
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().isPremium) {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isPremium,
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