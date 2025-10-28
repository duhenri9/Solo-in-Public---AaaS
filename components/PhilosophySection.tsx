import React from 'react';
import { useTranslation } from 'react-i18next';

const PhilosophySection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section id="philosophy" className="py-20 bg-slate-900/40">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">{t('philosophySection.title')}</h2>
        <blockquote className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-slate-300 italic">
          {t('philosophySection.quote')}
        </blockquote>
      </div>
    </section>
  );
};

export default PhilosophySection;
