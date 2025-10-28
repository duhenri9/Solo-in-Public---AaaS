// Centraliza métricas de performance para evitar ciclos de import

// Interface para métricas de performance do modelo
interface AIModelMetrics {
  tokenCost: number;
  responseTime: number;
  accuracy: number;
}

export class AIModelPerformanceManager {
  private static instance: AIModelPerformanceManager;
  private modelMetrics: Map<string, AIModelMetrics> = new Map();
  private fallbackThreshold = {
    tokenCost: 0.4,     // Custo máximo por token (mais restrito)
    responseTime: 1800, // Tempo máximo de resposta em ms
    accuracy: 0.85      // Precisão mínima aceitável
  };

  private constructor() {}

  public static getInstance(): AIModelPerformanceManager {
    if (!this.instance) {
      this.instance = new AIModelPerformanceManager();
    }
    return this.instance;
  }

  public recordModelMetrics(modelName: string, metrics: AIModelMetrics) {
    this.modelMetrics.set(modelName, metrics);
  }

  public isModelPerformant(modelName: string): boolean {
    const metrics = this.modelMetrics.get(modelName);
    if (!metrics) return false;
    return (
      metrics.tokenCost <= this.fallbackThreshold.tokenCost &&
      metrics.responseTime <= this.fallbackThreshold.responseTime &&
      metrics.accuracy >= this.fallbackThreshold.accuracy
    );
  }

  public getModelMetrics(modelName: string) {
    return this.modelMetrics.get(modelName);
  }
}

