import React from 'react';

const PhilosophySection: React.FC = () => {
  return (
    <section id="philosophy" className="py-20 bg-slate-900/40">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Nossa Filosofia</h2>
        <blockquote className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-slate-300 italic">
          “Building in Public é sobre partilhar valor, não só métricas. Crescer com transparência é a nova vantagem competitiva.”
        </blockquote>
      </div>
    </section>
  );
};

export default PhilosophySection;