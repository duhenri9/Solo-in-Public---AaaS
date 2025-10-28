import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { LogoIcon } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
);


const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        // Simulate OAuth flow
        setTimeout(() => {
            setIsLoading(false);
            onLoginSuccess();
        }, 1500);
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 text-center">
        <LogoIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Solo in Public</h2>
        <p className="text-slate-400 mb-8">Conecte sua conta do LinkedIn para começar a construir em público com seu agente de IA.</p>
        <Button onClick={handleLogin} disabled={isLoading} variant="primary" className="w-full flex items-center justify-center gap-3 text-lg">
            <LinkedInIcon className="h-6 w-6" />
            {isLoading ? 'Conectando...' : 'Conectar com LinkedIn'}
        </Button>
        <p className="text-xs text-slate-500 mt-4">Nós nunca publicaremos nada sem a sua permissão.</p>
      </div>
    </Modal>
  );
};

export default LoginModal;