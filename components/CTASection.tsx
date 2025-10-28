import React, { Fragment, useMemo } from 'react';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';

interface CTASectionProps {
  onActivateClick: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onActivateClick }) => {
  const { t } = useTranslation();
  const titleLines = useMemo(
    () => t('ctaSection.titleLines', { returnObjects: true }) as string[],
    [t]
  );

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
          {titleLines.map((line, index) => (
            <Fragment key={line}>
              {line}
              {index !== titleLines.length - 1 && <br />}
            </Fragment>
          ))}
        </h2>
        <div className="mt-10">
          <Button onClick={onActivateClick} variant="primary" className="px-10 py-5 text-xl">
            {t('ctaSection.cta')}
          </Button>
        </div>
        <p className="mt-6 text-sm text-slate-400 font-medium">{t('ctaSection.footnote')}</p>
      </div>
    </section>
  );
};

export default CTASection;
