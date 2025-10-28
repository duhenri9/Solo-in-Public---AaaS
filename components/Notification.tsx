import React from 'react';
import { useTranslation } from 'react-i18next';
import { Notification as NotificationType } from '../hooks/useNotifications';
import { XIcon, InfoIcon, CheckCircleIcon, WarningIcon } from '../constants';

interface NotificationProps {
  notification: NotificationType;
  onDismiss: (id: number) => void;
}

const icons: { [key in NotificationType['type']]: React.ReactNode } = {
  info: <InfoIcon className="h-6 w-6 text-blue-400" />,
  success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
  warning: <WarningIcon className="h-6 w-6 text-yellow-400" />,
  error: <WarningIcon className="h-6 w-6 text-red-400" />,
};

const typeStyles: { [key in NotificationType['type']]: string } = {
  info: 'border-blue-400/60 bg-blue-500/10',
  success: 'border-green-400/60 bg-green-500/10',
  warning: 'border-yellow-400/60 bg-yellow-500/10',
  error: 'border-red-400/60 bg-red-500/10',
};

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const { t } = useTranslation();
  return (
    <div
      data-notification-type={notification.type}
      className={`w-full backdrop-blur-lg border rounded-lg shadow-2xl p-4 flex items-start space-x-4 ${typeStyles[notification.type]}`}
    >
      <div className="flex-shrink-0">{icons[notification.type]}</div>
      <div className="flex-1">
        <p className="font-bold text-white">{notification.title}</p>
        <p className="text-sm text-slate-300">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-slate-500 hover:text-white"
        aria-label={t('notifications.dismiss')}
      >
        <XIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Notification;
