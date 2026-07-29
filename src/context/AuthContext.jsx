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
        activeSessionId: sessionId // Set session immediately on signup
      });
      
      return userCredential;
    } catch (error) {
      console.error("Signup Error:", error);
      throw error; // Throw error so the UI component can catch and display it
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const sessionId = getDeviceSessionId();
      
      // Register this device's session ID in Firebase
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
      // Clear the activeSessionId in Firestore on manual logout
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          activeSessionId: null
        });
      }
      localStorage.removeItem('ak_session_id');
      return signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      // Still sign out locally even if firebase update fails
      return signOut(auth);
    }
  }, [currentUser]);

  const submitPayment = useCallback(async (trxId, plan) => {
    if (!currentUser) throw new Error("No user logged in");
    
    try {
      // Using updateDoc since the document is guaranteed to exist from signup
      await updateDoc(doc(db, 'users', currentUser.uid), {
        trxId: trxId,
        plan: plan,
        paymentStatus: "pending"
      });
    } catch (error) {
      console.error("Payment Submit Error:", error);
      throw error;
    }
  }, [currentUser]);

  useEffect(() => {
    let unsubDoc = null;
    
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Unsubscribe from previous user's document listener
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (user) {
        // Just read the session ID, don't generate a new one here 
        // (prevents overwriting a new device's session ID with an old one)
        const sessionId = localStorage.getItem('ak_session_id');
        
        // Listen to user's document in real-time
        unsubDoc = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // 1. SINGLE DEVICE CHECK
            if (userData.activeSessionId && sessionId && userData.activeSessionId !== sessionId) {
              console.log("Another device logged in. Logging out.");
              
              // Force sign out WITHOUT updating Firestore (so we don't log out the new device)
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
              
              // If premium date has passed, lock the account in database
              if (userData.isPremium) {
                try {
                  await updateDoc(doc(db, 'users', user.uid), { 
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
};