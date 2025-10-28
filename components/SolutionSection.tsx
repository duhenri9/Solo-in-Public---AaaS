import React from 'react';
import Card from './ui/Card';
import { BrainIcon, CalendarIcon, ChatIcon, ChartIcon } from '../constants';
import { Feature } from '../types';

const iconMap: { [key: string]: React.ReactNode } = {
  BrainIcon: <BrainIcon className="h-8 w-8 mb-4 text-blue-400" />,
  CalendarIcon: <CalendarIcon className="h-8 w-8 mb-4 text-blue-400" />,
  ChatIcon: <ChatIcon className="h-8 w-8 mb-4 text-blue-400" />,
  ChartIcon: <ChartIcon className="h-8 w-8 mb-4 text-blue-400" />
};

const features: Feature[] = [
    { "icon": "BrainIcon", "title": "Gera conteúdo real", "description": "Cria posts com base na sua jornada, métricas, aprendizados e milestones. Autenticidade em escala." },
    { "icon": "CalendarIcon", "title": "Agenda automaticamente", "description": "Analisa a performance e publica seus conteúdos nos melhores horários para maximizar o alcance." },
    { "icon": "ChatIcon", "title": "Engaja com ética", "description": "Interage com naturalidade em seu nicho, criando conexões valiosas sem parecer um robô." },
    { "icon": "ChartIcon", "title": "Analisa e aprende", "description": "Aprende seu tom de voz e evolui junto com você, fornecendo insights para otimizar sua estratégia." }
];

const SolutionSection: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Conheça o Agente Pro-founder</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">Seu copiloto de IA para construir em público com propósito e consistência.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={`${feature.title}-${index}`} className="text-center">
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

export default SolutionSection;