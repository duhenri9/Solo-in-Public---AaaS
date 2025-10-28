import React from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children }) => {
  return (
    <section>
      {children}
    </section>
  );
};

export default AnimatedSection;