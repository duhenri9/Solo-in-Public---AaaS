import '@testing-library/jest-dom';

// Configurações globais de teste
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});

// Mock de performance e outros objetos globais
if (!window.performance) {
  window.performance = {
    now: jest.fn(() => Date.now()),
    memory: {
      totalJSHeapSize: 0,
      usedJSHeapSize: 0,
      jsHeapSizeLimit: 0
    }
  } as any;
}

// Configurações de console para testes
const originalConsoleError = console.error;
console.error = jest.fn((message: any, ...args: any[]) => {
  // Ignorar certos erros esperados
  if (
    (typeof message === 'string' && 
      (message.includes('Warning: An update inside a test was not wrapped in act') ||
       message.includes('Error: Not implemented'))) ||
    (message instanceof Error && 
      (message.message.includes('Warning: An update inside a test was not wrapped in act') ||
       message.message.includes('Error: Not implemented')))
  ) {
    return;
  }
  originalConsoleError(message, ...args);
});

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
