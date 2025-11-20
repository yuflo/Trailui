/**
 * InstanceCacheManager - 实例缓存管理器
 * 
 * 扩展CacheManager，支持Story/Scene/NPC实例的独立存储
 * 解决引用共享污染问题
 * 
 * 核心设计：
 * - 每个线索追踪时创建独立的StoryInstance
 * - 实例ID命名：${template_id}__${clue_id}
 * - 所有读取操作返回深拷贝
 * - 支持持久化到localStorage
 */

import type {
  StoryInstance,
  SceneInstance,
  NPCInstance,
  ClueRecord,
  LLMSceneNarrativeRecord,
  LLMDialogueRecord,
  PlayerStatusArea,
  StatusEffect
} from '../../types/instance.types';
import type { StoryConfig } from '../../types'; // 🔥 导入完整的 StoryConfig 类型
import { DataAccessFactory } from '../data-access/DataAccessFactory';

/**
 * 本地存储键
 */
const INSTANCE_STORAGE_KEY = 'dreamheart_instances';

/**
 * 实例缓存管理器（扩展）
 */
export class InstanceCacheManager {
  // ============================================
  // Layer 2: 运行时实例存储
  // ============================================
  private static storyInstances = new Map<string, StoryInstance>();
  private static sceneInstances = new Map<string, SceneInstance>();
  private static npcInstances = new Map<string, NPCInstance>();
  private static clueRecords = new Map<string, ClueRecord>();
  
  // ============================================
  // Layer 3: LLM生成内容存储
  // ============================================
  private static llmSceneNarratives = new Map<string, LLMSceneNarrativeRecord>();
  private static llmDialogueHistory = new Map<string, LLMDialogueRecord>();
  
  // ============================================
  // 初始化标记
  // ============================================
  private static initialized = false;
  
  // ============================================
  // 初始化
  // ============================================
  
  /**
   * 初始化实例缓存管理器
   */
  static initialize(): void {
    console.log('[InstanceCacheManager.initialize] 🚀 initialize() called, current initialized status:', this.initialized);
    console.log('[InstanceCacheManager.initialize] 📊 Current clueRecords size BEFORE:', this.clueRecords.size);
    
    if (this.initialized) {
      console.log('[InstanceCacheManager] Already initialized');
      return;
    }
    
    this.loadFromLocalStorage();
    this.initialized = true;
    
    console.log('[InstanceCacheManager] ✅ Initialized');
    console.log(`  - Story instances: ${this.storyInstances.size}`);
    console.log(`  - Scene instances: ${this.sceneInstances.size}`);
    console.log(`  - NPC instances: ${this.npcInstances.size}`);
    console.log(`  - Clue records: ${this.clueRecords.size}`);
  }
  
  // ============================================
  // 故事实例管理
  // ============================================
  
  /**
   * 🔥 创建故事实例（从线索追踪时调用）
   * 
   * @param playerId - 玩家ID
   * @param clueId - 线索ID
   * @param storyTemplate - 故事模板数据（完整的 StoryConfig）
   * @returns 故事实例ID
   */
  static createStoryInstance(
    playerId: string,
    clueId: string,
    storyTemplate: StoryConfig
  ): string {
    const instanceId = `${storyTemplate.story_id}__${clueId}`;
    
    // 检查是否已存在
    if (this.storyInstances.has(instanceId)) {
      console.warn(`[InstanceCacheManager] Story instance already exists: ${instanceId}`);
      return instanceId;
    }
    
    // 🔥 创建独立实例（深拷贝所有数据）
    const instance: StoryInstance = {
      instance_id: instanceId,
      player_id: playerId,
      clue_id: clueId,
      story_template_id: storyTemplate.story_id,
      
      // 🔥 完整深拷贝故事数据（包含所有必需字段）
      story_data: {
        story_id: storyTemplate.story_id,  // ✅ 新增：必须包含 story_id
        title: storyTemplate.title,
        description: storyTemplate.description,
        genre: [...storyTemplate.genre],
        difficulty: storyTemplate.difficulty,
        initial_scenario_id: storyTemplate.initial_scenario_id,  // ✅ 新增：初始场景ID
        visual_archetype: storyTemplate.visual_archetype,  // ✅ 新增：视觉原型
        visualOverrides: storyTemplate.visualOverrides ? { ...storyTemplate.visualOverrides } : undefined  // ✅ 新增：视觉覆盖
      },
      
      // 深拷贝序列
      scene_sequence: [...storyTemplate.scene_sequence],
      npc_ids: [...storyTemplate.npc_ids],
      
      // 🔥 初始化运行时状态
      current_scene_id: null,
      current_scene_index: 0,  // ✅ 新增：初始化场景索引为 0
      completed_scenes: [],
      status: 'not_started',
      progress_percentage: 0,
      
      // 时间戳
      created_at: Date.now(),
      started_at: null,
      completed_at: null,
      last_played_at: null
    };
    
    this.storyInstances.set(instanceId, instance);
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] ✅ Created story instance: ${instanceId}`);
    return instanceId;
  }
  
  /**
   * 🔥 获取故事实例（深拷贝）
   */
  static getStoryInstance(instanceId: string): StoryInstance | null {
    const instance = this.storyInstances.get(instanceId);
    if (!instance) {
      return null;
    }
    
    // ✅ 必须深拷贝，防止外部修改
    return JSON.parse(JSON.stringify(instance));
  }
  
  /**
   * 🔥 更新故事实例
   */
  static updateStoryInstance(
    instanceId: string,
    updates: Partial<StoryInstance>
  ): void {
    console.log(`[InstanceCacheManager.updateStoryInstance] 🔄 Updating instance: ${instanceId}`);
    console.log(`[InstanceCacheManager.updateStoryInstance] 📝 Updates:`, updates);
    
    const instance = this.storyInstances.get(instanceId);
    if (!instance) {
      throw new Error(`[InstanceCacheManager] Story instance not found: ${instanceId}`);
    }
    
    console.log(`[InstanceCacheManager.updateStoryInstance] 📊 BEFORE update:`, {
      status: instance.status,
      current_scene_index: instance.current_scene_index,
      completed_scenes: instance.completed_scenes,
      progress_percentage: instance.progress_percentage
    });
    
    // 应用更新
    Object.assign(instance, updates);
    
    console.log(`[InstanceCacheManager.updateStoryInstance] 📊 AFTER update:`, {
      status: instance.status,
      current_scene_index: instance.current_scene_index,
      completed_scenes: instance.completed_scenes,
      progress_percentage: instance.progress_percentage
    });
    
    this.saveToLocalStorage();
    console.log(`[InstanceCacheManager.updateStoryInstance] ✅ Updated and saved to localStorage`);
  }
  
  /**
   * 获取玩家的所有故事实例
   */
  static getPlayerStoryInstances(playerId: string): StoryInstance[] {
    const instances = Array.from(this.storyInstances.values())
      .filter(inst => inst.player_id === playerId);
    
    // 深拷贝
    return JSON.parse(JSON.stringify(instances));
  }
  
  // ============================================
  // 场景实例管理
  // ============================================
  
  /**
   * 🔥 创建场景实例
   */
  static createSceneInstance(
    storyInstanceId: string,
    sceneTemplate: {
      scene_id: string;
      title: string;
      location: string;
      time_of_day: string;
      weather: string;
      background_info: string;
      objective: string;
      present_npc_ids: string[];
    }
  ): string {
    const sceneInstanceId = `${storyInstanceId}__${sceneTemplate.scene_id}`;
    
    if (this.sceneInstances.has(sceneInstanceId)) {
      return sceneInstanceId;
    }
    
    // 获取故事实例信息
    const storyInstance = this.getStoryInstance(storyInstanceId);
    if (!storyInstance) {
      throw new Error(`[InstanceCacheManager] Story instance not found: ${storyInstanceId}`);
    }
    
    // 创建场景实例
    const instance: SceneInstance = {
      instance_id: sceneInstanceId,
      story_instance_id: storyInstanceId,
      scene_template_id: sceneTemplate.scene_id,
      player_id: storyInstance.player_id,
      
      // 深拷贝场景数据
      scene_data: {
        title: sceneTemplate.title,
        location: sceneTemplate.location,
        time_of_day: sceneTemplate.time_of_day,
        weather: sceneTemplate.weather,
        background_info: sceneTemplate.background_info,
        objective: sceneTemplate.objective
      },
      
      // 创建NPC实例ID列表
      npc_instance_ids: sceneTemplate.present_npc_ids.map(npcTemplateId =>
        `${storyInstanceId}__${npcTemplateId}`
      ),
      
      // 初始化状态
      status: 'not_entered',
      entered_at: null,
      completed_at: null,
      triggered_events: []
    };
    
    this.sceneInstances.set(sceneInstanceId, instance);
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] ✅ Created scene instance: ${sceneInstanceId}`);
    return sceneInstanceId;
  }
  
  /**
   * 🔥 获取场景实例（深拷贝）
   */
  static getSceneInstance(instanceId: string): SceneInstance | null {
    const instance = this.sceneInstances.get(instanceId);
    if (!instance) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(instance));
  }
  
  /**
   * 🔥 更新场景实例
   */
  static updateSceneInstance(
    instanceId: string,
    updates: Partial<SceneInstance>
  ): void {
    const instance = this.sceneInstances.get(instanceId);
    if (!instance) {
      throw new Error(`[InstanceCacheManager] Scene instance not found: ${instanceId}`);
    }
    
    Object.assign(instance, updates);
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] ✅ Updated scene instance: ${instanceId}`);
  }
  
  // ============================================
  // NPC实例管理
  // ============================================
  
  /**
   * 🔥 创建NPC实例
   */
  static createNPCInstance(
    storyInstanceId: string,
    npcTemplate: {
      npc_id: string;
      name: string;
      avatar_url: string;
      personality: {
        traits: string[];
        values: string[];
        speaking_style: string;
      };
      background: string;
      initial_relationship: number;
    }
  ): string {
    const npcInstanceId = `${storyInstanceId}__${npcTemplate.npc_id}`;
    
    if (this.npcInstances.has(npcInstanceId)) {
      return npcInstanceId;
    }
    
    // 获取故事实例信息
    const storyInstance = this.getStoryInstance(storyInstanceId);
    if (!storyInstance) {
      throw new Error(`[InstanceCacheManager] Story instance not found: ${storyInstanceId}`);
    }
    
    // 创建NPC实例
    const instance: NPCInstance = {
      instance_id: npcInstanceId,
      story_instance_id: storyInstanceId,
      npc_template_id: npcTemplate.npc_id,
      player_id: storyInstance.player_id,
      
      // 深拷贝NPC数据
      npc_data: {
        name: npcTemplate.name,
        avatar_url: npcTemplate.avatar_url,
        personality: {
          traits: [...npcTemplate.personality.traits],
          values: [...npcTemplate.personality.values],
          speaking_style: npcTemplate.personality.speaking_style
        },
        background: npcTemplate.background
      },
      
      // 初始化运行时状态
      current_state: {
        relationship: npcTemplate.initial_relationship,
        current_mood: 'neutral',
        alertness: 0.5,
        trust_level: npcTemplate.initial_relationship
      },
      
      // 初始化交互摘要
      interaction_summary: {
        total_interactions: 0,
        last_interaction_at: null,
        revealed_secrets: []
      }
    };
    
    this.npcInstances.set(npcInstanceId, instance);
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] ✅ Created NPC instance: ${npcInstanceId}`);
    return npcInstanceId;
  }
  
  /**
   * 🔥 获取NPC实例（深拷贝）
   */
  static getNPCInstance(instanceId: string): NPCInstance | null {
    const instance = this.npcInstances.get(instanceId);
    if (!instance) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(instance));
  }
  
  /**
   * 🔥 更新NPC实例
   */
  static updateNPCInstance(
    instanceId: string,
    stateUpdates: Partial<NPCInstance['current_state']>
  ): void {
    const instance = this.npcInstances.get(instanceId);
    if (!instance) {
      throw new Error(`[InstanceCacheManager] NPC instance not found: ${instanceId}`);
    }
    
    // 更新当前状态
    Object.assign(instance.current_state, stateUpdates);
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] ✅ Updated NPC instance: ${instanceId}`);
  }
  
  /**
   * 批量获取NPC实例
   */
  static getNPCInstances(instanceIds: string[]): NPCInstance[] {
    return instanceIds
      .map(id => this.getNPCInstance(id))
      .filter((inst): inst is NPCInstance => inst !== null);
  }
  
  // ============================================
  // 线索记录管理（扩展）
  // ============================================
  
  /**
   * 🔥 创建或更新线索记录
   */
  static upsertClueRecord(record: ClueRecord): void {
    console.log('[InstanceCacheManager.upsertClueRecord] 💾 Upserting clue record:', {
      clue_id: record.clue_id,
      title: record.title,
      status: record.status,
      player_id: record.player_id
    });
    this.clueRecords.set(record.clue_id, record);
    console.log('[InstanceCacheManager.upsertClueRecord] ✅ Current clueRecords size:', this.clueRecords.size);
    this.saveToLocalStorage();
  }
  
  /**
   * 🔥 获取线索记录（深拷贝）
   */
  static getClueRecord(clueId: string): ClueRecord | null {
    const record = this.clueRecords.get(clueId);
    if (!record) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(record));
  }
  
  /**
   * 🔥 更新线索记录
   */
  static updateClueRecord(
    clueId: string,
    updates: Partial<ClueRecord>
  ): void {
    console.log(`[InstanceCacheManager.updateClueRecord] 🔄 Updating clue: ${clueId}`);
    console.log(`[InstanceCacheManager.updateClueRecord] 📝 Updates:`, updates);
    
    const record = this.clueRecords.get(clueId);
    if (!record) {
      throw new Error(`[InstanceCacheManager] Clue record not found: ${clueId}`);
    }
    
    console.log(`[InstanceCacheManager.updateClueRecord] 📊 BEFORE update:`, {
      status: record.status,
      story_instance_id: record.story_instance_id,
      completed_at: record.completed_at
    });
    
    Object.assign(record, updates);
    
    console.log(`[InstanceCacheManager.updateClueRecord] 📊 AFTER update:`, {
      status: record.status,
      story_instance_id: record.story_instance_id,
      completed_at: record.completed_at
    });
    
    this.saveToLocalStorage();
    console.log(`[InstanceCacheManager.updateClueRecord] ✅ Updated and saved to localStorage`);
  }
  
  /**
   * 获取玩家的所有线索
   */
  static getPlayerClueRecords(playerId: string): ClueRecord[] {
    console.log('[InstanceCacheManager.getPlayerClueRecords] 🔍 Fetching clues for player:', playerId);
    console.log('[InstanceCacheManager.getPlayerClueRecords] 📊 Total clueRecords in Map:', this.clueRecords.size);
    console.log('[InstanceCacheManager.getPlayerClueRecords] 📋 All clue IDs in Map:', Array.from(this.clueRecords.keys()));
    
    const records = Array.from(this.clueRecords.values())
      .filter(r => r.player_id === playerId);
    
    console.log('[InstanceCacheManager.getPlayerClueRecords] ✅ Filtered records for player:', {
      count: records.length,
      clueIds: records.map(r => r.clue_id),
      titles: records.map(r => r.title)
    });
    
    return JSON.parse(JSON.stringify(records));
  }
  
  /**
   * 🔥 删除线索记录
   */
  static deleteClueRecord(clueId: string): void {
    const existed = this.clueRecords.has(clueId);
    this.clueRecords.delete(clueId);
    
    if (existed) {
      this.saveToLocalStorage();
      console.log(`[InstanceCacheManager] ✅ Deleted clue record: ${clueId}`);
    } else {
      // 降低日志级别：删除不存在的记录不是错误，只是清理操作
      if (this.initialized) {
        console.log(`[InstanceCacheManager] ℹ️ Clue record not found (already clean): ${clueId}`);
      }
    }
  }
  
  // ============================================
  // LLM生成内容管理
  // ============================================
  
  /**
   * 保存LLM生成的场景叙事
   */
  static saveLLMSceneNarrative(record: LLMSceneNarrativeRecord): void {
    this.llmSceneNarratives.set(record.record_id, record);
    this.saveToLocalStorage();
  }
  
  /**
   * 获取场景叙事（深拷贝）
   */
  static getLLMSceneNarrative(sceneInstanceId: string): LLMSceneNarrativeRecord | null {
    const record = Array.from(this.llmSceneNarratives.values()).find(r =>
      r.scene_instance_id === sceneInstanceId && r.is_active === true
    );
    
    if (!record) return null;
    
    return JSON.parse(JSON.stringify(record));
  }
  
  /**
   * 保存对话记录
   */
  static saveLLMDialogue(record: LLMDialogueRecord): void {
    this.llmDialogueHistory.set(record.record_id, record);
    this.saveToLocalStorage();
  }
  
  /**
   * 获取对话历史（深拷贝）
   */
  static getLLMDialogueHistory(
    npcInstanceId: string,
    limit: number = 10
  ): LLMDialogueRecord[] {
    const records = Array.from(this.llmDialogueHistory.values())
      .filter(r => r.npc_instance_id === npcInstanceId)
      .sort((a, b) => a.turn_number - b.turn_number)
      .slice(-limit);
    
    return JSON.parse(JSON.stringify(records));
  }
  
  // ============================================
  // 持久化
  // ============================================
  
  /**
   * 保存到localStorage
   */
  private static saveToLocalStorage(): void {
    try {
      const state = {
        storyInstances: Array.from(this.storyInstances.entries()),
        sceneInstances: Array.from(this.sceneInstances.entries()),
        npcInstances: Array.from(this.npcInstances.entries()),
        clueRecords: Array.from(this.clueRecords.entries()),
        llmSceneNarratives: Array.from(this.llmSceneNarratives.entries()),
        llmDialogueHistory: Array.from(this.llmDialogueHistory.entries()),
        playerStatus: this.playerStatus
      };
      
      console.log('[InstanceCacheManager.saveToLocalStorage] 💾 SAVING @ ' + Date.now());
      console.log('[InstanceCacheManager.saveToLocalStorage] 📊 Data being saved:', {
        clueRecordsCount: state.clueRecords.length,
        clueIds: state.clueRecords.map(([id]) => id),
        clueStatuses: state.clueRecords.map(([id, record]) => ({ id, status: record.status, story_instance_id: record.story_instance_id })),
        storyInstancesCount: state.storyInstances.length
      });
      
      localStorage.setItem(INSTANCE_STORAGE_KEY, JSON.stringify(state));
      console.log('[InstanceCacheManager.saveToLocalStorage] ✅ Saved successfully');
      // console.log('[InstanceCacheManager] ✅ Saved to localStorage');
    } catch (error) {
      console.error('[InstanceCacheManager] ❌ Failed to save:', error);
    }
  }
  
  /**
   * 从localStorage加载
   */
  private static loadFromLocalStorage(): void {
    console.log('[InstanceCacheManager.loadFromLocalStorage] 🔥 LOADING FROM LOCALSTORAGE @ ' + Date.now());
    console.log('[InstanceCacheManager.loadFromLocalStorage] 📍 Call stack:', new Error().stack);
    console.log('[InstanceCacheManager.loadFromLocalStorage] 📊 Current Map size BEFORE load:', {
      clueRecords: this.clueRecords.size,
      storyInstances: this.storyInstances.size
    });
    
    try {
      const saved = localStorage.getItem(INSTANCE_STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        
        console.log('[InstanceCacheManager.loadFromLocalStorage] 📦 Data from localStorage:', {
          clueRecordsCount: state.clueRecords?.length || 0,
          clueIds: (state.clueRecords || []).map((r: any) => r[0]),
          storyInstancesCount: state.storyInstances?.length || 0
        });
        
        this.storyInstances = new Map(state.storyInstances || []);
        this.sceneInstances = new Map(state.sceneInstances || []);
        this.npcInstances = new Map(state.npcInstances || []);
        this.clueRecords = new Map(state.clueRecords || []);
        this.llmSceneNarratives = new Map(state.llmSceneNarratives || []);
        this.llmDialogueHistory = new Map(state.llmDialogueHistory || []);
        this.playerStatus = state.playerStatus || null;
        
        console.log('[InstanceCacheManager.loadFromLocalStorage] ✅ Loaded from localStorage');
        console.log('[InstanceCacheManager.loadFromLocalStorage] 📊 Map size AFTER load:', {
          clueRecords: this.clueRecords.size,
          storyInstances: this.storyInstances.size
        });
      } else {
        console.log('[InstanceCacheManager.loadFromLocalStorage] ⚠️ No saved data in localStorage');
      }
    } catch (error) {
      console.error('[InstanceCacheManager] ❌ Failed to load:', error);
    }
  }
  
  /**
   * 清除localStorage
   */
  static clearLocalStorage(): void {
    localStorage.removeItem(INSTANCE_STORAGE_KEY);
    console.log('[InstanceCacheManager] ✅ Cleared localStorage');
  }
  
  /**
   * 重置所有数据
   */
  static reset(): void {
    this.storyInstances.clear();
    this.sceneInstances.clear();
    this.npcInstances.clear();
    this.clueRecords.clear();
    this.llmSceneNarratives.clear();
    this.llmDialogueHistory.clear();
    this.clearLocalStorage();
    
    console.log('[InstanceCacheManager] ✅ Reset complete');
  }
  
  /**
   * 获取统计信息
   */
  static getStats() {
    return {
      storyInstances: this.storyInstances.size,
      sceneInstances: this.sceneInstances.size,
      npcInstances: this.npcInstances.size,
      clueRecords: this.clueRecords.size,
      llmNarratives: this.llmSceneNarratives.size,
      llmDialogues: this.llmDialogueHistory.size
    };
  }
  
  // ============================================
  // 玩家状态管理（从 PlayerServiceImpl 迁移）
  // ============================================
  
  private static playerStatus: PlayerStatusArea | null = null;
  
  /**
   * 初始化玩家状态
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static async initializePlayer(saveId?: string): Promise<void> {
    if (this.playerStatus) {
      console.log('[InstanceCacheManager] Player already initialized, skipping');
      return;
    }
    
    const playerDataAccess = DataAccessFactory.createPlayerDataAccess();
    
    try {
      this.playerStatus = await playerDataAccess.loadStatus(saveId);
      console.log('[InstanceCacheManager] Player initialized:', {
        location: this.playerStatus.current_location,
        vigor: `${this.playerStatus.vigor.value}/${this.playerStatus.vigor.max}`,
        clarity: `${this.playerStatus.clarity.value}/${this.playerStatus.clarity.max}`
      });
    } catch (error) {
      console.error('[InstanceCacheManager] Failed to initialize player:', error);
      // Fallback: 使用默认状态
      this.playerStatus = await playerDataAccess.getDefaultStatus();
    }
    
    this.saveToLocalStorage();
  }
  
  /**
   * 获取玩家状态（只读）
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static getPlayerStatus(): Readonly<PlayerStatusArea> {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized. Call initializePlayer() first.');
    }
    
    // 返回深拷贝，防止外部修改
    return JSON.parse(JSON.stringify(this.playerStatus));
  }
  
  /**
   * 更新体力
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static updateVigor(delta: number): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    const newValue = Math.max(
      0,
      Math.min(
        this.playerStatus.vigor.max,
        this.playerStatus.vigor.value + delta
      )
    );
    
    this.playerStatus.vigor.value = newValue;
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Vigor updated: ${delta > 0 ? '+' : ''}${delta} → ${newValue}`);
  }
  
  /**
   * 更新心力
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static updateClarity(delta: number): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    const newValue = Math.max(
      0,
      Math.min(
        this.playerStatus.clarity.max,
        this.playerStatus.clarity.value + delta
      )
    );
    
    this.playerStatus.clarity.value = newValue;
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Clarity updated: ${delta > 0 ? '+' : ''}${delta} → ${newValue}`);
  }
  
  /**
   * 设置体力最大值
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static setVigorMax(max: number): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    this.playerStatus.vigor.max = Math.max(1, max);
    // 当前值不超过新最大值
    this.playerStatus.vigor.value = Math.min(
      this.playerStatus.vigor.value,
      max
    );
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Vigor max set to: ${max}`);
  }
  
  /**
   * 设置心力最大值
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static setClarityMax(max: number): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    this.playerStatus.clarity.max = Math.max(1, max);
    // 当前值不超过新最大值
    this.playerStatus.clarity.value = Math.min(
      this.playerStatus.clarity.value,
      max
    );
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Clarity max set to: ${max}`);
  }
  
  /**
   * 更新当前位置
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static updatePlayerLocation(location: string): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    this.playerStatus.current_location = location;
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Location updated: ${location}`);
  }
  
  /**
   * 更新游戏时间
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static updateWorldTime(time: string): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    this.playerStatus.world_time = time;
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Time updated: ${time}`);
  }
  
  /**
   * 更新财力等级
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static updateFinancialPower(level: string): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    this.playerStatus.financial_power = level as any;
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Financial power updated: ${level}`);
  }
  
  /**
   * 更新信用值
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static updateCredit(delta: number): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    const newValue = Math.max(
      0,
      Math.min(
        100,
        this.playerStatus.credit.value + delta
      )
    );
    
    this.playerStatus.credit.value = newValue;
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Credit updated: ${delta > 0 ? '+' : ''}${delta} → ${newValue}`);
  }
  
  /**
   * 添加状态效果
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static addPlayerEffect(effect: StatusEffect): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    // 移除同名效果（如果存在）
    this.removePlayerEffect(effect.name);
    
    // 添加新效果
    this.playerStatus.active_effects.push({ ...effect });
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Effect added: ${effect.name}`);
  }
  
  /**
   * 移除状态效果
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static removePlayerEffect(effectName: string): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    const index = this.playerStatus.active_effects.findIndex(
      e => e.name === effectName
    );
    
    if (index !== -1) {
      this.playerStatus.active_effects.splice(index, 1);
      this.saveToLocalStorage();
      console.log(`[InstanceCacheManager] Effect removed: ${effectName}`);
    }
  }
  
  /**
   * 清除所有状态效果
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static clearPlayerEffects(): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    const count = this.playerStatus.active_effects.length;
    this.playerStatus.active_effects = [];
    this.saveToLocalStorage();
    
    console.log(`[InstanceCacheManager] Cleared ${count} effects`);
  }
  
  /**
   * 检查是否有指定效果
   * 🔥 从 PlayerServiceImpl 迁移
   */
  static hasPlayerEffect(effectName: string): boolean {
    if (!this.playerStatus) {
      return false;
    }
    return this.playerStatus.active_effects.some(e => e.name === effectName);
  }
  
  /**
   * 从场景快照同步玩家状态
   * 🔥 从 PlayerServiceImpl 迁移
   * @note 进入故事时调用
   */
  static syncPlayerFromScenario(scenario: { player_status_area: PlayerStatusArea }): void {
    if (!this.playerStatus) {
      throw new Error('[InstanceCacheManager] Player not initialized');
    }
    
    // 深拷贝场景中的玩家状态
    this.playerStatus = JSON.parse(
      JSON.stringify(scenario.player_status_area)
    );
    this.saveToLocalStorage();
    
    console.log('[InstanceCacheManager] Synced player from scenario:', {
      location: this.playerStatus.current_location,
      time: this.playerStatus.world_time
    });
  }
}