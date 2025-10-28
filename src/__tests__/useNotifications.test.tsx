import React, { useImperativeHandle } from 'react';
import { render, act } from '@testing-library/react';
import { NotificationProvider, useNotifications, Notification as NotificationType } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/NotificationContainer';
import { LocalizationProvider } from '../../hooks/useLocalization';

type NotificationContextHandle = {
  addNotification: (notification: Omit<NotificationType, 'id'>) => void;
};

const NotificationTestHarness = React.forwardRef<NotificationContextHandle>((_, ref) => {
  const context = useNotifications();

  useImperativeHandle(ref, () => ({
    addNotification: context.addNotification
  }), [context.addNotification]);

  return (
    <>
      <button
        onClick={() =>
          context.addNotification({
            type: 'success',
            title: 'Test Title',
            message: 'Test Notification'
          })
        }
      >
        Add Notification
      </button>
      <NotificationContainer />
    </>
  );
});
NotificationTestHarness.displayName = 'NotificationTestHarness';

describe('useNotifications Hook', () => {
  const renderHarness = () => {
    const ref = React.createRef<NotificationContextHandle>();
    const utils = render(
      <LocalizationProvider>
        <NotificationProvider>
          <NotificationTestHarness ref={ref} />
        </NotificationProvider>
      </LocalizationProvider>
    );

    if (!ref.current) {
      throw new Error('Notification context not ready');
    }

    return { ...utils, contextRef: ref };
  };

  test('adds notification correctly', () => {
    const { getByText } = renderHarness();
    const button = getByText('Add Notification');

    act(() => {
      button.click();
    });

    expect(getByText('Test Notification')).toBeInTheDocument();
  });

  test('supports different notification types', () => {
    const { contextRef, container } = renderHarness();
    const notifications: Array<Omit<NotificationType, 'id'>> = [
      { type: 'success', title: 'Success', message: 'Success message' },
      { type: 'error', title: 'Error', message: 'Error message' },
      { type: 'info', title: 'Info', message: 'Info message' },
      { type: 'warning', title: 'Warning', message: 'Warning message' }
    ];

    notifications.forEach(notification => {
      act(() => {
        contextRef.current.addNotification(notification);
      });
    });

    const renderedNotifications = container.querySelectorAll('[data-notification-type]');
    expect(renderedNotifications.length).toBe(4);
  });

  test('removes notifications after timeout', () => {
    jest.useFakeTimers();

    const { contextRef, queryByText } = renderHarness();

    act(() => {
      contextRef.current.addNotification({
        type: 'success',
        title: 'Temporary Title',
        message: 'Temporary Notification'
      });
    });

    expect(queryByText('Temporary Notification')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(queryByText('Temporary Notification')).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
