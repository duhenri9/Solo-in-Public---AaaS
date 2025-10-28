import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from './hooks/useLocalization';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import DifferentiatorSection from './components/DifferentiatorSection';
import PricingSection from './components/PricingSection';
import PhilosophySection from './components/PhilosophySection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import EngagementSection from './components/EngagementSection';
import AdvancedFeaturesSection from './components/AdvancedFeaturesSection';
import AnimatedSection from './components/AnimatedSection';
import { NotificationProvider, useNotifications } from './hooks/useNotifications';
import NotificationContainer from './components/NotificationContainer';
import CheckoutModal from './components/CheckoutModal';
import LoginModal from './components/LoginModal';
import ChatBot from './components/ChatBot';
import FeedbackWidget from './components/FeedbackWidget';

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const { addNotification } = useNotifications();

  const handleOpenCheckout = () => {
    setCheckoutModalOpen(true);
  };

  const handleOpenLogin = () => {
    setLoginModalOpen(true);
  };

  const handleCloseModals = () => {
    setCheckoutModalOpen(false);
    setLoginModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setLoginModalOpen(false);
    addNotification({
      type: 'success',
      message: 'Login realizado com sucesso!'
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    addNotification({
      type: 'info',
      message: 'Você foi desconectado com sucesso.'
    });
  };

  return (
    <div className="bg-[#0D1117] text-slate-300 antialiased overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-3xl filter"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-3xl filter"></div>
      </div>
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Header 
            isLoggedIn={isLoggedIn} 
            onLoginClick={handleOpenLogin} 
            onLogoutClick={handleLogout} 
            onActivateClick={handleOpenCheckout} 
          />
        </div>
        <main>
          <HeroSection 
            onPrimaryClick={handleOpenCheckout} 
            onSecondaryClick={handleOpenLogin} 
          />
          <AnimatedSection>
            <ProblemSection />
          </AnimatedSection>
          <AnimatedSection>
            <SolutionSection />
          </AnimatedSection>
          <AnimatedSection>
            <EngagementSection />
          </AnimatedSection>
          <AnimatedSection>
            <DifferentiatorSection />
          </AnimatedSection>
          <AnimatedSection>
            <AdvancedFeaturesSection />
          </AnimatedSection>
          <AnimatedSection>
            <PricingSection 
              onActivateClick={handleOpenCheckout} 
              onStartFreeClick={handleOpenLogin} 
            />
          </AnimatedSection>
          <AnimatedSection>
            <PhilosophySection />
          </AnimatedSection>
          <AnimatedSection>
            <CTASection onActivateClick={handleOpenCheckout} />
          </AnimatedSection>
        </main>
        <Footer />
      </div>
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={handleCloseModals} 
      />
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onLoginSuccess={handleLoginSuccess}
      />
      <ChatBot />
      <FeedbackWidget />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LocalizationProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </LocalizationProvider>
  );
};

export default App;