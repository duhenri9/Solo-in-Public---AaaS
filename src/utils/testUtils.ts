import { fireEvent } from '@testing-library/react';

export const testModalInteractions = {
  openModal: (getByText: (text: string) => HTMLElement) => {
    const openButton = getByText('Ativar meu Agente');
    fireEvent.click(openButton);
  },

  closeModal: (getByLabelText: (text: string) => HTMLElement) => {
    const closeButton = getByLabelText('Fechar');
    fireEvent.click(closeButton);
  },

  simulateLogin: (getByText: (text: string) => HTMLElement) => {
    const loginButton = getByText('Conectar com LinkedIn');
    fireEvent.click(loginButton);
  }
};

export const testNavigationFlow = {
  scrollToSection: (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      return true;
    }
    return false;
  },

  validateSectionVisibility: (sectionId: string) => {
    const section = document.getElementById(sectionId);
    return section !== null && 
           window.getComputedStyle(section).display !== 'none';
  }
};

export const performanceMetrics = {
  measureRenderTime: (component: () => void) => {
    const start = performance.now();
    component();
    const end = performance.now();
    return end - start;
  },

  checkMemoryUsage: () => {
    const perf = window.performance as Performance & {
      memory?: {
        totalJSHeapSize: number;
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (perf && perf.memory) {
      const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } = perf.memory;
      return { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit };
    }

    return null;
  }
};

export const accessibilityChecks = {
  checkAriaAttributes: (element: HTMLElement) => {
    const missingAttributes: string[] = [];
    
    const requiredAriaAttributes = [
      'aria-label', 
      'aria-describedby', 
      'role'
    ];

    requiredAriaAttributes.forEach(attr => {
      if (!element.hasAttribute(attr)) {
        missingAttributes.push(attr);
      }
    });

    return {
      passed: missingAttributes.length === 0,
      missingAttributes
    };
  },

  checkKeyboardNavigation: (element: HTMLElement) => {
    const isFocusable = element.tabIndex !== -1;
    const canReceiveFocus = element.focus !== undefined;
    
    return {
      isFocusable,
      canReceiveFocus
    };
  }
};

export const errorHandling = {
  captureAndLogErrors: (callback: () => void) => {
    try {
      callback();
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro capturado:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
};
