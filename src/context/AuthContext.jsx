import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Helper to get/generate a unique session ID for this device
const getDeviceSessionId = () => {
  let id = localStorage.getItem('ak_session_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('ak_session_id', id);
  }
  return id;
};

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

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const sessionId = getDeviceSessionId();
    // Register this device's session ID in Firebase
    await updateDoc(doc(db, 'users', cred.user.uid), {
      activeSessionId: sessionId
    });
    return cred;
  }

  async function logout() {
    localStorage.removeItem('ak_session_id');
    return signOut(auth);
  }

  async function submitPayment(trxId, plan) {
    if (!currentUser) return;
    
    // 1. Save the payment request to Firebase
    await setDoc(doc(db, 'users', currentUser.uid), {
      trxId: trxId,
      plan: plan,
      paymentStatus: "pending"
    }, { merge: true });

    // 2. Send Instant Telegram Notification to Admin
    const TELEGRAM_BOT_TOKEN = "8829544471:AAEs0obYy7g36a5tRAUwfFqPcjcTDJ8hZ90"; 
    const TELEGRAM_CHAT_ID = "6007421279"; 
    
    const planText = plan === '6_months' ? '6 Months (5,000 PKR)' : '1 Year (10,000 PKR)';
    const message = `🔔 *New Payment Request!*\n\n*Student:* ${currentUser.email}\n*Plan:* ${planText}\n*Trx ID:* ${trxId}\n\nApprove them in the Admin Dashboard.`;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown"
        })
      });
    } catch (err) {
      console.log("Telegram notification failed: ", err);
    }
  }

  useEffect(() => {
    let unsubDoc;
    const unsubAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (unsubDoc) unsubDoc(); // unsubscribe from previous user
      
      if (user) {
        const sessionId = getDeviceSessionId();
        
        // Listen to user's document in real-time (for Single Device Login & Auto-Expiry)
        unsubDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // 1. SINGLE DEVICE CHECK
            if (userData.activeSessionId && userData.activeSessionId !== sessionId) {
              console.log("Another device logged in. Logging out.");
              logout();
              window.location.href = '/login?reason=another_device';
              return;
            }

            // 2. PREMIUM & EXPIRY CHECK
            const expiry = userData.expiryDate ? new Date(userData.expiryDate) : null;
            setExpiryDate(expiry);
            if (userData.isPremium && expiry && expiry > new Date()) {
              setIsPremium(true);
            } else {
              setIsPremium(false);
              if (userData.isPremium) {
                // If date is passed, lock the account in database
                updateDoc(doc(db, 'users', user.uid), { isPremium: false });
              }
            }
          }
          setLoading(false);
        });
      } else {
        setIsPremium(false);
        setExpiryDate(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const value = { currentUser, isPremium, expiryDate, signup, login, logout, submitPayment };
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};