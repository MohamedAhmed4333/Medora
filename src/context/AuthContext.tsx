import { createContext, useContext, useState, ReactNode } from "react";

type Mode = "login" | "register" | null;

type AuthContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <AuthContext.Provider value={{ mode, setMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};