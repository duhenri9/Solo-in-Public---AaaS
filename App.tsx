import React, { useState, useEffect } from 'react';
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
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { addNotification } = useNotifications();

  const handleOpenCheckout = () => setCheckoutModalOpen(true);
  const handleOpenLogin = () => setLoginModalOpen(true);
  const handleCloseModals = () => {
    setCheckoutModalOpen(false);
    setLoginModalOpen(false);
  };
  const handleLoginSuccess = () => {
      setIsLoggedIn(true);
      setLoginModalOpen(false);
      addNotification({
          type: 'success',
          title: 'Login bem-sucedido',
          message: 'Bem-vindo(a) de volta, Founder!'
      });
  };
  const handleLogout = () => {
      setIsLoggedIn(false);
      addNotification({
          type: 'info',
          title: 'Logout efetuado',
          message: 'Você foi desconectado com sucesso.'
      });
  };

  return (
    <>
      <div className="bg-[#0D1117] text-slate-300 antialiased overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-3xl filter"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-3xl filter"></div>
        </div>
        <div className="relative z-10">
          <Header isLoggedIn={isLoggedIn} onLoginClick={handleOpenLogin} onLogoutClick={handleLogout} onActivateClick={handleOpenCheckout} />
          <main>
            <HeroSection onPrimaryClick={handleOpenCheckout} onSecondaryClick={handleOpenLogin} />
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
              <PricingSection onActivateClick={handleOpenCheckout} onStartFreeClick={handleOpenLogin} />
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
      </div>
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={handleCloseModals} />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModals} onLoginSuccess={handleLoginSuccess} />
      <ChatBot />
      <FeedbackWidget />
    </>
  );
};


const App: React.FC = () => {
    return (
        <NotificationProvider>
            <NotificationContainer />
            <AppContent />
        </NotificationProvider>
    );
};

export default App;