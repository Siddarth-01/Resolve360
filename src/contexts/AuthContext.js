import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { getUserRole, isEmailAuthorized } from '../config/authorizedEmails';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Automatically determine user role based on email
      const detectedRole = getUserRole(result.user.email);
      
      // Store user data in Firestore if first time
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          userType: detectedRole,
          createdAt: new Date(),
          isActive: true,
          photoURL: result.user.photoURL
        });

        // Store admin emails for verification
        if (detectedRole === 'admin') {
          await setDoc(doc(db, 'admins', result.user.email), {
            email: result.user.email,
            displayName: result.user.displayName,
            createdAt: new Date()
          });
        }
      } else {
        // Update user type if it's different
        const userData = userDoc.data();
        if (userData.userType !== detectedRole) {
          await setDoc(doc(db, 'users', result.user.uid), {
            ...userData,
            userType: detectedRole,
            updatedAt: new Date()
          }, { merge: true });
        }
      }

      toast.success(`Welcome! You're signed in as a ${detectedRole === 'admin' ? 'Administrator' : detectedRole === 'contractor' ? 'Technician' : 'Resident'}`);
      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  async function getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userData = await getUserData(user.uid);
        setUserType(userData?.userType || null);
      } else {
        setCurrentUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userType,
    signInWithGoogle,
    logout,
    getUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 