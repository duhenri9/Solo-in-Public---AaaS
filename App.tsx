import React, { useState, useEffect, useCallback } from 'react';
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
import LeadCaptureModal from './components/LeadCaptureModal';
import ChatBot from './components/ChatBot';
import FeedbackWidget from './components/FeedbackWidget';
import DashboardWidget from './components/DashboardWidget';
import { useTranslation } from 'react-i18next';
import { LeadCaptureService, LeadSubmissionResult } from '@/src/services/leadCaptureService';
import { AuthService } from '@/src/services/authService';

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [isLeadCaptureOpen, setLeadCaptureOpen] = useState<boolean>(false);
  const [leadSubmission, setLeadSubmission] = useState<LeadSubmissionResult | null>(null);
  const { addNotification } = useNotifications();
  const { t } = useTranslation();

  useEffect(() => {
    const cachedLead = LeadCaptureService.getCachedLead();
    if (cachedLead) {
      setLeadSubmission({
        id: cachedLead.id,
        status: cachedLead.status,
        submittedAt: cachedLead.submittedAt
      });
    }
  }, []);

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

  const handleOpenLeadCapture = () => {
    setLeadCaptureOpen(true);
  };

  const handleCloseLeadCapture = () => {
    setLeadCaptureOpen(false);
  };

  const handleLeadCaptureSuccess = (result: LeadSubmissionResult) => {
    setLeadSubmission(result);
    setLeadCaptureOpen(false);
  };

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setLoginModalOpen(false);
    addNotification({
      type: 'success',
      title: t('notifications.loginSuccess.title'),
      message: t('notifications.loginSuccess.message')
    });
  }, [addNotification, t]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    addNotification({
      type: 'info',
      title: t('notifications.logout.title'),
      message: t('notifications.logout.message')
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const result = AuthService.consumeOAuthResult(window.location.search);
    if (!result || result.provider !== 'linkedin') {
      return;
    }

    if (result.status === 'success') {
      handleLoginSuccess();
    } else {
      addNotification({
        type: 'error',
        title: t('notifications.error.title'),
        message: result.message ?? t('notifications.error.message')
      });
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('oauth');
    url.searchParams.delete('status');
    url.searchParams.delete('message');
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());
  }, [addNotification, handleLoginSuccess, t]);

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
            onSecondaryClick={handleOpenLeadCapture} 
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
              onStartFreeClick={handleOpenLeadCapture} 
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
        leadId={leadSubmission?.id}
      />
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onLoginSuccess={handleLoginSuccess}
        leadId={leadSubmission?.id}
      />
      <LeadCaptureModal
        isOpen={isLeadCaptureOpen}
        onClose={handleCloseLeadCapture}
        onSuccess={handleLeadCaptureSuccess}
      />
      <ChatBot leadSubmission={leadSubmission} />
      <DashboardWidget />
      <FeedbackWidget />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LocalizationProvider>
      <NotificationProvider>
        <NotificationContainer />
        <AppContent />
      </NotificationProvider>
    </LocalizationProvider>
  );
};

export default App;
