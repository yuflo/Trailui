/**
 * ClueService - 线索业务服务（静态方法）
 * 
 * Phase 6.1: 从 ClueServiceImpl 完全迁移到 business 层
 * - 完全无状态
 * - 所有方法都是静态方法
 * - 通过工厂模式获取依赖
 */

import { InstanceCacheManager } from '../../cache/InstanceCacheManager';
import { DataAccessFactory } from '../../data-access/DataAccessFactory';
import { StateManager } from '../../core/StateManager';  // 🔥 新增：导入 StateManager
import { StoryService } from './StoryService';  // 🔥 新增：导入 StoryService
import type { ClueRecord } from '../../../types/instance.types';
import type { StoryConfig, ClueData, ClueStatus, TrackedStoryData } from '../../../types';  // 🔥 新增：TrackedStoryData

/**
 * Demo阶段默认玩家ID
 */
const DEFAULT_PLAYER_ID = 'demo-player';

/**
 * 线索服务
 */
export class ClueService {
  // ============================================
  // 核心线索管理方法
  // ============================================
  
  /**
   * 从消息中提取线索
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @param messageId 消息ID
   * @param clueId 线索ID
   * @returns 提取的线索数据
   */
  static async extractClue(messageId: string, clueId: string): Promise<ClueData> {
    // 获取依赖
    const clueDataAccess = DataAccessFactory.createClueDataAccess();
    
    // 1. 从 DataAccess 获取线索静态数据
    const clue = await clueDataAccess.findById(clueId);
    
    if (!clue) {
      throw new Error(`[ClueService] Clue not found: ${clueId}`);
    }
    
    // 2. 检查是否已在收件箱
    const existingRecord = InstanceCacheManager.getClueRecord(clueId);
    if (existingRecord) {
      console.log(`[ClueService] Clue already in inbox: ${clueId}`);
      return {
        ...clue,
        status: existingRecord.status,
        extracted_at: existingRecord.received_at
      };
    }
    
    // 3. 创建线索记录（添加到收件箱）
    const clueRecord: ClueRecord = {
      clue_id: clueId,
      player_id: DEFAULT_PLAYER_ID,
      story_template_id: clue.story_id,
      story_instance_id: null,
      title: clue.title,
      description: clue.summary,
      source: '世界信息流',
      status: 'unread',
      received_at: Date.now(),
      read_at: null,
      tracked_at: null,
      completed_at: null
    };
    
    InstanceCacheManager.upsertClueRecord(clueRecord);
    
    console.log(`[ClueService] Clue extracted: ${clueId} from message: ${messageId}`);
    
    // 4. 返回带状态的线索数据
    return {
      ...clue,
      status: 'unread',
      extracted_at: clueRecord.received_at
    };
  }
  
  /**
   * 获取收件箱中的所有线索
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @returns 线索数组（带状态）
   */
  static async getClueInbox(): Promise<ClueData[]> {
    // 1. 从 InstanceCacheManager 获取所有线索记录
    const clueRecords = InstanceCacheManager.getPlayerClueRecords(DEFAULT_PLAYER_ID);
    
    // 2. 加载每个线索的静态数据
    const clueDataAccess = DataAccessFactory.createClueDataAccess();
    const result: ClueData[] = [];
    for (const record of clueRecords) {
      const clueStatic = await clueDataAccess.findById(record.clue_id);
      if (clueStatic) {
        result.push({
          ...clueStatic,
          status: record.status,
          extracted_at: record.received_at
        });
      }
    }
    
    console.log(`[ClueService] Fetched inbox: ${result.length} clue(s)`);
    return result;
  }
  
  /**
   * 获取指定状态的线索
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @param status 线索状态
   * @returns 符合状态的线索数组
   */
  static async getCluesByStatus(status: ClueStatus): Promise<ClueData[]> {
    // 1. 从 InstanceCacheManager 筛选
    const clueRecords = InstanceCacheManager.getPlayerClueRecords(DEFAULT_PLAYER_ID)
      .filter(record => record.status === status);
    
    // 2. 加载静态数据
    const clueDataAccess = DataAccessFactory.createClueDataAccess();
    const result: ClueData[] = [];
    for (const record of clueRecords) {
      const clueStatic = await clueDataAccess.findById(record.clue_id);
      if (clueStatic) {
        result.push({
          ...clueStatic,
          status: record.status,
          extracted_at: record.received_at
        });
      }
    }
    
    console.log(`[ClueService] Fetched ${status} clues: ${result.length}`);
    return result;
  }
  
  /**
   * 更新线索状态
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @param clueId 线索ID
   * @param status 新状态
   */
  static async updateClueStatus(clueId: string, status: ClueStatus): Promise<void> {
    console.log(`[ClueService.updateClueStatus] Updating ${clueId} to ${status}`);
    
    const record = InstanceCacheManager.getClueRecord(clueId);
    if (!record) {
      throw new Error(`[ClueService] Clue not found: ${clueId}`);
    }
    
    // 根据状态更新相应的时间戳
    const updates: Partial<ClueRecord> = { status };
    
    if (status === 'read' && !record.read_at) {
      updates.read_at = Date.now();
    } else if (status === 'tracking' && !record.tracked_at) {
      updates.tracked_at = Date.now();
    } else if (status === 'completed' && !record.completed_at) {
      updates.completed_at = Date.now();
    }
    
    InstanceCacheManager.updateClueRecord(clueId, updates);
    console.log(`[ClueService] ✅ Updated clue status: ${clueId} -> ${status}`);
  }
  
  /**
   * 清空收件箱（测试用）
   * 🔥 从 ClueServiceImpl 迁移
   */
  static clearInbox(): void {
    const clueRecords = InstanceCacheManager.getPlayerClueRecords(DEFAULT_PLAYER_ID);
    clueRecords.forEach(record => {
      InstanceCacheManager.deleteClueRecord(record.clue_id);
    });
    console.log('[ClueService] Inbox cleared');
  }
  
  /**
   * 获取统计信息（调试用）
   * 🔥 从 ClueServiceImpl 迁移
   */
  static async getStats(): Promise<{
    registeredClues: number;
    inboxClues: number;
    untrackedClues: number;
    trackingClues: number;
    completedClues: number;
  }> {
    // 1. 从 InstanceCacheManager 获取收件箱数据
    const inbox = InstanceCacheManager.getPlayerClueRecords(DEFAULT_PLAYER_ID);
    
    // 2. 从 DataAccess 获取注册表大小
    const clueDataAccess = DataAccessFactory.createClueDataAccess();
    const allClues = await clueDataAccess.getAll();
    
    return {
      registeredClues: allClues?.length || 0,
      inboxClues: inbox.length,
      untrackedClues: inbox.filter(c => c.status === 'unread').length,
      trackingClues: inbox.filter(c => c.status === 'tracking').length,
      completedClues: inbox.filter(c => c.status === 'completed').length,
    };
  }
  
  /**
   * 追踪线索（开启故事）
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @param clueId 线索ID
   * @returns 故事数据和入口信息（完整版 - 沉浸式任务简报）
   */
  static async trackClue(clueId: string): Promise<TrackedStoryData> {
    const playerId = DEFAULT_PLAYER_ID;  // 🔥 使用默认玩家ID
    
    // 获取依赖
    const clueDataAccess = DataAccessFactory.createClueDataAccess();
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const stateManager = StateManager.getInstance();
    
    // 1. 从 InstanceCacheManager 获取线索记录
    const clueRecord = InstanceCacheManager.getClueRecord(clueId);
    if (!clueRecord) {
      throw new Error(`[ClueService] Clue not in inbox: ${clueId}`);
    }
    
    // 2. 从 DataAccess 获取静态数据
    const clueStatic = await clueDataAccess.findById(clueId);
    if (!clueStatic) {
      throw new Error(`[ClueService] Clue not found: ${clueId}`);
    }
    
    // 3. 合并数据（用于后续处理）
    const clue = {
      ...clueStatic,
      status: clueRecord.status,
      extracted_at: clueRecord.received_at
    };
    
    // 4. 检查是否已追踪（通过 StateManager）
    const existingStory = stateManager.getTrackedStory(clueId);
    if (existingStory) {
      console.log(`[ClueService] Story already tracked, returning existing data: ${clueId}`);
      return existingStory;
    }
    
    // 5. 异步加载故事数据
    const baseStoryData = await this.getStoryPackage(clue.story_id, storyDataAccess);
    
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
    
    // 6. 保存到 StateManager（唯一真实来源）
    stateManager.setTrackedStory(clueId, trackedStory);
    
    // 7. 🔥 创建故事实例
    const story = await storyDataAccess.getStoryById(clueRecord.story_template_id);
    if (story) {
      const storyTemplate: StoryConfig = {
        story_id: story.meta.story_id,
        title: story.meta.title,
        description: story.meta.description,
        genre: [],
        difficulty: 'medium',
        scene_sequence: story.meta.scenes,
        npc_ids: [],
        initial_scenario_id: story.meta.scenes[0] || 'scene-a',
        visual_archetype: 'neon_noir',
        visualOverrides: undefined
      };
      
      const storyInstanceId = InstanceCacheManager.createStoryInstance(
        playerId,
        clueId,
        storyTemplate
      );
      
      // 更新线索记录
      InstanceCacheManager.updateClueRecord(clueId, {
        story_instance_id: storyInstanceId,
        status: 'tracking',
        tracked_at: Date.now()
      });
    }
    
    console.log(`[ClueService] Clue tracked: ${clueId} -> Story: ${clue.story_id}`);
    console.log(`[ClueService] Story package cached with ${trackedStory.scene_sequence.length} scenes`);
    
    return trackedStory;
  }
  
  /**
   * 通过线索ID获取追踪的故事数据
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @param clueId 线索ID
   * @returns 追踪的故事数据，如果未追踪则返回 null
   */
  static async getTrackedStoryByClue(clueId: string): Promise<TrackedStoryData | null> {
    const stateManager = StateManager.getInstance();
    console.log(`[ClueService.getTrackedStoryByClue] Fetching story for clue: ${clueId}`);
    const story = stateManager.getTrackedStory(clueId);
    console.log(`[ClueService.getTrackedStoryByClue] ${story ? '✅ Found story: ' + story.title : '⚠️ Story not found'}`);
    return story;
  }
  
  /**
   * 标记场景为已完成
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @note ✅ 同步更新 StateManager 和 InstanceCacheManager
   * @param clueId 触发该故事的线索ID
   * @param sceneId 已完成的场景ID
   */
  static async markSceneCompleted(clueId: string, sceneId: string): Promise<void> {
    const stateManager = StateManager.getInstance();
    console.log(`[ClueService.markSceneCompleted] Marking scene ${sceneId} as completed for clue: ${clueId}`);
    
    const story = stateManager.getTrackedStory(clueId);
    if (!story) {
      console.warn(`[ClueService] Story not found for clue: ${clueId}`);
      return;
    }
    
    // 检查场景是否已完成
    if (story.progress.completed_scenes.includes(sceneId)) {
      console.log(`[ClueService] Scene already completed: ${sceneId}`);
      return;
    }
    
    // 1. ✅ 更新 StateManager 中的 TrackedStory（进度追踪）
    const updatedStory: TrackedStoryData = {
      ...story,
      progress: {
        ...story.progress,
        completed_scenes: [...story.progress.completed_scenes, sceneId],
        current_scene_index: story.progress.current_scene_index + 1
      },
      updated_at: Date.now()
    };
    
    stateManager.setTrackedStory(clueId, updatedStory);
    console.log(`[ClueService] ✅ Scene marked as completed: ${sceneId}`);
    
    // 2. ✅ 同步更新 InstanceCacheManager 中的 StoryInstance（持久化）
    const clueRecord = InstanceCacheManager.getClueRecord(clueId);
    if (clueRecord?.story_instance_id) {
      console.log(`[ClueService.markSceneCompleted] 🔄 Syncing to StoryInstance: ${clueRecord.story_instance_id}`);
      
      // 调用 StoryService 更新 StoryInstance
      StoryService.completeScene(clueRecord.story_instance_id, sceneId);
      
      console.log(`[ClueService.markSceneCompleted] ✅ StoryInstance synced with progress: ${updatedStory.progress.completed_scenes.length}/${story.scene_sequence.length} scenes`);
    } else {
      console.warn(`[ClueService.markSceneCompleted] ⚠️ No story_instance_id found for clue: ${clueId}`);
    }
  }
  
  /**
   * 标记故事为已完成
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @param clueId 触发该故事的线索ID
   * @param completionClueId 可选：完成记录ID（仅用于追踪，不会提取到收件箱）
   */
  static async markStoryCompleted(clueId: string, completionClueId?: string): Promise<void> {
    const stateManager = StateManager.getInstance();
    console.log(`[ClueService] Marking story completed for clue: ${clueId}`);
    
    if (completionClueId) {
      console.log(`[ClueService] 📝 Completion record ID: ${completionClueId} (tracking only, not extracted)`);
    }
    
    // 1. ✅ 更新 InstanceCacheManager 中的 ClueRecord 状态
    InstanceCacheManager.updateClueRecord(clueId, {
      status: 'completed',
      completed_at: Date.now()
    });
    
    // 2. ✅ 更新 StateManager（React 状态同步）
    stateManager.markStoryCompleted(clueId, completionClueId);
    
    // 3. 🔥 BUG FIX: 同步更新 StoryInstance
    const clueRecord = InstanceCacheManager.getClueRecord(clueId);
    if (clueRecord?.story_instance_id) {
      console.log(`[ClueService] 🔗 Also completing story instance: ${clueRecord.story_instance_id}`);
      StoryService.completeStory(clueRecord.story_instance_id);
    }
    
    console.log(`[ClueService] ✅ Story completion recorded`);
  }
  
  /**
   * 获取所有追踪中的故事
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @returns 追踪中的故事列表
   */
  static async getTrackedStories(): Promise<TrackedStoryData[]> {
    const stateManager = StateManager.getInstance();
    console.log('[ClueService.getTrackedStories] 🔍 Fetching tracked stories from StateManager');
    const stories = stateManager.getTrackedStories();
    console.log(`[ClueService.getTrackedStories] ✅ Found ${stories.length} tracked stories`);
    return stories;
  }
  
  /**
   * 获取当前活跃的故事
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @returns 活跃的故事数据，如果没有则返回 null
   */
  static async getActiveStory(): Promise<TrackedStoryData | null> {
    const stateManager = StateManager.getInstance();
    console.log('[ClueService.getActiveStory] 🔍 Fetching active story from StateManager');
    const activeStory = stateManager.getActiveStory();
    console.log(`[ClueService.getActiveStory] ${activeStory ? '✅ Found active story: ' + activeStory.title : '⚠️ No active story'}`);
    return activeStory;
  }
  
  /**
   * 设置活跃故事（当前正在玩的故事）
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @param clueId 线索ID
   * @note 同时会将其他故事的 is_active 设为 false
   */
  static async setActiveStory(clueId: string): Promise<void> {
    const stateManager = StateManager.getInstance();
    console.log(`[ClueService.setActiveStory] 🎯 Setting active story for clue: ${clueId}`);
    
    // 获取所有追踪的故事
    const trackedStories = stateManager.getTrackedStories();
    
    // 将所有故事设置为非活跃
    for (const story of trackedStories) {
      if (story.is_active) {
        const updatedStory = {
          ...story,
          is_active: false,
          updated_at: Date.now()
        };
        stateManager.setTrackedStory(story.entry_clue_id, updatedStory);
      }
    }
    
    // 将目标故事设置为活跃
    const targetStory = trackedStories.find(s => s.entry_clue_id === clueId);
    if (targetStory) {
      const updatedStory = {
        ...targetStory,
        is_active: true,
        updated_at: Date.now()
      };
      stateManager.setTrackedStory(clueId, updatedStory);
      console.log(`[ClueService.setActiveStory] ✅ Story set as active: ${targetStory.title}`);
    } else {
      console.warn(`[ClueService.setActiveStory] ⚠️ Story not found for clue: ${clueId}`);
    }
  }
  
  /**
   * 清除当前活跃的故事
   * 🔥 从 ClueServiceImpl 迁移
   * 
   * @note 用于退出所有故事，返回空闲状态
   */
  static async clearActiveStory(): Promise<void> {
    const stateManager = StateManager.getInstance();
    console.log('[ClueService.clearActiveStory] 🔄 Clearing active story...');
    
    // 获取所有追踪的故事
    const trackedStories = stateManager.getTrackedStories();
    
    // 将所有故事设置为非活跃状态
    for (const story of trackedStories) {
      if (story.is_active) {
        const updatedStory = {
          ...story,
          is_active: false,
          updated_at: Date.now()
        };
        stateManager.setTrackedStory(story.entry_clue_id, updatedStory);
      }
    }
    
    console.log('[ClueService.clearActiveStory] ✅ Active story cleared');
  }
  
  // ============================================
  // 辅助私有方法
  // ============================================
  
  /**
   * 获取故事包（从 StoryDataAccess 加载）
   * 🔥 从 ClueServiceImpl 迁移
   */
  private static async getStoryPackage(storyId: string, storyDataAccess: any): Promise<TrackedStoryData> {
    // 从 StoryDataAccess 获取完整故事数据
    const story = await storyDataAccess.getStoryById(storyId);
    
    if (!story) {
      throw new Error(`[ClueService] Story not found: ${storyId}`);
    }
    
    // 转换为 TrackedStoryData 格式
    return {
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      genre: story.meta.genre || [],
      difficulty: story.meta.difficulty || 'medium',
      scene_sequence: story.meta.scenes.map((sceneId: string) => ({
        scene_id: sceneId,
        title: sceneId // TODO: 从场景数据获取实际标题
      })),
      npc_ids: [], // TODO: 从场景中提取
      entry_point_action: {
        label: '开始调查',
        target_scene_id: story.meta.scenes[0] || ''
      },
      entry_clue_id: '',
      discovered_clues: [],
      progress: {
        current_scene_index: 0,
        completed_scenes: [],
        total_scenes: story.meta.scenes.length
      },
      is_active: false,
      tracked_at: Date.now(),
      updated_at: Date.now()
    };
  }
  
  // ============================================
  // 原有实例管理方法（保留）
  // ============================================
  
  /**
   * 🔥 获取线索记录（深拷贝）
   */
  static getClue(clueId: string): ClueRecord | null {
    return InstanceCacheManager.getClueRecord(clueId);
  }
  
  /**
   * 标记线索为已读
   */
  static markClueAsRead(clueId: string): void {
    InstanceCacheManager.updateClueRecord(clueId, {
      status: 'read',
      read_at: Date.now()
    });
    
    console.log(`[ClueService] ✅ Marked clue as read: ${clueId}`);
  }
  
  /**
   * 获取玩家的所有线索
   */
  static getPlayerClues(playerId: string = DEFAULT_PLAYER_ID): ClueRecord[] {
    console.log('[ClueService.getPlayerClues] 🔍 Fetching clues for player:', playerId);
    const clues = InstanceCacheManager.getPlayerClueRecords(playerId);
    console.log('[ClueService.getPlayerClues] ✅ Found clues:', {
      count: clues.length,
      clueIds: clues.map(c => c.clue_id),
      titles: clues.map(c => c.title),
      statuses: clues.map(c => c.status)
    });
    return clues;
  }
  
  /**
   * 获取未读线索数量
   */
  static getUnreadCount(playerId: string = DEFAULT_PLAYER_ID): number {
    const clues = this.getPlayerClues(playerId);
    return clues.filter(c => c.status === 'unread').length;
  }
  
  /**
   * 获取追踪中的线索数量
   */
  static getTrackingCount(playerId: string = DEFAULT_PLAYER_ID): number {
    const clues = this.getPlayerClues(playerId);
    return clues.filter(c => c.status === 'tracking').length;
  }
  
  /**
   * 完成线索
   */
  static completeClue(clueId: string): void {
    console.log(`[ClueService.completeClue] 🎉 Completing clue: ${clueId}`);
    
    const clueRecord = InstanceCacheManager.getClueRecord(clueId);
    if (clueRecord) {
      console.log(`[ClueService.completeClue] 📊 Clue state BEFORE completion:`, {
        status: clueRecord.status,
        story_instance_id: clueRecord.story_instance_id,
        completed_at: clueRecord.completed_at
      });
    }
    
    InstanceCacheManager.updateClueRecord(clueId, {
      status: 'completed',
      completed_at: Date.now()
    });
    
    const updatedRecord = InstanceCacheManager.getClueRecord(clueId);
    if (updatedRecord) {
      console.log(`[ClueService.completeClue] 📊 Clue state AFTER completion:`, {
        status: updatedRecord.status,
        story_instance_id: updatedRecord.story_instance_id,
        completed_at: updatedRecord.completed_at
      });
      
      // 如果线索关联了故事实例，也完成故事实例
      if (updatedRecord.story_instance_id) {
        console.log(`[ClueService.completeClue] 🔗 Also completing story instance: ${updatedRecord.story_instance_id}`);
        // StoryService.completeStory 会打印自己的日志
      }
    }
    
    console.log(`[ClueService.completeClue] ✅ Clue completion saved to InstanceCacheManager`);
  }
  
  /**
   * 放弃线索
   */
  static abandonClue(clueId: string): void {
    InstanceCacheManager.updateClueRecord(clueId, {
      status: 'abandoned'
    });
    
    console.log(`[ClueService] ✅ Abandoned clue: ${clueId}`);
  }
}