import React, { useMemo } from 'react';
import Button from './ui/Button';
import { CheckIcon } from '../constants';
import { useTranslation } from 'react-i18next';

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

const PricingSection: React.FC<PricingSectionProps> = ({ onActivateClick, onStartFreeClick }) => {
  const { t } = useTranslation();
  const freeFeatures = useMemo(
    () => t('pricingSection.freePlan.features', { returnObjects: true }) as string[],
    [t]
  );
  const proFeatures = useMemo(
    () => t('pricingSection.proPlan.features', { returnObjects: true }) as string[],
    [t]
  );

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t('pricingSection.title')}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">{t('pricingSection.subtitle')}</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 flex flex-col">
            <h3 className="text-2xl font-semibold text-white">{t('pricingSection.freePlan.name')}</h3>
            <p className="text-slate-400 mt-2 mb-6">{t('pricingSection.freePlan.description')}</p>
            <div className="my-4">
              <span className="text-5xl font-bold text-white">{t('pricingSection.freePlan.price')}</span>
              <span className="text-slate-400">{t('pricingSection.freePlan.period')}</span>
            </div>
            <ul className="space-y-4 text-slate-300 flex-grow">
                {freeFeatures.map((feature, index) => (
                    <PlanFeature key={`free-${index}`}>{feature}</PlanFeature>
                ))}
            </ul>
            <Button onClick={onStartFreeClick} variant="outline" className="w-full mt-8">
              {t('pricingSection.freePlan.cta')}
            </Button>
          </div>

          {/* Pro Founder Plan */}
          <div className="relative bg-slate-800/50 backdrop-blur-sm border-2 border-blue-500 rounded-xl p-8 flex flex-col shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {t('pricingSection.proPlan.badge')}
            </div>
            <h3 className="text-2xl font-semibold text-white">{t('pricingSection.proPlan.name')}</h3>
            <p className="text-slate-400 mt-2 mb-6">{t('pricingSection.proPlan.description')}</p>
            <div className="my-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-white">{t('pricingSection.proPlan.price')}</span>
                <span className="text-slate-400">{t('pricingSection.proPlan.period')}</span>
                <span className="text-xl text-slate-500 line-through">{t('pricingSection.proPlan.oldPrice')}</span>
              </div>
              <p className="text-center text-sm font-semibold text-blue-400 mt-1">
                {t('pricingSection.proPlan.launchLabel')}
              </p>
            </div>
            <ul className="space-y-4 text-slate-300 flex-grow mt-4">
              {proFeatures.map((feature, index) => (
                <PlanFeature key={`pro-${index}`}>{feature}</PlanFeature>
              ))}
            </ul>
            <Button onClick={onActivateClick} variant="primary" className="w-full mt-8">
              {t('pricingSection.proPlan.cta')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
