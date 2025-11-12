/**
 * CacheManager - 全局缓存管理器
 * 
 * 模拟后端数据库的行为
 * Demo阶段使用内存Map，可序列化到localStorage
 * 上线后切换为真实API调用
 * 
 * 设计理念：
 * - 模拟数据库表结构（clues, player_clue_inbox, player_story_progress）
 * - 支持CRUD操作
 * - 支持持久化（localStorage）
 * - 唯一数据真实来源（Single Source of Truth）
 */

import type { 
  ClueStaticData, 
  PlayerClueRecord, 
  StoryProgressRecord,
  ClueWithStatus
} from './types';

/**
 * 本地存储键
 */
const STORAGE_KEY = 'dreamheart_cache';

/**
 * Demo阶段默认玩家ID
 */
const DEFAULT_PLAYER_ID = 'demo-player';

/**
 * 全局缓存管理器（单例）
 */
export class CacheManager {
  // ========== 表1: clues (线索静态数据) ==========
  private static clueRegistry = new Map<string, ClueStaticData>();
  
  // ========== 表2: player_clue_inbox (玩家线索收件箱) ==========
  private static playerClueInbox = new Map<string, PlayerClueRecord>();
  
  // ========== 表3: player_story_progress (故事追踪进度) ==========
  private static playerStoryProgress = new Map<string, StoryProgressRecord>();
  
  // ========== 初始化标记 ==========
  private static initialized = false;
  
  // ==================== 初始化 ====================
  
  /**
   * 初始化缓存管理器
   * @param initialData 初始数据（线索静态数据）
   */
  static initialize(initialData: {
    clues: ClueStaticData[];
  }): void {
    if (this.initialized) {
      console.log('[CacheManager] Already initialized, skipping');
      return;
    }
    
    // 加载线索静态数据
    initialData.clues.forEach(clue => {
      this.clueRegistry.set(clue.clue_id, clue);
    });
    
    // Demo阶段：从 localStorage 恢复玩家进度
    this.loadFromLocalStorage();
    
    this.initialized = true;
    console.log(`[CacheManager] Initialized with ${initialData.clues.length} clues`);
    console.log(`[CacheManager] Restored ${this.playerClueInbox.size} inbox items, ${this.playerStoryProgress.size} progress records`);
  }
  
  // ==================== 持久化 ====================
  
  /**
   * 保存到 localStorage
   */
  static saveToLocalStorage(): void {
    const state = {
      playerClueInbox: Array.from(this.playerClueInbox.entries()),
      playerStoryProgress: Array.from(this.playerStoryProgress.entries())
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('[CacheManager] ✅ Saved to localStorage');
    } catch (error) {
      console.error('[CacheManager] ❌ Failed to save to localStorage:', error);
    }
  }
  
  /**
   * 从 localStorage 加载
   */
  static loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        this.playerClueInbox = new Map(state.playerClueInbox);
        this.playerStoryProgress = new Map(state.playerStoryProgress);
        console.log('[CacheManager] ✅ Loaded from localStorage');
      }
    } catch (error) {
      console.error('[CacheManager] ❌ Failed to load from localStorage:', error);
    }
  }
  
  /**
   * 清除 localStorage（测试用）
   */
  static clearLocalStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[CacheManager] ✅ Cleared localStorage');
  }
  
  // ==================== 表1: clues CRUD ====================
  
  /**
   * SELECT * FROM clues WHERE clue_id = ?
   */
  static getClue(clueId: string): ClueStaticData | null {
    return this.clueRegistry.get(clueId) || null;
  }
  
  /**
   * SELECT * FROM clues
   */
  static getAllClues(): ClueStaticData[] {
    return Array.from(this.clueRegistry.values());
  }
  
  /**
   * INSERT/UPDATE clue (helper method for initialization)
   * @note 仅用于初始化阶段，不触发持久化
   */
  static setClue(clueId: string, clue: any): void {
    this.clueRegistry.set(clueId, {
      clue_id: clue.clue_id,
      title: clue.title,
      summary: clue.summary,
      story_id: clue.story_id,
      related_clues: clue.related_clues,
      related_scenes: clue.related_scenes
    });
  }
  
  /**
   * Get clue registry size (helper for stats)
   */
  static getClueRegistrySize(): number {
    return this.clueRegistry.size;
  }
  
  // ==================== 表2: player_clue_inbox CRUD ====================
  
  /**
   * INSERT INTO player_clue_inbox
   */
  static addClueToInbox(playerId: string, clueId: string): void {
    const key = `${playerId}:${clueId}`;
    
    // 防止重复插入
    if (this.playerClueInbox.has(key)) {
      console.log(`[CacheManager] Clue already in inbox: ${clueId}`);
      return;
    }
    
    this.playerClueInbox.set(key, {
      clue_id: clueId,
      player_id: playerId,
      extracted_at: Date.now()
    });
    
    this.saveToLocalStorage();
    console.log(`[CacheManager] ✅ Added clue to inbox: ${clueId}`);
  }
  
  /**
   * SELECT * FROM player_clue_inbox WHERE player_id = ?
   */
  static getPlayerInbox(playerId: string): PlayerClueRecord[] {
    return Array.from(this.playerClueInbox.values())
      .filter(record => record.player_id === playerId);
  }
  
  /**
   * DELETE FROM player_clue_inbox WHERE player_id = ? AND clue_id = ?
   */
  static removeClueFromInbox(playerId: string, clueId: string): void {
    const key = `${playerId}:${clueId}`;
    this.playerClueInbox.delete(key);
    this.saveToLocalStorage();
    console.log(`[CacheManager] ✅ Removed clue from inbox: ${clueId}`);
  }
  
  // ==================== 表3: player_story_progress CRUD ====================
  
  /**
   * INSERT INTO player_story_progress
   */
  static trackStory(playerId: string, clueId: string, storyId: string): void {
    const key = `${playerId}:${clueId}`;
    
    // 防止重复插入（如果已存在，跳过）
    if (this.playerStoryProgress.has(key)) {
      console.log(`[CacheManager] Story already tracked: ${clueId}`);
      return;
    }
    
    this.playerStoryProgress.set(key, {
      clue_id: clueId,
      player_id: playerId,
      story_id: storyId,
      status: 'tracking',
      current_scene_index: 0,
      completed_scenes: [],
      tracked_at: Date.now(),
      unlocked_clue_ids: []
    });
    
    this.saveToLocalStorage();
    console.log(`[CacheManager] ✅ Story tracked: ${clueId} -> ${storyId}`);
  }
  
  /**
   * UPDATE player_story_progress SET status = 'completed'
   */
  static completeStory(playerId: string, clueId: string): void {
    const key = `${playerId}:${clueId}`;
    const record = this.playerStoryProgress.get(key);
    
    if (!record) {
      console.warn(`[CacheManager] ⚠️ Story progress not found: ${clueId}`);
      return;
    }
    
    record.status = 'completed';
    record.completed_at = Date.now();
    this.playerStoryProgress.set(key, record);
    
    this.saveToLocalStorage();
    console.log(`[CacheManager] ✅ Story completed: ${clueId}`);
  }
  
  /**
   * SELECT * FROM player_story_progress WHERE player_id = ? AND clue_id = ?
   */
  static getStoryProgress(playerId: string, clueId: string): StoryProgressRecord | null {
    const key = `${playerId}:${clueId}`;
    return this.playerStoryProgress.get(key) || null;
  }
  
  /**
   * SELECT * FROM player_story_progress WHERE player_id = ?
   */
  static getAllStoryProgress(playerId: string): StoryProgressRecord[] {
    return Array.from(this.playerStoryProgress.values())
      .filter(record => record.player_id === playerId);
  }
  
  /**
   * UPDATE player_story_progress SET current_scene_index = ?, completed_scenes = ?
   */
  static updateSceneProgress(
    playerId: string, 
    clueId: string, 
    sceneIndex: number, 
    completedScenes: string[]
  ): void {
    const key = `${playerId}:${clueId}`;
    const record = this.playerStoryProgress.get(key);
    
    if (!record) {
      console.warn(`[CacheManager] ⚠️ Story progress not found: ${clueId}`);
      return;
    }
    
    record.current_scene_index = sceneIndex;
    record.completed_scenes = completedScenes;
    this.playerStoryProgress.set(key, record);
    
    this.saveToLocalStorage();
    console.log(`[CacheManager] ✅ Scene progress updated: ${clueId}`);
  }
  
  /**
   * UPDATE player_story_progress SET unlocked_clue_ids = ?
   */
  static addUnlockedClue(playerId: string, clueId: string, unlockedClueId: string): void {
    const key = `${playerId}:${clueId}`;
    const record = this.playerStoryProgress.get(key);
    
    if (!record) {
      console.warn(`[CacheManager] ⚠️ Story progress not found: ${clueId}`);
      return;
    }
    
    if (!record.unlocked_clue_ids.includes(unlockedClueId)) {
      record.unlocked_clue_ids.push(unlockedClueId);
      this.playerStoryProgress.set(key, record);
      this.saveToLocalStorage();
      console.log(`[CacheManager] ✅ Unlocked clue added: ${unlockedClueId} to story ${clueId}`);
    }
  }
  
  // ==================== 派生查询（JOIN） ====================
  
  /**
   * 获取玩家收件箱的线索（带状态）
   * 
   * 等价 SQL:
   * SELECT c.*, p.extracted_at, COALESCE(s.status, 'untracked') as status
   * FROM player_clue_inbox p
   * LEFT JOIN clues c ON p.clue_id = c.clue_id
   * LEFT JOIN player_story_progress s ON p.clue_id = s.clue_id AND p.player_id = s.player_id
   * WHERE p.player_id = ?
   */
  static getClueInboxWithStatus(playerId: string = DEFAULT_PLAYER_ID): ClueWithStatus[] {
    const inboxRecords = this.getPlayerInbox(playerId);
    
    return inboxRecords.map(record => {
      // JOIN clues 表
      const clueStatic = this.getClue(record.clue_id);
      if (!clueStatic) {
        console.warn(`[CacheManager] ⚠️ Clue not found in registry: ${record.clue_id}`);
        // 返回占位数据
        return {
          clue_id: record.clue_id,
          title: '未知线索',
          summary: '数据缺失',
          story_id: '',
          status: 'untracked' as const,
          extracted_at: record.extracted_at
        };
      }
      
      // LEFT JOIN player_story_progress 表
      const storyProgress = this.getStoryProgress(playerId, record.clue_id);
      
      // 派生 status
      const status = storyProgress ? storyProgress.status : 'untracked';
      
      return {
        ...clueStatic,
        status,
        extracted_at: record.extracted_at
      };
    });
  }
  
  // ==================== 调试方法 ====================
  
  /**
   * 获取统计信息
   */
  static getStats() {
    return {
      clues: this.clueRegistry.size,
      inbox: this.playerClueInbox.size,
      progress: this.playerStoryProgress.size
    };
  }
  
  /**
   * 清空所有玩家数据（测试用）
   */
  static clearPlayerData(): void {
    this.playerClueInbox.clear();
    this.playerStoryProgress.clear();
    this.clearLocalStorage();
    console.log('[CacheManager] ✅ Cleared all player data');
  }
  
  /**
   * 清空收件箱（测试用）
   */
  static clearInbox(): void {
    this.playerClueInbox.clear();
    this.saveToLocalStorage();
    console.log('[CacheManager] ✅ Cleared inbox');
  }
  
  /**
   * 获取收件箱中的所有线索（带状态）
   * Helper method for stats
   */
  static getInboxClues(): ClueWithStatus[] {
    return this.getClueInboxWithStatus(DEFAULT_PLAYER_ID);
  }
  
  /**
   * 重置到初始状态（测试用）
   */
  static reset(): void {
    this.clueRegistry.clear();
    this.playerClueInbox.clear();
    this.playerStoryProgress.clear();
    this.initialized = false;
    this.clearLocalStorage();
    console.log('[CacheManager] ✅ Reset complete');
  }
}