/**
 * ClueService - 线索业务服务（无状态）
 * 
 * 重构后的版本：
 * - 完全无状态
 * - 所有数据通过InstanceCacheManager读写
 * - 所有方法都是静态方法
 */

import { InstanceCacheManager } from '../../cache/InstanceCacheManager';
import { CacheManager } from '../../cache/CacheManager';
import { DataAccessFactory } from '../../data-access/DataAccessFactory'; // 🔥 新增：导入数据访问层
import type { ClueRecord } from '../../../types/instance.types';
import type { StoryConfig } from '../../../types'; // 🔥 新增：导入 StoryConfig 类型

/**
 * Demo阶段默认玩家ID
 */
const DEFAULT_PLAYER_ID = 'demo-player';

/**
 * 线索服务
 */
export class ClueService {
  /**
   * 🔥 追踪线索（创建故事实例）
   * 
   * 核心功能：
   * 1. 获取线索的故事模板ID
   * 2. 创建独立的故事实例
   * 3. 关联线索和故事实例
   * 
   * @param playerId - 玩家ID
   * @param clueId - 线索ID
   * @returns 故事实例ID
   */
  static async trackClue(playerId: string, clueId: string): Promise<string> {
    // 1. 检查线索记录是否已存在
    let clueRecord = InstanceCacheManager.getClueRecord(clueId);
    
    if (clueRecord && clueRecord.story_instance_id) {
      // 已追踪，返回现有故事实例ID
      console.log(`[ClueService] Clue already tracked: ${clueId} → ${clueRecord.story_instance_id}`);
      return clueRecord.story_instance_id;
    }
    
    // 2. 如果线索记录不存在，从CacheManager获取线索静态数据
    if (!clueRecord) {
      const clueStatic = CacheManager.getClue(clueId);
      if (!clueStatic) {
        throw new Error(`[ClueService] Clue not found: ${clueId}`);
      }
      
      // 创建线索记录
      clueRecord = {
        clue_id: clueId,
        player_id: playerId,
        story_template_id: clueStatic.story_id,
        story_instance_id: null,
        title: clueStatic.title,
        description: clueStatic.summary,
        source: '未知来源', // TODO: 从clue静态数据获取
        status: 'unread',
        received_at: Date.now(),
        read_at: null,
        tracked_at: null,
        completed_at: null
      };
      
      InstanceCacheManager.upsertClueRecord(clueRecord);
    }
    
    // 3. 🔥 从 StoryDataAccess 获取完整故事配置
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const story = await storyDataAccess.getStoryById(clueRecord.story_template_id);
    
    if (!story) {
      throw new Error(`[ClueService] Story template not found: ${clueRecord.story_template_id}`);
    }
    
    // 4. 🔥 构建 StoryConfig（从 Story 转换）
    const storyTemplate: StoryConfig = {
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      genre: [], // TODO: 从 story.meta 获取
      difficulty: 'medium', // TODO: 从 story.meta 获取
      scene_sequence: story.meta.scenes,  // ✅ 场景序列
      npc_ids: [], // TODO: 从 scenes 中提取
      initial_scenario_id: story.meta.scenes[0] || 'scene-a',  // ✅ 第一个场景作为初始场景
      visual_archetype: 'neon_noir', // TODO: 从 story.meta 获取
      visualOverrides: undefined
    };
    
    // 5. 创建故事实例
    const storyInstanceId = InstanceCacheManager.createStoryInstance(
      playerId,
      clueId,
      storyTemplate
    );
    
    // 6. 更新线索记录
    InstanceCacheManager.updateClueRecord(clueId, {
      story_instance_id: storyInstanceId,
      status: 'tracking',
      tracked_at: Date.now()
    });
    
    console.log(`[ClueService] ✅ Tracked clue ${clueId} → ${storyInstanceId}`);
    return storyInstanceId;
  }
  
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