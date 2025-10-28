import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';
import { LeadCaptureService, LeadCaptureForm, LeadSubmissionResult } from '@/src/services/leadCaptureService';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: LeadSubmissionResult) => void;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const initialFormState: LeadCaptureForm = {
  fullName: '',
  email: '',
  company: '',
  role: '',
  primaryGoal: '',
  urgency: '',
  notes: '',
};

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotifications();
  const [formState, setFormState] = useState<LeadCaptureForm>(initialFormState);
  const [status, setStatus] = useState<FormStatus>('idle');

  const goalOptions = useMemo(
    () => t('leadCapture.options.primaryGoal', { returnObjects: true }) as Record<string, string>,
    [t]
  );
  // Campo de faixa de investimento removido para o fluxo Free
  const urgencyOptions = useMemo(
    () => t('leadCapture.options.urgency', { returnObjects: true }) as Record<string, string>,
    [t]
  );

  const handleChange = (field: keyof LeadCaptureForm, value: string | boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const cached = LeadCaptureService.getCachedLead();
    if (cached) {
      setFormState({
        fullName: cached.fullName,
        email: cached.email,
        company: cached.company,
        role: cached.role,
        primaryGoal: cached.primaryGoal,
        urgency: cached.urgency,
        notes: cached.notes,
      });
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    try {
      const submissionResult = await LeadCaptureService.submitLead(formState);
      setStatus('success');
      onSuccess?.(submissionResult);
      addNotification({
        type: 'success',
        title: t('notifications.leadCaptured.title'),
        message: t('notifications.leadCaptured.message')
      });
    } catch (error) {
      console.error('Lead capture submission failed', error);
      setStatus('error');
      addNotification({
        type: 'error',
        title: t('notifications.error.title'),
        message: t('leadCapture.errorMessage')
      });
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setFormState(initialFormState);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-8">
        {status === 'success' ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">{t('leadCapture.successTitle')}</h2>
            <p className="text-slate-400">{t('leadCapture.successDescription')}</p>
            <Button variant="primary" className="w-full" onClick={handleClose}>
              {t('leadCapture.successCta')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">{t('leadCapture.title')}</h2>
              <p className="text-slate-400 text-sm">{t('leadCapture.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                required
                value={formState.fullName}
                onChange={(event) => handleChange('fullName', event.target.value)}
                placeholder={t('leadCapture.fields.fullName')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                required
                value={formState.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder={t('leadCapture.fields.email')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={formState.company}
                onChange={(event) => handleChange('company', event.target.value)}
                placeholder={t('leadCapture.fields.company')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={formState.role}
                onChange={(event) => handleChange('role', event.target.value)}
                placeholder={t('leadCapture.fields.role')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                required
                value={formState.primaryGoal}
                onChange={(event) => handleChange('primaryGoal', event.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  {t('leadCapture.fields.primaryGoal')}
                </option>
                {Object.entries(goalOptions).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {/* Campo "Faixa de investimento mensal" removido para conta Free */}
              <select
                required
                value={formState.urgency}
                onChange={(event) => handleChange('urgency', event.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  {t('leadCapture.fields.urgency')}
                </option>
                {Object.entries(urgencyOptions).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                value={formState.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
                placeholder={t('leadCapture.fields.notes')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Consentimento removido para fluxo Free sem fricção */}
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-400">
                {t('leadCapture.errorMessage')}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={status === 'submitting'}
              className="w-full py-3 text-lg"
            >
              {status === 'submitting' ? t('leadCapture.submitting') : t('leadCapture.submit')}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default LeadCaptureModal;
