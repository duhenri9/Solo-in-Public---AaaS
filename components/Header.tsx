import React, { useMemo } from 'react';
import Button from './ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import { LogoIcon } from '../constants';
import { useTranslation } from 'react-i18next';

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 p-1 bg-slate-700 rounded-full">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onActivateClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isLoggedIn, 
  onLoginClick, 
  onLogoutClick, 
  onActivateClick 
}) => {
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const navItems = useMemo(() => ([
    { key: 'features', section: 'features' },
    { key: 'engagement', section: 'engagement' },
    { key: 'proFeatures', section: 'advanced-features' },
    { key: 'pricing', section: 'pricing' },
    { key: 'philosophy', section: 'philosophy' }
  ]), []);

  return (
    <header className="sticky top-0 z-50 bg-[#0D1117]/80 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-8 py-3 flex flex-nowrap items-center justify-between gap-y-2 ">
        <a href="#" className="flex items-center gap-2 min-w-fit">
          <LogoIcon className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold text-white">{t('common.brandName')}</span>
        </a>
        {/* Menu navegação - escondido em telas <md */}
        <nav className="hidden md:flex flex-1 items-center justify-center">
          <div className="flex gap-x-6 ml-10 text-base font-medium text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.section)}
                className="hover:text-white transition-colors"
              >
                {t(`header.${item.key}`)}
              </button>
            ))}
          </div>
        </nav>
        {/* Bloco direito responsivo separado do menu com padding-left */}
        <div className="flex items-center gap-4 min-w-fit pl-10">
          {!isLoggedIn ? (
            <>
              <button
                onClick={onLoginClick}
                className="text-slate-300 hover:text-white transition-colors text-base font-medium"
              >
                {t('header.login')}
              </button>
              <Button
                onClick={onActivateClick}
                variant="primary"
                className="py-2 px-4 text-sm font-bold"
              >
                {t('header.activate')}
              </Button>
            </>
          ) : (
            <button
              onClick={onLogoutClick}
              title="Logout"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <UserIcon />
              <span className="text-sm font-semibold hidden sm:inline">{t('header.logout')}</span>
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
