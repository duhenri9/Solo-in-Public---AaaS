import React from 'react';
import { useTranslation } from 'react-i18next';

const ProblemSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-slate-900/40">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">{t('problemSection.title')}</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
          {t('problemSection.description')}
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
