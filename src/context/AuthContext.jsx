import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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
  
  // FIX 1: Add a state to hold the actual Firestore document data
  const [user, setUser] = useState(null); 
  
  const [isPremium, setIsPremium] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = useCallback(async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const sessionId = getDeviceSessionId();
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        isPremium: false,
        trxId: "",
        paymentStatus: "none",
        expiryDate: null,
        currentPlan: "none",
        activeSessionId: sessionId
      });
      
      return userCredential;
    } catch (error) {
      console.error("Signup Error:", error);
      throw error; 
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const sessionId = getDeviceSessionId();
      
      await updateDoc(doc(db, 'users', cred.user.uid), {
        activeSessionId: sessionId
      });
      
      return cred;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          activeSessionId: null
        });
      }
      localStorage.removeItem('ak_session_id');
      return signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      return signOut(auth);
    }
  }, [currentUser]);

  // FIX 2: Accept amountToPay so upgrades are correctly logged in the database
  const submitPayment = useCallback(async (trxId, plan, amountToPay = 0) => {
    if (!currentUser) throw new Error("No user logged in");
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        trxId: trxId,
        plan: plan,
        amountPaid: amountToPay, // Track how much they actually paid
        paymentStatus: "pending"
      });
    } catch (error) {
      console.error("Payment Submit Error:", error);
      throw error;
    }
  }, [currentUser]);

  useEffect(() => {
    let unsubDoc = null;
    
    const unsubAuth = onAuthStateChanged(auth, async (authUser) => {
      setCurrentUser(authUser);
      
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (authUser) {
        const sessionId = localStorage.getItem('ak_session_id');
        
        unsubDoc = onSnapshot(doc(db, 'users', authUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // FIX 3: Push Firestore data to the user state so Payment.jsx doesn't crash!
            setUser({ id: authUser.uid, ...userData });
            
            // 1. SINGLE DEVICE CHECK
            if (userData.activeSessionId && sessionId && userData.activeSessionId !== sessionId) {
              console.log("Another device logged in. Logging out.");
              localStorage.removeItem('ak_session_id');
              await signOut(auth);
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
                try {
                  await updateDoc(doc(db, 'users', authUser.uid), { 
                    isPremium: false,
                    paymentStatus: "expired" 
                  });
                } catch (err) {
                  console.error("Failed to update expired premium status:", err);
                }
              }
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Snapshot listener error:", error);
          setLoading(false);
        });
      } else {
        setUser(null); // Clear on logout
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

  // FIX 4: Export the 'user' object so Payment.jsx can read user.currentPlan safely
  const value = { 
    currentUser, 
    user, 
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
};