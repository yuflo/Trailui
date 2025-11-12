/**
 * Near-Field Interaction Manager
 * 近场交互管理器
 * 
 * 职责：
 * - 管理近场交互的生命周期
 * - 维护scene_history_context
 * - 调用NearFieldService的advance()接口
 * - 处理事件流转和状态切换
 * 
 * 设计理念：
 * - Manager层有状态（维护scene_history_context）
 * - 调用Service层获取响应
 * - 更新GameState并触发事件
 */

import type {
  AdvanceRequest,
  AdvanceResponse,
  NearFieldEvent,
  NextActionType,
  INearFieldService,
} from '../../types';
import type { StateManager } from './StateManager';
import type { GameEngine } from './GameEngine';

/**
 * 近场交互管理器类
 */
export class NearFieldManager {
  private stateManager: StateManager;
  private nearFieldService: INearFieldService;
  private gameEngine: GameEngine;

  constructor(
    stateManager: StateManager, 
    nearFieldService: INearFieldService,
    gameEngine: GameEngine
  ) {
    this.stateManager = stateManager;
    this.nearFieldService = nearFieldService;
    this.gameEngine = gameEngine;
    
    console.log('[NearFieldManager] Initialized');
  }

  /**
   * 进入近场交互模式
   * 
   * 初始化近场交互状态
   * 
   * ✅ Phase X: 新增加载 narrative_sequence
   * - 从数据层读取场景的 narrative_sequence
   * - 缓存到 current_narrative_sequence 状态
   * - 初始化 current_narrative_index 为 0
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   */
  async enterNearFieldMode(storyId: string, sceneId: string): Promise<void> {
    const state = this.stateManager.getInternalState();

    // 初始化近场交互状态
    state.nearfield_active = true;
    state.current_scene_id = sceneId;
    state.scene_history_context = [];
    state.awaiting_action_type = null;
    
    // ========== Phase X 新增：加载并缓存叙事序列 ==========
    // 暂时先不实现，等 handleLoadScene 调用 Service 时由 Service 返回
    // 这样可以保持 Manager 层无数据访问逻辑
    state.current_narrative_sequence = null;
    state.current_narrative_index = 0;

    console.log(`[NearFieldManager] Entered nearfield mode: ${sceneId}`);
  }

  /**
   * 退出近场交互模式
   * 
   * 清理近场交互状态
   * 
   * ✅ Phase X: 清理叙事序列状态
   */
  exitNearFieldMode(): void {
    const state = this.stateManager.getInternalState();

    // 清理状态
    state.nearfield_active = false;
    state.current_scene_id = null;
    state.scene_history_context = [];
    state.awaiting_action_type = null;
    
    // ========== Phase X 新增：清理叙事序列状态 ==========
    state.current_narrative_sequence = null;
    state.current_narrative_index = 0;

    console.log('[NearFieldManager] Exited nearfield mode');
  }

  /**
   * 获取当前场景历史
   */
  getSceneHistory(): NearFieldEvent[] {
    const state = this.stateManager.getInternalState();
    return state.scene_history_context || [];
  }

  /**
   * 获取等待的行动类型
   */
  getAwaitingActionType(): NextActionType | null {
    const state = this.stateManager.getInternalState();
    return state.awaiting_action_type || null;
  }

  /**
   * 处理 LOAD_SCENE 行动
   * 
   * 加载场景的叙事序列（gen #3）
   * 
   * ✅ Phase X: 加载完整的 narrative_sequence 到状态
   * 
   * @returns advance响应
   */
  async handleLoadScene(): Promise<AdvanceResponse> {
    const state = this.stateManager.getInternalState();

    if (!state.nearfield_active || !state.current_scene_id || !state.currentStoryId) {
      throw new Error('Nearfield mode not active');
    }

    console.log(`[NearFieldManager] handleLoadScene: ${state.current_scene_id}`);

    // 构建请求（✅ Phase X: 传递 narrative_index）
    const request: AdvanceRequest = {
      story_id: state.currentStoryId,
      current_scene_id: state.current_scene_id,
      scene_history_context: state.scene_history_context,
      player_action: {
        type: "LOAD_SCENE",
        intent_text: null,
        narrative_index: 0  // ← 从索引0开始
      }
    };

    // 调用Service
    const response = await this.nearFieldService.advance(request);

    // ========== Phase X 新增：加载完整的 narrative_sequence ==========
    // LOAD_SCENE 后，我们需要从数据层读取完整的叙事序列并缓存到状态
    await this.loadNarrativeSequence(state.currentStoryId, state.current_scene_id);

    // 更新状态
    this.applyResponse(response);

    return response;
  }

  /**
   * 处理 INTERACT 行动
   * 
   * 玩家介入或交互（gen #4a/4b）
   * 
   * @param intentText 玩家意图文本
   * @returns advance响应
   */
  async handleInteract(intentText: string): Promise<AdvanceResponse> {
    const state = this.stateManager.getInternalState();

    if (!state.nearfield_active || !state.current_scene_id || !state.currentStoryId) {
      throw new Error('Nearfield mode not active');
    }

    if (!intentText || !intentText.trim()) {
      throw new Error('Intent text cannot be empty');
    }

    console.log(`[NearFieldManager] handleInteract: "${intentText}" (narrative_index: ${state.current_narrative_index})`);

    // 构建请求（✅ Phase X: 传递 narrative_index）
    const request: AdvanceRequest = {
      story_id: state.currentStoryId,
      current_scene_id: state.current_scene_id,
      scene_history_context: state.scene_history_context,
      player_action: {
        type: "INTERACT",
        intent_text: intentText,
        narrative_index: state.current_narrative_index  // ← 记录介入时的位置
      }
    };

    // 调用Service
    const response = await this.nearFieldService.advance(request);

    // 更新状态
    this.applyResponse(response);

    return response;
  }

  /**
   * 处理 PASS 行动
   * 
   * 玩家选择路过（剪枝）
   * 
   * @returns advance响应
   */
  async handlePass(): Promise<AdvanceResponse> {
    const state = this.stateManager.getInternalState();

    if (!state.nearfield_active || !state.current_scene_id || !state.currentStoryId) {
      throw new Error('Nearfield mode not active');
    }

    console.log(`[NearFieldManager] handlePass (narrative_index: ${state.current_narrative_index})`);

    // 构建请求（✅ Phase X: 传递 current_narrative_index）
    const request: AdvanceRequest = {
      story_id: state.currentStoryId,
      current_scene_id: state.current_scene_id,
      scene_history_context: state.scene_history_context,
      player_action: {
        type: "PASS",
        intent_text: null,
        narrative_index: state.current_narrative_index  // ← 当前介入点位置
      }
    };

    // 调用Service
    const response = await this.nearFieldService.advance(request);

    // 更新状态
    this.applyResponse(response);

    return response;
  }

  /**
   * 处理 REQUEST_NARRATIVE 行动
   * 
   * 请求后续叙事（gen #3b，自动调用）
   * 
   * @returns advance响应
   */
  async handleRequestNarrative(): Promise<AdvanceResponse> {
    const state = this.stateManager.getInternalState();

    if (!state.nearfield_active || !state.current_scene_id || !state.currentStoryId) {
      throw new Error('Nearfield mode not active');
    }

    console.log(`[NearFieldManager] handleRequestNarrative (narrative_index: ${state.current_narrative_index})`);

    // 构建请求（✅ Phase X: 传递 current_narrative_index）
    const request: AdvanceRequest = {
      story_id: state.currentStoryId,
      current_scene_id: state.current_scene_id,
      scene_history_context: state.scene_history_context,
      player_action: {
        type: "REQUEST_NARRATIVE",
        intent_text: null,
        narrative_index: state.current_narrative_index  // ← 当前播放位置
      }
    };

    // 调用Service
    const response = await this.nearFieldService.advance(request);

    // 更新状态
    this.applyResponse(response);

    return response;
  }

  /**
   * 应用Service响应到GameState
   * 
   * 核心职责：
   * - 将new_events追加到scene_history_context
   * - 更新awaiting_action_type（前端状态机指��）
   * - 检查场景是否结束
   * - 处理新线索
   * 
   * @param response Service响应
   */
  private applyResponse(response: AdvanceResponse): void {
    const state = this.stateManager.getInternalState();

    console.log(`[NearFieldManager] Applying response:`);
    console.log(`  - new_events: ${response.new_events.length}`);
    console.log(`  - scene_over: ${response.scene_status.is_scene_over}`);
    console.log(`  - next_action: ${response.next_action_type.type}`);

    // 1. 追加事件到历史
    state.scene_history_context = [
      ...state.scene_history_context,
      ...response.new_events
    ];

    console.log(`  - total history: ${state.scene_history_context.length} events`);

    // 2. 更新等待的行动类型
    state.awaiting_action_type = response.next_action_type;
    
    // ========== Phase X 新增：更新 narrative_index ==========
    if ('narrative_index' in response.next_action_type && 
        response.next_action_type.narrative_index !== undefined) {
      state.current_narrative_index = response.next_action_type.narrative_index;
      console.log(`  - narrative_index updated to: ${state.current_narrative_index}`);
    }

    // 2.5 ✨ 新增：自动播放叙事
    if (response.next_action_type.type === "PLAYING_NARRATIVE") {
      console.log('[NearFieldManager] Auto-playing narrative...');
      
      // 延迟1秒后自动请求后续叙事
      setTimeout(async () => {
        try {
          await this.handleRequestNarrative();
        } catch (error) {
          console.error('[NearFieldManager] Auto-play failed:', error);
        }
      }, 1000);
    }

    // 3. 处理场景结束
    if (response.scene_status.is_scene_over) {
      console.log('[NearFieldManager] Scene ended');

      // 3.1 检查是否有下一个场景
      if (response.scene_status.next_scene_id) {
        console.log(`[NearFieldManager] Next scene: ${response.scene_status.next_scene_id}`);
        state.current_scene_id = response.scene_status.next_scene_id;
        
        // 清空历史，准备加载新场景
        state.scene_history_context = [];
        state.awaiting_action_type = null;
      } else {
        console.log('[NearFieldManager] No next scene, nearfield interaction complete');
      }

      // 3.2 检查故事是否结束
      if (response.scene_status.is_story_over) {
        console.log('[NearFieldManager] Story ended');
      }
    }

    // 4. 处理新线索
    if (response.scene_status.new_clue) {
      console.log(`[NearFieldManager] New clue obtained: ${response.scene_status.new_clue.title}`);
      
      // TODO: 集成到线索系统
      // 目前仅记录，未来可以调用ClueService添加到玩家线索库
    }

    // 5. 处理实体更新
    if (response.entity_updates.length > 0) {
      console.log(`[NearFieldManager] Entity updates: ${response.entity_updates.length}`);
      
      // TODO: 集成到NPC系统
      // 更新NPC的composure、status等状态
      for (const update of response.entity_updates) {
        console.log(`  - ${update.entity_id}: composure=${update.composure}, status=${update.status}`);
      }
    }

    // 6. ✅ 发射事件通知UI更新
    this.gameEngine.emit('nearfieldUpdated', {
      scene_history_context: state.scene_history_context,
      awaiting_action_type: state.awaiting_action_type,
      current_scene_id: state.current_scene_id
    });
  }

  /**
   * 检查是否在近场交互模式
   */
  isActive(): boolean {
    const state = this.stateManager.getInternalState();
    return state.nearfield_active || false;
  }

  /**
   * 获取当前场景ID
   */
  getCurrentSceneId(): string | null {
    const state = this.stateManager.getInternalState();
    return state.current_scene_id || null;
  }

  /**
   * 检查场景是否已结束
   */
  isSceneEnded(): boolean {
    const state = this.stateManager.getInternalState();
    const actionType = state.awaiting_action_type;
    
    return actionType !== null && actionType.type === "SCENE_ENDED";
  }

  /**
   * 检查故事是否已结束
   * 
   * 注意：这个信息需要从最后一次响应中获取
   * 当前实现简化处理，仅检查SCENE_ENDED
   */
  isStoryEnded(): boolean {
    // TODO: 需要在状态中保存is_story_over标志
    // 当前简化实现
    return this.isSceneEnded();
  }

  /**
   * 加载场景的完整叙事序列
   * 
   * ✅ Phase X 新增：
   * - 从 DataAccess 读取场景的 narrative_sequence
   * - 缓存到 GameState.current_narrative_sequence
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   */
  private async loadNarrativeSequence(storyId: string, sceneId: string): Promise<void> {
    try {
      // ✅ 直接从 NearFieldService 内部的 storyDataAccess 读取
      // 我们需要通过 Service 层来获取场景数据
      // 但由于 Service 是 NearFieldService，而它内部已经有 storyDataAccess
      // 最简单的办法是让 Service 返回 narrative_sequence
      
      // 临时方案：直接从响应中提取并缓存（但响应中没有完整序列）
      // 更好的方案：从 DataAccessFactory 创建 StoryDataAccess 实例
      const DataAccessFactory = (await import('../data-access/DataAccessFactory')).DataAccessFactory;
      const storyDataAccess = DataAccessFactory.createStoryDataAccess();
      
      // 读取场景数据
      const scene = await storyDataAccess.getSceneById(storyId, sceneId);
      
      if (!scene || !scene.narrative_sequence) {
        console.warn(`[NearFieldManager] Scene has no narrative_sequence: ${storyId}:${sceneId}`);
        return;
      }
      
      // 缓存到状态
      const state = this.stateManager.getInternalState();
      state.current_narrative_sequence = scene.narrative_sequence;
      
      console.log(`[NearFieldManager] Loaded narrative_sequence: ${scene.narrative_sequence.length} units`);
    } catch (error) {
      console.error(`[NearFieldManager] Failed to load narrative_sequence:`, error);
      throw error;
    }
  }
}
