import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { ChatBubbleIcon, XIcon, SendIcon, SparklesIcon } from '../constants';
import ChatBubble from './ChatBubble';

// Static import of types is safe and doesn't affect runtime
import type { GoogleGenAI, Chat } from '@google/genai';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAssistantReady, setIsAssistantReady] = useState(false);
  
  const messageId = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const isChatInitialized = useRef(false);

  // Set the initial greeting message
  useEffect(() => {
    messageId.current = 0;
    const initialMessageText = "Olá! Sou seu assistente do Agente Pro-founder. Como posso ajudar com sua estratégia de conteúdo hoje?";
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
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const systemInstruction = `You are a helpful assistant for "Solo in Public", an Agent as a Service (AaaS) that helps solo founders build and grow in public on LinkedIn. Your name is Pro-founder Agent assistant. Be concise and helpful. The user is asking questions about the service. The current language is pt. Please respond in pt.`;

        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: [{
                role: 'model',
                parts: [{ text: messages[0].text }]
            }],
            config: {
                systemInstruction
            }
        });
        setIsAssistantReady(true);
        isChatInitialized.current = true;
    } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
        setMessages(prev => [...prev, {
            id: messageId.current++,
            role: 'model',
            text: 'Desculpe, não foi possível conectar ao assistente de IA. Por favor, tente novamente mais tarde.'
        }]);
    } finally {
        setIsInitializing(false);
    }
  };
  
  // Initialize the chat when the user opens it
  useEffect(() => {
    if (isOpen) {
        initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages.length, messages[messages.length - 1]?.text]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isAssistantReady || !chatRef.current) return;

    const userMessageText = input;
    setInput('');
    setIsLoading(true);

    const userMessage: Message = { id: messageId.current++, role: 'user', text: userMessageText };
    const modelMessageId = messageId.current++;
    const modelMessagePlaceholder: Message = { id: modelMessageId, role: 'model', text: '' };

    setMessages(prev => [...prev, userMessage, modelMessagePlaceholder]);

    try {
        const responseStream = await chatRef.current.sendMessageStream({ message: userMessageText });

        let modelResponse = '';
        for await (const chunk of responseStream) {
            modelResponse += chunk.text;
            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, text: modelResponse } : msg
            ));
        }

    } catch (error) {
        console.error("Error sending message:", error);
        setIsAssistantReady(false);
        const errorMessage = "Desculpe, algo deu errado. Por favor, tente novamente.";
        setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId 
            ? { ...msg, text: errorMessage } 
            : msg
        ));
    } finally {
        setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
      if(isInitializing) return "Inicializando assistente...";
      if(isAssistantReady) return "Pergunte qualquer coisa...";
      return "Assistente indisponível";
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-8 w-[calc(100%-2rem)] sm:w-96 h-[70vh] sm:h-[600px] bg-[#0D1117]/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-blue-400" />
              <h3 className="font-bold text-white">Assistente de IA</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto">
            <div 
              className="flex flex-col gap-4"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getPlaceholderText()}
                disabled={!isAssistantReady || isInitializing}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button type="submit" disabled={!isAssistantReady || isLoading || !input.trim()} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                <SendIcon className="h-6 w-6" />
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-8 bg-blue-600 text-white rounded-full p-4 shadow-2xl shadow-blue-600/30 z-50 transition-transform hover:scale-110 active:scale-95"
        aria-label={"Abrir chat"}
      >
        {isOpen ? <XIcon className="h-8 w-8" /> : <ChatBubbleIcon className="h-8 w-8" />}
      </button>
    </>
  );
};

export default ChatBot;