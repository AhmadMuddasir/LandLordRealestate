"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Restore login session
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to restore authentication:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      toast.success("Login successful!");
      router.push("/");

      return data;
    } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Login failed";
    toast.error(errorMessage);
      console.log(error);
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const data = await authApi.register(name, email, password);

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      toast.success("Account created successfully!");
      router.push("/");
      return data;
    } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "sign up failed";
    toast.error(errorMessage);
      console.log(error);
    }
  };

  // Logout
  const logout = () => {
    authApi.logout();
    setUser(null);
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
