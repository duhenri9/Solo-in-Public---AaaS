import React, { useMemo } from 'react';
import Card from './ui/Card';
import { BrainIcon, CalendarIcon, ChatIcon, ChartIcon } from '../constants';
import { Feature } from '../types';
import { useTranslation } from 'react-i18next';

const iconMap: { [key: string]: React.ReactNode } = {
  BrainIcon: <BrainIcon className="h-8 w-8 mb-4 text-blue-400" />,
  CalendarIcon: <CalendarIcon className="h-8 w-8 mb-4 text-blue-400" />,
  ChatIcon: <ChatIcon className="h-8 w-8 mb-4 text-blue-400" />,
  ChartIcon: <ChartIcon className="h-8 w-8 mb-4 text-blue-400" />
};

const SolutionSection: React.FC = () => {
  const { t } = useTranslation();
  const features = useMemo(
    () => t('solutionSection.features', { returnObjects: true }) as Feature[],
    [t]
  );

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t('solutionSection.title')}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">{t('solutionSection.subtitle')}</p>
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
