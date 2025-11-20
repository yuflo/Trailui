/**
 * Service Container
 * 
 * 依赖注入容器
 * 管理所有服务实例的创建和访问
 * 
 * ✅ Phase 2优化：使用DataAccessFactory注入DataAccess实例
 * ✅ Phase 5 Step 5.2: 移除 StoryServiceImpl（已迁移到 business 层）
 * ✅ Phase 6.1: 移除 ClueServiceImpl（已迁移到 business 层）
 */

import type { 
  // IStoryService,  // 🗑️ Phase 5 完成：已迁移到 business/StoryService
  IVisualService, 
  ITickerService,  // ⚠️ 保留接口类型（TickerSystem 需要）
  // INarrativeClueService,  // 🗑️ 已删除 - Phase 3
  // IFreedomMirrorService,  // 🗑️ 已删除 - Phase 2
  IClueService,
  INearFieldService,
  // IPlayerService,  // ⚠️ Phase 1 完成：已迁移到 InstanceCacheManager，移除接口引用
} from '../../types';
import { 
  // StoryServiceImpl,  // 🗑️ Phase 5 完成：已迁移到 business/StoryService
  // VisualServiceImpl,  // 🗑️ Phase 6.2: 已迁移到 business/VisualService
  // ClueServiceImpl,  // 🗑️ Phase 6.1: 已迁移到 business/ClueService
  // NearFieldServiceImpl,  // 🗑️ Phase 6.3: 已迁移到 business/NearFieldService
  // PlayerServiceImpl,  // ⚠️ Phase 1 完成：已迁移，移除导入
} from './impl';
import { ClueService } from './business/ClueService';  // 🔥 Phase 6.1: 导入新的 ClueService
import { VisualService } from './business/VisualService';  // 🔥 Phase 6.2: 导入新的 VisualService
import { NearFieldService } from './business/NearFieldService';  // 🔥 Phase 6.3: 导入新的 NearFieldService
import { DataAccessFactory } from '../data-access/DataAccessFactory';
import type { StateManager } from '../core/StateManager';

/**
 * 服务容器类
 * 
 * 使用单例模式，提供服务实例的统一访问点
 * 
 * ✅ 架构修复：支持 StateManager 延迟注入
 * ✅ Phase 6.1: ClueService 改为静态方法适配器
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  
  // ⚠️ Phase 5: StoryService 已迁移到 business 层，直接使用 StoryService.methodName()
  // private storyService: IStoryService;  // 🗑️ 已删除
  private visualService: IVisualService;
  private clueService: IClueService | null = null;  // 🔥 Phase 6.1: 改为适配器
  private nearFieldService: INearFieldService;  // 🔥 Phase 6.3: 改为适配器
  // private playerService: IPlayerService;  // 🗑️ Phase 1 完成：已迁移到 InstanceCacheManager
  
  /**
   * 私有构造函数，防止外部实例化
   */
  private constructor() {
    console.log('[ServiceContainer] Initializing services with DataAccess layer...');
    
    // 🔥 Phase 6.2: 创建 VisualService 适配器（静态方法 → 实例方法）
    this.visualService = {
      getAllArchetypes: () => VisualService.getAllArchetypes(),
      applyArchetype: (archetypeId: any, overrides?: any) => VisualService.applyArchetype(archetypeId, overrides),
      clearArchetype: () => VisualService.clearArchetype(),
      getCurrentConfig: () => VisualService.getCurrentConfig(),
    } as IVisualService;
    
    // 🔥 Phase 6.3: 创建 NearFieldService 适配器（静态方法 → 实例方法）
    this.nearFieldService = {
      advance: (request: any) => NearFieldService.advance(request),
    } as INearFieldService;
  }
  
  /**
   * ✅ 注入 StateManager 并初始化 ClueService
   * 🔥 Phase 6.1: 创建静态方法适配器
   * @param stateManager 状态管理器实例（已废弃，保留兼容性）
   * @note 必须在使用 ClueService 前调用
   */
  initializeClueService(stateManager: StateManager): void {
    if (this.clueService) {
      console.warn('[ServiceContainer] ClueService already initialized');
      return;
    }
    
    // 🔥 Phase 6.1: 创建适配器，将静态方法包装为实例方法
    this.clueService = {
      extractClue: (messageId: string, clueId: string) => ClueService.extractClue(messageId, clueId),
      trackClue: (clueId: string) => ClueService.trackClue(clueId),  // 🔥 修复：只传 clueId
      getClueInbox: () => ClueService.getClueInbox(),
      getCluesByStatus: (status: any) => ClueService.getCluesByStatus(status),
      updateClueStatus: (clueId: string, status: any) => ClueService.updateClueStatus(clueId, status),
      getTrackedStoryByClue: (clueId: string) => ClueService.getTrackedStoryByClue(clueId),
      markSceneCompleted: (clueId: string, sceneId: string) => ClueService.markSceneCompleted(clueId, sceneId),
      markStoryCompleted: (clueId: string, completionClueId?: string) => ClueService.markStoryCompleted(clueId, completionClueId),
      getTrackedStories: () => ClueService.getTrackedStories(),
      getActiveStory: () => ClueService.getActiveStory(),
      setActiveStory: (clueId: string) => ClueService.setActiveStory(clueId),
      clearActiveStory: () => ClueService.clearActiveStory(),
      clearInbox: () => ClueService.clearInbox(),
      getStats: () => ClueService.getStats(),
    } as IClueService;
    
    console.log('[ServiceContainer] ✅ ClueService initialized with static method adapter');
  }
  
  /**
   * 获取服务容器单例
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
  
  /**
   * 获取故事服务
   * 🗑️ Phase 5 删除：请直接使用 StoryService.methodName()
   */
  // getStoryService(): IStoryService {
  //   return this.storyService;
  // }
  
  /**
   * 获取视觉服务
   */
  getVisualService(): IVisualService {
    return this.visualService;
  }
  
  /**
   * 获取线索服务（远场探索）
   * @throws 如果 ClueService 未初始化
   */
  getClueService(): IClueService {
    if (!this.clueService) {
      throw new Error('[ServiceContainer] ClueService not initialized. Call initializeClueService(stateManager) first.');
    }
    return this.clueService;
  }
  
  /**
   * 获取近场交互服务
   */
  getNearFieldService(): INearFieldService {
    return this.nearFieldService;
  }
  
  /**
   * 获取玩家服务
   */
  // getPlayerService(): IPlayerService {
  //   return this.playerService;
  // }
}