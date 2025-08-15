import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FirebaseService } from '../services/firebaseService';

interface LogoConfig {
  iconName: string;
  iconLibrary: string;
  color: string;
  size: number;
}

interface AppConfig {
  logo: LogoConfig;
  appName: string;
  version: string;
}

interface AppConfigContextType {
  appConfig: AppConfig | null;
  logoConfig: LogoConfig | null;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

interface AppConfigProviderProps {
  children: ReactNode;
}

export function AppConfigProvider({ children }: AppConfigProviderProps) {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [logoConfig, setLogoConfig] = useState<LogoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const config = await FirebaseService.getAppConfig();
      const logo = await FirebaseService.getLogoConfig();
      
      setAppConfig(config);
      setLogoConfig(logo);
    } catch (error) {
      console.error('Error loading app config:', error);
      // Set default values on error
      const defaultLogo = {
        iconName: 'heart-outline',
        iconLibrary: 'ionicons',
        color: '#FF6B6B',
        size: 24
      };
      setLogoConfig(defaultLogo);
      setAppConfig({
        logo: defaultLogo,
        appName: 'iPrayUST',
        version: '1.0.0'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshConfig = async () => {
    await loadConfig();
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <AppConfigContext.Provider value={{
      appConfig,
      logoConfig,
      loading,
      refreshConfig
    }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
}