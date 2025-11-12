/**
 * Dreamheart Engine - Story Configuration Types
 * 
 * 故事配置类型定义
 * 用于定义故事的元数据和配置信息
 */

import type { VisualArchetype, VisualOverrides } from './visual.types';
import type { ScenarioSnapshot, PlotUnit } from './scenario.types';

/**
 * 故事元数据
 * 包含故事的基本信息和视觉配置
 */
export interface StoryMetadata {
  /** 故事唯一标识 */
  id: string;
  
  /** 故事标题 */
  title: string;
  
  /** 故事描述 */
  description: string;
  
  /** 故事标签（氛围、类型等） */
  tags: string[];
  
  /** 故事图标（emoji） */
  icon?: string;
  
  /** 选择的视觉原型 */
  visualArchetype: VisualArchetype;
  
  /** 可选的视觉微调参数 */
  visualOverrides?: VisualOverrides;
}

/**
 * 故事配置
 * 完整的故事配置信息
 */
export interface StoryConfig {
  /** 故事唯一标识 */
  story_id: string;
  
  /** 故事标题 */
  title: string;
  
  /** 故事描述 */
  description: string;
  
  /** 选择的视觉原型 */
  visual_archetype: VisualArchetype;
  
  /** 可选的视觉微调参数 */
  visualOverrides?: VisualOverrides;
  
  /** 初始场景ID */
  initial_scenario_id: string;
  
  /** 故事版本号 */
  version?: string;
  
  /** 故事作者 */
  author?: string;
  
  /** 创建日期 */
  createdAt?: string;
}

// ==================== 场景流转配置 ====================

/**
 * 场景流转配置
 * 
 * 定义场景结束后的流转逻辑
 * 预定义在场景配置中，不由LLM生成
 */
export interface SceneTransition {
  /** 下一个场景ID（场景正常结束时） */
  next_scene_id: string | null;
  
  /** 是否为故事终点 */
  is_story_terminal: boolean;
  
  /** 场景完成时获得的线索（可选） */
  completion_clue_id?: string;
}

// ==================== 正式类型定义 ====================

/**
 * 场景数据
 * 
 * 完整的场景配置和内容数据
 * Demo阶段：包含静态 mock 数据
 * 正式线上：包含 LLM 生成的动态数据
 */
export interface SceneData {
  /** 场景唯一标识 */
  scene_id: string;
  
  /** 场景标题 */
  title: string;
  
  /** 场景描述 */
  description: string;
  
  /**
   * 叙事序列 - 剧情模式用
   * Demo阶段：静态 mock 数据
   * 正式线上：LLM 实时生成
   */
  narrative_sequence: PlotUnit[];
  
  /**
   * 交互快照 - 冲突模式用
   * Demo阶段：静态 mock 数据
   * 正式线上：LLM 实时生成
   */
  interactive_sequence: ScenarioSnapshot;
  
  /**
   * 最大交互轮数
   * 配置参数，由场景设计决定
   */
  max_turns: number;
  
  /**
   * 场景流转规则
   * 配置参数，预定义在场景配置中
   */
  transition: SceneTransition;
  
  /**
   * 解锁条件（可选）
   * 用于场景解锁逻辑
   */
  unlock_condition?: string;
}

/**
 * 故事元信息
 * 
 * 故事的基本配置信息
 */
export interface StoryMeta {
  /** 故事唯一标识 */
  story_id: string;
  
  /** 故事标题 */
  title: string;
  
  /** 故事描述 */
  description: string;
  
  /** 入口线索ID */
  entry_clue_id: string;
  
  /** 场景ID列表（按顺序） */
  scenes: string[];
}

/**
 * 故事完整数据
 * 
 * 包含元信息和所有场景数据
 * Demo阶段：从静态文件读取
 * 正式线上：从 API 获取
 */
export interface Story {
  /** 故事元信息 */
  meta: StoryMeta;
  
  /** 场景数据映射（scene_id -> SceneData） */
  scenes: Record<string, SceneData>;
}

// ==================== 向后兼容（临时保留）====================

/**
 * @deprecated 使用 SceneData 替代
 * 为了向后兼容，保留类型别名
 */
export type DemoSceneData = SceneData;

/**
 * @deprecated 使用 Story 替代
 * 为了向后兼容，保留类型别名
 */
export type DemoStoryMap = Story;

/**
 * @deprecated 使用 StoryMeta 替代
 * 为了向后兼容，保留类型别名
 */
export type DemoStoryMeta = StoryMeta;
