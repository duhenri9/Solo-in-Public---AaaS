import React, { FormEvent, useMemo, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { CheckIcon, CheckCircleIcon } from '../constants';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';
import { BillingService } from '@/src/services/billingService';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
}

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
let stripePromise: Promise<Stripe | null> | null = null;

const getStripeClient = async (): Promise<Stripe | null> => {
  if (!stripePublishableKey) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, leadId }) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        company: ''
    });
    const { t } = useTranslation();
    const { addNotification } = useNotifications();
    const checkoutFeatures = useMemo(
        () => t('checkoutModal.features', { returnObjects: true }) as string[],
        [t]
    );

    const handleChange = (field: 'fullName' | 'email' | 'company', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (status === 'processing') return;

        setStatus('processing');
        setErrorMessage(null);

        try {
            const session = await BillingService.createCheckoutSession({
                ...formData,
                planId: 'pro-founder-monthly',
                leadId
            });

            if (session.status === 'requires_redirect') {
                if (session.checkoutUrl) {
                    window.location.href = session.checkoutUrl;
                    return;
                }

                if (session.sessionId) {
                    const stripe = await getStripeClient();
                    if (!stripe) {
                        throw new Error('Stripe publishable key não configurada ou inválida.');
                    }

                    const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId });
                    if (error) {
                        throw new Error(error.message ?? 'Falha ao redirecionar para o checkout.');
                    }
                    return;
                }
            }

            if (session.status === 'simulated') {
                setStatus('success');
                setFormData({ fullName: '', email: '', company: '' });
                addNotification({
                    type: 'info',
                    title: t('notifications.simulation.title'),
                    message: t('notifications.simulation.message')
                });
                return;
            }

            throw new Error('Não foi possível iniciar o checkout.');
        } catch (error) {
            console.error('Checkout session creation failed', error);
            setStatus('idle');
            setErrorMessage(t('notifications.error.message'));
            addNotification({
                type: 'error',
                title: t('notifications.error.title'),
                message: t('notifications.error.message')
            });
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStatus('idle');
            setErrorMessage(null);
            setFormData({ fullName: '', email: '', company: '' });
        }, 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-8">
                {status === 'success' ? (
                    <div className="text-center py-8">
                        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">{t('checkoutModal.successTitle')}</h2>
                        <p className="text-slate-400 mb-6">{t('checkoutModal.successDescription')}</p>
                        <Button onClick={handleClose} variant="outline" className="w-full">
                            {t('checkoutModal.successCta')}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleCheckout}>
                        <h2 className="text-2xl font-bold text-white mb-2">{t('checkoutModal.title')}</h2>
                        <p className="text-slate-400 mb-6">{t('checkoutModal.subtitle')}</p>
                        
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{t('checkoutModal.planLabel')}</h3>
                                    <p className="text-blue-400 text-sm font-bold">{t('checkoutModal.launchTag')}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white">{t('checkoutModal.price')}</span>
                                    <span className="text-slate-400">{t('checkoutModal.period')}</span>
                                    <p className="text-sm text-slate-500 line-through">{t('checkoutModal.oldPrice')}</p>
                                </div>
                            </div>
                            <ul className="space-y-3 text-slate-300 mt-4 text-sm">
                                {checkoutFeatures.map((feature: string, index: number) => (
                                    <li key={`checkout-${index}`} className="flex items-center gap-2">
                                        <CheckIcon className="h-5 w-5 text-blue-400"/>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4 mb-8">
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(event) => handleChange('fullName', event.target.value)}
                                placeholder={t('checkoutModal.fields.fullName')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(event) => handleChange('email', event.target.value)}
                                placeholder={t('checkoutModal.fields.email')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(event) => handleChange('company', event.target.value)}
                                placeholder={t('checkoutModal.fields.company')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {errorMessage && (
                            <p className="text-sm text-red-400 mb-4">
                                {errorMessage}
                            </p>
                        )}

                        <Button type="submit" disabled={status === 'processing'} variant="primary" className="w-full py-3 text-lg">
                            {status === 'processing' ? t('checkoutModal.processing') : t('checkoutModal.payCta')}
                        </Button>
                        <p className="text-xs text-slate-500 text-center mt-4">{t('checkoutModal.stripeDisclaimer')}</p>
                        <p className="text-xs text-slate-500 text-center mt-2">{t('checkoutModal.secureNote')}</p>
                        <p className="text-xs text-slate-600 text-center mt-2 font-medium">{t('checkoutModal.permissionReminder')}</p>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default CheckoutModal;
