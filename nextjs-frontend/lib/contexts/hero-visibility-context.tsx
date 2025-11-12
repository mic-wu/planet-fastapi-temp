'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const STORAGE_KEY = 'hero-section-visible';
const DEFAULT_VISIBLE = true;

interface HeroVisibilityContextType {
  isVisible: boolean;
  toggle: () => void;
  isHydrated: boolean;
}

const HeroVisibilityContext = createContext<HeroVisibilityContextType | undefined>(undefined);

export function HeroVisibilityProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(DEFAULT_VISIBLE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsVisible(stored === 'true');
    }
    setIsHydrated(true);
  }, []);

  const toggle = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
  };

  return (
    <HeroVisibilityContext.Provider value={{ isVisible, toggle, isHydrated }}>
      {children}
    </HeroVisibilityContext.Provider>
  );
}

export function useHeroVisibility() {
  const context = useContext(HeroVisibilityContext);
  if (context === undefined) {
    throw new Error('useHeroVisibility must be used within a HeroVisibilityProvider');
  }
  return context;
}

