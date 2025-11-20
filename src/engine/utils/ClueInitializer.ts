/**
 * ClueInitializer - 线索初始化工具
 * 
 * 🔥 完全迁移到 InstanceCacheManager + DataAccess 架构
 * Demo阶段创建一些预设线索供玩家追踪
 */

import { InstanceCacheManager } from '../cache/InstanceCacheManager';
import { DataAccessFactory } from '../data-access/DataAccessFactory';
import type { StoryConfig } from '../../types';

const DEFAULT_PLAYER_ID = 'demo-player';

/**
 * 线索初始化器
 * 
 * 🔥 新架构：
 * - 静态数据从 DataAccess 获取
 * - 实例数据存储在 InstanceCacheManager
 * - 不再依赖旧的 CacheManager
 */
export class ClueInitializer {
  /**
   * 🔥 初始化线索收件箱
   * 
   * 从 InstanceCacheManager 加载现有线索，确保数据完整性
   */
  static async initializeClueInbox(playerId: string = DEFAULT_PLAYER_ID): Promise<void> {
    console.log('[ClueInitializer] 🔄 Initializing clue inbox...');
    
    // 🧹 清理旧的demo线索（遗留数据）
    const oldDemoClueIds = ['CLUE_004', 'CLUE_005', 'CLUE_006'];
    for (const oldId of oldDemoClueIds) {
      try {
        InstanceCacheManager.deleteClueRecord(oldId);
        console.log('[ClueInitializer] 🧹 Removed old demo clue:', oldId);
      } catch (error) {
        // 忽略错误（可能不存在）
      }
    }
    
    // 1. 从 InstanceCacheManager 获取现有线索记录
    const clueRecords = InstanceCacheManager.getPlayerClueRecords(playerId);
    
    console.log(`[ClueInitializer] Found ${clueRecords.length} existing clue records`);
    
    // 2. 获取 DataAccess 实例
    const clueDataAccess = DataAccessFactory.createClueDataAccess();
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    
    // 3. 验证每个线索的静态数据是否存在
    for (const record of clueRecords) {
      const clueStatic = await clueDataAccess.findById(record.clue_id);
      if (!clueStatic) {
        console.warn(`[ClueInitializer] ⚠️ Clue static data not found: ${record.clue_id}`);
        continue;
      }
      
      // 4. 如果是追踪状态，确保故事实例存在
      if (record.status === 'tracking' && !record.story_instance_id) {
        console.log(`[ClueInitializer] 🔧 Creating missing story instance for: ${record.clue_id}`);
        await this.createStoryInstanceForClue(playerId, record.clue_id, record.story_template_id);
      }
    }
    
    console.log('[ClueInitializer] ✅ Initialization complete');
  }
  
  /**
   * 为线索创建故事实例
   * 
   * 🔥 纯 InstanceCacheManager + DataAccess 实现
   */
  private static async createStoryInstanceForClue(
    playerId: string,
    clueId: string,
    storyTemplateId: string
  ): Promise<void> {
    // 检查故事实例是否已存在
    const clueRecord = InstanceCacheManager.getClueRecord(clueId);
    if (clueRecord?.story_instance_id) {
      const existing = InstanceCacheManager.getStoryInstance(clueRecord.story_instance_id);
      if (existing) {
        console.log('[ClueInitializer] Story instance already exists:', clueRecord.story_instance_id);
        return;
      }
    }
    
    // 🔥 从 StoryDataAccess 获取完整故事模板
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const story = await storyDataAccess.getStoryById(storyTemplateId);
    
    if (!story) {
      console.error(`[ClueInitializer] Story template not found: ${storyTemplateId}`);
      return;
    }
    
    // 🔥 构建 StoryConfig（从 Story 转换）
    const storyTemplate: StoryConfig = {
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      genre: story.meta.genre || [],
      difficulty: story.meta.difficulty || 'medium',
      scene_sequence: story.meta.scenes,
      npc_ids: [], // TODO: 从 scenes 中提取
      initial_scenario_id: story.meta.scenes[0] || 'scene-a',
      visual_archetype: 'neon_noir',
      visualOverrides: undefined
    };
    
    // 创建故事实例
    const instanceId = InstanceCacheManager.createStoryInstance(
      playerId,
      clueId,
      storyTemplate
    );
    
    // 更新线索记录
    InstanceCacheManager.updateClueRecord(clueId, {
      story_instance_id: instanceId,
      status: 'tracking',
      tracked_at: clueRecord?.tracked_at || Date.now()
    });
    
    console.log('[ClueInitializer] ✅ Created story instance:', instanceId);
  }
  
  /**
   * 添加演示线索（Demo用）
   * 
   * 🔥 纯 InstanceCacheManager 实现，不依赖 CacheManager
   */
  static async addDemoClues(): Promise<void> {
    console.log('[ClueInitializer] 🎮 Adding demo clues...');
    
    // 演示线索ID列表
    const demoClues = [
      'CLUE_004_GANG_RUMOR',    // 黑帮火并传闻
      'CLUE_005_MISSING_CARGO', // 价值三十万的货物
    ];
    
    // 获取 DataAccess
    const clueDataAccess = DataAccessFactory.createClueDataAccess();
    
    for (const clueId of demoClues) {
      // 检查线索是否已在收件箱中
      const existingRecord = InstanceCacheManager.getClueRecord(clueId);
      if (existingRecord) {
        console.log(`[ClueInitializer] Demo clue already exists: ${clueId}`);
        continue;
      }
      
      // 从 DataAccess 获取线索静态数据
      const clueStatic = await clueDataAccess.findById(clueId);
      if (!clueStatic) {
        console.warn(`[ClueInitializer] ⚠️ Demo clue not found in DataAccess: ${clueId}`);
        continue;
      }
      
      // 创建线索记录
      const clueRecord = {
        clue_id: clueId,
        player_id: DEFAULT_PLAYER_ID,
        story_template_id: clueStatic.story_id,
        story_instance_id: null,
        title: clueStatic.title,
        description: clueStatic.summary,
        source: '世界信息流',
        status: 'unread' as const,
        received_at: Date.now(),
        read_at: null,
        tracked_at: null,
        completed_at: null
      };
      
      InstanceCacheManager.upsertClueRecord(clueRecord);
      console.log('[ClueInitializer] ✅ Added demo clue:', clueId);
    }
    
    console.log('[ClueInitializer] 🎮 Demo clues initialization complete');
  }
}
