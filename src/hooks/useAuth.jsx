import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (u) => setUser(u ?? null),
      (err) => {
        console.error("Auth state listener failed:", err);
        setUser(null);
        setAuthError("Tizim holatini tekshirishda xatolik yuz berdi.");
      }
    );
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // User closing the popup is not an error worth surfacing.
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      console.error("Login failed:", err);
      setAuthError("Kirish amalga oshmadi. Qaytadan urinib ko'ring.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
      setAuthError("Chiqishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, authError, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
