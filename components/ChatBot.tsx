import React, { useState, useEffect, useRef, FormEvent } from 'react';
import Button from './ui/Button';  // Importar como default
import { aiModelService } from '../src/services/aiModelService';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAssistantReady, setIsAssistantReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messageId = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isChatInitialized = useRef(false);

  const initialMessageText = "Olá! Sou o assistente do Solo in Public. Como posso ajudar você hoje?";

  useEffect(() => {
    setMessages([{
      id: messageId.current++,
      role: 'model',
      text: initialMessageText,
    }]);
  }, []);

  const initializeChat = async () => {
    if (isChatInitialized.current || isInitializing) return;

    setIsInitializing(true);
    try {
      // Lógica de inicialização do modelo de IA
      // Pode ser substituída por qualquer modelo (Anthropic, Google, etc.)
      setIsAssistantReady(true);
      isChatInitialized.current = true;
    } catch (error) {
      console.error("Falha na inicialização do assistente:", error);
      setMessages(prev => [...prev, {
        id: messageId.current++,
        role: 'model',
        text: 'Desculpe, não foi possível conectar ao assistente. Por favor, verifique sua configuração.'
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
      const response = await aiModelService.sendMessage(userMessage);
      const aiResponse: Message = {
        id: messageId.current++,
        role: 'model',
        text: response.text()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [...prev, {
        id: messageId.current++,
        role: 'model',
        text: 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
      }]);
    } finally {
      setIsLoading(false);
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
          💬 Assistente
        </Button>
      )}

      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center rounded-t-lg">
            <h3>Pro-founder Agent</h3>
            <button onClick={toggleChat} className="text-white">✕</button>
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
            {isLoading && (
              <div className="text-center text-gray-500">Digitando...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t flex">
            <input 
              type="text" 
              name="message"
              placeholder="Digite sua mensagem..." 
              className="flex-grow p-2 border rounded-l-lg"
              disabled={!isAssistantReady || isLoading}
            />
            <Button 
              type="submit" 
              disabled={!isAssistantReady || isLoading}
              className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
            >
              Enviar
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;