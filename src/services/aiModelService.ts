// Definição da interface base para modelos de IA
export interface AIModel {
  sendMessage: (message: string) => Promise<{ text: () => string }>;
}

// Modelo padrão que pode ser substituído
export class DefaultAIModel implements AIModel {
  async sendMessage(message: string) {
    return {
      text: () => `Resposta padrão para: ${message}. Por favor, configure um modelo de IA.`
    };
  }
}

// Classe para gerenciar diferentes modelos de IA
export class AIModelService {
  private static instance: AIModelService;
  private currentModel: AIModel;

  private constructor() {
    this.currentModel = new DefaultAIModel();
  }

  // Singleton para garantir uma única instância
  public static getInstance(): AIModelService {
    if (!AIModelService.instance) {
      AIModelService.instance = new AIModelService();
    }
    return AIModelService.instance;
  }

  // Método para definir o modelo de IA atual
  public setModel(model: AIModel): void {
    this.currentModel = model;
  }

  // Método para obter o modelo de IA atual
  public getModel(): AIModel {
    return this.currentModel;
  }

  // Método para enviar mensagem usando o modelo atual
  public async sendMessage(message: string) {
    return this.currentModel.sendMessage(message);
  }
}

// Exportar uma instância singleton para uso global
export const aiModelService = AIModelService.getInstance();
