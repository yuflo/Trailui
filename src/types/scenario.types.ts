/**
 * Dreamheart Engine - Scenario Data Types
 * 
 * 场景数据类型定义
 * 从 game.types.ts 提取，用于定义游戏场景的完整数据结构
 */

// ==================== 枚举类型 ====================

/**
 * 行为类型枚举
 */
export type BehaviorType = 
  | 'Speak'           // 对话
  | 'Observe'         // 观察
  | 'Move'            // 移动
  | 'Intimidate'      // 威吓
  | 'Empathize'       // 共情
  | 'Persuade';       // 说服

/**
 * 消息类型枚举
 */
export type MessageType = 
  | 'Sound'           // 声音
  | 'Sight'           // 视觉
  | 'Smell'           // 气味
  | 'SMS'             // 短信
  | 'Call';           // 电话

/**
 * 效果类型枚举
 */
export type EffectType = 'buff' | 'debuff';

/**
 * 关系情感枚举
 */
export type RapportSentiment = 
  | '警惕'
  | '中立'
  | '恐惧'
  | '未知'
  | '友好'
  | '敌对';

/**
 * 财力等级枚举
 */
export type FinancialPowerLevel = 
  | '贫困'
  | '温饱'
  | '体面'
  | '富裕'
  | '豪富';

// ==================== 基础接口 ====================

/**
 * 环境频道消息
 */
export interface AmbientMessage {
  type: MessageType;
  content: string;
}

/**
 * 警察扫描器消息
 */
export interface PoliceScanner {
  location: string;
  code: string;
  report: string;
}

/**
 * 地下世界闲谈
 */
export interface UnderworldChatter {
  source: string;
  rumor: string;
}

/**
 * 社交媒体动态
 */
export interface SocialFeed {
  user: string;
  post: string;
}

/**
 * 私人频道消息
 */
export interface PersonalChannel {
  from: string;
  type: MessageType;
  content: string;
}

/**
 * 线索钩子
 */
export interface ThreadHook {
  thread_id: string;
  title: string;
  hook: string;
}

/**
 * 广播区域 - 世界信息流
 */
export interface BroadcastArea {
  ambient_channel: AmbientMessage[];
  police_scanner: PoliceScanner[];
  underworld_chatter?: UnderworldChatter[];
  social_feed?: SocialFeed[];
  personal_channel: PersonalChannel[];
  thread_hooks: ThreadHook[];
}

// ==================== NPC 和行为相关 ====================

/**
 * 关系值
 */
export interface Rapport {
  sentiment: RapportSentiment;
  intensity: number; // 0-100
}

/**
 * NPC 实体
 */
export interface NPCEntity {
  id: string;
  name: string;
  status_summary: string;
  composure: string;
  rapport: Rapport;
}

/**
 * 行为项
 */
export interface BehaviorItem {
  actor: string;
  name?: string;
  behavior_type: BehaviorType | string;
  target?: string;
  narrative_snippet?: string;
}

/**
 * 可用玩家行为
 */
export interface AvailablePlayerBehavior {
  behavior_type: BehaviorType | string;
  description: string;
}

/**
 * 叙事线索
 */
export interface NarrativeThread {
  id: string;
  title: string;
  status: string;
}

// ==================== 动态视图 ====================

/**
 * 动态视图 - 场景和交互
 */
export interface DynamicView {
  scene_setting: string;
  involved_entities: NPCEntity[];
  behavior_stream: BehaviorItem[];
  available_player_behaviors: AvailablePlayerBehavior[];
  narrative_threads: NarrativeThread[];
  system_narrative?: string; // 可选的系统叙事
}

// ==================== 玩家状态 ====================

/**
 * 数值属性
 */
export interface StatValue {
  value: number;
  max: number;
}

/**
 * 信用分
 */
export interface CreditValue {
  value: number;
}

/**
 * 状态效果
 */
export interface StatusEffect {
  name: string;
  description: string;
  type: EffectType;
}

/**
 * 玩家状态区域
 */
export interface PlayerStatusArea {
  world_time: string;
  current_location: string;
  vigor: StatValue;           // 体力
  clarity: StatValue;         // 心力
  financial_power: FinancialPowerLevel;
  credit: CreditValue;
  active_effects: StatusEffect[];
}

// ==================== 场景快照 ====================

/**
 * 场景快照 - 完整的游戏状态数据
 * 
 * 这是游戏在某一回合的完整状态快照
 * 包含广播区域、动态视图和玩家状态
 */
export interface ScenarioSnapshot {
  broadcast_area: BroadcastArea;
  dynamic_view: DynamicView;
  player_status_area: PlayerStatusArea;
}

/**
 * 场景序列 - 故事的所有场景
 */
export type ScenarioSequence = ScenarioSnapshot[];

// ==================== 剧本系统（新增）====================

/**
 * 剧本单元类型
 * 
 * ✅ Phase X: 统一数据定义 + 近场系统扩展
 * - 'Plot' 替代 'Narrative'（与 demo-story-map.data.ts 保持一致）
 * - 新增 'Narrative' | 'InteractionTurn' 支持近场叙事系统
 */
export type PlotUnitType = 'Plot' | 'InterventionPoint' | 'Narrative' | 'InteractionTurn';

/**
 * 剧本单元 - 场景剧本的基本组成单元
 * 
 * 用于"剧情/冲突"混合模式的剧本播放器系统
 * - Plot: 普通剧情，自动播放
 * - InterventionPoint: 介入时机点，暂停并等待玩家决策
 * 
 * Phase X扩展：支持近场叙事系统
 * - Narrative: 近场叙事片段（自动播放）
 * - InteractionTurn: 近场交互回合（Player或NPC的对话）
 */
export interface PlotUnit {
  id?: string;            // 单元ID（可选，用于React key）
  unit_id?: string;       // 单元ID（近场系统专用，可选）
  type: PlotUnitType;
  actor: string;          // 演员名称，如 "System", "肥棠", "小雪", "Player"
  content: string;        // 剧情文本内容
  hint?: string;          // 介入时机点的提示文本（仅 InterventionPoint 类型）
}

/**
 * 场景剧本 - 完整的场景剧本数据
 * 
 * LLM 在场景加载时一次性生成，包含多个 PlotUnit
 * 引擎的"剧本播放器"将逐个播放这些单元
 */
export interface ScenePlot {
  id: string;             // 剧本唯一标识
  units: PlotUnit[];      // 剧本单元数组
}
