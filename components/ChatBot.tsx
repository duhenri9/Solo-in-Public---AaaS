import React, { useState, useEffect, useRef, useCallback, FormEvent, useMemo } from 'react';
import Button from './ui/Button';
import { AssistantOrchestrator } from '@/src/services/assistant/orchestrator';
import { LeadSubmissionResult } from '@/src/services/leadCaptureService';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  leadSubmission?: LeadSubmissionResult | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ leadSubmission }) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAssistantReady, setIsAssistantReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const messageId = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isChatInitialized = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const sessionIdRef = useRef<string>('');

  if (!sessionIdRef.current) {
    const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
    sessionIdRef.current = hasCrypto ? crypto.randomUUID() : `session_${Date.now()}`;
  }

  const orchestrator = useMemo(() => new AssistantOrchestrator(), []);

  const initialMessageText = useMemo(() => t('chatbot.initialMessage'), [t]);
  const speechLocale = useMemo(() => {
    if (i18n.language.startsWith('en')) return 'en-US';
    if (i18n.language.startsWith('es')) return 'es-ES';
    return 'pt-BR';
  }, [i18n.language]);

  useEffect(() => {
    messageId.current = 0;
    setMessages([{
      id: messageId.current++,
      role: 'model',
      text: initialMessageText,
    }]);
  }, [initialMessageText]);

  const handleVoiceInput = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !isAssistantReady) return;

    const newUserMessage: Message = {
      id: messageId.current++,
      role: 'user',
      text: text.trim()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const assistantResponse = await orchestrator.processMessage({
        sessionId: sessionIdRef.current,
        message: text.trim(),
        locale: i18n.language,
        leadSubmission
      });
      const responseText = assistantResponse.message;

      const aiResponse: Message = {
        id: messageId.current++,
        role: 'model',
        text: responseText
      };

      setMessages(prev => [...prev, aiResponse]);

      // Saída por voz desativada por padrão (apenas entrada por voz quando usuário clicar em "Falar").

      if (assistantResponse.handoverTriggered) {
        addNotification({
          type: 'info',
          title: t('notifications.handover.title'),
          message: t('notifications.handover.message')
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [...prev, {
        id: messageId.current++,
        role: 'model',
        text: t('chatbot.errorFallback')
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isAssistantReady, t, speechLocale, orchestrator, i18n.language, leadSubmission, addNotification]);

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const speechSynthesis = window.speechSynthesis;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = speechLocale;

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
          
          if (event.results[current].isFinal) {
            setTranscript('');
            handleVoiceInput(transcriptText);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Erro no reconhecimento de voz:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }

      if (speechSynthesis) {
        synthRef.current = speechSynthesis;
      }
    }
  }, [handleVoiceInput, speechLocale]);

  const initializeChat = async () => {
    if (isChatInitialized.current || isInitializing) return;

    setIsInitializing(true);
    try {
      setIsAssistantReady(true);
      isChatInitialized.current = true;
    } catch (error) {
      console.error("Falha na inicialização do assistente:", error);
      setMessages(prev => [...prev, {
        id: messageId.current++,
        role: 'model',
        text: t('chatbot.connectionError')
      }]);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages.length, messages[messages.length - 1]?.text]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
    const userMessage = input.value.trim();

    if (!userMessage || isLoading || !isAssistantReady) return;

    const newUserMessage: Message = {
      id: messageId.current++,
      role: 'user',
      text: userMessage
    };

    setMessages(prev => [...prev, newUserMessage]);
    input.value = '';
    setIsLoading(true);

    try {
      const assistantResponse = await orchestrator.processMessage({
        sessionId: sessionIdRef.current,
        message: userMessage,
        locale: i18n.language,
        leadSubmission
      });
      const responseText = assistantResponse.message;
      
      const aiResponse: Message = {
        id: messageId.current++,
        role: 'model',
        text: responseText
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Saída por voz desativada por padrão (apenas entrada por voz quando usuário clicar em "Falar").

      if (assistantResponse.handoverTriggered) {
        addNotification({
          type: 'info',
          title: t('notifications.handover.title'),
          message: t('notifications.handover.message')
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [...prev, {
        id: messageId.current++,
        role: 'model',
        text: t('chatbot.errorFallback')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(t('chatbot.speechUnsupported'));
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button 
          onClick={toggleChat} 
          className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600"
        >
          {t('chatbot.launcher')}
        </Button>
      )}

      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center rounded-t-lg">
            <h3>{t('chatbot.title')}</h3>
            <button 
              onClick={toggleChat} 
              className="text-white font-semibold"
              aria-label={t('feedback.close')}
            >
              x
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-blue-100 text-blue-800 self-end ml-auto' 
                    : 'bg-gray-100 text-gray-800 self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {transcript && (
              <div className="p-2 rounded-lg max-w-[80%] bg-blue-50 text-blue-600 italic border border-blue-200 self-end ml-auto">
                {transcript}...
              </div>
            )}
            {isLoading && (
              <div className="text-center text-gray-500">{t('chatbot.loading')}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
            <input 
              type="text" 
              name="message"
              placeholder={t('chatbot.placeholder')} 
              className="flex-grow p-2 border rounded-lg"
              disabled={!isAssistantReady || isLoading}
            />
            <button
              type="button"
              onClick={toggleRecording}
              disabled={!isAssistantReady || isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${!isAssistantReady || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isRecording ? t('chatbot.listeningStop') : t('chatbot.listeningStart')}
            >
              <span className="text-sm font-semibold">
                {isRecording ? t('chatbot.listeningStop') : t('chatbot.listeningStart')}
              </span>
            </button>
            <Button 
              type="submit" 
              disabled={!isAssistantReady || isLoading}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              {t('chatbot.send')}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
