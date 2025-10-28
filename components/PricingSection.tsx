import React from 'react';
import Button from './ui/Button';
import { CheckIcon } from '../constants';

interface PricingSectionProps {
  onActivateClick: () => void;
  onStartFreeClick: () => void;
}

interface PlanFeatureProps {
    children: React.ReactNode;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ children }) => (
  <li className="flex items-start gap-3">
    <CheckIcon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
    <span dangerouslySetInnerHTML={{ __html: children as string }} />
  </li>
);

const freeFeatures: string[] = [ "Dashboard básico", "3 posts/mês gerados por IA", "Análise de 2 métricas", "Recomendações limitadas" ];
const proFeatures: string[] = [
    "Todos os recursos do plano Free",
    "IA adaptativa e automação completa",
    "Engajamento ético e inteligente",
    "Relatórios avançados e alertas",
    "<strong>Personas Multi-Agente</strong>",
    "<strong>Calendário de Conteúdo IA</strong>",
    "<strong>Dashboards Públicos Compartilháveis</strong>"
];

const PricingSection: React.FC<PricingSectionProps> = ({ onActivateClick, onStartFreeClick }) => {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Planos simples e transparentes</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">Comece de graça e escale quando estiver pronto.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 flex flex-col">
            <h3 className="text-2xl font-semibold text-white">Free</h3>
            <p className="text-slate-400 mt-2 mb-6">Ideal para começar a construir em público.</p>
            <div className="my-4">
              <span className="text-5xl font-bold text-white">R$0</span>
              <span className="text-slate-400">/mês</span>
            </div>
            <ul className="space-y-4 text-slate-300 flex-grow">
                {freeFeatures.map((feature, index) => (
                    <PlanFeature key={`free-${index}`}>{feature}</PlanFeature>
                ))}
            </ul>
            <Button onClick={onStartFreeClick} variant="outline" className="w-full mt-8">Começar agora</Button>
          </div>

          {/* Pro Founder Plan */}
          <div className="relative bg-slate-800/50 backdrop-blur-sm border-2 border-blue-500 rounded-xl p-8 flex flex-col shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">MAIS POPULAR</div>
            <h3 className="text-2xl font-semibold text-white">Pro Founder</h3>
            <p className="text-slate-400 mt-2 mb-6">O agente completo para founders que querem escalar.</p>
            <div className="my-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-white">R$197</span>
                <span className="text-slate-400">/mês</span>
                <span className="text-xl text-slate-500 line-through">R$297</span>
              </div>
              <p className="text-center text-sm font-semibold text-blue-400 mt-1">Preço de Lançamento</p>
            </div>
            <ul className="space-y-4 text-slate-300 flex-grow mt-4">
              {proFeatures.map((feature, index) => (
                <PlanFeature key={`pro-${index}`}>{feature}</PlanFeature>
              ))}
            </ul>
            <Button onClick={onActivateClick} variant="primary" className="w-full mt-8">Ativar Agente Pro-founder</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;