import React from 'react';
import Button from './ui/Button';
import { LogoIcon } from '../constants';

interface HeaderProps {
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onActivateClick: () => void;
}

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLoginClick, onLogoutClick, onActivateClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0D1117]/80 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2">
          <LogoIcon className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold text-white">Solo in Public</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#engagement" className="hover:text-white transition-colors">Engajamento</a>
          <a href="#advanced-features" className="hover:text-white transition-colors">Recursos Pro</a>
          <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
          <a href="#philosophy" className="hover:text-white transition-colors">Filosofia</a>
        </nav>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
              <div className="flex items-center gap-3">
                  <button onClick={onLogoutClick} title="Logout" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <UserIcon className="h-7 w-7 p-1 bg-slate-700 rounded-full" />
                      <span className="text-sm font-semibold hidden sm:inline">Logout</span>
                  </button>
              </div>
          ) : (
              <>
                  <button onClick={onLoginClick} className="text-slate-300 hover:text-white transition-colors hidden sm:block">Login</button>
                  <Button onClick={onActivateClick} variant="primary" className="py-2 px-4 text-sm">Ativar meu Agente</Button>
              </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;