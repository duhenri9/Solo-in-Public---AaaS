import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider } from '../../hooks/useNotifications';
import { NotificationContainer } from '../../components/NotificationContainer';

describe('NotificationContainer', () => {
  const renderNotificationContainer = (notifications: any[] = []) => {
    return render(
      <NotificationProvider>
        <NotificationContainer />
      </NotificationProvider>
    );
  };

  test('renders without crashing', () => {
    renderNotificationContainer();
    const container = screen.getByTestId('notification-container');
    expect(container).toBeInTheDocument();
  });

  test('displays different types of notifications', () => {
    const notificationTypes = [
      { type: 'success', title: 'Success', message: 'Success notification' },
      { type: 'error', title: 'Error', message: 'Error notification' },
      { type: 'warning', title: 'Warning', message: 'Warning notification' },
      { type: 'info', title: 'Info', message: 'Info notification' }
    ];

    const { addNotification } = renderNotificationContainer();

    notificationTypes.forEach(notification => {
      act(() => {
        addNotification(notification);
      });
    });

    notificationTypes.forEach(notification => {
      const notificationElement = screen.getByText(notification.message);
      expect(notificationElement).toBeInTheDocument();
    });
  });

  test('notification container has correct aria attributes', () => {
    renderNotificationContainer();
    const container = screen.getByTestId('notification-container');
    
    expect(container).toHaveAttribute('role', 'alert');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  test('notifications have correct styling based on type', () => {
    const notificationTypes = [
      { type: 'success', title: 'Success', message: 'Success notification', expectedClass: 'bg-green-500' },
      { type: 'error', title: 'Error', message: 'Error notification', expectedClass: 'bg-red-500' },
      { type: 'warning', title: 'Warning', message: 'Warning notification', expectedClass: 'bg-yellow-500' },
      { type: 'info', title: 'Info', message: 'Info notification', expectedClass: 'bg-blue-500' }
    ];

    const { addNotification } = renderNotificationContainer();

    notificationTypes.forEach(notification => {
      act(() => {
        addNotification(notification);
      });
    });

    notificationTypes.forEach(notification => {
      const notificationElement = screen.getByText(notification.message);
      expect(notificationElement).toHaveClass(notification.expectedClass);
    });
  });
});
