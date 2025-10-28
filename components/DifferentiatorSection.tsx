import React from 'react';

const DifferentiatorSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-900/40">
      <div className="container mx-auto px-6">
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que é diferente?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-400">
                A maioria das ferramentas automatiza conteúdo.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-2 font-semibold">
                O Solo in Public automatiza crescimento com propósito.
                </span>
            </p>
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorSection;