import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../../hooks/useNotifications';
import { NotificationContainer } from '../../components/NotificationContainer';

describe('useNotifications Hook', () => {
  const TestComponent = () => {
    const { addNotification } = useNotifications();
    return (
      <button 
        onClick={() => addNotification({
          type: 'success', 
          title: 'Test Title',
          message: 'Test Notification'
        })}
      >
        Add Notification
      </button>
    );
  };

  test('adds notification correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Test Title',
        message: 'Test Notification'
      });
    });

    // Renderizar o componente para verificar a notificação
    const { getByText } = render(
      <NotificationProvider>
        <TestComponent />
        <NotificationContainer />
      </NotificationProvider>
    );

    // Simular clique para adicionar notificação
    const button = getByText('Add Notification');
    act(() => {
      button.click();
    });

    // Verificar se a notificação foi adicionada
    expect(getByText('Test Notification')).toBeInTheDocument();
  });

  test('supports different notification types', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    const testCases = [
      { type: 'success', title: 'Success', message: 'Success message' },
      { type: 'error', title: 'Error', message: 'Error message' },
      { type: 'info', title: 'Info', message: 'Info message' },
      { type: 'warning', title: 'Warning', message: 'Warning message' }
    ];

    testCases.forEach(notification => {
      act(() => {
        result.current.addNotification(notification);
      });
    });

    const { getAllByRole } = render(
      <NotificationProvider>
        <NotificationContainer />
      </NotificationProvider>
    );

    // Verificar se todas as notificações foram renderizadas
    const notificationElements = getAllByRole('alert');
    expect(notificationElements.length).toBe(4);
  });

  test('removes notifications after timeout', () => {
    jest.useFakeTimers();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Temporary Title',
        message: 'Temporary Notification'
      });
    });

    const { queryByText } = render(
      <NotificationProvider>
        <NotificationContainer />
      </NotificationProvider>
    );

    // Verificar se a notificação existe inicialmente
    expect(queryByText('Temporary Notification')).toBeInTheDocument();

    // Avançar o tempo para remover a notificação
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Verificar se a notificação foi removida
    expect(queryByText('Temporary Notification')).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
