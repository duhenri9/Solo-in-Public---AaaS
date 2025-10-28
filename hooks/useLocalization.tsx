import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslations from '../locales/pt.json';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

// Configuração do i18n
if (typeof window !== 'undefined') {
  i18n.use(LanguageDetector);
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: ptTranslations },
      en: { translation: enTranslations },
      es: { translation: esTranslations }
    },
    fallbackLng: 'pt', // Português como idioma padrão
    interpolation: {
      escapeValue: false // React já escapa os valores
    }
  });

// Contexto de localização
interface LocalizationContextType {
  language: string;
  changeLanguage: (lang: string) => void;
}

const LocalizationContext = createContext<LocalizationContextType>({
  language: 'pt',
  changeLanguage: () => {}
});

// Provedor de localização
export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  useEffect(() => {
    // Recuperar idioma salvo no localStorage
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LocalizationContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Hook personalizado para usar localização
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

// Exportar hook de tradução do react-i18next para uso direto
export { useTranslation };

export default i18n;
