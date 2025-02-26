"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define the theme settings interface
export interface ThemeSettings {
  borderColor: string;
  backgroundColor: string;
  shadowColor: string;
  textColor: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonApproveBg: string;
  buttonApproveShadow: string;
  buttonRejectBg: string;
  buttonRejectShadow: string;
  buttonClaimBg: string;
  buttonClaimShadow: string;
  iconSet: 'default' | 'minimal' | 'playful' | 'tech';
}

// Default theme settings
export const defaultTheme: ThemeSettings = {
  borderColor: '#000000',
  backgroundColor: '#FFFFFF',
  shadowColor: '#000000',
  textColor: '#000000',
  buttonPrimaryBg: '#000000',
  buttonPrimaryText: '#FFFFFF',
  buttonApproveBg: '#296fbb',
  buttonApproveShadow: '#004280',
  buttonRejectBg: '#ff0000',
  buttonRejectShadow: '#800000',
  buttonClaimBg: '#4CAF50',
  buttonClaimShadow: '#2E7D32',
  iconSet: 'default'
};

// Define the context interface
interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  saveTheme: (familyId: string) => Promise<void>;
  loadTheme: (familyId: string) => Promise<void>;
  applyThemeToRoot: () => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
  saveTheme: async () => {},
  loadTheme: async () => {},
  applyThemeToRoot: () => {}
});

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Update theme function
  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme
    }));
  };

  // Apply theme to CSS variables
  const applyThemeToRoot = useCallback(() => {
    document.documentElement.style.setProperty('--brutalist-card-border-color', theme.borderColor);
    document.documentElement.style.setProperty('--brutalist-card-bg-color', theme.backgroundColor);
    document.documentElement.style.setProperty('--brutalist-card-shadow-color', theme.shadowColor);
    document.documentElement.style.setProperty('--brutalist-card-text-color', theme.textColor);
    document.documentElement.style.setProperty('--brutalist-card-button-primary-bg', theme.buttonPrimaryBg);
    document.documentElement.style.setProperty('--brutalist-card-button-primary-text', theme.buttonPrimaryText);
    document.documentElement.style.setProperty('--brutalist-card-button-approve-bg', theme.buttonApproveBg);
    document.documentElement.style.setProperty('--brutalist-card-button-approve-shadow', theme.buttonApproveShadow);
    document.documentElement.style.setProperty('--brutalist-card-button-reject-bg', theme.buttonRejectBg);
    document.documentElement.style.setProperty('--brutalist-card-button-reject-shadow', theme.buttonRejectShadow);
    document.documentElement.style.setProperty('--brutalist-card-button-claim-bg', theme.buttonClaimBg);
    document.documentElement.style.setProperty('--brutalist-card-button-claim-shadow', theme.buttonClaimShadow);
  }, [theme]);

  // Save theme to database
  const saveTheme = async (familyId: string) => {
    try {
      const { error } = await supabase
        .from('theme_settings')
        .upsert({
          family_id: familyId,
          custom_theme: theme,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'family_id'
        });

      if (error) {
        console.error('Error saving theme:', error);
      }
    } catch (error) {
      console.error('Error in saveTheme:', error);
    }
  };

  // Load theme from database
  const loadTheme = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('custom_theme')
        .eq('family_id', familyId)
        .single();

      if (error) {
        console.error('Error loading theme:', error);
        return;
      }

      if (data && data.custom_theme) {
        setTheme({
          ...defaultTheme,
          ...data.custom_theme
        });
      }
    } catch (error) {
      console.error('Error in loadTheme:', error);
    }
  };

  // Apply theme when it changes
  useEffect(() => {
    applyThemeToRoot();
  }, [theme, applyThemeToRoot]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, saveTheme, loadTheme, applyThemeToRoot }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 