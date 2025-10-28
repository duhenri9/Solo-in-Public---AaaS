import React from 'react';
import Card from './ui/Card';
import { TargetIcon, FeatherIcon, ClockIcon } from '../constants';
import { Feature } from '../types';

const iconMap: { [key: string]: React.ReactNode } = {
    TargetIcon: <TargetIcon className="h-8 w-8 mb-4 text-purple-400" />,
    FeatherIcon: <FeatherIcon className="h-8 w-8 mb-4 text-purple-400" />,
    ClockIcon: <ClockIcon className="h-8 w-8 mb-4 text-purple-400" />
};

const engagementFeatures: Feature[] = [
    { "icon": "TargetIcon", "title": "Identifica Conversas Relevantes", "description": "O agente monitora seu nicho e identifica as discussões mais valiosas para você participar, onde sua voz terá mais impacto." },
    { "icon": "FeatherIcon", "title": "Cria Comentários Personalizados", "description": "Com base no contexto e no seu histórico de interações, o agente elabora respostas autênticas que refletem seu tom e conhecimento." },
    { "icon": "ClockIcon", "title": "Sugere o Momento Ideal", "description": "Para manter a naturalidade, o agente sugere os melhores horários para engajar, evitando picos de automação e mantendo uma presença humana." }
];

const EngagementSection: React.FC = () => {
  return (
    <section id="engagement" className="py-20 md:py-28 bg-slate-900/40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Engajamento ético, elevado a outro nível</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">Vá além de simples curtidas. Crie conexões genuínas com um agente que entende de pessoas.</p>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {engagementFeatures.map((feature, index) => (
            <Card key={`${feature.title}-${index}`} className="text-center border-purple-800/50 hover:border-purple-600">
              {iconMap[feature.icon]}
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EngagementSection;