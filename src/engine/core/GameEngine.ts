/**
 * Game Engine
 * 
 * 游戏引擎核心
 * 协调所有系统和服务，提供统一的游戏逻辑接口
 */

import type { 
  EngineConfig, 
  EngineEvent, 
  EngineEventType, 
  EventListener,
  TurnResult,
  GameState,
  StoryConfig,
  ScenePlot,
  MirrorMode,
  TrackedStoryData,
  ClueStatus,
  IClueService,
  // IPlayerService, // ⚠️ Phase 1 完成：playerService 已迁移，移除类型引用
} from '../../types';
import { ServiceContainer } from '../services/ServiceContainer';
import { DataAccessFactory } from '../data-access/DataAccessFactory';
import { StateManager } from './StateManager';
import { TurnManager } from './TurnManager';
import { NearFieldManager } from './NearFieldManager';
import { NearFieldManagerSimple } from './NearFieldManagerSimple';
import { StatSystem } from '../systems/StatSystem';
import { RapportSystem } from '../systems/RapportSystem';
import { BehaviorSystem } from '../systems/BehaviorSystem'; // 🔥 添加回来
import { TickerSystem } from '../systems/TickerSystem'; // 🔥 添加回来
import { InstanceCacheManager } from '../cache/InstanceCacheManager'; // 🔥 新增：访问新架构数据
import { TickerServiceAdapter } from '../services/business/TickerService'; // 🔥 新增：使用 business 层
import { NarrativeService } from '../services/business/NarrativeService'; // 🔥 新增：使用 business 层
import { StoryService } from '../services/business/StoryService'; // 🔥 Phase 2：使用 business 层 StoryService
import { ClueService } from '../services/business/ClueService'; // 🔥 Phase 3：使用 business 层 ClueService

/**
 * 游戏引擎类
 */
export class GameEngine {
  private config: EngineConfig;
  private serviceContainer: ServiceContainer;
  
  // 核心组件
  private stateManager: StateManager;
  private turnManager: TurnManager;
  private nearFieldManager: NearFieldManager;  // 旧版（保留向后兼容）
  private nearFieldManagerSimple: NearFieldManagerSimple;  // 新简化版
  
  // 子系统
  private statSystem: StatSystem;
  private rapportSystem: RapportSystem;
  private behaviorSystem: BehaviorSystem; // 🔥 添加回来
  private tickerSystem: TickerSystem; // 🔥 添加回来
  
  // ========== Phase 4 新增：Service 引用 ==========
  /**
   * 线索服务引用（快速访问）
   * @note 用于线索驱动的故事启动流程
   */
  private clueService: IClueService;
  
  // ⚠️ Phase 1 完成：playerService 已迁移到 InstanceCacheManager，移除此引用
  // private playerService: IPlayerService;
  
  // 事件系统
  private eventListeners: Map<EngineEventType, EventListener[]> = new Map();
  
  constructor(config?: EngineConfig) {
    this.config = {
      debug: config?.debug || false,
      autoApplyVisual: config?.autoApplyVisual !== false, // 默认true
      tickerUpdateInterval: config?.tickerUpdateInterval || 8000,
    };
    
    // ========== Phase 6.1: 使用 StateManager 单例 ==========
    this.stateManager = StateManager.getInstance();
    
    // 初始化服务容器
    this.serviceContainer = ServiceContainer.getInstance();
    
    // ✅ 在创建 StateManager 后，立即初始化 ClueService
    this.serviceContainer.initializeClueService(this.stateManager);
    
    // ========== Phase 4：初始化 Service 引用 ==========
    this.clueService = this.serviceContainer.getClueService();
    // ⚠️ Phase 1 完成：playerService 已迁移到 InstanceCacheManager，移除此引用
    // this.playerService = this.serviceContainer.getPlayerService();
    
    // 初始化子系统
    this.statSystem = new StatSystem();
    this.rapportSystem = new RapportSystem();
    this.behaviorSystem = new BehaviorSystem(); // 🔥 添加回来
    this.tickerSystem = new TickerSystem(
      new TickerServiceAdapter(),
      { updateInterval: this.config.tickerUpdateInterval }
    ); // 🔥 使用 business 层 TickerServiceAdapter
    
    // ✅ 创建StoryDataAccess实例用于TurnManager
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    
    this.turnManager = new TurnManager(
      this.stateManager,
      this.statSystem,
      this.rapportSystem,
      storyDataAccess
    );
    this.nearFieldManager = new NearFieldManager(
      this.stateManager,
      this.serviceContainer.getNearFieldService(),
      this  // ✅ 传入 GameEngine 引用，用于事件发射
    );
    
    // ========== 新增：简化版近场管理器 ==========
    this.nearFieldManagerSimple = new NearFieldManagerSimple(
      this.stateManager,
      this
    );
    
    // ========== 🆕 注册故事完成事件监听器 ==========
    this.setupStoryCompletionListeners();
    
    if (this.config.debug) {
      console.log('[GameEngine] Initialized', this.config);
    }
  }
  
  /**
   * 初始化引擎
   * 
   * Phase X 扩展：
   * - 初始化 PlayerService
   * - 将玩家状态同步到 StateManager
   * - 注册叙事线索数据（Demo）
   * 
   * ✅ Phase 1: 初始化 CacheManager
   */
  async initialize(): Promise<void> {
    this.emit('stateChange', { message: 'Engine initializing' });
    
    // ========== ✅ Phase 1: 初始化 CacheManager ==========
    try {
      const { clueRegistry } = await import('../../data/hong-kong/clues/clue-registry.data');
      
      // 将 ClueData 转换为 ClueStaticData（移除 status 字段）
      const clueStaticData = clueRegistry.map(clue => ({
        clue_id: clue.clue_id,
        title: clue.title,
        summary: clue.summary,
        story_id: clue.story_id,
        related_clues: clue.related_clues,
        related_scenes: clue.related_scenes
      }));
      
      // ❌ 删除 CacheManager 初始化
      // 静态数据直接从 DataAccessFactory 获取，不需要预加载到缓存
      
      console.log('[GameEngine] ✅ Clue data available via DataAccessFactory');
    } catch (error) {
      console.error('[GameEngine] Failed to initialize clue data access:', error);
      // 不阻塞引擎初始化，允许继续
    }
    
    // ========== Phase X：初始化独立玩家状态 ==========
    try {
      // ✅ 使用 InstanceCacheManager 管理玩家状态（不再使用 PlayerServiceImpl）
      await InstanceCacheManager.initializePlayer();
      const playerStatus = InstanceCacheManager.getPlayerStatus();
      this.stateManager.setPlayerStatus(playerStatus);
      console.log('[GameEngine] Player initialized via InstanceCacheManager');
    } catch (error) {
      console.error('[GameEngine] Failed to initialize player:', error);
      // 不阻塞引擎初始化，允许继续
    }
    
    // ========== 注册叙事线索数据（Demo） ==========
    try {
      const { demoStoryNarrativeClues } = await import('../../data/hong-kong/narrative-clues');
      NarrativeService.registerStoryClues('demo-story', demoStoryNarrativeClues);
      console.log('[GameEngine] Registered narrative clues for demo-story');
    } catch (error) {
      console.error('[GameEngine] Failed to register narrative clues:', error);
      // 不阻塞引擎初始化，允许继续
    }
    
    // ⚠️ 改为手动刷新模式，不自动启动Ticker
    // this.tickerSystem.start();
    
    // 初始化时加载20条消息
    await this.tickerSystem.refreshAll();
    
    this.emit('stateChange', { message: 'Engine initialized' });
  }
  
  /**
   * 获取所有可用故事
   */
  async getAllStories(): Promise<StoryConfig[]> {
    try {
      // ✅ Phase 2: 直接调用 StoryService 静态方法
      const stories = await StoryService.getAllStories();
      
      this.emit('storyLoaded', { storyId: 'all', config: null });
      
      return stories;
    } catch (error) {
      this.emit('error', { error, message: 'Failed to get stories' });
      throw error;
    }
  }
  
  /**
   * 开始游戏
   */
  async startGame(storyId: string): Promise<GameState> {
    try {
      // ✅ Phase 2: 直接调用 StoryService 静态方法
      const { config, scenarios } = await StoryService.getStoryData(storyId);
      
      this.emit('storyLoaded', { storyId, config });
      
      // 2. 始化状态
      this.stateManager.initStory(storyId, config, scenarios);
      this.stateManager.startGame();
      
      // 3. Demo阶段：设置初始场景ID到TurnManager
      if (config.initial_scenario_id) {
        this.turnManager.setCurrentScene(config.initial_scenario_id);
      }
      
      // 4. 初始化行为历史
      const initialScenario = this.stateManager.getCurrentScenario();
      if (initialScenario) {
        this.behaviorSystem.setHistory(initialScenario.dynamic_view.behavior_stream);
      }
      
      // 5. 应用视觉原型
      if (this.config.autoApplyVisual) {
        this.serviceContainer
          .getVisualService()
          .applyArchetype(config.visual_archetype, config.visualOverrides);
        
        this.emit('visualApplied', { 
          archetype: config.visual_archetype, 
          overrides: config.visualOverrides 
        });
      }
      
      const state = this.stateManager.getState();
      this.emit('gameStarted', { state });
      
      return state;
    } catch (error) {
      this.emit('error', { error, message: 'Failed to start game' });
      throw error;
    }
  }
  
  /**
   * 提交玩家动作
   */
  async submitAction(intentText: string): Promise<TurnResult> {
    if (!intentText.trim()) {
      throw new Error('Intent text cannot be empty');
    }
    
    try {
      const result = await this.turnManager.submitAction(intentText);
      
      if (result.success) {
        this.emit('turnComplete', { result });
      } else {
        this.emit('error', { error: result.error, message: 'Turn failed' });
      }
      
      return result;
    } catch (error) {
      this.emit('error', { error, message: 'Failed to submit action' });
      throw error;
    }
  }
  
  /**
   * 获取当前状态
   */
  getCurrentState(): GameState {
    return this.stateManager.getState();
  }
  
  /**
   * 切换故事
   */
  async switchStory(storyId: string): Promise<GameState> {
    // 重置当前状态
    this.stateManager.reset();
    this.behaviorSystem.clearHistory();
    
    // 开始新故事
    return this.startGame(storyId);
  }
  
  /**
   * 获取行为历史
   */
  getBehaviorHistory() {
    return this.behaviorSystem.getHistory();
  }
  
  /**
   * 获取Ticker系统
   */
  getTickerSystem(): TickerSystem {
    return this.tickerSystem;
  }
  
  /**
   * 获取关系系统
   */
  getRapportSystem(): RapportSystem {
    return this.rapportSystem;
  }
  
  /**
   * 获取数值系统
   */
  getStatSystem(): StatSystem {
    return this.statSystem;
  }
  
  // ==================== 剧本播放器系统（新增）====================
  
  /**
   * 加载场景剧本
   * 
   * 用于"剧情/冲突"混合模式
   * 替代传统的场景切换，改为加载剧本并开始播放
   * 
   * @param plot 场景剧本数据
   */
  loadScenePlot(plot: ScenePlot): void {
    const state = this.stateManager.getInternalState();
    
    // 设置剧本数据
    state.scenePlot = plot;
    state.currentPlotIndex = 0;
    state.displayedPlotUnits = [];
    state.currentHint = null;
    state.mirrorMode = 'plot_playing' as MirrorMode;
    
    console.log('[GameEngine] Scene plot loaded:', plot.id, 'Total units:', plot.units.length);
    
    // 触发状态更新事件
    this.emit('stateChange', { message: 'Scene plot loaded', plotId: plot.id });
    
    // 开始播放第一个单元
    this.playNextUnit();
  }
  
  /**
   * 播放下一个剧本单元（私有方法）
   * 
   * 核心播放逻辑：
   * - 如果是普通剧情(Narrative)，继续播放
   * - 如果是介入时机点(InterventionPoint)，暂停并等待玩家决策
   */
  private playNextUnit(): void {
    const state = this.stateManager.getInternalState();
    const { scenePlot, currentPlotIndex } = state;
    
    console.log('[GameEngine] playNextUnit - index:', currentPlotIndex, 'total:', scenePlot?.units.length);
    
    if (!scenePlot || currentPlotIndex >= scenePlot.units.length) {
      // 剧本播放完毕 → 切换到冲突模式
      state.mirrorMode = 'conflict' as MirrorMode;
      console.log('[GameEngine] Plot playback complete, switching to conflict mode');
      this.emit('stateChange', { message: 'Plot complete, entering conflict mode' });
      return;
    }
    
    const unit = scenePlot.units[currentPlotIndex];
    console.log('[GameEngine] Playing unit:', unit.type, '-', unit.actor);
    
    // 添加到已显示列表
    state.displayedPlotUnits.push(unit);
    
    // 先递增索引（避免重复播放同一单元）
    state.currentPlotIndex++;
    
    if (unit.type === 'InterventionPoint') {
      // 遇到介入时机点 → 暂停
      state.currentHint = unit.hint || null;
      state.mirrorMode = 'plot_paused' as MirrorMode;
      
      console.log('[GameEngine] Plot paused at intervention point:', unit.actor);
      
      this.emit('stateChange', { 
        message: 'Plot paused at intervention point',
        hint: unit.hint 
      });
    } else {
      // 普通剧情 → 继续播放
      this.emit('stateChange', { 
        message: 'Plot unit played',
        unit 
      });
      
      // 延迟播放下一个（模拟阅读节奏）
      setTimeout(() => {
        this.playNextUnit();
      }, 1500); // 增加到1.5秒，给玩家更多阅读时间
    }
  }
  
  /**
   * 处理"路过"（Pass）
   * 
   * 当玩家在介入时机点选择"路过"时调用
   * 
   * ✅ Phase X 更新：支持近场交互系统（简化版和旧版）
   * - 优先检查 NearFieldManagerSimple（新版）
   * - 其次检查 NearFieldManager（旧版）
   * - 最后使用旧的剧本系统逻辑
   */
  async handlePass(): Promise<void> {
    const state = this.stateManager.getInternalState();
    
    // ========== 优先检查：NearFieldManagerSimple（新简化版）==========
    if (this.nearFieldManagerSimple.isActive()) {
      console.log('[GameEngine] Delegating pass to NearFieldManagerSimple');
      this.nearFieldManagerSimple.handlePass();
      return;
    }
    
    // ========== 近场交互系统（旧版 NearFieldManager）==========
    if (state.nearfield_active && state.awaiting_action_type?.type === 'AWAITING_INTERVENTION') {
      console.log('[GameEngine] Delegating pass to NearFieldManager (legacy)');
      await this.nearFieldManager.handlePass();
      return;
    }
    
    // ========== 旧剧本系统 ==========
    if (state.mirrorMode !== ('plot_paused' as MirrorMode)) {
      console.warn('[GameEngine] Cannot pass - not in paused state');
      return;
    }
    
    // 清除提示，切换回播放状态
    state.currentHint = null;
    // 注意：不要再递增 currentPlotIndex，因为 playNextUnit 已经递增过了
    state.mirrorMode = 'plot_playing' as MirrorMode;
    
    if (this.config.debug) {
      console.log('[GameEngine] Player passed intervention point');
    }
    
    this.emit('stateChange', { message: 'Player passed intervention' });
    
    // 继续播放下一个单元
    this.playNextUnit();
  }
  
  /**
   * 处理"介入"（Intervention）和"交互"（Interaction）
   * 
   * 当玩家在介入时机点选择"介入"并提交意图时调用，或在交互模式中继续交互时调用
   * 
   * ✅ Phase X 更新：支持近场交互系统（简化版和旧版）
   * - 优先检查 NearFieldManagerSimple（新版）
   * - 其次检查 NearFieldManager（旧版）
   * - 最后使用旧的剧本系统逻辑（切换到冲突模式）
   * 
   * @param intentText 玩家的意图文本
   */
  async handleIntervention(intentText: string): Promise<TurnResult> {
    const state = this.stateManager.getInternalState();
    
    // ========== 优先检查NearFieldManagerSimple（新简化版）==========
    if (this.nearFieldManagerSimple.isActive()) {
      console.log('[GameEngine] Delegating intervention to NearFieldManagerSimple');
      await this.nearFieldManagerSimple.handleIntervention(intentText);
      
      // 返回空的TurnResult（近场统不使用TurnResult）
      return {
        snapshot: state.currentScenario!,
        playerAction: intentText,
        statDeltas: [],
        rapportDeltas: []
      };
    }
    
    // ========== 近场交互系统（旧版 NearFieldManager）==========
    // ✅ 处理两种状态：AWAITING_INTERVENTION（介入点）和 AWAITING_INTERACTION（交互中）
    if (state.nearfield_active && 
        (state.awaiting_action_type?.type === 'AWAITING_INTERVENTION' || 
         state.awaiting_action_type?.type === 'AWAITING_INTERACTION')) {
      console.log(`[GameEngine] Delegating ${state.awaiting_action_type?.type} to NearFieldManager (legacy)`);
      await this.nearFieldManager.handleInteract(intentText);
      
      // 返回空的TurnResult（近场系统不使用TurnResult）
      return {
        snapshot: state.currentScenario!,
        playerAction: intentText,
        statDeltas: [],
        rapportDeltas: []
      };
    }
    
    // ========== 旧剧本系统 ==========
    if (state.mirrorMode !== ('plot_paused' as MirrorMode)) {
      throw new Error('Cannot intervene - not in paused state');
    }
    
    // 切换到冲突模式
    state.mirrorMode = 'conflict' as MirrorMode;
    state.currentHint = null;
    
    if (this.config.debug) {
      console.log('[GameEngine] Player intervened, entering conflict mode');
    }
    
    this.emit('stateChange', { 
      message: 'Entering conflict mode',
      intent: intentText 
    });
    
    // ✅ 直接添加玩家行为，不触发 advanceTurn
    this.behaviorSystem.addPlayerBehavior(intentText);
    
    // ✅ Mock: 模拟 LLM 生成的 NPC 反应
    // 根据剧本上下文生成相关的反应
    const mockReactions: import('../../types').BehaviorItem[] = [
      {
        actor: "NPC-肥棠",
        name: "肥",
        behavior_type: "Speak",
        target: "player",
        narrative_snippet: "肥棠转过头，恶狠狠地盯着你：\"你TM谁啊？想当英雄是吧？\""
      },
      {
        actor: "NPC-小雪",
        name: "小雪", 
        behavior_type: "Observe",
        target: "player",
        narrative_snippet: "小雪松了一口气，悄悄往你身后躲了躲，眼神中闪过一丝希望。"
      },
      {
        actor: "System",
        name: "System",
        behavior_type: "Observe",
        narrative_snippet: "其他酒客纷纷抬起头，窃窃私语。有人掏出手机，似乎在录像。"
      }
    ];
    
    // 添加 NPC 反应到行为历史
    this.behaviorSystem.addNpcBehaviors(mockReactions);
    
    if (this.config.debug) {
      console.log('[GameEngine] Mock NPC reactions added:', mockReactions.length);
    }
    
    this.emit('stateChange', { 
      message: 'NPC reactions generated',
      reactions: mockReactions 
    });
    
    // 返回结果（不推进turn，保持在当前场景）
    return {
      success: true,
      scenario: this.stateManager.getCurrentScenario(),
      turnIndex: this.stateManager.getCurrentTurnIndex(),
      statDeltas: [],
      rapportDeltas: [],
      isEnding: false
    };
  }
  
  /**
   * 监听事件
   */
  on<T = any>(eventType: EngineEventType, listener: EventListener<T>): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener as EventListener);
  }
  
  /**
   * 取消监听事件
   */
  off<T = any>(eventType: EngineEventType, listener: EventListener<T>): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener as EventListener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * 触发事件
   */
  private emit<T = any>(eventType: EngineEventType, data: T): void {
    const event: EngineEvent<T> = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };
    
    if (this.config.debug) {
      console.log(`[GameEngine] Event: ${eventType}`, data);
    }
    
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[GameEngine] Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }
  
  // ==================== 近场交互系统（新增）====================
  
  /**
   * 进入近场交互模式（简化版）
   * 
   * @param sceneId 场景ID
   */
  async enterNearField(sceneId: string): Promise<void> {
    const state = this.stateManager.getInternalState();
    
    if (!state.currentStoryId) {
      throw new Error('No story loaded');
    }
    
    try {
      console.log(`[GameEngine] Entering nearfield (simplified): ${sceneId}`);
      
      // 使用新的简化版管理器
      await this.nearFieldManagerSimple.enterScene(state.currentStoryId, sceneId);
      
      console.log(`[GameEngine] Nearfield entered successfully`);
    } catch (error) {
      this.emit('nearfield_error', { error, message: 'Failed to enter nearfield' });
      throw error;
    }
  }
  
  /**
   * 退出近场交互模式
   */
  exitNearField(): void {
    this.nearFieldManager.exitNearFieldMode();
    
    this.emit('stateChange', { message: 'Exited nearfield mode' });
    
    console.log('[GameEngine] Exited nearfield');
  }
  
  /**
   * 近场交互 - 玩家介入或交互（简化版）
   * 
   * @param intentText 玩家意图文本
   */
  async nearFieldInteract(intentText: string): Promise<void> {
    if (!this.nearFieldManagerSimple.isActive()) {
      throw new Error('Nearfield mode not active');
    }
    
    try {
      await this.nearFieldManagerSimple.handleIntervention(intentText);
      
      console.log('[GameEngine] Nearfield interact complete');
    } catch (error) {
      this.emit('nearfield_error', { error, message: 'Failed to interact' });
      throw error;
    }
  }
  
  /**
   * ✅ 别名方法：兼容 UI 调用
   */
  async handleIntervention(intentText: string): Promise<void> {
    return this.nearFieldInteract(intentText);
  }
  
  /**
   * 近场交互 - 玩家选择路过（简化版）
   */
  async nearFieldPass(): Promise<void> {
    if (!this.nearFieldManagerSimple.isActive()) {
      throw new Error('Nearfield mode not active');
    }
    
    try {
      this.nearFieldManagerSimple.handlePass();
      
      console.log('[GameEngine] Nearfield pass complete');
    } catch (error) {
      this.emit('nearfield_error', { error, message: 'Failed to pass' });
      throw error;
    }
  }
  
  /**
   * ✅ 别名方法：兼容 UI 调用
   */
  async handlePass(): Promise<void> {
    return this.nearFieldPass();
  }
  
  /**
   * 获取近场交互管理器
   */
  getNearFieldManager(): NearFieldManager {
    return this.nearFieldManager;
  }
  
  // ==================== 线索系统（新增）====================
  
  /**
   * 获取线索收件箱
   * @returns 所有已提取的线索
   */
  async getClueInbox() {
    return await this.clueService.getClueInbox();
  }
  
  /**
   * 提取线索
   * @param messageId 消息ID
   * @param clueId 线索ID
   */
  async extractClue(messageId: string, clueId: string) {
    // 1. 调用 Service 提取线索
    const clue = await this.clueService.extractClue(messageId, clueId);
    
    // 2. 发射事件（通知 useGameEngine 更新 extractedClues）
    this.emit('clueInboxUpdated', { 
      clue,
      clueId: clue.clue_id 
    });
    
    if (this.config.debug) {
      console.log('[GameEngine] Clue extracted:', clue.title);
    }
    
    return clue;
  }
  
  /**
   * 追踪线索（开启故事）
   * 
   * Phase 4 升级：
   * - 调用 ClueService.trackClue()
   * - 获取追踪的故事数据
   * - 同步到 StateManager（更新 trackedStories）
   * - 发射 storyTracked 事件
   * 
   * @param clueId 线索ID
   * @returns 追踪的故事数据
   */
  async trackClue(clueId: string): Promise<TrackedStoryData> {
    try {
      // 1. 调用 Service 追踪线索
      const trackedStory = await this.clueService.trackClue(clueId);
      
      // 2. 同步到 StateManager
      const allTrackedStories = await this.clueService.getTrackedStories();
      
      // 转换为 Map
      const trackedStoriesMap = new Map<string, TrackedStoryData>();
      allTrackedStories.forEach(story => {
        trackedStoriesMap.set(story.entry_clue_id, story);
      });
      
      // 更新 StateManager
      this.stateManager.updateTrackedStories(trackedStoriesMap);
      
      // 3. 🔥 触发 clueInboxUpdated 事件（线索状态从unread/read变为tracking）
      console.log('[GameEngine.trackClue] 🔥 Emitting clueInboxUpdated event for clue:', clueId);
      this.emit('clueInboxUpdated', { 
        clue: null,
        clueId 
      });
      
      // 4. 触发 storyTracked 事件（更新trackedStories池）
      console.log('[GameEngine.trackClue] 🔥 About to emit storyTracked event for clue:', clueId);
      this.emit('storyTracked', { 
        trackedStory,
        clueId 
      });
      console.log('[GameEngine.trackClue] ✅ Both events emitted');
      
      if (this.config.debug) {
        console.log('[GameEngine] Story tracked:', trackedStory.title);
        console.log('[GameEngine] Session state:', this.stateManager.getSessionState());
      }
      
      return trackedStory;
    } catch (error) {
      this.emit('error', { error, message: 'Failed to track clue' });
      throw error;
    }
  }
  
  /**
   * 进入故事（从追踪的线索启动游戏）
   * 
   * Phase 4 新增：线索驱动的故事启动流程
   * 
   * 流程：
   * 1. 验证线索是否已追踪
   * 2. 调用 ClueService.setActiveStory()
   * 3. 调用 StateManager.enterStory()
   * 4. 加载故事数据（调用 startGame）
   * 5. 发射 storyEntered 事件
   * 
   * ✅ Phase 5 更新：从 InstanceCacheManager 获取新架构数据
   * 
   * @param clueId 线索ID
   * @returns 游戏状态
   */
  async enterStory(clueId: string): Promise<GameState> {
    try {
      // ========== 🔥 Step 1: 从新架构获取追踪数据 ==========
      const clueRecord = InstanceCacheManager.getClueRecord(clueId);
      
      if (!clueRecord) {
        throw new Error(`Clue ${clueId} not found`);
      }
      
      if (!clueRecord.story_instance_id) {
        throw new Error(`Story for clue ${clueId} is not tracked. Please track the clue first.`);
      }
      
      const storyInstance = InstanceCacheManager.getStoryInstance(clueRecord.story_instance_id);
      
      if (!storyInstance) {
        throw new Error(`Story instance ${clueRecord.story_instance_id} not found`);
      }
      
      if (this.config.debug) {
        console.log('[GameEngine] 📊 Entering story from InstanceCacheManager:', {
          clueId,
          storyInstanceId: storyInstance.instance_id,
          storyTitle: storyInstance.story_data.title,
          status: storyInstance.status
        });
      }
      
      // 🔥 Phase 6.1 修复：如果故事还未启动，先启动它
      if (storyInstance.status === 'not_started') {
        console.log('[GameEngine] 🎬 Story not started yet, calling StoryService.startStory()...');
        StoryService.startStory(clueRecord.story_instance_id);
        // 重新获取更新后的实例
        const updatedInstance = InstanceCacheManager.getStoryInstance(clueRecord.story_instance_id);
        if (updatedInstance) {
          // 使用更新后的实例继续
          console.log('[GameEngine] ✅ Story started, status:', updatedInstance.status);
        }
      }
      
      // ========== 🔥 Step 2: 转换为 TrackedStoryData 格式（兼容旧接口）==========
      // ✅ 修复：需要将 StoryInstance.scene_sequence (string[]) 转换为 SceneSequenceItem[]
      const sceneSequence: import('../../types').SceneSequenceItem[] = storyInstance.scene_sequence.map((sceneId, index) => ({
        scene_id: sceneId,
        title: `场景${index + 1}`,  // 临时标题，后续可以从 SceneTemplate 加载
        status: (index === 0 || storyInstance.completed_scenes.includes(sceneId)) ? 'unlocked' : 'locked'
      }));
      
      const trackedStory: TrackedStoryData = {
        entry_clue_id: clueId,
        story_id: storyInstance.story_data.story_id,
        title: storyInstance.story_data.title,
        description: storyInstance.story_data.description || '',
        status: storyInstance.status as 'tracking' | 'completed',
        is_active: false, // 将在下面设置
        tracked_at: clueRecord.tracked_at || Date.now(),
        progress: {
          current_scene_index: storyInstance.current_scene_index,
          completed_scenes: storyInstance.completed_scenes
        },
        scene_sequence: sceneSequence,  // ✅ 使用转换后的对象数组
        unlocked_clue_ids: []
      };
      
      // ========== 🔥 Step 2.5: 先同步到 StateManager（必须在 setActiveStory 之前）==========
      // 原因：setActiveStory 内部会查询 StateManager，必须先把数据写入
      
      // 🔍 验证日志：进入故事前的状态
      const existingStories = this.stateManager.getTrackedStories();
      console.log('[GameEngine.enterStory] 🔍 BEFORE updateTrackedStories:');
      console.log(`  - Existing tracked stories: ${existingStories.length}`);
      console.log(`  - Story IDs: [${existingStories.map(s => s.entry_clue_id).join(', ')}]`);
      console.log(`  - About to enter story for clue: ${clueId}`);
      
      // ✅ 修复：合并现有故事 + 当前故事，而不是覆盖
      const trackedStoriesMap = new Map<string, TrackedStoryData>();
      
      // 1. 先添加所有现有的追踪故事
      existingStories.forEach(story => {
        trackedStoriesMap.set(story.entry_clue_id, story);
      });
      
      // 2. 再添加/更新当前故事（如果已存在则覆盖）
      trackedStoriesMap.set(clueId, trackedStory);
      
      console.log('[GameEngine.enterStory] 🔥 MERGED MAP:');
      console.log(`  - Map size: ${trackedStoriesMap.size}`);
      console.log(`  - Map keys: [${Array.from(trackedStoriesMap.keys()).join(', ')}]`);
      console.log(`  - ✅ Merged ${existingStories.length} existing + 1 current story`);
      
      this.stateManager.updateTrackedStories(trackedStoriesMap);
      
      // 🔍 验证日志：更新后的状态
      const afterStories = this.stateManager.getTrackedStories();
      console.log('[GameEngine.enterStory] 🔍 AFTER updateTrackedStories:');
      console.log(`  - Tracked stories now: ${afterStories.length}`);
      console.log(`  - Story IDs now: [${afterStories.map(s => s.entry_clue_id).join(', ')}]`);
      
      // 2. 设置为活跃故事（Service 层）
      await this.clueService.setActiveStory(clueId);
      
      // 3. 设置为活跃故事（State 层）
      const success = this.stateManager.enterStory(trackedStory);
      
      if (!success) {
        throw new Error('Failed to enter story in StateManager');
      }
      
      // 4. 启动游戏（加载故事数据）
      const state = await this.startGame(trackedStory.story_id);
      
      // ========== Phase X：进入故事时同步玩家状态 ==========
      this.syncPlayerFromScenario();
      
      // ========== ✅ 自动进入第一个场景的近场交互 ==========
      const initialSceneId = state.currentStory?.initial_scenario_id;
      if (initialSceneId) {
        if (this.config.debug) {
          console.log(`[GameEngine] Auto-entering initial scene: ${initialSceneId}`);
        }
        
        // 进入近场交互并加载场景
        await this.enterNearField(initialSceneId);
      } else {
        console.warn('[GameEngine] No initial scene ID found in story config');
      }
      
      // 5. 发射事件
      this.emit('storyEntered', { 
        trackedStory,
        clueId,
        state 
      });
      
      if (this.config.debug) {
        console.log('[GameEngine] Entered story:', trackedStory.title);
        console.log('[GameEngine] Session state:', this.stateManager.getSessionState());
        console.log('[GameEngine] Story entered and initial scene loaded');
      }
      
      return this.stateManager.getState();  // ✅ 返回最新状态（包含近场数据）
    } catch (error) {
      this.emit('error', { error, message: 'Failed to enter story' });
      throw error;
    }
  }
  
  /**
   * 退出故事（返回空闲状态）
   * 
   * Phase 4 新增：退出故事流程
   * 
   * 流程：
   * 1. 调用 ClueService.clearActiveStory()
   * 2. 调用 StateManager.exitStory()
   * 3. 重置行为历史
   * 4. 发射 storyExited 事件
   * 
   * @returns 是否成功退出
   */
  async exitStory(): Promise<boolean> {
    try {
      // 1. 清除活跃故事（Service 层）
      await this.clueService.clearActiveStory();
      
      // 2. 退出故事（State 层）
      const success = this.stateManager.exitStory();
      
      if (!success) {
        throw new Error('Failed to exit story in StateManager');
      }
      
      // 3. 清除行为历史
      this.behaviorSystem.clearHistory();
      
      // 4. 发射事
      this.emit('storyExited', { 
        sessionState: this.stateManager.getSessionState() 
      });
      
      if (this.config.debug) {
        console.log('[GameEngine] Exited story');
        console.log('[GameEngine] Session state:', this.stateManager.getSessionState());
      }
      
      return true;
    } catch (error) {
      this.emit('error', { error, message: 'Failed to exit story' });
      throw error;
    }
  }
  
  /**
   * 更新线索状态
   * @param clueId 线索ID
   * @param status 新状态
   */
  async updateClueStatus(clueId: string, status: ClueStatus) {
    return await this.clueService.updateClueStatus(clueId, status);
  }
  
  // ==================== Phase 4 新增：辅助方法 ====================
  
  /**
   * 获取所有追踪的故事
   * @returns 追踪的故事列表
   */
  async getTrackedStories(): Promise<TrackedStoryData[]> {
    console.log('[GameEngine] 🔍 getTrackedStories() called');
    const stories = await this.clueService.getTrackedStories();
    console.log(`[GameEngine] 🔍 getTrackedStories() returning ${stories.length} stories`);
    
    stories.forEach((story, idx) => {
      console.log(`  [${idx}] ${story.title} (${story.status}) - current_scene_index: ${story.progress?.current_scene_index}, completed: [${story.progress?.completed_scenes?.join(', ')}]`);
    });
    
    return stories;
  }
  
  /**
   * 获取当前活跃的故事
   * @returns 活跃的故事数据，如果没有则返回 null
   */
  async getActiveStory(): Promise<TrackedStoryData | null> {
    return await this.clueService.getActiveStory();
  }
  
  /**
   * 获取当前会话状态
   * @returns 会话状态（IDLE/READY/PLAYING）
   */
  getSessionState() {
    return this.stateManager.getSessionState();
  }
  
  // ==================== Phase X 新增：玩家状态管理 ====================
  
  /**
   * 获取玩家状态（只读）
   * 
   * @returns 玩家状态的副本，如果未初始化则返回 null
   * @note 这是对外暴露的主要接口
   */
  getPlayerStatus() {
    return this.stateManager.getPlayerStatus();
  }
  
  /**
   * 获取行为历史（交互记录）
   * 
   * ✅ 新增：用于 UI 显示交互模式的对话历史
   * 
   * @returns 行为历史数组
   */
  getBehaviorHistory() {
    return this.behaviorSystem.getHistory();
  }
  
  /**
   * 清空行为历史
   * 
   * ✅ 新增：场景切换时清空交互记录
   */
  clearBehaviorHistory() {
    this.behaviorSystem.clearHistory();
  }
  
  /**
   * 更新玩家体力
   * 
   * @param delta 变化量（可为负数）
   */
  updatePlayerVigor(delta: number): void {
    InstanceCacheManager.updateVigor(delta);
    // 同步到 StateManager
    const updatedStatus = InstanceCacheManager.getPlayerStatus();
    this.stateManager.updatePlayerStatus(updatedStatus);
    
    // 发射事件
    this.emit('playerStatusChanged', { 
      type: 'vigor', 
      delta,
      current: updatedStatus.vigor.value 
    });
  }
  
  /**
   * 更新玩家心力
   * 
   * @param delta 变化量（可为负数）
   */
  updatePlayerClarity(delta: number): void {
    InstanceCacheManager.updateClarity(delta);
    // 同步到 StateManager
    const updatedStatus = InstanceCacheManager.getPlayerStatus();
    this.stateManager.updatePlayerStatus(updatedStatus);
    
    // 发射事件
    this.emit('playerStatusChanged', { 
      type: 'clarity', 
      delta,
      current: updatedStatus.clarity.value 
    });
  }
  
  /**
   * 更新玩家位置
   * 
   * @param location 新位置
   */
  updatePlayerLocation(location: string): void {
    InstanceCacheManager.updatePlayerLocation(location);
    // 同步到 StateManager
    const updatedStatus = InstanceCacheManager.getPlayerStatus();
    this.stateManager.updatePlayerStatus(updatedStatus);
    
    // 发射事件
    this.emit('playerStatusChanged', { 
      type: 'location', 
      location 
    });
  }
  
  /**
   * 更新游戏时间
   * 
   * @param time 新时间
   */
  updatePlayerTime(time: string): void {
    InstanceCacheManager.updateWorldTime(time);
    // 同步到 StateManager
    const updatedStatus = InstanceCacheManager.getPlayerStatus();
    this.stateManager.updatePlayerStatus(updatedStatus);
    
    // 发射事件
    this.emit('playerStatusChanged', { 
      type: 'time', 
      time 
    });
  }
  
  /**
   * 从场景同步玩家状态
   * 
   * @note 进入故事时调用，将场景中的 player_status_area 同步到独立的 playerStatus
   */
  syncPlayerFromScenario(): void {
    const scenario = this.stateManager.getCurrentScenario();
    
    if (!scenario) {
      console.warn('[GameEngine] No scenario to sync from');
      return;
    }
    
    InstanceCacheManager.syncPlayerFromScenario(scenario);
    const updatedStatus = InstanceCacheManager.getPlayerStatus();
    this.stateManager.updatePlayerStatus(updatedStatus);
    
    console.log('[GameEngine] Player status synced from scenario via InstanceCacheManager');
  }
  
  /**
   * 销毁引擎
   */
  // ==================== 🆕 故事完成状态管理 ====================
  
  /**
   * 🆕 设置故事完成事件监听器
   */
  private setupStoryCompletionListeners(): void {
    // 监听场景流转事件
    this.on('scene_transition', this.handleSceneTransition.bind(this));
    
    // 监听故事结束事件
    this.on('story_ended', this.handleStoryEnded.bind(this));
    
    console.log('[GameEngine] Story completion listeners registered');
  }
  
  /**
   * 🆕 处理场景流转
   * @note ✅ 重构：通过 ClueService 更新状态，不再直接修改 StateManager
   * @note ✅ 修复：接收 EngineEvent<T> 格式的事件对象
   */
  private async handleSceneTransition(event: EngineEvent<{
    fromSceneId: string;
    toSceneId: string;
    completionClueId?: string;
    storyId?: string;
  }>): Promise<void> {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   SCENE TRANSITION HANDLER START      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('[GameEngine] 🎬 Scene transition event:', {
      fromSceneId: event.data.fromSceneId,
      toSceneId: event.data.toSceneId,
      completionClueId: event.data.completionClueId,
      storyId: event.data.storyId
    });
    
    // 1. 查找当前追踪的故事对应的线索ID
    const clueId = this.findClueIdByCurrentStory();
    console.log('[GameEngine] 📝 Found clue ID for current story:', clueId);
    
    if (!clueId) {
      console.warn('[GameEngine] ⚠️ No tracked clue found for current story - ABORT');
      return;
    }
    
    // 🔍 打印更新前的状态
    const beforeStory = this.stateManager.getTrackedStory(clueId);
    console.log('[GameEngine] 📊 BEFORE UPDATE - Story state:', {
      clueId,
      currentSceneIndex: beforeStory?.progress?.current_scene_index,
      completedScenes: beforeStory?.progress?.completed_scenes,
      sceneSequence: beforeStory?.scene_sequence.map((s, i) => ({
        index: i,
        id: s.scene_id,
        title: s.title,
        status: s.status
      }))
    });
    
    // 2. ✅ 通过 ClueService 标记场景完成（统一数据源）
    console.log(`[GameEngine] 🔄 Step 1: Marking scene ${event.data.fromSceneId} as completed via ClueService...`);
    await this.clueService.markSceneCompleted(clueId, event.data.fromSceneId);
    
    const afterMarkComplete = this.stateManager.getTrackedStory(clueId);
    console.log('[GameEngine] AFTER markSceneCompleted:', {
      completedScenes: afterMarkComplete?.progress?.completed_scenes,
      sceneSequence: afterMarkComplete?.scene_sequence.map((s, i) => ({
        index: i,
        id: s.scene_id,
        status: s.status
      }))
    });
    
    // 2.5. ✅ 更新 StoryInstance 的 current_scene_id（进入下一个场景）
    const clueRecord = InstanceCacheManager.getClueRecord(clueId);
    if (clueRecord?.story_instance_id && event.data.toSceneId) {
      console.log(`[GameEngine] 🔄 Step 1.5: Entering next scene in StoryInstance: ${event.data.toSceneId}`);
      StoryService.enterScene(clueRecord.story_instance_id, event.data.toSceneId);
      console.log(`[GameEngine] ✅ StoryInstance.current_scene_id updated to next scene`);
    }
    
    // 3. 更新当前场景索引（直接通过 StateManager）
    const trackedData = this.stateManager.getTrackedStory(clueId);
    if (trackedData?.progress) {
      // ✅ 修复：scene_sequence 是 SceneSequenceItem[] 对象数组
      const nextSceneIndex = trackedData.scene_sequence?.findIndex(scene => scene.scene_id === event.data.toSceneId);
      console.log(`[GameEngine] 🔄 Step 2: Updating current_scene_index to ${nextSceneIndex} (toScene: ${event.data.toSceneId})...`);
      
      if (nextSceneIndex !== undefined && nextSceneIndex >= 0) {
        this.stateManager.updateTrackedStory(clueId, {
          progress: {
            ...trackedData.progress,
            current_scene_index: nextSceneIndex
          }
        });
        
        const afterIndexUpdate = this.stateManager.getTrackedStory(clueId);
        console.log('[GameEngine] 📊 AFTER updateTrackedStory (index):', {
          currentSceneIndex: afterIndexUpdate?.progress?.current_scene_index
        });
        
        // ✅ 现在 InstanceCacheManager 已在 StoryService.enterScene() 中同步更新
        // 无需在这里重复更新（符合分层架构）
      }
    }
    
    // 4. 如果有完成线索ID，记录到 unlocked_clue_ids（不提取到收件箱）
    // @note ✅ 修复：completionClueId 不再自动提取到收件箱
    // @note completionClueId 仅作为场景完成的追踪记录，不是需要解锁的线索
    if (event.data.completionClueId) {
      console.log(`[GameEngine] 📝 Recording completion clue: ${event.data.completionClueId} (tracking only, not extracted)`);
      
      // 仅记录到 unlocked_clue_ids，不提取到收件箱
      const currentData = this.stateManager.getTrackedStory(clueId);
      if (currentData) {
        const unlockedIds = currentData.unlocked_clue_ids || [];
        if (!unlockedIds.includes(event.data.completionClueId)) {
          this.stateManager.updateTrackedStory(clueId, {
            unlocked_clue_ids: [...unlockedIds, event.data.completionClueId]
          });
          console.log(`[GameEngine] ✅ Completion clue recorded in unlocked_clue_ids`);
        }
      }
    }
    
    // 5. 触发更新事件
    const state = this.stateManager.getInternalState();
    
    // 🔍 调试：打印更新后的数据
    const updatedStory = this.stateManager.getTrackedStory(clueId);
    console.log('[GameEngine] 📊 FINAL STATE - Before emitting event:', {
      fromScene: event.data.fromSceneId,
      toScene: event.data.toSceneId,
      currentSceneIndex: updatedStory?.progress?.current_scene_index,
      completedScenes: updatedStory?.progress?.completed_scenes,
      totalScenes: updatedStory?.scene_sequence.length,
      sceneSequence: updatedStory?.scene_sequence.map((s, i) => ({
        index: i,
        id: s.scene_id,
        status: s.status,
        isCurrent: i === updatedStory?.progress?.current_scene_index
      }))
    });
    
    console.log('[GameEngine] 🔍 Emitting trackedStoriesUpdated event...');
    console.log('[GameEngine]   - trackedStories Map size:', state.trackedStories.size);
    console.log('[GameEngine]   - trackedStories Map keys:', Array.from(state.trackedStories.keys()));
    
    this.emit('trackedStoriesUpdated', {
      trackedStories: state.trackedStories
    });
    
    console.log('╔════════════════════════════════════════╗');
    console.log('║   SCENE TRANSITION HANDLER END        ║');
    console.log('║   ✅ Event emitted                    ║');
    console.log('╚════════════════════════════════════════╝\n');
  }
  
  /**
   * 🆕 处理故事结束
   * @note ✅ 重构：通过 ClueService 更新状态，不再直接修改 StateManager
   * @note ✅ 修复：接收 EngineEvent<T> 格式的事件对象
   */
  private async handleStoryEnded(event: EngineEvent<{
    storyId: string;
    completionClueId?: string;
  }>): Promise<void> {
    console.log('[GameEngine] 🏁 Story ended:', event.data);
    
    // 1. 查找线索ID
    const clueId = this.findClueIdByCurrentStory();
    if (!clueId) {
      console.warn('[GameEngine] No tracked clue found for current story');
      return;
    }
    
    // 2. ✅ 通过 ClueService 标记故事完成（统一数据源）
    await this.clueService.markStoryCompleted(clueId, event.data.completionClueId);
    
    // 3. 🔥 触发 clueInboxUpdated 事件，让 useGameEngine 重新加载 extractedClues
    //    这样 Badge 的 completedCount 才能正确更新
    this.emit('clueInboxUpdated', {
      clue: null, // 不需要完整 clue 对象，useGameEngine 会重新加载所有线索
      clueId
    });
    console.log('[GameEngine] 🔥 Emitted clueInboxUpdated event to update Badge status');
    
    // 4. 触发 trackedStories 更新事件
    const state = this.stateManager.getInternalState();
    this.emit('trackedStoriesUpdated', {
      trackedStories: state.trackedStories
    });
    
    // 5. 获取更新后的故事数据用于显示提示
    const trackedData = this.stateManager.getTrackedStory(clueId);
    if (trackedData) {
      // 显示完成提示
      this.emit('story_completion_notification', {
        storyTitle: trackedData.title,
        completionClueId: event.data.completionClueId
      });
    }
    
    console.log(`[GameEngine] ✅ Story completion update complete`);
  }
  
  /**
   * 🆕 辅助方法：通过当前故事查找线索ID
   */
  private findClueIdByCurrentStory(): string | null {
    const state = this.stateManager.getInternalState();
    const currentStoryId = state.currentStoryId;
    
    if (!currentStoryId) {
      return null;
    }
    
    // 遍历 trackedStories，找到匹配的 story_id 且 is_active 为 true
    for (const [clueId, trackedData] of state.trackedStories.entries()) {
      if (trackedData.story_id === currentStoryId && trackedData.is_active) {
        return clueId;
      }
    }
    
    return null;
  }
  
  // ==================== 销毁引擎 ====================
  
  destroy(): void {
    // 停止Ticker系统
    this.tickerSystem.stop();
    
    // 清除所有监听器
    this.eventListeners.clear();
    
    // 退出近场交互（如果激活）
    if (this.nearFieldManager.isActive()) {
      this.nearFieldManager.exitNearFieldMode();
    }
    
    // 重置状态
    this.stateManager.reset();
    this.behaviorSystem.clearHistory();
    
    if (this.config.debug) {
      console.log('[GameEngine] Destroyed');
    }
  }
}