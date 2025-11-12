/**
 * Dreamheart Engine - Engine Core Types
 * 
 * 引擎核心类型定义
 * 用于定义引擎的状态、事件和配置
 */

import type { StoryConfig } from './story.types';
import type { ScenarioSnapshot, NPCEntity, StatValue, ScenePlot, PlotUnit, PlayerStatusArea } from './scenario.types';
import type { VisualArchetype, VisualOverrides } from './visual.types';
import type { NearFieldEvent, NextActionType } from './nearfield.types';
import type { TrackedStoryData } from './service.types';
import type { NearFieldState } from './game.types';

// ==================== 游戏会话状态（新增）====================

/**
 * 游戏会话状态枚举
 * 
 * 用于线索驱动的故事启动流程
 * - IDLE: 空闲 - 未追踪任何故事，界面显示空状态
 * - STORY_READY: 就绪 - 有追踪的故事，但未进入游戏
 * - PLAYING: 游戏中 - 已进入某个故事，正在游戏
 */
export enum GameSessionState {
  IDLE = 'idle',
  STORY_READY = 'ready',
  PLAYING = 'playing',
}

// ==================== 自由镜模式（优化重构）====================

/**
 * 自由镜显示模式（派生状态）
 * 
 * 用于UI根据数据状态计算显示模式
 * - IDLE: 空状态 - 未进入故事
 * - NARRATIVE: 近场叙事模式 - 播放 narrative_sequence
 * - INTERACTION: 冲突交互模式 - 显示 behaviorHistory
 * 
 * @note 这是计算属性，不存储在 GameState 中
 */
export enum FreeMirrorMode {
  IDLE = 'idle',
  NARRATIVE = 'narrative',
  INTERACTION = 'interaction'
}

/**
 * @deprecated 旧的 MirrorMode 枚举已废弃
 * 请使用 FreeMirrorMode 和数据驱动的状态计算
 */
export enum MirrorMode {
  PLOT_PLAYING = 'plot_playing',
  PLOT_PAUSED = 'plot_paused',
  CONFLICT = 'conflict'
}

// ==================== 游戏状态 ====================

/**
 * 游戏状态
 */
export interface GameState {
  // ========== 会话状态（新增）==========
  
  /** 游戏会话状态 */
  sessionState: GameSessionState;
  
  /** 追踪的故事池（clue_id → TrackedStoryData） */
  trackedStories: Map<string, TrackedStoryData>;
  
  // ========== 独立玩家状态（新增 Phase X）==========
  
  /** 
   * 玩家状态（独立于场景）
   * - 在所有 sessionState 下都存在
   * - 不依赖 currentScenario
   * - 进入故事时从场景同步
   * - 退出故事后保持最后状态
   */
  playerStatus: PlayerStatusArea | null;
  
  // ========== 现有字段（保持不变）==========
  
  /** 当前故事ID */
  currentStoryId: string | null;
  
  /** 当前故事配置 */
  currentStory: StoryConfig | null;
  
  /** 当前回合索引 */
  currentTurnIndex: number;
  
  /** 当前场景快照 */
  currentScenario: ScenarioSnapshot | null;
  
  /** 所有场景快照 */
  allScenarios: ScenarioSnapshot[];
  
  /** 游戏是否已开始 */
  isStarted: boolean;
  
  /** 游戏是否已结束 */
  isEnded: boolean;
  
  // ========== 近场交互系统（简化版 - 新）==========
  
  /** 
   * 近场交互状态（简化版）
   * 所有近场交互相关的状态都在这里
   */
  nearfield: NearFieldState;
  
  // ========== @deprecated 近场交互旧字段（向后兼容，逐步移除）==========
  
  /** @deprecated 使用 nearfield.active */
  nearfield_active: boolean;
  
  /** @deprecated 使用 nearfield.sceneId */
  current_scene_id: string | null;
  
  /** @deprecated 不再使用，改用 nearfield.narrativeSequence.slice(0, displayIndex+1) */
  scene_history_context: NearFieldEvent[];
  
  /** @deprecated 使用 nearfield.mode */
  awaiting_action_type: NextActionType | null;
  
  /** @deprecated 使用 nearfield.narrativeSequence */
  current_narrative_sequence: PlotUnit[] | null;
  
  /** @deprecated 使用 nearfield.displayIndex */
  current_narrative_index: number;
  
  // ========== @deprecated 旧剧本系统字段（待清理）==========
  
  /**
   * @deprecated 旧的镜像模式（使用 FreeMirrorMode 计算派生状态）
   */
  mirrorMode?: MirrorMode;
  
  /**
   * @deprecated 场景剧本（已被 nearfield.narrativeSequence 替代）
   */
  scenePlot?: any;
  
  /**
   * @deprecated 当前剧本索引（已被 nearfield.displayIndex 替代）
   */
  currentPlotIndex?: number;
  
  /**
   * @deprecated UI显示的剧本单元（直接使用 nearfield.narrativeSequence.slice() ）
   */
  displayedPlotUnits?: PlotUnit[];
  
  /**
   * @deprecated 当前提示（使用 nearfield.interventionHint 替代）
   */
  currentHint?: string | null;
}

// ==================== 数值变化 ====================

/**
 * 数值变化
 */
export interface StatDelta {
  /** 变化类型 */
  type: 'vigor' | 'clarity';
  
  /** 变化前的值 */
  oldValue: StatValue;
  
  /** 变化后的值 */
  newValue: StatValue;
  
  /** 变化量 */
  delta: number;
}

/**
 * 关系值变化
 */
export interface RapportDelta {
  /** NPC实体 */
  npc: NPCEntity;
  
  /** 旧关系值 */
  oldIntensity: number;
  
  /** 新关系值 */
  newIntensity: number;
  
  /** 变化量 */
  delta: number;
}

// ==================== 回合结果 ====================

/**
 * 回合推进结果
 */
export interface TurnResult {
  /** 是否成功 */
  success: boolean;
  
  /** 新的场景快照 */
  scenario: ScenarioSnapshot | null;
  
  /** 当前回合索引 */
  turnIndex: number;
  
  /** 数值变化列表 */
  statDeltas: StatDelta[];
  
  /** 关系值变化列表 */
  rapportDeltas: RapportDelta[];
  
  /** 是否已到达结局 */
  isEnding: boolean;
  
  /** 错误信息（如果失败） */
  error?: string;
}

// ==================== 引擎事件 ====================

/**
 * 引擎事件类型
 */
export type EngineEventType = 
  | 'storyLoaded'      // 故事加载完成
  | 'gameStarted'      // 游戏开始
  | 'turnComplete'     // 回合完成
  | 'stateChange'      // 状态变化
  | 'visualApplied'    // 视觉原型已应用
  | 'error'            // 错误
  // 会话状态事件（新增）
  | 'storyTracked'     // 追踪故事（新增）
  | 'storyEntered'     // 进入故事（从线索启动）
  | 'storyExited'      // 退出故事（返回空闲）
  | 'playerStatusChanged'  // 玩家状态变化
  // 近场交互事件
  | 'nearfieldUpdated'           // 近场状态更新（新简化版）
  | 'nearfield_scene_loaded'     // 近场场景加载完成
  | 'nearfield_events_received'  // 收到新的近场事件
  | 'nearfield_scene_ended'      // 近场场景结束
  | 'nearfield_error';           // 近场交互错误

/**
 * 引擎事件数据
 */
export interface EngineEvent<T = any> {
  /** 事件类型 */
  type: EngineEventType;
  
  /** 事件数据 */
  data: T;
  
  /** 时间戳 */
  timestamp: number;
}

/**
 * 事件监听器
 */
export type EventListener<T = any> = (event: EngineEvent<T>) => void;

// ==================== 引擎配置 ====================

/**
 * 引擎配置
 */
export interface EngineConfig {
  /** 是否启用调试模式 */
  debug?: boolean;
  
  /** 是否自动应用视觉原型 */
  autoApplyVisual?: boolean;
  
  /** Ticker消息更新间隔（毫秒） */
  tickerUpdateInterval?: number;
}
