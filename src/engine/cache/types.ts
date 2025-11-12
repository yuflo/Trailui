/**
 * Cache System Type Definitions
 * 
 * 模拟后端数据库的类型定义
 * 对标真实数据库表结构
 */

import type { ClueData } from '../../types/service.types';

// ==================== 数据库表模拟 ====================

/**
 * 表1: clues (线索静态数据)
 * 
 * 对应数据库表：clues
 * 主键：clue_id
 */
export interface ClueStaticData {
  clue_id: string;           // PRIMARY KEY
  title: string;
  summary: string;
  story_id: string;          // FOREIGN KEY
  related_clues?: string[];
  related_scenes?: string[];
  // ❌ 不包含 status！（status 是玩家数据，在另一张表）
}

/**
 * 表2: player_clue_inbox (玩家线索收件箱)
 * 
 * 对应数据库表：player_clue_inbox
 * 主键：(player_id, clue_id) 复合主键
 */
export interface PlayerClueRecord {
  clue_id: string;           // PRIMARY KEY (复合主键的一部分)
  player_id: string;         // PRIMARY KEY (复合主键的一部分)
  extracted_at: number;      // 提取时间（时间戳）
  // ❌ 不包含 status！（status 从 story_progress 派生）
}

/**
 * 表3: player_story_progress (玩家故事追踪进度)
 * 
 * 对应数据库表：player_story_progress
 * 主键：(player_id, clue_id) 复合主键
 */
export interface StoryProgressRecord {
  clue_id: string;               // PRIMARY KEY (复合主键)
  player_id: string;             // PRIMARY KEY (复合主键)
  story_id: string;              // FOREIGN KEY
  status: 'tracking' | 'completed';  // ⭐ 这里才存储 status！
  current_scene_index: number;
  completed_scenes: string[];
  tracked_at: number;            // 开始追踪时间
  completed_at?: number;         // 完成时间
  unlocked_clue_ids: string[];   // 解锁的线索ID列表
}

// ==================== 派生类型 ====================

/**
 * 线索与状态的组合（用于UI显示）
 * 
 * 通过 JOIN 查询派生：
 * - 静态数据来自 clues 表
 * - status 来自 player_story_progress 表（如果有追踪记录）
 */
export interface ClueWithStatus extends ClueStaticData {
  status: 'untracked' | 'tracking' | 'completed';
  extracted_at?: number;  // 来自 player_clue_inbox
}
