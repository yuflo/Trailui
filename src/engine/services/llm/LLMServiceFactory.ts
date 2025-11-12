/**
 * LLM服务工厂
 * 
 * 管理LLM服务实例，支持Mock/Real切换
 */

import type {
  ISceneNarrativeGenerationService,
  INPCDialogueService,
  IPlayerChoiceGenerationService,
  IFreeformInputProcessingService
} from './interfaces/ILLMService';

import {
  MockSceneNarrativeService,
  MockNPCDialogueService,
  MockPlayerChoiceGenerationService,
  MockFreeformInputProcessingService
} from './mock/MockLLMService';

/**
 * LLM服务模式
 */
type LLMServiceMode = 'mock' | 'real';

/**
 * LLM服务工厂
 */
export class LLMServiceFactory {
  private static mode: LLMServiceMode = 'mock';
  
  // 服务实例
  private static narrativeService: ISceneNarrativeGenerationService = new MockSceneNarrativeService();
  private static dialogueService: INPCDialogueService = new MockNPCDialogueService();
  private static choiceService: IPlayerChoiceGenerationService = new MockPlayerChoiceGenerationService();
  private static freeformService: IFreeformInputProcessingService = new MockFreeformInputProcessingService();
  
  /**
   * 获取场景叙事生成服务
   */
  static getNarrativeService(): ISceneNarrativeGenerationService {
    return this.narrativeService;
  }
  
  /**
   * 获取NPC对话服务
   */
  static getDialogueService(): INPCDialogueService {
    return this.dialogueService;
  }
  
  /**
   * 获取玩家选择生成服务
   */
  static getChoiceService(): IPlayerChoiceGenerationService {
    return this.choiceService;
  }
  
  /**
   * 获取自由输入处理服务
   */
  static getFreeformService(): IFreeformInputProcessingService {
    return this.freeformService;
  }
  
  /**
   * 🚀 切换到真实LLM服务（上线时调用）
   */
  static switchToRealLLM(config?: {
    apiKey: string;
    model: string;
    endpoint?: string;
  }): void {
    console.warn('[LLMServiceFactory] switchToRealLLM not implemented yet');
    // TODO: 上线时实现
    // this.narrativeService = new RealSceneNarrativeService(config);
    // this.dialogueService = new RealNPCDialogueService(config);
    // this.choiceService = new RealPlayerChoiceGenerationService(config);
    // this.freeformService = new RealFreeformInputProcessingService(config);
    // this.mode = 'real';
  }
  
  /**
   * 切换回Mock模式（测试用）
   */
  static switchToMock(): void {
    this.narrativeService = new MockSceneNarrativeService();
    this.dialogueService = new MockNPCDialogueService();
    this.choiceService = new MockPlayerChoiceGenerationService();
    this.freeformService = new MockFreeformInputProcessingService();
    this.mode = 'mock';
    
    console.log('[LLMServiceFactory] ✅ Switched to Mock mode');
  }
  
  /**
   * 获取当前模式
   */
  static getMode(): LLMServiceMode {
    return this.mode;
  }
}
