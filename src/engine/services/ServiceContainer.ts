/**
 * Service Container
 * 
 * 依赖注入容器
 * 管理所有服务实例的创建和访问
 * 
 * ✅ Phase 2优化：使用DataAccessFactory注入DataAccess实例
 */

import type { 
  IStoryService, 
  IVisualService, 
  ITickerService,
  INarrativeClueService,
  IFreedomMirrorService,
  IClueService,
  INearFieldService,
  IPlayerService,
} from '../../types';
import { 
  StoryServiceImpl, 
  VisualServiceImpl, 
  TickerServiceImpl,
  NarrativeClueServiceImpl,
  FreedomMirrorServiceImpl,
  ClueServiceImpl,
  NearFieldServiceImpl,
  PlayerServiceImpl,
} from './impl';
import { DataAccessFactory } from '../data-access/DataAccessFactory';
import type { StateManager } from '../core/StateManager';

/**
 * 服务容器类
 * 
 * 使用单例模式，提供服务实例的统一访问点
 * 
 * ✅ 架构修复：支持 StateManager 延迟注入
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  
  private storyService: IStoryService;
  private visualService: IVisualService;
  private tickerService: ITickerService;
  private narrativeClueService: INarrativeClueService;
  private freedomMirrorService: IFreedomMirrorService;
  private clueService: IClueService | null = null;  // ✅ 延迟初始化
  private nearFieldService: INearFieldService;
  private playerService: IPlayerService;
  
  // ✅ 保存 DataAccess 实例，用于延迟初始化
  private clueDataAccess: any;
  private storyDataAccess: any;
  
  /**
   * 私有构造函数，防止外部实例化
   */
  private constructor() {
    console.log('[ServiceContainer] Initializing services with DataAccess layer...');
    
    // ✅ 通过DataAccessFactory创建DataAccess实例
    this.clueDataAccess = DataAccessFactory.createClueDataAccess();
    this.storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const worldInfoDataAccess = DataAccessFactory.createWorldInfoDataAccess();
    const sceneDataAccess = DataAccessFactory.createSceneDataAccess();
    const playerDataAccess = DataAccessFactory.createPlayerDataAccess();
    
    // ✅ 注入DataAccess到需要的Service
    // ⚠️ ClueService 延迟初始化（需要 StateManager）
    this.storyService = new StoryServiceImpl(this.storyDataAccess);
    this.tickerService = new TickerServiceImpl(worldInfoDataAccess);
    // ✅ Phase X: NearFieldService 需要同时注入 sceneDataAccess 和 storyDataAccess
    this.nearFieldService = new NearFieldServiceImpl(sceneDataAccess, this.storyDataAccess);
    this.freedomMirrorService = new FreedomMirrorServiceImpl(this.storyDataAccess);
    this.playerService = new PlayerServiceImpl(playerDataAccess);
    
    // 其他Service不需要DataAccess（纯业务逻辑）
    this.visualService = new VisualServiceImpl();
    this.narrativeClueService = new NarrativeClueServiceImpl();
    
    console.log('[ServiceContainer] All services initialized with DataAccess layer');
    console.log(`[ServiceContainer] DataAccess mode: ${DataAccessFactory.getMode()}`);
  }
  
  /**
   * ✅ 注入 StateManager 并初始化 ClueService
   * @param stateManager 状态管理器实例
   * @note 必须在使用 ClueService 前调用
   */
  initializeClueService(stateManager: StateManager): void {
    if (this.clueService) {
      console.warn('[ServiceContainer] ClueService already initialized');
      return;
    }
    
    this.clueService = new ClueServiceImpl(
      this.clueDataAccess,
      this.storyDataAccess,
      stateManager
    );
    
    console.log('[ServiceContainer] ✅ ClueService initialized with StateManager');
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
   */
  getStoryService(): IStoryService {
    return this.storyService;
  }
  
  /**
   * 获取视觉服务
   */
  getVisualService(): IVisualService {
    return this.visualService;
  }
  
  /**
   * 获取Ticker服务
   */
  getTickerService(): ITickerService {
    return this.tickerService;
  }
  
  /**
   * 获取叙事线索服务
   */
  getNarrativeClueService(): INarrativeClueService {
    return this.narrativeClueService;
  }
  
  /**
   * 获取自由镜服务
   */
  getFreedomMirrorService(): IFreedomMirrorService {
    return this.freedomMirrorService;
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
  getPlayerService(): IPlayerService {
    return this.playerService;
  }
}
