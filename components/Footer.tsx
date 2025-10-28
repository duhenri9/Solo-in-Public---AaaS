import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800">
      <div className="container mx-auto px-6 py-8 text-center text-slate-500">
        <p className="mt-6">&copy; {new Date().getFullYear()} Solo in Public. Todos os direitos reservados.</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Termos</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Contato</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;