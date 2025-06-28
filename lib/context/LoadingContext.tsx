"use client";

import { createContext, useContext, useState, useEffect } from "react";
import NyraLoading from "@/components/ui/nyra-loading";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Handle initial page load only
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsInitialLoad(false);
    }, 1800); // Show NYRA animation for 1.8 seconds on initial load

    return () => clearTimeout(timer);
  }, []);

  // Handle manual page refresh only
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLoading(true);
    };

    // Only listen for actual page refresh, not other activities
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
          <NyraLoading size="lg" className="min-h-screen" />
        </div>
      )}
      <div className={isLoading ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-500"}>
        {children}
      </div>
    </LoadingContext.Provider>
  );
} 