import React from 'react';
import Button from './ui/Button';

interface CTASectionProps {
  onActivateClick: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onActivateClick }) => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
          Ative seu agente. <br />
          Construa com propósito. <br />
          Cresça em público.
        </h2>
        <div className="mt-10">
          <Button onClick={onActivateClick} variant="primary" className="px-10 py-5 text-xl">
            Ativar Agente Pro-founder
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;