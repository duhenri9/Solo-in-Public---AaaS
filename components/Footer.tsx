import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800">
      <div className="container mx-auto px-6 py-8 text-center text-slate-500">
        <p className="mt-6">{t('footer.copyright', { year: currentYear })}</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">{t('footer.terms')}</a>
          <a href="#" className="hover:text-slate-300 transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-slate-300 transition-colors">{t('footer.contact')}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
