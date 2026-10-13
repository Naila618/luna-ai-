"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebase";
import { UserProfile, UserPreferences } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  preferences: UserPreferences | null;
  onboardingCompleted: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  savePreferences: (prefs: UserPreferences) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREFS_KEY_PREFIX = "luna_user_prefs_";
const LOCAL_USER_KEY = "luna_local_session_user";
const LOCAL_USERS_DB = "luna_local_accounts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebaseActive = isFirebaseConfigured();

  const loadPreferencesForUser = (uid: string): UserPreferences | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(`${PREFS_KEY_PREFIX}${uid}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const userPrefs = loadPreferencesForUser(fbUser.uid);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Friend",
            photoURL: fbUser.photoURL,
            preferences: userPrefs || undefined,
            onboardingCompleted: Boolean(userPrefs?.completedAt),
          });
          setPreferences(userPrefs);
        } else {
          setUser(null);
          setPreferences(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local fallback session
      if (typeof window !== "undefined") {
        try {
          const savedSession = localStorage.getItem(LOCAL_USER_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            const userPrefs = loadPreferencesForUser(parsed.uid);
            setUser({
              ...parsed,
              preferences: userPrefs || undefined,
              onboardingCompleted: Boolean(userPrefs?.completedAt),
            });
            setPreferences(userPrefs);
          }
        } catch (e) {
          console.error("Failed to load local session", e);
        }
      }
      setLoading(false);
    }
  }, [isFirebaseActive]);

  const signInWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseActive && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const prefs = loadPreferencesForUser(cred.user.uid);
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "Friend",
          photoURL: cred.user.photoURL,
          preferences: prefs || undefined,
          onboardingCompleted: Boolean(prefs?.completedAt),
        });
        setPreferences(prefs);
        return { success: true };
      } else {
        // Fallback local accounts
        const rawAccounts = localStorage.getItem(LOCAL_USERS_DB) || "{}";
        const accounts = JSON.parse(rawAccounts);
        const existing = accounts[email.toLowerCase()];
        if (existing && existing.password !== pass) {
          return { success: false, error: "Incorrect password. Please verify and try again." };
        }
        const uid = existing ? existing.uid : "usr_" + Math.random().toString(36).substring(2, 9);
        const displayName = existing?.displayName || email.split("@")[0];

        if (!existing) {
          accounts[email.toLowerCase()] = { uid, email, displayName, password: pass };
          localStorage.setItem(LOCAL_USERS_DB, JSON.stringify(accounts));
        }

        const prefs = loadPreferencesForUser(uid);
        const profile: UserProfile = {
          uid,
          email,
          displayName,
          onboardingCompleted: Boolean(prefs?.completedAt),
          preferences: prefs || undefined,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        setUser(profile);
        setPreferences(prefs);
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to sign in." };
    }
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseActive && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (name && cred.user) {
          await updateProfile(cred.user, { displayName: name });
        }
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name || cred.user.email?.split("@")[0] || "Friend",
          photoURL: cred.user.photoURL,
          onboardingCompleted: false,
        });
        setPreferences(null);
        return { success: true };
      } else {
        const rawAccounts = localStorage.getItem(LOCAL_USERS_DB) || "{}";
        const accounts = JSON.parse(rawAccounts);
        if (accounts[email.toLowerCase()]) {
          return { success: false, error: "An account with this email already exists." };
        }
        const uid = "usr_" + Math.random().toString(36).substring(2, 9);
        accounts[email.toLowerCase()] = { uid, email, displayName: name, password: pass };
        localStorage.setItem(LOCAL_USERS_DB, JSON.stringify(accounts));

        const profile: UserProfile = {
          uid,
          email,
          displayName: name || email.split("@")[0],
          onboardingCompleted: false,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        setUser(profile);
        setPreferences(null);
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to create account." };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseActive && auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const prefs = loadPreferencesForUser(result.user.uid);
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || "Friend",
          photoURL: result.user.photoURL,
          preferences: prefs || undefined,
          onboardingCompleted: Boolean(prefs?.completedAt),
        });
        setPreferences(prefs);
        return { success: true };
      } else {
        return {
          success: false,
          error: "Google Sign-In requires active Firebase credentials configured in .env.local",
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Google sign-in was cancelled or failed." };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseActive && auth) {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } else {
        return {
          success: true,
          error: undefined,
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to send reset email." };
    }
  };

  const signOutUser = async () => {
    if (isFirebaseActive && auth) {
      await firebaseSignOut(auth);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
    setUser(null);
    setPreferences(null);
  };

  const signInAsGuest = async () => {
    const guestUser: UserProfile = {
      uid: "guest_" + Math.random().toString(36).substring(2, 9),
      email: "guest@luna.local",
      displayName: "Guest Friend",
      onboardingCompleted: false,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    }
    setUser(guestUser);
    setPreferences(null);
  };

  const savePreferences = async (prefs: UserPreferences) => {
    if (!user) return;
    const enriched: UserPreferences = {
      ...prefs,
      completedAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(`${PREFS_KEY_PREFIX}${user.uid}`, JSON.stringify(enriched));
    }
    setPreferences(enriched);
    setUser((prev) =>
      prev ? { ...prev, preferences: enriched, onboardingCompleted: true } : null
    );
  };

  const resetPreferences = async () => {
    if (!user) return;
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${PREFS_KEY_PREFIX}${user.uid}`);
    }
    setPreferences(null);
    setUser((prev) =>
      prev ? { ...prev, preferences: undefined, onboardingCompleted: false } : null
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive,
        preferences,
        onboardingCompleted: Boolean(user?.onboardingCompleted),
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        signOutUser,
        signInAsGuest,
        savePreferences,
        resetPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
