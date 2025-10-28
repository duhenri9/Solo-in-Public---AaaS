import React, { Fragment, useMemo } from 'react';
import Button from './ui/Button';
import { LogoIcon } from '../constants';
import { useTranslation } from 'react-i18next';

interface HeroSectionProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const HeroSection: React.FC<HeroSectionProps> = ({ onPrimaryClick, onSecondaryClick }) => {
  const { t } = useTranslation();
  const titleLines = useMemo(
    () => t('heroSection.titleLines', { returnObjects: true }) as string[],
    [t]
  );

  return (
    <section className="py-20 md:py-32 text-center">
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-4">
          <LogoIcon className="h-14 w-14 text-blue-400 mx-auto" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-tight">
          {titleLines.map((line, index) => (
            <Fragment key={line}>
              {line}
              {index !== titleLines.length - 1 && <br />}
            </Fragment>
          ))}
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-slate-400">
          {t('heroSection.subtitle')}
        </p>
        <div className="mt-10 flex justify-center items-center gap-4">
          <Button onClick={onPrimaryClick} variant="primary" className="px-8 py-4 text-lg">{t('heroSection.primaryButton')}</Button>
          <Button onClick={onSecondaryClick} variant="outline" className="px-8 py-4 text-lg">{t('heroSection.secondaryButton')}</Button>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-blue-50/10 border border-blue-500/30 rounded-lg px-4 py-3 text-sm font-medium text-blue-400 shadow-sm">
            <LockIcon />
            <span>{t('common.permissionReminder')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
