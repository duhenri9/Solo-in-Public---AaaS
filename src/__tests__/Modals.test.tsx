import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationProvider } from '../../hooks/useNotifications';
import App from '../../App';

// Mocks globais para componentes
jest.mock('../../components/Header', () => {
  return {
    __esModule: true,
    default: ({ onLoginClick, onActivateClick }: any) => (
      <div>
        <button onClick={onLoginClick} data-testid="login-button">Login</button>
        <button onClick={onActivateClick} data-testid="activate-button">Ativar Agente</button>
      </div>
    )
  };
});

jest.mock('../../components/LoginModal', () => {
  return {
    __esModule: true,
    default: ({ isOpen, onClose, onLoginSuccess }: any) => (
      isOpen ? (
        <div data-testid="login-modal">
          <button onClick={onLoginSuccess} data-testid="login-success-button">
            Conectar com LinkedIn
          </button>
          <button onClick={onClose} data-testid="login-close-button">
            Fechar
          </button>
        </div>
      ) : null
    )
  };
});

jest.mock('../../components/CheckoutModal', () => {
  return {
    __esModule: true,
    default: ({ isOpen, onClose }: any) => (
      isOpen ? (
        <div data-testid="checkout-modal">
          <button onClick={onClose} data-testid="checkout-close-button">
            Fechar
          </button>
        </div>
      ) : null
    )
  };
});

jest.mock('../../components/ChatBot', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="chatbot">ChatBot Mockado</div>
  };
});

jest.mock('../../components/NotificationContainer', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="notification-container">Notificações</div>
  };
});

describe('Modal Integration Tests', () => {
  test('opens login modal when login button is clicked', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );

    const loginButton = screen.getByTestId('login-button');
    
    act(() => {
      fireEvent.click(loginButton);
    });

    const loginModal = screen.getByTestId('login-modal');
    expect(loginModal).toBeInTheDocument();
  });

  test('closes login modal when close button is clicked', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );

    const loginButton = screen.getByTestId('login-button');
    
    act(() => {
      fireEvent.click(loginButton);
    });

    const loginCloseButton = screen.getByTestId('login-close-button');
    
    act(() => {
      fireEvent.click(loginCloseButton);
    });

    const loginModal = screen.queryByTestId('login-modal');
    expect(loginModal).not.toBeInTheDocument();
  });

  test('successful login triggers notification', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );

    const loginButton = screen.getByTestId('login-button');
    
    act(() => {
      fireEvent.click(loginButton);
    });

    const loginSuccessButton = screen.getByTestId('login-success-button');
    
    act(() => {
      fireEvent.click(loginSuccessButton);
    });

    const successNotification = screen.getByText('Login realizado com sucesso!');
    expect(successNotification).toBeInTheDocument();
  });

  test('opens checkout modal when activate button is clicked', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );

    const activateButton = screen.getByTestId('activate-button');
    
    act(() => {
      fireEvent.click(activateButton);
    });

    const checkoutModal = screen.getByTestId('checkout-modal');
    expect(checkoutModal).toBeInTheDocument();
  });

  test('closes checkout modal when close button is clicked', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );

    const activateButton = screen.getByTestId('activate-button');
    
    act(() => {
      fireEvent.click(activateButton);
    });

    const checkoutCloseButton = screen.getByTestId('checkout-close-button');
    
    act(() => {
      fireEvent.click(checkoutCloseButton);
    });

    const checkoutModal = screen.queryByTestId('checkout-modal');
    expect(checkoutModal).not.toBeInTheDocument();
  });
});
