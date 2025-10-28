import React from 'react';
import { useTranslation } from 'react-i18next';

const DifferentiatorSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-slate-900/40">
      <div className="container mx-auto px-6">
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('differentiatorSection.title')}</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-400">
                {t('differentiatorSection.description')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-2 font-semibold">
                {t('differentiatorSection.highlight')}
                </span>
            </p>
            <div className="mt-6 max-w-3xl mx-auto">
                <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {t('differentiatorSection.supporting')}
                </p>
            </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorSection;
