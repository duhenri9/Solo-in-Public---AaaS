import React from 'react';
import Button from './ui/Button';

interface HeroSectionProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPrimaryClick, onSecondaryClick }) => {
  return (
    <section className="py-20 md:py-32 text-center">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-tight">
          Construa ou Otimize em público.<br />Cresça partilhando Valor.
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-slate-400">
          Deixe o agente Pro-founder trabalhar por você — o AaaS que gerencia sua presença no LinkedIn enquanto você foca no produto.
        </p>
        <div className="mt-10 flex justify-center items-center gap-4">
          <Button onClick={onPrimaryClick} variant="primary" className="px-8 py-4 text-lg">Ativar meu Agente</Button>
          <Button onClick={onSecondaryClick} variant="outline" className="px-8 py-4 text-lg">Começar Grátis</Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;