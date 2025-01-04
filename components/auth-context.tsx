"use client";
import { createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({
  redirectToLogin: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const redirectToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ redirectToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const getAuthContext = () => useContext(AuthContext);
