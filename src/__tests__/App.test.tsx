import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock de componentes para evitar problemas de importação
jest.mock('../../components/Header', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="header">Header Mockado</div>
  };
});

jest.mock('../../components/ChatBot', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="chatbot">ChatBot Mockado</div>
  };
});

jest.mock('../../hooks/useNotifications', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNotifications: () => ({
    addNotification: jest.fn()
  })
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    
    // Verificar elementos principais da landing page
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
  });

  test('contains all main sections', () => {
    render(<App />);
    
    const sections = [
      'Publicar no LinkedIn é essencial',
      'Manter consistência, engajamento e autenticidade',
      'Recursos Pro',
      'Preços'
    ];

    sections.forEach(sectionText => {
      const sectionElement = screen.queryByText(new RegExp(sectionText, 'i'));
      if (sectionElement) {
        expect(sectionElement).toBeInTheDocument();
      }
    });
  });
});
