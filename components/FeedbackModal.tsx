import React, { useState, FormEvent } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { LightbulbIcon, CheckCircleIcon } from '../constants';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = 'idle' | 'submitting' | 'success';
type FeedbackCategory = 'suggestion' | 'bug' | 'general';

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const { addNotification } = useNotifications();
  const { t } = useTranslation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length === 0) return;
    
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
        console.log("Simulating feedback submission:", { category, message });
        addNotification({
          type: 'success',
          title: t('notifications.feedbackSent.title'),
          message: t('notifications.feedbackSent.message')
        });
        setStatus('success');
    }, 1000);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setStatus('idle');
        setMessage('');
        setCategory('suggestion');
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="p-8">
            {status !== 'success' ? (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <LightbulbIcon className="h-8 w-8 text-purple-400" />
                        <h2 className="text-2xl font-bold text-white">{t('feedback.modalTitle')}</h2>
                    </div>
                    <p className="text-slate-400 mb-6">{t('feedback.modalSubtitle')}</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
                                    {t('feedback.categoryLabel')}
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="suggestion">{t('feedback.categories.suggestion')}</option>
                                    <option value="bug">{t('feedback.categories.bug')}</option>
                                    <option value="general">{t('feedback.categories.general')}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">
                                    {t('feedback.messageLabel')}
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t('feedback.placeholder')}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={status === 'submitting'} variant="primary" className="w-full mt-6 bg-purple-600 hover:bg-purple-500 focus:ring-purple-500 shadow-purple-600/20">
                            {status === 'submitting' ? t('feedback.submitting') : t('feedback.submit')}
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="text-center py-8">
                    <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">{t('feedback.successTitle')}</h2>
                    <p className="text-slate-400 mb-6">{t('feedback.successDescription')}</p>
                    <Button onClick={handleClose} variant="outline" className="w-full">
                        {t('feedback.close')}
                    </Button>
                </div>
            )}
        </div>
    </Modal>
  );
};

export default FeedbackModal;
