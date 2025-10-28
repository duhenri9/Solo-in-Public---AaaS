import React, { useImperativeHandle } from 'react';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider, useNotifications, Notification as NotificationType } from '../../hooks/useNotifications';
import { LocalizationProvider } from '../../hooks/useLocalization';
import NotificationContainer from '../../components/NotificationContainer';

describe('NotificationContainer', () => {
  type NotificationContextHandle = {
    addNotification: (notification: Omit<NotificationType, 'id'>) => void;
  };

  const NotificationTestBridge = React.forwardRef<NotificationContextHandle>((_, ref) => {
    const { addNotification } = useNotifications();

    useImperativeHandle(ref, () => ({
      addNotification
    }), [addNotification]);

    return <NotificationContainer />;
  });
  NotificationTestBridge.displayName = 'NotificationTestBridge';

  const renderNotificationContainer = () => {
    const contextRef = React.createRef<NotificationContextHandle>();

    const utils = render(
      <LocalizationProvider>
        <NotificationProvider>
          <NotificationTestBridge ref={contextRef} />
        </NotificationProvider>
      </LocalizationProvider>
    );

    if (!contextRef.current) {
      throw new Error('Notification context not available for testing');
    }

    return { ...utils, contextRef };
  };

  test('renders without crashing', () => {
    const { contextRef } = renderNotificationContainer();
    expect(screen.getByTestId('notification-container')).toBeInTheDocument();

    act(() => {
      contextRef.current.addNotification({
        type: 'success',
        title: 'Rendered',
        message: 'Container mounted'
      });
    });

    expect(screen.getByText('Container mounted')).toBeInTheDocument();
  });

  test('displays different types of notifications', () => {
    const { contextRef } = renderNotificationContainer();
    const notifications: Array<Omit<NotificationType, 'id'>> = [
      { type: 'success', title: 'Success', message: 'Success notification' },
      { type: 'error', title: 'Error', message: 'Error notification' },
      { type: 'warning', title: 'Warning', message: 'Warning notification' },
      { type: 'info', title: 'Info', message: 'Info notification' }
    ];

    notifications.forEach(notification => {
      act(() => {
        contextRef.current.addNotification(notification);
      });
    });

    notifications.forEach(notification => {
      expect(screen.getByText(notification.message)).toBeInTheDocument();
    });
  });

  test('notification container has correct aria attributes', () => {
    renderNotificationContainer();
    const container = screen.getByTestId('notification-container');
    
    expect(container).toHaveAttribute('role', 'alert');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-atomic', 'false');
  });

  test('notifications expose their types for styling', () => {
    const { contextRef } = renderNotificationContainer();
    const notifications: Array<Omit<NotificationType, 'id'>> = [
      { type: 'success', title: 'Success', message: 'Success notification' },
      { type: 'error', title: 'Error', message: 'Error notification' },
      { type: 'warning', title: 'Warning', message: 'Warning notification' },
      { type: 'info', title: 'Info', message: 'Info notification' }
    ];

    notifications.forEach(notification => {
      act(() => {
        contextRef.current.addNotification(notification);
      });
    });

    notifications.forEach(notification => {
      const element = screen.getByText(notification.message).closest('[data-notification-type]');
      expect(element).toHaveAttribute('data-notification-type', notification.type);
    });
  });
});
