/**
 * Clue Service Implementation
 * 
 * 线索服务实现
 * 负责线索的提取、追踪和收件箱管理
 * 
 * @note 使用DataAccess接口，Demo阶段用Mock实现，上线后切换为API实现
 * ✅ Phase 1: 重构为使用 CacheManager（唯一数据源）
 */

import type { 
  IClueService, 
  ClueData, 
  TrackedStoryData, 
  ClueStatus,
  IClueDataAccess,
  IStoryDataAccess
} from '../../../types';
import type { StateManager } from '../../core/StateManager';
import { CacheManager } from '../../cache/CacheManager';  // ✅ Phase 1: 导入 CacheManager
import { InstanceCacheManager } from '../../cache/InstanceCacheManager';  // 🔥 导入 InstanceCacheManager
import { StoryService } from '../business/StoryService';  // 🔥 导入 StoryService（用于完成故事实例）

/**
 * Demo阶段默认玩家ID
 */
const DEFAULT_PLAYER_ID = 'demo-player';

/**
 * 线索服务实现类
 * 
 * 通过依赖注入使用DataAccess接口
 * 
 * Phase 2 扩展：
 * - ✅ 移除 trackedStoriesCache，使用 StateManager 作为唯一真实来源
 * - 新增 activeClueId 标记当前活跃的故事
 * - 实现会话状态管理方法
 */
export class ClueServiceImpl implements IClueService {
  private initialized = false;
  
  // ========== 移除独立缓存，使用 StateManager ==========
  
  /**
   * 当前活跃的线索ID（正在玩的故事）
   */
  private activeClueId: string | null = null;
  
  /**
   * 构造函数 - 依赖注入
   * @param clueDataAccess 线索数据访问接口
   * @param storyDataAccess 故事数据访问接口
   * @param stateManager 状态管理器（唯一真实来源）
   */
  constructor(
    private clueDataAccess: IClueDataAccess,
    private storyDataAccess: IStoryDataAccess,
    private stateManager: StateManager
  ) {}
  
  /**
   * 初始化线索数据（延迟加载）
   * @note 通过DataAccess加载线索注册表
   */
  private async initializeClues(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      // ✅ 使用DataAccess获取所有线索
      const clues = await this.clueDataAccess.getAll();
      
      if (clues && Array.isArray(clues)) {
        clues.forEach(clue => {
          CacheManager.setClue(clue.clue_id, { ...clue });
        });
        this.initialized = true;
        console.log(`[ClueService] Initialized with ${clues.length} clues via DataAccess`);
      }
    } catch (error) {
      console.error('[ClueService] Failed to load clue registry:', error);
    }
  }
  
  /**
   * 注册线索数据
   * @param clueData 线索数据
   * @note Demo功能：手动注册线索到注册表
   */
  registerClue(clueData: ClueData): void {
    CacheManager.setClue(clueData.clue_id, { ...clueData });
    console.log(`[ClueService] Registered clue: ${clueData.clue_id}`);
  }
  
  /**
   * 从消息中提取线索
   * 
   * ✅ Phase 1: 重构使用 CacheManager
   * 🔥 Phase 3: 同步到 InstanceCacheManager
   * 
   * @param messageId 消息ID
   * @param clueId 线索ID
   * @returns 提取的线索数据
   */
  async extractClue(messageId: string, clueId: string): Promise<ClueData> {
    // 确保已初始化
    await this.initializeClues();
    
    // ✅ 从 CacheManager 获取线索静态数据
    const clue = CacheManager.getClue(clueId);
    
    if (!clue) {
      // 如果注册表中没有，通过DataAccess加载
      const clueFromData = await this.clueDataAccess.findById(clueId);
      if (!clueFromData) {
        throw new Error(`[ClueService] Clue not found: ${clueId}`);
      }
    }
    
    // ✅ 添加到 CacheManager 的收件箱（会自动去重）
    CacheManager.addClueToInbox(DEFAULT_PLAYER_ID, clueId);
    
    // 🔥 同步到 InstanceCacheManager（新架构）
    const existingRecord = InstanceCacheManager.getClueRecord(clueId);
    if (!existingRecord && clue) {
      const clueRecord = {
        clue_id: clueId,
        player_id: DEFAULT_PLAYER_ID,
        story_template_id: clue.story_id,
        story_instance_id: null, // 初始未追踪
        title: clue.title,
        description: clue.summary,
        source: '世界信息流',
        status: 'unread' as const,
        received_at: Date.now(),
        read_at: null,
        tracked_at: null,
        completed_at: null
      };
      
      InstanceCacheManager.upsertClueRecord(clueRecord);
      console.log(`[ClueService] 🔥 Synced to InstanceCacheManager: ${clueId}`);
    }
    
    // ✅ 获取带状态的线索数据（JOIN 查询）
    const cluesWithStatus = CacheManager.getClueInboxWithStatus(DEFAULT_PLAYER_ID);
    const extractedClue = cluesWithStatus.find(c => c.clue_id === clueId);
    
    if (!extractedClue) {
      throw new Error(`[ClueService] Failed to extract clue: ${clueId}`);
    }
    
    console.log(`[ClueService] Clue extracted: ${clueId} from message: ${messageId}`);
    console.log(`[ClueService] Inbox now contains ${cluesWithStatus.length} clue(s)`);
    
    return extractedClue as ClueData;
  }
  
  /**
   * 追踪线索（开启故事）
   * 
   * ✅ Phase 1: 重构使用 CacheManager
   * 
   * @param clueId 线索ID
   * @returns 故事数据和入口信息（完整版 - 沉浸式任务简报）
   */
  async trackClue(clueId: string): Promise<TrackedStoryData> {
    // ✅ 从 CacheManager 获取收件箱中的线索
    const cluesInInbox = CacheManager.getClueInboxWithStatus(DEFAULT_PLAYER_ID);
    const clue = cluesInInbox.find(c => c.clue_id === clueId);
    
    if (!clue) {
      throw new Error(`[ClueService] Clue not in inbox: ${clueId}`);
    }
    
    // 检查是否已追踪（通过 StateManager）
    const existingStory = this.stateManager.getTrackedStory(clueId);
    if (existingStory) {
      console.log(`[ClueService] Story already tracked, returning existing data: ${clueId}`);
      return existingStory;
    }
    
    // ✅ 新架构：追踪线索只更新 InstanceCacheManager 和 StateManager
    // ❌ 旧架构已移除：CacheManager.trackStory()
    
    // ✅ 异步加载故事数据
    const baseStoryData = await this.getStoryPackage(clue.story_id);
    
    // ========== 构建完整的 TrackedStoryData ==========
    const trackedStory: TrackedStoryData = {
      ...baseStoryData,
      
      // ========== 确保 entry_point_action 存在 ==========
      entry_point_action: baseStoryData.entry_point_action || {
        label: '进入故事',
        target_scene_id: baseStoryData.scene_sequence[0]?.scene_id || ''
      },
      
      // ========== 新增：线索链和进度追踪 ==========
      entry_clue_id: clueId,
      discovered_clues: [clueId],
      progress: {
        current_scene_index: 0,
        completed_scenes: [],
        total_scenes: baseStoryData.scene_sequence.length
      },
      
      // ========== 新增：活跃状态 ==========
      is_active: false,  // ⚠️ 初始不活跃，需要通过 enterStory() 激活
      tracked_at: Date.now(),
      updated_at: Date.now()
    };
    
    // 保存到 StateManager（唯一真实来源）
    this.stateManager.setTrackedStory(clueId, trackedStory);
    
    console.log(`[ClueService] Clue tracked: ${clueId} -> Story: ${clue.story_id}`);
    console.log(`[ClueService] Story package cached with ${trackedStory.scene_sequence.length} scenes`);
    
    return trackedStory;
  }
  
  /**
   * 获取故事包（异步方法，通过DataAccess）
   * @param storyId 故事ID
   * @returns 基础的故事数据包（不含活跃状态）
   * @note ✅ 使用StoryDataAccess获取故事数据
   * @note Phase 2: 返回基础数据，由 trackClue() 补充完整字段
   */
  private async getStoryPackage(storyId: string): Promise<Omit<TrackedStoryData, 'entry_clue_id' | 'is_active' | 'tracked_at' | 'updated_at'>> {
    // ✅ 使用DataAccess加载故事
    const story = await this.storyDataAccess.getStoryById(storyId);
    
    if (!story) {
      console.warn(`[ClueService] Story not found: ${storyId}`);
      throw new Error(`Story not found: ${storyId}`);
    }
    
    console.log(`[ClueService] Loaded story via DataAccess: ${story.meta.title}`);
    
    // 构建scene_sequence
    const sceneSequence = story.meta.scenes.map((sceneId, index) => {
      const sceneData = story.scenes[sceneId];
      return {
        scene_id: sceneId,
        title: sceneData.title,
        status: (index === 0 ? 'unlocked' : 'locked') as 'unlocked' | 'locked'
      };
    });
    
    return {
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      status: 'tracking',
      scene_sequence: sceneSequence,
      entry_point_action: {
        label: '进入故事',
        target_scene_id: story.meta.scenes[0]
      },
      // ========== 可选字段保持兼容 ==========
      discovered_clues: [],
      progress: {
        current_scene_index: 0,
        completed_scenes: [],
        total_scenes: sceneSequence.length
      }
    };
  }
  
  /**
   * 获取收件箱中的所有线索
   * 
   * ✅ Phase 1: 重构使用 CacheManager
   * - 从 CacheManager 执行 JOIN 查询
   * - status 从 player_story_progress 派生
   * 
   * @returns 线索数组（带状态）
   */
  async getClueInbox(): Promise<ClueData[]> {
    // ✅ 使用 CacheManager 的 JOIN 查询方法
    const cluesWithStatus = CacheManager.getClueInboxWithStatus(DEFAULT_PLAYER_ID);
    
    console.log(`[ClueService] Fetched inbox: ${cluesWithStatus.length} clue(s)`);
    
    // 转换为 ClueData 类型
    return cluesWithStatus as ClueData[];
  }
  
  /**
   * 获取指定状态的线索
   * 
   * ✅ Phase 1: 重构使用 CacheManager
   * 
   * @param status 线索状态
   * @returns 符合状态的线索数组
   */
  async getCluesByStatus(status: ClueStatus): Promise<ClueData[]> {
    // ✅ 从 CacheManager 获取所有线索，然后过滤
    const allClues = CacheManager.getClueInboxWithStatus(DEFAULT_PLAYER_ID);
    const filtered = allClues.filter(clue => clue.status === status);
    
    console.log(`[ClueService] Fetched ${status} clues: ${filtered.length}`);
    
    return filtered as ClueData[];
  }
  
  /**
   * 更新线索状态
   * 
   * ❌ Phase 1: 此方法已废弃
   * - status 现在从 player_story_progress 派生，不应手动更新
   * - 应该通过 trackClue() 和 markStoryCompleted() 来改变状态
   * 
   * @param clueId 线索ID
   * @param status 新状态
   * @deprecated 不再支持手动更新线索状态
   */
  async updateClueStatus(clueId: string, status: ClueStatus): Promise<void> {
    console.warn(`[ClueService] updateClueStatus() is deprecated - status is now derived from story progress`);
    console.warn(`[ClueService] Use trackClue() or markStoryCompleted() instead`);
  }
  
  // ========== Phase 2 新增方法 ==========
  
  /**
   * 通过线索ID获取追踪的故事数据
   * @param clueId 线索ID
   * @returns 追踪的故事数据，如果未追踪则返回null
   */
  async getTrackedStoryByClue(clueId: string): Promise<TrackedStoryData | null> {
    // 从 StateManager 读取（唯一真实来源）
    return this.stateManager.getTrackedStory(clueId);
  }
  
  /**
   * 设置活跃故事（当前正在玩的故事）
   * @param clueId 线索ID
   * @note 同时会将其他故事的is_active设为false
   */
  async setActiveStory(clueId: string): Promise<void> {
    // 1. 获取目标故事（从 StateManager）
    const targetStory = this.stateManager.getTrackedStory(clueId);
    if (!targetStory) {
      throw new Error(`[ClueService] Story for clue ${clueId} is not tracked`);
    }
    
    // 2. 清除所有其他故事的活跃状态（通过 StateManager）
    const allStories = this.stateManager.getTrackedStories();
    allStories.forEach((story) => {
      if (story.entry_clue_id !== clueId) {
        this.stateManager.updateTrackedStory(story.entry_clue_id, { is_active: false });
      }
    });
    
    // 3. 设置目标故事为活跃
    this.stateManager.updateTrackedStory(clueId, { is_active: true });
    
    // 4. 记录活跃线索ID
    this.activeClueId = clueId;
    
    console.log(`[ClueService] Set active story: ${targetStory.title} (clue: ${clueId})`);
  }
  
  /**
   * 清除所有活跃故事标记
   * @note 用于退出所有故事，返回空闲状态
   */
  async clearActiveStory(): Promise<void> {
    // 清除所有故事的活跃标记（通过 StateManager）
    const allStories = this.stateManager.getTrackedStories();
    allStories.forEach((story) => {
      this.stateManager.updateTrackedStory(story.entry_clue_id, { is_active: false });
    });
    
    // 清空活跃线索ID
    this.activeClueId = null;
    
    console.log('[ClueService] Cleared all active stories');
  }
  
  /**
   * 获取当前活跃的故事
   * @returns 活跃的故事数据，如果没有则返回null
   */
  async getActiveStory(): Promise<TrackedStoryData | null> {
    if (!this.activeClueId) {
      return null;
    }
    
    // 从 StateManager 读取
    return this.stateManager.getTrackedStory(this.activeClueId);
  }
  
  /**
   * 获取所有追踪的故事
   * @returns 所有追踪的故事列表（包括 tracking 和 completed 状态）
   * @note ✅ 修复：不再过滤掉已完成的故事
   */
  async getTrackedStories(): Promise<TrackedStoryData[]> {
    console.log('[ClueServiceImpl] 🔍 getTrackedStories() called');
    
    // 从 StateManager 读取所有追踪的故事
    const stories = this.stateManager.getTrackedStories();
    
    console.log(`[ClueServiceImpl] 🔍 getTrackedStories() got ${stories.length} stories from StateManager`);
    stories.forEach((story, idx) => {
      console.log(`  [${idx}] ${story.title} - Reference: ${story}`);
      console.log(`      current_scene_index: ${story.progress?.current_scene_index}`);
      console.log(`      completed_scenes: [${story.progress?.completed_scenes?.join(', ')}]`);
      console.log(`      scene_sequence[0].status: ${story.scene_sequence[0]?.status}`);
    });
    
    return stories;
  }
  
  /**
   * 标记场景为已完成
   * @param clueId 触发该故事的线索ID
   * @param sceneId 已完成的场景ID
   */
  async markSceneCompleted(clueId: string, sceneId: string): Promise<void> {
    console.log(`[ClueService] Marking scene completed: ${sceneId} in clue ${clueId}`);
    
    // 通过 StateManager 更新状态
    this.stateManager.markSceneCompleted(clueId, sceneId);
    
    console.log(`[ClueService] ✅ Scene completion recorded`);
  }
  
  /**
   * 标记故事为已完成
   * @param clueId 触发该故事的线索ID
   * @param completionClueId 可选：完成记录ID（仅用于追踪，不会提取到收件箱）
   * @note ✅ 修复：completionClueId 不再自动提取到收件箱
   * @note completionClueId 仅作为故事完成的追踪记录，不是需要解锁的线索
   * @note ✅ Phase 1: 同步更新 CacheManager、StateManager 和 InstanceCacheManager
   */
  async markStoryCompleted(clueId: string, completionClueId?: string): Promise<void> {
    console.log(`[ClueService] Marking story completed for clue: ${clueId}`);
    
    if (completionClueId) {
      console.log(`[ClueService] 📝 Completion record ID: ${completionClueId} (tracking only, not extracted)`);
    }
    
    // ✅ Phase 1: 同时更新 CacheManager、StateManager 和 InstanceCacheManager
    
    // 1. ✅ 新架构：更新 InstanceCacheManager 中的 ClueRecord 状态
    InstanceCacheManager.updateClueRecord(clueId, {
      status: 'completed',
      completed_at: Date.now()
    });
    
    // 2. ✅ 新架构：更新 StateManager（React 状态同步）
    this.stateManager.markStoryCompleted(clueId, completionClueId);
    
    // 3. ⚠️ 旧架构（向后兼容）：���新 CacheManager 的 player_story_progress 表
    CacheManager.completeStory(DEFAULT_PLAYER_ID, clueId);
    
    // 4. 🔥 BUG FIX: 同步更新 StoryInstance
    const clueRecord = InstanceCacheManager.getClueRecord(clueId);
    if (clueRecord?.story_instance_id) {
      console.log(`[ClueService] 🔗 Also completing story instance: ${clueRecord.story_instance_id}`);
      StoryService.completeStory(clueRecord.story_instance_id);
    }
    
    console.log(`[ClueService] ✅ Story completion recorded in all data layers`);
  }
  
  // ========== 调试和测试方法 ==========
  
  /**
   * 清空收件箱（测试用）
   * @note Demo功能：仅用于测试和开发
   */
  clearInbox(): void {
    CacheManager.clearInbox();
    console.log('[ClueService] Inbox cleared');
  }
  
  /**
   * 获取统计信息（调试用）
   * @note Demo功能：仅用于调试
   */
  getStats(): {
    registeredClues: number;
    inboxClues: number;
    untrackedClues: number;
    trackingClues: number;
    completedClues: number;
  } {
    const inbox = CacheManager.getInboxClues();
    return {
      registeredClues: CacheManager.getClueRegistrySize(),
      inboxClues: inbox.length,
      untrackedClues: inbox.filter(c => c.status === 'untracked').length,
      trackingClues: inbox.filter(c => c.status === 'tracking').length,
      completedClues: inbox.filter(c => c.status === 'completed').length,
    };
  }
}