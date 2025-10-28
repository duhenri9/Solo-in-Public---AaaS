import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { CheckIcon, CheckCircleIcon } from '../constants';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const checkoutFeatures: string[] = [ "IA adaptativa e automação completa", "Engajamento ético e inteligente", "Relatórios avançados e alertas" ];

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const handlePayment = () => {
        setStatus('processing');
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => setStatus('idle'), 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-8">
                {status === 'success' ? (
                    <div className="text-center py-8">
                        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Pagamento bem-sucedido!</h2>
                        <p className="text-slate-400 mb-6">Bem-vindo(a) a bordo! Seu Agente Pro-founder está ativo.</p>
                        <Button onClick={handleClose} variant="outline" className="w-full">
                            Começar a Construir
                        </Button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ativar Agente Pro-founder</h2>
                        <p className="text-slate-400 mb-6">Você está garantindo o preço especial de lançamento.</p>
                        
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Pro Founder</h3>
                                    <p className="text-blue-400 text-sm font-bold">Preço de Lançamento</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white">R$197</span>
                                    <span className="text-slate-400">/mês</span>
                                    <p className="text-sm text-slate-500 line-through">R$297</p>
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
                            <input type="text" placeholder="Número do Cartão" className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="flex gap-4">
                                <input type="text" placeholder="MM / AA" className="w-1/2 bg-slate-800 border border-slate-700 rounded-md p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="text" placeholder="CVC" className="w-1/2 bg-slate-800 border border-slate-700 rounded-md p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <Button onClick={handlePayment} disabled={status === 'processing'} variant="primary" className="w-full py-3 text-lg">
                            {status === 'processing' ? 'Processando...' : `Pagar R$197`}
                        </Button>
                        <p className="text-xs text-slate-500 text-center mt-4">Pagamento seguro via Stripe. Cancele a qualquer momento.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CheckoutModal;