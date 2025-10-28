import React from 'react';
import { useTranslation } from 'react-i18next';

const FLAGS = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
};

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  let language = i18n.language;
  if (!['pt', 'en', 'es'].includes(language)) {
    if (language.startsWith('pt')) language = 'pt';
    else if (language.startsWith('es')) language = 'es';
    else language = 'en';
  }
  const languages: Array<'pt'|'en'|'es'> = ['pt','en','es'];
  return (
    <div className="flex items-center gap-2 ml-2">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`text-xl sm:text-lg rounded-full mx-1 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            language === lang ? 'scale-110 ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
          }`}
          aria-label={`Trocar idioma para ${lang === 'pt' ? 'Português' : lang === 'en' ? 'Inglês' : 'Espanhol'}`}
          type="button"
        >
          {FLAGS[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
