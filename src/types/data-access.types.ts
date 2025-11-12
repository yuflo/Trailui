/**
 * Dreamheart Engine - Data Access Layer Interface Types
 * 
 * 数据访问层接口类型定义
 * 用于定义数据访问层的接口契约
 * 
 * 设计理念：
 * - Service层依赖DataAccess接口，不直接依赖数据文件
 * - Demo阶段使用Mock实现，上线后使用API实现
 * - 通过DataAccessFactory统一管理实例创建
 */

import type { ClueData, BroadcastMessageData } from './service.types';
import type { SceneData, Story } from './story.types';
import type { PlayerStatusArea } from './scenario.types';

// ==================== Clue Data Access ====================

/**
 * 线索数据访问接口
 * 
 * 提供线索数据的查询和访问功能
 * Demo阶段从静态数据读取，上线后从API获取
 */
export interface IClueDataAccess {
  /**
   * 根据ID查找线索
   * @param clueId 线索ID
   * @returns 线索数据或null
   */
  findById(clueId: string): Promise<ClueData | null>;
  
  /**
   * 根据故事ID获取所有关联线索
   * @param storyId 故事ID
   * @returns 线索数组
   */
  getByStoryId(storyId: string): Promise<ClueData[]>;
  
  /**
   * 获取所有线索
   * @returns 所有线索数组
   */
  getAll(): Promise<ClueData[]>;
}

// ==================== Story Data Access ====================

/**
 * 故事数据访问接口
 * 
 * 提供故事数据的查询和访问功能
 * Demo阶段从demo-story-map读取，上线后从API获取
 */
export interface IStoryDataAccess {
  /**
   * 根据故事ID获取故事数据
   * @param storyId 故事ID
   * @returns 故事数据或null
   */
  getStoryById(storyId: string): Promise<Story | null>;
  
  /**
   * 获取所有故事
   * @returns 故事数组
   */
  getAllStories(): Promise<Story[]>;
  
  /**
   * 根据场景ID获取场景数据
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @returns 场景数据或null
   */
  getSceneById(storyId: string, sceneId: string): Promise<SceneData | null>;
}

// ==================== World Info Data Access ====================

/**
 * 世界信息数据访问接口
 * 
 * 提供世界信息流消息的访问功能
 * Demo阶段从静态数据读取，上线后从API获取
 */
export interface IWorldInfoDataAccess {
  /**
   * 获取广播消息流（随机采样）
   * @param count 消息数量
   * @returns 广播消息数组
   */
  getBroadcastMessages(count: number): Promise<BroadcastMessageData[]>;
  
  /**
   * 获取所有广播消息
   * @returns 所有消息数组
   */
  getAllBroadcastMessages(): Promise<BroadcastMessageData[]>;
}

// ==================== Scene Data Access ====================

/**
 * 场景Mock数据访问接口
 * 
 * 提供近场交互场景Mock数据的访问功能
 * Demo阶段从scenes/目录读取，上线后从LLM API获取
 */
export interface ISceneDataAccess {
  /**
   * 根据三层Key获取场景Mock响应数据
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @param mockKey Mock数据Key（如 'LOAD_SCENE', 'INTERACT_turn_1'）
   * @returns Mock响应数据或null
   */
  getSceneMock(storyId: string, sceneId: string, mockKey: string): Promise<any | null>;
  
  /**
   * 获取场景的所有Mock数据
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @returns Mock数据Map（key -> response）
   */
  getAllSceneMocks(storyId: string, sceneId: string): Promise<Record<string, any>>;
}

// ==================== Player Data Access ====================

/**
 * 玩家数据访问接口
 * 
 * 提供玩家状态数据的查询和持久化功能
 * Demo阶段从静态数据读取，上线后从API/存档获取
 */
export interface IPlayerDataAccess {
  /**
   * 获取默认玩家状态
   * @returns 默认玩家状态
   * @note Demo功能：返回预设的默认状态
   */
  getDefaultStatus(): Promise<PlayerStatusArea>;
  
  /**
   * 加载玩家状态
   * @param saveId 存档ID（可选，Demo阶段使用预设ID）
   * @returns 玩家状态
   * @note Demo功能：从MOCK_PLAYER_SAVES加载，上线后从API加载
   */
  loadStatus(saveId?: string): Promise<PlayerStatusArea>;
  
  /**
   * 保存玩家状态
   * @param status 玩家状态
   * @param saveId 存档ID（可选）
   * @note Demo功能：仅控制台输出，上线后调用API保存
   */
  saveStatus(status: PlayerStatusArea, saveId?: string): Promise<void>;
  
  /**
   * 删除存档
   * @param saveId 存档ID
   * @note Demo功能：仅控制台输出，上线后调用API删除
   */
  deleteSave(saveId: string): Promise<void>;
  
  /**
   * 获取所有存档列表
   * @returns 存档信息数组
   * @note Demo功能：返回MOCK_PLAYER_SAVES的keys，上线后从API获取
   */
  listSaves(): Promise<Array<{ id: string; timestamp: number; location: string }>>;
}
