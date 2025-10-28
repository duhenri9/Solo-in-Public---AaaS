import React, { useMemo } from 'react';
import Card from './ui/Card';
import { TargetIcon, FeatherIcon, ClockIcon } from '../constants';
import { Feature } from '../types';
import { useTranslation } from 'react-i18next';

const iconMap: { [key: string]: React.ReactNode } = {
    TargetIcon: <TargetIcon className="h-8 w-8 mb-4 text-purple-400" />,
    FeatherIcon: <FeatherIcon className="h-8 w-8 mb-4 text-purple-400" />,
    ClockIcon: <ClockIcon className="h-8 w-8 mb-4 text-purple-400" />
};

const EngagementSection: React.FC = () => {
  const { t } = useTranslation();
  const engagementFeatures = useMemo(
    () => t('engagementSection.features', { returnObjects: true }) as Feature[],
    [t]
  );

  return (
    <section id="engagement" className="py-20 md:py-28 bg-slate-900/40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t('engagementSection.title')}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">{t('engagementSection.subtitle')}</p>
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
