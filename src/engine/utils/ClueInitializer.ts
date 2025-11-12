/**
 * ClueInitializer - 线索初始化工具
 * 
 * 负责从CacheManager迁移线索数据到InstanceCacheManager
 * Demo阶段创建一些预设线索供玩家追踪
 */

import { CacheManager } from '../cache/CacheManager';
import { InstanceCacheManager } from '../cache/InstanceCacheManager';
import { DataAccessFactory } from '../data-access/DataAccessFactory'; // 🔥 修复：正确的导入路径
import type { StoryConfig } from '../../types'; // 🔥 修复：正确的类型导入

const DEFAULT_PLAYER_ID = 'demo-player';

/**
 * 线索初始化器
 */
export class ClueInitializer {
  /**
   * 🔥 初始化线索收件箱
   * 
   * 将CacheManager中的线索数据同步到InstanceCacheManager
   */
  static initializeClueInbox(playerId: string = DEFAULT_PLAYER_ID): void {
    console.log('[ClueInitializer] 🔄 Initializing clue inbox...');
    
    // 🧹 清理旧的demo线索（从收件箱和InstanceCacheManager）
    const oldDemoClueIds = ['CLUE_004', 'CLUE_005', 'CLUE_006', 'CLUE_004_GANG_RUMOR', 'CLUE_005_MISSING_CARGO'];
    for (const oldId of oldDemoClueIds) {
      try {
        CacheManager.removeClueFromInbox(playerId, oldId);
        console.log('[ClueInitializer] 🧹 Removed old demo clue from CacheManager:', oldId);
      } catch (error) {
        // 忽略错误（可能不存在）
      }
    }
    
    // 1. 从CacheManager获取玩家的线索收件箱
    const cluesWithStatus = CacheManager.getClueInboxWithStatus(playerId);
    
    console.log('[ClueInitializer] Found clues:', cluesWithStatus.length);
    
    // 2. 转换为ClueRecord格式并保存到InstanceCacheManager
    for (const clue of cluesWithStatus) {
      // 检查是否已存在
      const existing = InstanceCacheManager.getClueRecord(clue.clue_id);
      if (existing) {
        console.log('[ClueInitializer] Clue already exists:', clue.clue_id);
        continue;
      }
      
      // 创建ClueRecord
      const clueRecord = {
        clue_id: clue.clue_id,
        player_id: playerId,
        story_template_id: clue.story_id,
        story_instance_id: null, // 初始未追踪
        title: clue.title,
        description: clue.summary,
        source: '世界信息流',
        status: this.mapStatus(clue.status),
        received_at: clue.extracted_at,
        read_at: null,
        tracked_at: null,
        completed_at: null
      };
      
      InstanceCacheManager.upsertClueRecord(clueRecord);
      console.log('[ClueInitializer] ✅ Created clue record:', clue.clue_id);
    }
    
    // 3. 如果有已追踪的线索，创建故事实例
    const trackedClues = cluesWithStatus.filter(c => 
      c.status === 'tracking' || c.status === 'tracked'
    );
    
    for (const clue of trackedClues) {
      try {
        this.createStoryInstanceForClue(playerId, clue.clue_id, clue.story_id);
      } catch (error) {
        console.error('[ClueInitializer] ❌ Failed to create story instance:', error);
      }
    }
    
    console.log('[ClueInitializer] ✅ Initialization complete');
  }
  
  /**
   * 为线索创建故事实例
   */
  private static createStoryInstanceForClue(
    playerId: string,
    clueId: string,
    storyTemplateId: string
  ): void {
    // 检查故事实例是否已存在
    const expectedInstanceId = `${storyTemplateId}__${clueId}`;
    const existing = InstanceCacheManager.getStoryInstance(expectedInstanceId);
    if (existing) {
      console.log('[ClueInitializer] Story instance already exists:', expectedInstanceId);
      return;
    }
    
    // 获取故事进度
    const progress = CacheManager.getStoryProgress(playerId, clueId);
    
    // 🔥 从 StoryDataAccess 获取完整故事模板
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const story = storyDataAccess.getStoryById(storyTemplateId);
    
    if (!story) {
      console.error(`[ClueInitializer] Story template not found: ${storyTemplateId}`);
      return;
    }
    
    // 🔥 构建 StoryConfig（从 Story 转换）
    const storyTemplate: StoryConfig = {
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      genre: [], // TODO: 从 story.meta 获取
      difficulty: 'medium', // TODO: 从 story.meta 获取
      scene_sequence: story.meta.scenes,
      npc_ids: [], // TODO: 从 scenes 中提取
      initial_scenario_id: story.meta.scenes[0] || 'scene-a',
      visual_archetype: 'neon_noir', // TODO: 从 story.meta 获取
      visualOverrides: undefined
    };
    
    const instanceId = InstanceCacheManager.createStoryInstance(
      playerId,
      clueId,
      storyTemplate
    );
    
    // 更新线索记录
    InstanceCacheManager.updateClueRecord(clueId, {
      story_instance_id: instanceId,
      status: 'tracking',
      tracked_at: progress?.tracked_at || Date.now()
    });
    
    // 如果有进度，更新故事实例状态
    if (progress) {
      const status = progress.status === 'completed' ? 'completed' : 'in_progress';
      const progressPercentage = progress.completed_scenes.length > 0
        ? Math.round((progress.completed_scenes.length / storyTemplate.scene_sequence.length) * 100)
        : 0;
      
      InstanceCacheManager.updateStoryInstance(instanceId, {
        status,
        progress_percentage: progressPercentage,
        completed_scenes: progress.completed_scenes,
        started_at: progress.tracked_at
      });
    }
    
    console.log('[ClueInitializer] ✅ Created story instance:', instanceId);
  }
  
  /**
   * 映射状态
   */
  private static mapStatus(oldStatus: string): 'unread' | 'read' | 'tracking' | 'completed' | 'abandoned' {
    switch (oldStatus) {
      case 'untracked':
        return 'unread';
      case 'tracking':
      case 'tracked':
        return 'tracking';
      case 'completed':
        return 'completed';
      default:
        return 'unread';
    }
  }
  
  /**
   * 添加演示线索（Demo用）
   */
  static addDemoClues(): void {
    // 🔥 清理旧的错误ID（数据迁移）
    const deprecatedClueIds = ['CLUE_004', 'CLUE_005', 'CLUE_006'];
    for (const oldId of deprecatedClueIds) {
      try {
        CacheManager.removeClueFromInbox(DEFAULT_PLAYER_ID, oldId);
      } catch (error) {
        // 忽略错误（可能不存在）
      }
    }
    
    // 添加正确的线索ID
    const demoClues = [
      'CLUE_004_GANG_RUMOR',    // 黑帮火并传闻
      'CLUE_005_MISSING_CARGO', // 价值三十万的货物
    ];
    
    for (const clueId of demoClues) {
      // 检查线索是否已在收件箱中
      const inboxRecords = CacheManager.getPlayerInbox(DEFAULT_PLAYER_ID);
      const exists = inboxRecords.some(r => r.clue_id === clueId);
      
      if (!exists) {
        CacheManager.addClueToInbox(DEFAULT_PLAYER_ID, clueId);
        console.log('[ClueInitializer] ✅ Added demo clue:', clueId);
      }
    }
  }
}