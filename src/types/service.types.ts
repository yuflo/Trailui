/**
 * Dreamheart Engine - Service Interface Types
 * 
 * 服务层接口类型定义
 * 用于定义服务层的接口契约
 */

import type { StoryConfig } from './story.types';
import type { ScenarioSnapshot, NarrativeThread, ScenePlot, PlotUnit } from './scenario.types';
import type { VisualArchetype, VisualOverrides, AppliedVisualConfig } from './visual.types';
import type { AdvanceRequest, AdvanceResponse } from './nearfield.types';

// ==================== Story Service ====================

/**
 * 故事服务接口
 * 
 * 提供故事数据的访问和管理功能
 */
export interface IStoryService {
  /**
   * 获取所有可用故事的配置
   * @returns 故事配置数组
   */
  getAllStories(): Promise<StoryConfig[]>;
  
  /**
   * 获取指定故事的完整数据
   * @param storyId 故事ID
   * @returns 故事配置和场景数据
   */
  getStoryData(storyId: string): Promise<{
    config: StoryConfig;
    scenarios: ScenarioSnapshot[];
  }>;
  
  /**
   * 获取指定故事的某个回合场景
   * @param storyId 故事ID
   * @param turnIndex 回合索引（从0开始）
   * @returns 场景快照
   */
  getScenarioTurn(storyId: string, turnIndex: number): Promise<ScenarioSnapshot | null>;
  
  /**
   * 通过线索开启故事（远场探索）
   * @param clueId 线索ID
   * @returns 故事数据和入口场景
   * @note Demo功能：根据线索ID返回对应的故事入口
   */
  openStoryByClue(clueId: string): Promise<{
    config: StoryConfig;
    entryScene: ScenarioSnapshot;
  }>;
  
  /**
   * 获取故事的入口场景
   * @param storyId 故事ID
   * @returns 入口场景快照
   */
  getEntryScene(storyId: string): Promise<ScenarioSnapshot>;
}

// ==================== Visual Service ====================

/**
 * 视觉服务接口
 * 
 * 提供视觉原型的管理和应用功能
 */
export interface IVisualService {
  /**
   * 获取所有可用的视觉原型
   * @returns 视觉原型ID数组
   */
  getAllArchetypes(): VisualArchetype[];
  
  /**
   * 应用视觉原型到DOM
   * @param archetypeId 原型ID
   * @param overrides 可选的微调参数
   * @returns 应用的视觉配置
   */
  applyArchetype(archetypeId: VisualArchetype, overrides?: VisualOverrides): AppliedVisualConfig;
  
  /**
   * 清除当前视觉原型
   */
  clearArchetype(): void;
  
  /**
   * 获取当前应用的视觉配置
   * @returns 当前视觉配置，如果未应用则返回null
   */
  getCurrentConfig(): AppliedVisualConfig | null;
}

// ==================== Ticker Service ====================

/**
 * Ticker消息数据（旧版，保留兼容）
 */
export interface TickerMessageData {
  type: string;
  color: string;
  text: string;
}

/**
 * 广播消息数据（远场探索）
 * 
 * 符合远场探索API规范的完整消息结构
 */
export interface BroadcastMessageData {
  message_id: string;              // 消息唯一ID
  category: string;                 // 类别（社交/媒体/警讯等）
  timestamp: string;                // 时间戳（如 "23:41"）
  text: string;                     // 消息文本
  color: string;                    // UI显示颜色（兼容旧UI）
  extractable_clue_id: string | null;  // 可提取的线索ID
}

/**
 * Ticker服务接口
 * 
 * 提供世界信息流消息的管理功能
 */
export interface ITickerService {
  /**
   * 获取世界信息流（远场探索）
   * @param count 消息数量
   * @returns 广播消息数组（从消息池中随机采样）
   * @note Demo功能：从50条消息池中随机采样20条
   */
  getBroadcastStream(count: number): Promise<BroadcastMessageData[]>;
  
  /**
   * 获取随机的Ticker消息
   * @returns Ticker消息
   * @deprecated 使用 getBroadcastStream() 代替
   */
  getRandomMessage(): Promise<TickerMessageData>;
  
  /**
   * 获取多个随机Ticker消息
   * @param count 消息数量
   * @returns Ticker消息数组
   * @deprecated 使用 getBroadcastStream() 代替
   */
  getMessages(count: number): Promise<TickerMessageData[]>;
  
  /**
   * 获取下一条Ticker消息（循环播放）
   * @returns Ticker消息
   * @note Demo功能：按顺序循环返回消息，播放完毕后重新开始
   */
  getNextMessage(): TickerMessageData;
  
  /**
   * 重置循环播放位置
   * @note Demo功能：将播放位置重置到开头
   */
  resetCycle(): void;
}

// ==================== Narrative Clue Service ====================

/**
 * 叙事线索服务接口
 * 
 * 提供叙事线索的管理和随机获取功能
 * 线索与故事绑定，每个故事有独立的线索池
 */
export interface INarrativeClueService {
  /**
   * 获取指定故事的随机线索
   * @param storyId 故事ID
   * @param count 线索数量
   * @returns 叙事线索数组
   * @note Demo功能：从该故事的线索池中随机抽取
   */
  getRandomClues(storyId: string, count: number): NarrativeThread[];
  
  /**
   * 获取指定故事的所有线索
   * @param storyId 故事ID
   * @returns 所有叙事线索
   */
  getAllClues(storyId: string): NarrativeThread[];
  
  /**
   * 刷新线索（重新随机获取）
   * @param storyId 故事ID
   * @param count 线索数量
   * @returns 新的叙事线索数组
   * @note Demo功能：用于定时刷新线索面板
   */
  refreshClues(storyId: string, count: number): NarrativeThread[];
  
  /**
   * 🆕 标记场景为已完成
   * @param clueId 触发该故事的线索ID
   * @param sceneId 已完成的场景ID
   * @param completionClueId 可选：完成时解锁的线索ID
   */
  markSceneCompleted(
    clueId: string, 
    sceneId: string,
    completionClueId?: string
  ): Promise<void>;
  
  /**
   * 🆕 标记故事为已完成
   * @param clueId 触发该故事的线索ID
   * @param completionClueId 可选：完成时解锁的线索ID
   */
  markStoryCompleted(
    clueId: string,
    completionClueId?: string
  ): Promise<void>;
}

// ==================== Freedom Mirror Service ====================

/**
 * 自由镜服务接口
 * 
 * 提供剧情消息流的播放管理功能
 * 用于"剧情/冲突"混合模式中的自动剧情播放
 */
export interface IFreedomMirrorService {
  /**
   * 加载指定故事的场景剧本
   * @param storyId 故事ID
   * @returns 场景剧本数据
   */
  loadScenePlot(storyId: string): ScenePlot;
  
  /**
   * 获取下一个剧本单元（循环播放）
   * @returns 下一个剧本单元，如果没有则返回null
   * @note Demo功能：按顺序返回剧本单元，播放完毕后循环重播
   */
  getNextPlotUnit(): PlotUnit | null;
  
  /**
   * 检查是否还有更多剧本单元
   * @returns 是否还有未播放的单元
   */
  hasMore(): boolean;
  
  /**
   * 重置播放位置到开头
   * @note Demo功能：将播放位置重置，用于重新播放或切换故事
   */
  resetPlayback(): void;
  
  /**
   * 设置循环模式
   * @param loop 是否启用循环播放
   * @note Demo功能：控制播放完毕后是否自动重新开始
   */
  setLoopMode(loop: boolean): void;
  
  /**
   * 获取当前播放进度
   * @returns 当前索引和总数
   */
  getPlaybackProgress(): { current: number; total: number };
}

// ==================== Clue Service ====================

/**
 * 线索状态
 */
export type ClueStatus = 
  | 'untracked'   // 未追踪（在收件箱中）
  | 'tracking'    // 追踪中（已开启故事）
  | 'completed';  // 已完成

/**
 * 线索数据
 */
export interface ClueData {
  clue_id: string;         // 线索ID
  title: string;            // 线索标题
  summary: string;          // 线索摘要
  status: ClueStatus;       // 线索状态
  story_id: string;         // 关联的故事ID
  
  // ✨ 新增：线索关联关系
  related_clues?: string[];   // 关联的其他线索ID列表
  related_scenes?: string[];  // 关联的场景ID列表（可以在这些场景中找到或使用该线索）
}

/**
 * 场景序列项（故事路线图）
 */
export interface SceneSequenceItem {
  scene_id: string;               // 场景ID
  title: string;                   // 场景标题（如"场景一：酒吧入口"）
  status: 'unlocked' | 'locked';  // 场景状态
  convergence_policy?: {          // 收敛策略（供LLM使用，UI不显示）
    description: string;
    goal: string;
    constraints?: string | null;
  };
}

/**
 * 追踪线索返回的故事数据（完整版 - 沉浸式任务简报）
 * 
 * 升级说明：
 * - 提供更长、更具氛围的故事描述
 * - 包含完整的场景序列（故事路线图）
 * - 明确的行动入口点
 * - 支持线索链和进度追踪
 */
export interface TrackedStoryData {
  story_id: string;              // 故事ID
  title: string;                  // 故事标题
  description: string;            // 故事描述（更长、更具氛围感）
  status: 'tracking' | 'completed';  // 故事状态
  scene_sequence: SceneSequenceItem[];  // 场景序列（任务路线图）
  // ========== 行动入口点（必需）==========
  entry_point_action: {          // 行动入口点
    label: string;                // 按钮标签（如"开启故事线"）
    target_scene_id: string;      // 目标场景ID
  };
  
  // ========== 线索链和进度追踪 ==========
  entry_clue_id: string;         // 入口线索ID（必需）
  discovered_clues?: string[];    // 已发现的线索ID列表
  progress?: {                    // 故事进度
    current_scene_index: number;  // 当前场景索引
    completed_scenes: string[];   // 已完成场景ID列表
    total_scenes: number;         // 总场景数
  };
  // ========== 活跃状态（必需）==========
  is_active: boolean;            // 是否为当前正在玩的故事
  tracked_at: number;            // 开始追踪时间戳
  updated_at: number;            // 最后更新时间戳
  
  // ========== 🆕 完成状态追踪 ==========
  unlocked_clue_ids?: string[];  // 完成时解锁的线索ID列表
  completion_time?: number;      // 故事完成时间戳
}

/**
 * 线索服务接口（远场探索）
 * 
 * 提供线索的提取、追踪和收件箱管理功能
 * 实现"世界信息流 → 线索 → 故事"的完整探索流程
 */
export interface IClueService {
  /**
   * 从消息中提取线索
   * @param messageId 消息ID
   * @param clueId 线索ID
   * @returns 提取的线索数据
   * @note Demo功能：从注册表中查找线索，加入收件箱
   */
  extractClue(messageId: string, clueId: string): Promise<ClueData>;
  
  /**
   * 追踪线索（开启故事）
   * @param clueId 线索ID
   * @returns 故事数据和入口信息
   * @note Demo功能：更新线索状态为tracking，返回关联的故事
   */
  trackClue(clueId: string): Promise<TrackedStoryData>;
  
  /**
   * 获取收件箱中的所有线索
   * @returns 线索数组
   * @note Demo功能：返回所有已提取的线索
   */
  getClueInbox(): Promise<ClueData[]>;
  
  /**
   * 获取指定状态的线索
   * @param status 线索状态
   * @returns 符合状态的线索数组
   * @note Demo功能：过滤收件箱中的线索
   */
  getCluesByStatus(status: ClueStatus): Promise<ClueData[]>;
  
  /**
   * 更新线索状态
   * @param clueId 线索ID
   * @param status 新状态
   * @note Demo功能：手动更新线索状态
   */
  updateClueStatus(clueId: string, status: ClueStatus): Promise<void>;
  
  // ========== Phase 1 新增方法 ==========
  
  /**
   * 通过线索ID获取追踪的故事数据
   * @param clueId 线索ID
   * @returns 追踪的故事数据，如果未追踪则返回null
   */
  getTrackedStoryByClue(clueId: string): Promise<TrackedStoryData | null>;
  
  /**
   * 设置活跃故事（当前正在玩的故事）
   * @param clueId 线索ID
   * @note 同时会将其他故事的is_active设为false
   */
  setActiveStory(clueId: string): Promise<void>;
  
  /**
   * 清除所有活跃故事标记
   * @note 用于退出所有故事，返回空闲状态
   */
  clearActiveStory(): Promise<void>;
  
  /**
   * 获取当前活跃的故事
   * @returns 活跃的故事数据，如果没有则返回null
   */
  getActiveStory(): Promise<TrackedStoryData | null>;
  
  /**
   * 获取所有追踪中的故事
   * @returns 追踪中的故事列表
   */
  getTrackedStories(): Promise<TrackedStoryData[]>;
  
  /**
   * 标记场景为已完成
   * @param clueId 触发该故事的线索ID
   * @param sceneId 已完成的场景ID
   * @note 更新 StateManager 中的追踪故事状态
   */
  markSceneCompleted(clueId: string, sceneId: string): Promise<void>;
  
  /**
   * 标记故事为已完成
   * @param clueId 触发该故事的线索ID
   * @param completionClueId 可选：完成时解锁的线索ID
   * @note 更新 StateManager 中的追踪故事状态，并提取完成线索（如果有）
   */
  markStoryCompleted(clueId: string, completionClueId?: string): Promise<void>;
}

// ==================== Near-Field Interaction Service ====================

/**
 * 近场交互服务接口（原文档设计）
 * 
 * 提供近场交互的统一状态推进接口
 * 
 * 设计理念：
 * - 统一的advance()接口处理所有场景状态流转
 * - Service层无状态（Demo阶段）
 * - 前端作为"纯渲染器"
 * - 三层Key结构的Mock数据查找
 * 
 * 核心流程：
 * 1. 加载 (gen #3): LOAD_SCENE 返回叙事序列和第一个介入点
 * 2. 交互 (gen #4a): INTERACT 处理玩家介入和多轮对话
 * 3. 收敛 (gen #4b): INTERACT 达到max_turns时强制结束
 * 4. 循环 (gen #3b): REQUEST_NARRATIVE 重新生成后续叙事
 * 
 * @note Demo阶段从Mock数据读取，上线后改为调用LLM API
 */
export interface INearFieldService {
  /**
   * 推进场景状态（统一入口）
   * 
   * 这是近场交互的唯一接口，处理所有场景状态流转：
   * - LOAD_SCENE: 加载场景的叙事序列（gen #3）
   * - INTERACT: 玩家介入或交互（gen #4a/4b）
   * - PASS: 玩家选择路过（剪枝）
   * - REQUEST_NARRATIVE: 请求后续叙事（gen #3b，自动调用）
   * 
   * @param request 场景推进请求
   * @returns 场景推进响应（包含新事件、实体更新、下一步指令）
   * 
   * @example
   * // 加载场景
   * const response = await service.advance({
   *   story_id: "tense-alley",
   *   current_scene_id: "SCENE_A_BAR_ENTRANCE",
   *   scene_history_context: [],
   *   player_action: { type: "LOAD_SCENE", intent_text: null }
   * });
   * 
   * @example
   * // 玩家介入交互
   * const response = await service.advance({
   *   story_id: "tense-alley",
   *   current_scene_id: "SCENE_A_BAR_ENTRANCE",
   *   scene_history_context: [...],
   *   player_action: { type: "INTERACT", intent_text: "让我来处理" }
   * });
   */
  advance(request: AdvanceRequest): Promise<AdvanceResponse>;
}

// ==================== Player Service ====================

/**
 * 玩家服务接口
 * 
 * 提供玩家状态的查询和更新功能
 * 管理玩家的各项数值、位置、时间、状态效果等
 * 
 * 设计理念：
 * - 玩家数值独立于故事/场景存在
 * - 在所有sessionState下都可访问
 * - 支持存档和恢复
 * - 可与场景数据同步
 */
export interface IPlayerService {
  /**
   * 初始化玩家状态
   * @param saveId 存档ID（可选，不提供则使用默认状态）
   * @note Demo功能：从DataAccess加载默认状态或指定存档
   */
  initialize(saveId?: string): Promise<void>;
  
  /**
   * 获取当前玩家状态（只读）
   * @returns 玩家状态的副本
   */
  getStatus(): Readonly<PlayerStatusArea>;
  
  // ========== 数值更新方法 ==========
  
  /**
   * 更新体力
   * @param delta 变化量（可为负数）
   * @note 自动限制在 [0, max] 范围内
   */
  updateVigor(delta: number): void;
  
  /**
   * 更新心力
   * @param delta 变化量（可为负数）
   * @note 自动限制在 [0, max] 范围内
   */
  updateClarity(delta: number): void;
  
  /**
   * 设置体力最大值
   * @param max 新的最大值
   */
  setVigorMax(max: number): void;
  
  /**
   * 设置心力最大值
   * @param max 新的最大值
   */
  setClarityMax(max: number): void;
  
  // ========== 位置和时间 ==========
  
  /**
   * 更新当前位置
   * @param location 新位置
   */
  updateLocation(location: string): void;
  
  /**
   * 更新游戏时间
   * @param time 新时间（格式如 "23:45"）
   */
  updateTime(time: string): void;
  
  // ========== 财力和信用 ==========
  
  /**
   * 更新财力等级
   * @param level 新的财力等级
   */
  updateFinancialPower(level: FinancialPowerLevel): void;
  
  /**
   * 更新信用值
   * @param delta 变化量（可为负数）
   * @note 自动限制在 [0, 100] 范围内
   */
  updateCredit(delta: number): void;
  
  // ========== 状态效果管理 ==========
  
  /**
   * 添加状态效果
   * @param effect 状态效果
   * @note 如果同名效果已存在，则替换
   */
  addEffect(effect: StatusEffect): void;
  
  /**
   * 移除状态效果
   * @param effectName 效果名称
   */
  removeEffect(effectName: string): void;
  
  /**
   * 清除所有状态效果
   */
  clearEffects(): void;
  
  /**
   * 检查是否有指定效果
   * @param effectName 效果名称
   * @returns 是否存在
   */
  hasEffect(effectName: string): boolean;
  
  // ========== 场景同步 ==========
  
  /**
   * 从场景快照同步玩家状态
   * @param scenario 场景快照
   * @note 进入故事时调用，将场景中的player_status_area同步到独立的playerStatus
   */
  syncFromScenario(scenario: ScenarioSnapshot): void;
  
  /**
   * 将当前玩家状态应用到场景快照
   * @param scenario 场景快照
   * @returns 更新后的场景快照
   * @note 用于将独立的playerStatus更新到场景数据中
   */
  applyToScenario(scenario: ScenarioSnapshot): ScenarioSnapshot;
  
  // ========== 存档管理 ==========
  
  /**
   * 保存当前状态
   * @param saveId 存档ID（可选）
   * @note Demo功能：仅输出到控制台，上线后调用API保存
   */
  save(saveId?: string): Promise<void>;
  
  /**
   * 加载存档
   * @param saveId 存档ID
   * @note Demo功能：从MOCK_PLAYER_SAVES加载
   */
  load(saveId: string): Promise<void>;
  
  /**
   * 重置为默认状态
   * @note Demo功能：恢复到DEFAULT_PLAYER_STATUS
   */
  reset(): Promise<void>;
}
