/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: In a real deployment, this file will exist after Firebase setup.
import config from '../../firebase-applet-config.json';

const firebaseConfig = config;

// Ensure we only initialize once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: Required for this environment
export const googleProvider = new GoogleAuthProvider();

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  if (!auth) throw new Error("Auth not initialized");
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential.user;
};

export const loginWithEmail = async (email: string, pass: string) => {
  if (!auth) throw new Error("Auth not initialized");
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export { onAuthStateChanged, signInAnonymously };

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Auth not initialized. Check Firebase configuration.");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logout = async () => {
  if (!auth) return;
  await signOut(auth);
};
