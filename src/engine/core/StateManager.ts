/**
 * State Manager
 * 
 * 状态管理器
 * 负责维护和管理游戏状态
 * 
 * Phase 6.1: 改为单例模式
 */

import type { 
  GameState, 
  StoryConfig, 
  ScenarioSnapshot,
  GameSessionState,
  TrackedStoryData,
  PlayerStatusArea,
  FreeMirrorMode
} from '../../types';

/**
 * 状态管理器类（单例模式）
 */
export class StateManager {
  private static instance: StateManager | null = null;
  private state: GameState;
  
  private constructor() {
    this.state = this.createInitialState();
  }
  
  /**
   * 获取StateManager单例
   */
  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
      console.log('[StateManager] ✅ Singleton instance created');
    }
    return StateManager.instance;
  }
  
  /**
   * 重置单例（仅用于测试）
   */
  static resetInstance(): void {
    StateManager.instance = null;
    console.log('[StateManager] ⚠️ Singleton instance reset');
  }
  
  /**
   * 创建初始状态
   * 
   * Phase 3 扩展：
   * - 新增 sessionState（初始为 IDLE）
   * - 新增 trackedStories（空 Map）
   * - 新增 playerStatus（初始为 null，需要初始化）
   */
  private createInitialState(): GameState {
    return {
      // ========== Phase 3 新增：会话状态 ==========
      sessionState: 'idle' as GameSessionState,
      trackedStories: new Map<string, TrackedStoryData>(),
      
      // ========== Phase X 新增：独立玩家状态 ==========
      playerStatus: null,
      
      // ========== 现有字段 ==========
      currentStoryId: null,
      currentStory: null,
      currentTurnIndex: 0,
      currentScenario: null,
      allScenarios: [],
      isStarted: false,
      isEnded: false,
      
      // ========== 近场交互系统（简化版）==========
      nearfield: {
        active: false,
        sceneId: null,
        narrativeSequence: [],
        displayIndex: -1,
        mode: 'PLAYING',
        interventionHint: null
      },
      
      // ========== @deprecated 旧近场字段（向后兼容）==========
      nearfield_active: false,
      current_scene_id: null,
      scene_history_context: [],
      awaiting_action_type: null,
      current_narrative_sequence: null,
      current_narrative_index: 0,
    };
  }
  
  /**
   * 获取当前状态（只读）
   */
  getState(): Readonly<GameState> {
    return { ...this.state };
  }
  
  /**
   * 初始化故事
   * 
   * Phase 3 注意：
   * - 保留现有行为（向后兼容）
   * - 新增字段使用默认值
   * - sessionState 保持当前值（不重置）
   * - playerStatus 保持当前值（不重置）
   */
  initStory(storyId: string, config: StoryConfig, scenarios: ScenarioSnapshot[]): void {
    // 保留当前的 sessionState、trackedStories 和 playerStatus
    const currentSessionState = this.state.sessionState;
    const currentTrackedStories = this.state.trackedStories;
    const currentPlayerStatus = this.state.playerStatus;
    
    this.state = {
      // ========== Phase 3：保留会话状态 ==========
      sessionState: currentSessionState,
      trackedStories: currentTrackedStories,
      
      // ========== Phase X：保留独立玩家状态 ==========
      playerStatus: currentPlayerStatus,
      
      // ========== 现有字段 ==========
      currentStoryId: storyId,
      currentStory: config,
      currentTurnIndex: 0,
      currentScenario: scenarios[0] || null,
      allScenarios: scenarios,
      isStarted: false,
      isEnded: false,
      
      // ========== 近场交互系统（简化版）==========
      nearfield: {
        active: false,
        sceneId: null,
        narrativeSequence: [],
        displayIndex: -1,
        mode: 'PLAYING',
        interventionHint: null
      },
      
      // ========== @deprecated 旧近场字段（向后兼容）==========
      nearfield_active: false,
      current_scene_id: null,
      scene_history_context: [],
      awaiting_action_type: null,
      current_narrative_sequence: null,
      current_narrative_index: 0,
    };
  }
  
  /**
   * 开始游戏
   */
  startGame(): void {
    this.state.isStarted = true;
  }
  
  /**
   * 推进到下一个回合
   */
  advanceTurn(): boolean {
    const nextIndex = this.state.currentTurnIndex + 1;
    
    if (nextIndex >= this.state.allScenarios.length) {
      // 已到达最后一个场景，循环回第一个
      this.state.currentTurnIndex = 0;
      this.state.currentScenario = this.state.allScenarios[0];
      return true;
    }
    
    this.state.currentTurnIndex = nextIndex;
    this.state.currentScenario = this.state.allScenarios[nextIndex];
    return true;
  }
  
  /**
   * 跳转到指定回合
   */
  goToTurn(turnIndex: number): boolean {
    if (turnIndex < 0 || turnIndex >= this.state.allScenarios.length) {
      return false;
    }
    
    this.state.currentTurnIndex = turnIndex;
    this.state.currentScenario = this.state.allScenarios[turnIndex];
    return true;
  }
  
  /**
   * 结束游戏
   */
  endGame(): void {
    this.state.isEnded = true;
  }
  
  /**
   * 重置状态
   */
  reset(): void {
    this.state = this.createInitialState();
  }
  
  /**
   * 获取当前场景
   */
  getCurrentScenario(): ScenarioSnapshot | null {
    return this.state.currentScenario;
  }
  
  /**
   * 获取当前回合索引
   */
  getCurrentTurnIndex(): number {
    return this.state.currentTurnIndex;
  }
  
  /**
   * 获取总回合数
   */
  getTotalTurns(): number {
    return this.state.allScenarios.length;
  }
  
  /**
   * 判断是否已开始
   */
  isGameStarted(): boolean {
    return this.state.isStarted;
  }
  
  /**
   * 判断是否已结束
   */
  isGameEnded(): boolean {
    return this.state.isEnded;
  }
  
  /**
   * 判断是否是最后一个回合
   */
  isLastTurn(): boolean {
    return this.state.currentTurnIndex === this.state.allScenarios.length - 1;
  }
  
  // ==================== 剧本系统方法（新增）====================
  
  /**
   * 获取内部状态（供GameEngine内部使用）
   * WARNING: 直接修改此对象会影响内部状态
   */
  getInternalState(): GameState {
    return this.state;
  }
  
  // ==================== Phase 3 新增：会话状态管理 ====================
  
  /**
   * 进入故事（从线索启动游戏）
   * 
   * @param trackedStory 追踪的故事数据
   * @returns 是否成功进入
   * 
   * 流程：
   * 1. 检查故事是否已追踪
   * 2. 更新 trackedStories（设置 is_active）
   * 3. 更新 sessionState 为 PLAYING
   * 4. 不修改 currentStoryId 等字段（由 GameEngine.enterStory 处理）
   */
  enterStory(trackedStory: TrackedStoryData): boolean {
    // 1. 验证故事是否已追踪
    if (!this.state.trackedStories.has(trackedStory.entry_clue_id)) {
      console.error('[StateManager] Story not tracked, cannot enter');
      return false;
    }
    
    // 2. 清除所有其他故事的活跃状态
    this.state.trackedStories.forEach((story, clueId) => {
      story.is_active = false;
      story.updated_at = Date.now();
    });
    
    // 3. 设置目标故事为活跃
    const updatedStory = { ...trackedStory, is_active: true, updated_at: Date.now() };
    this.state.trackedStories.set(trackedStory.entry_clue_id, updatedStory);
    
    // 4. 更新会话状态为 PLAYING
    this.state.sessionState = 'playing' as GameSessionState;
    
    console.log(`[StateManager] Entered story: ${trackedStory.title} (sessionState: PLAYING)`);
    return true;
  }
  
  /**
   * 退出故事（返回空闲状态）
   * 
   * @returns 是否成功退出
   * 
   * 流程：
   * 1. 清除所有故事的 is_active 标记
   * 2. 更新 sessionState 为 STORY_READY 或 IDLE
   * 3. 重置游戏状态字段（currentStoryId, isStarted 等）
   */
  exitStory(): boolean {
    // 1. 清除所有故事的活跃标记
    this.state.trackedStories.forEach((story, clueId) => {
      story.is_active = false;
      story.updated_at = Date.now();
    });
    
    // 2. 确定新的会话状态
    const hasTrackedStories = this.state.trackedStories.size > 0;
    this.state.sessionState = hasTrackedStories 
      ? ('ready' as GameSessionState)
      : ('idle' as GameSessionState);
    
    // 3. 重置游戏状态字段（但不重置 trackedStories）
    this.state.currentStoryId = null;
    this.state.currentStory = null;
    this.state.currentTurnIndex = 0;
    this.state.currentScenario = null;
    this.state.allScenarios = [];
    this.state.isStarted = false;
    this.state.isEnded = false;
    
    // 4. 重置近场交互状态
    this.state.nearfield_active = false;
    this.state.current_scene_id = null;
    this.state.scene_history_context = [];
    this.state.awaiting_action_type = null;
    
    // ========== Phase X 新增：重置叙事序列状态 ==========
    this.state.current_narrative_sequence = null;
    this.state.current_narrative_index = 0;
    
    console.log(`[StateManager] Exited story (sessionState: ${this.state.sessionState})`);
    return true;
  }
  
  // ==================== Phase 3 新增：辅助方法 ====================
  
  /**
   * 检查是否有追踪的故事
   * @returns 是否有追踪的故事
   */
  hasTrackedStories(): boolean {
    return this.state.trackedStories.size > 0;
  }
  
  /**
   * 获取当前会话状态
   * @returns 会话状态
   */
  getSessionState(): GameSessionState {
    return this.state.sessionState;
  }
  
  /**
   * 更新追踪的故事池
   * @param trackedStories 新的故事池
   * @note 通常由 GameEngine 调用，在 trackClue 后更新
   */
  updateTrackedStories(trackedStories: Map<string, TrackedStoryData>): void {
    this.state.trackedStories = trackedStories;
    
    // 根据故事池状态更新 sessionState
    if (trackedStories.size === 0) {
      this.state.sessionState = 'idle' as GameSessionState;
    } else if (this.state.sessionState === 'idle' as GameSessionState) {
      // 如果当前是 IDLE，且有了追踪的故事，切换到 READY
      this.state.sessionState = 'ready' as GameSessionState;
    }
    // 如果是 PLAYING，保持不变
    
    console.log(`[StateManager] Updated tracked stories (count: ${trackedStories.size}, sessionState: ${this.state.sessionState})`);
  }
  
  /**
   * 获取活跃的故事
   * @returns 活跃的故事数据，如果没有则返回 null
   */
  getActiveStory(): TrackedStoryData | null {
    for (const story of this.state.trackedStories.values()) {
      if (story.is_active) {
        return story;
      }
    }
    return null;
  }
  
  /**
   * 获取所有追踪的故事
   * @returns 追踪的故事数组
   */
  getTrackedStories(): TrackedStoryData[] {
    console.log('[StateManager] 🔍 getTrackedStories() called');
    console.log(`[StateManager]   - Map size: ${this.state.trackedStories.size}`);
    console.log(`[StateManager]   - Map keys: [${Array.from(this.state.trackedStories.keys()).join(', ')}]`);
    
    const stories = Array.from(this.state.trackedStories.values());
    
    console.log(`[StateManager] 🔍 Returning ${stories.length} stories`);
    stories.forEach((story, idx) => {
      console.log(`  [${idx}] ${story.clue_id} -> ${story.title}`);
      console.log(`      Object reference: ${story}`);
      console.log(`      current_scene_index: ${story.progress?.current_scene_index}`);
      console.log(`      completed_scenes: [${story.progress?.completed_scenes?.join(', ')}]`);
      console.log(`      scene_sequence length: ${story.scene_sequence.length}`);
      story.scene_sequence.forEach((s, i) => {
        console.log(`        [${i}] ${s.scene_id} - status: ${s.status}`);
      });
    });
    
    return stories;
  }
  
  /**
   * 获取单个追踪的故事
   * @param clueId 线索ID
   * @returns 追踪的故事数据，如果未找到则返回 null
   */
  getTrackedStory(clueId: string): TrackedStoryData | null {
    return this.state.trackedStories.get(clueId) || null;
  }
  
  /**
   * 设置/更新追踪的故事
   * @param clueId 线索ID
   * @param storyData 故事数据
   * @note ✅ 修复：深拷贝对象数组，防止引用污染
   */
  setTrackedStory(clueId: string, storyData: TrackedStoryData): void {
    // ✅ 深拷贝 scene_sequence 和其他嵌套对象
    const clonedStoryData: TrackedStoryData = {
      ...storyData,
      scene_sequence: storyData.scene_sequence.map(scene => ({ ...scene })),
      progress: storyData.progress ? {
        ...storyData.progress,
        completed_scenes: [...storyData.progress.completed_scenes]
      } : undefined,
      unlocked_clue_ids: storyData.unlocked_clue_ids ? [...storyData.unlocked_clue_ids] : undefined
    };
    
    this.state.trackedStories.set(clueId, clonedStoryData);
  }
  
  /**
   * 更新追踪的故事（部分更新）
   * @param clueId 线索ID
   * @param updates 需要更新的字段
   * @note ✅ 方案B+：使用不可变更新，创建新对象引用
   */
  updateTrackedStory(clueId: string, updates: Partial<TrackedStoryData>): void {
    const existing = this.state.trackedStories.get(clueId);
    if (!existing) {
      console.warn(`[StateManager] Cannot update non-existent tracked story: ${clueId}`);
      return;
    }
    
    // ✅ 深拷贝嵌套对象，确保完全不可变
    const updated: TrackedStoryData = {
      ...existing,
      ...updates,
      // 深拷贝 progress（如果有更新）
      progress: updates.progress ? {
        ...existing.progress,
        ...updates.progress,
        completed_scenes: updates.progress.completed_scenes 
          ? [...updates.progress.completed_scenes]
          : existing.progress?.completed_scenes 
          ? [...existing.progress.completed_scenes]
          : []
      } : existing.progress ? {
        ...existing.progress,
        completed_scenes: [...existing.progress.completed_scenes]
      } : undefined,
      // ✅ 修复：深拷贝 scene_sequence 对象数组
      scene_sequence: updates.scene_sequence 
        ? updates.scene_sequence.map(scene => ({ ...scene }))
        : existing.scene_sequence.map(scene => ({ ...scene })),
      // 深拷贝数组字段
      unlocked_clue_ids: updates.unlocked_clue_ids 
        ? [...updates.unlocked_clue_ids]
        : existing.unlocked_clue_ids 
        ? [...existing.unlocked_clue_ids]
        : undefined,
      updated_at: Date.now()
    };
    
    this.state.trackedStories.set(clueId, updated);
    
    console.log(`[StateManager] ✅ Story updated (immutable): ${clueId}`, {
      status: updated.status,
      currentSceneIndex: updated.progress?.current_scene_index,
      completedScenes: updated.progress?.completed_scenes.length
    });
  }
  
  /**
   * 标记场景为已完成
   * @param clueId 触发该故事的线索ID
   * @param sceneId 已完成的场景ID
   * @note ✅ 方案B+：使用不可变更新，创建新对象引用
   */
  markSceneCompleted(clueId: string, sceneId: string): void {
    const trackedData = this.state.trackedStories.get(clueId);
    if (!trackedData) {
      console.warn(`[StateManager] Cannot mark scene completed: story not found for clue ${clueId}`);
      return;
    }
    
    // ✅ 创建新的 completed_scenes 数组
    const completedScenes = trackedData.progress?.completed_scenes 
      ? [...trackedData.progress.completed_scenes]
      : [];
    
    if (!completedScenes.includes(sceneId)) {
      completedScenes.push(sceneId);
    }
    
    // ✅ 创建新的 scene_sequence 数组，更新对应场景的状态
    const updatedSceneSequence = trackedData.scene_sequence.map(s => 
      s.scene_id === sceneId 
        ? { ...s, status: 'unlocked' as const }
        : { ...s }
    );
    
    // ✅ 创建完全新的对象（不可变更新）
    const updatedStory: TrackedStoryData = {
      ...trackedData,
      progress: trackedData.progress ? {
        ...trackedData.progress,
        completed_scenes: completedScenes
      } : undefined,
      scene_sequence: updatedSceneSequence,
      updated_at: Date.now()
    };
    
    // ✅ 更新 Map
    this.state.trackedStories.set(clueId, updatedStory);
    
    console.log(`[StateManager] ✅ Scene marked as completed (immutable): ${sceneId} in story ${trackedData.title}`, {
      completedScenesCount: completedScenes.length,
      totalScenes: updatedSceneSequence.length
    });
  }
  
  /**
   * 标记故事为已完成
   * @param clueId 触发该故事的线索ID
   * @param completionClueId 可选：完成时解锁的线索ID
   * @note ✅ 方案B+：使用不可变更新，创建新对象引用
   */
  markStoryCompleted(clueId: string, completionClueId?: string): void {
    const trackedData = this.state.trackedStories.get(clueId);
    if (!trackedData) {
      console.warn(`[StateManager] Cannot mark story completed: story not found for clue ${clueId}`);
      return;
    }
    
    // ✅ 创建新的 unlocked_clue_ids 数组
    const unlockedClueIds = trackedData.unlocked_clue_ids 
      ? [...trackedData.unlocked_clue_ids]
      : [];
    
    if (completionClueId && !unlockedClueIds.includes(completionClueId)) {
      unlockedClueIds.push(completionClueId);
    }
    
    // ✅ 标记当前场景为已完成
    let updatedSceneSequence = trackedData.scene_sequence.map(s => ({...s}));
    let updatedCompletedScenes = trackedData.progress?.completed_scenes 
      ? [...trackedData.progress.completed_scenes]
      : [];
    
    const currentSceneIndex = trackedData.progress?.current_scene_index;
    if (currentSceneIndex !== undefined && updatedSceneSequence) {
      const currentScene = updatedSceneSequence[currentSceneIndex];
      if (currentScene) {
        currentScene.status = 'unlocked';
        
        if (!updatedCompletedScenes.includes(currentScene.scene_id)) {
          updatedCompletedScenes.push(currentScene.scene_id);
        }
      }
    }
    
    // ✅ 创建完全新的对象（不可变更新）
    const updatedStory: TrackedStoryData = {
      ...trackedData,
      status: 'completed',
      completion_time: Date.now(),
      updated_at: Date.now(),
      unlocked_clue_ids: unlockedClueIds,
      scene_sequence: updatedSceneSequence,
      progress: trackedData.progress ? {
        ...trackedData.progress,
        completed_scenes: updatedCompletedScenes
      } : undefined
    };
    
    // ✅ 更新 Map
    this.state.trackedStories.set(clueId, updatedStory);
    
    // 🔥 BUG FIX: 清空 activeStoryClueId（允许进入新故事）
    if (this.state.activeStoryClueId === clueId) {
      this.state.activeStoryClueId = null;
      console.log(`[StateManager] 🔓 Cleared active story: ${clueId} (story completed)`);
    }
    
    console.log(`[StateManager] ✅ Story marked as completed (immutable): ${trackedData.title}`, {
      completionClueId,
      unlockedCluesCount: unlockedClueIds.length,
      completedScenesCount: updatedCompletedScenes.length
    });
  }
  
  // ==================== Phase X 新增：独立玩家状态管理 ====================
  
  /**
   * 设置玩家状态
   * 
   * @param playerStatus 玩家状态
   * @note 通常在 PlayerService.initialize() 后调用
   */
  setPlayerStatus(playerStatus: PlayerStatusArea): void {
    this.state.playerStatus = playerStatus;
    console.log('[StateManager] Player status set:', {
      location: playerStatus.current_location,
      time: playerStatus.world_time
    });
  }
  
  /**
   * 获取玩家状态（只读）
   * 
   * @returns 玩家状态的副本，如果未初始化则返回 null
   */
  getPlayerStatus(): Readonly<PlayerStatusArea> | null {
    if (!this.state.playerStatus) {
      return null;
    }
    
    // 返回深拷贝，防止外部修改
    return JSON.parse(JSON.stringify(this.state.playerStatus));
  }
  
  /**
   * 更新玩家状态
   * 
   * @param playerStatus 新的玩家状态
   * @note PlayerService 调用，用于同步更新
   */
  updatePlayerStatus(playerStatus: PlayerStatusArea): void {
    this.state.playerStatus = playerStatus;
  }
  
  /**
   * 清除玩家状态
   * 
   * @note 通常在重置游戏时调用
   */
  clearPlayerStatus(): void {
    this.state.playerStatus = null;
    console.log('[StateManager] Player status cleared');
  }
  
  /**
   * 检查玩家状态是否已初始化
   * 
   * @returns 是否已初始化
   */
  hasPlayerStatus(): boolean {
    return this.state.playerStatus !== null;
  }
  
  // ========== 自由镜模式计算（新增）==========
  
  /**
   * 计算自由镜当前显示模式
   * 
   * 这是一个派生状态，根据数据状态计算得出：
   * 1. 未进入故事 → IDLE
   * 2. 有叙事序列数据 → NARRATIVE
   * 3. 其他 → INTERACTION
   * 
   * @returns 自由镜显示模式
   */
  getFreeMirrorMode(): FreeMirrorMode {
    const state = this.state;
    
    // 1. 未进入故事
    if (!state.nearfield_active || state.sessionState !== 'playing') {
      return 'idle' as FreeMirrorMode;
    }
    
    // 2. 近场叙事模式（有叙事序列数据）
    if (state.current_narrative_sequence && state.current_narrative_sequence.length > 0) {
      return 'narrative' as FreeMirrorMode;
    }
    
    // 3. 冲突交互模式
    return 'interaction' as FreeMirrorMode;
  }
}