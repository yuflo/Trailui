/**
 * Dreamheart Engine - Game Type Definitions
 * 
 * 完整的游戏类型系统定义
 * 用于确保数据结构的类型安全和一致性
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
 * 
 * 🔥 升级说明：
 * - 新增 avatar, role, bio 字段
 * - 这些字段来自 NPC Registry（静态配置）
 * - status_summary, composure, rapport 仍然是动态的（来自 Scenario）
 */
export interface NPCEntity {
  /** NPC 唯一标识符 */
  id: string;
  
  /** NPC 姓名 */
  name: string;
  
  /** 头像 URL（新增） */
  avatar?: string;
  
  /** 职业/角色（新增） */
  role?: string;
  
  /** 简短描述（新增） */
  bio?: string;
  
  /** 当前状态描述（动态） */
  status_summary: string;
  
  /** 心防/稳定度（动态） */
  composure: string;
  
  /** 好感度（动态） */
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
  name?: string;              // 玩家姓名
  avatar?: string;            // 头像URL
  world_time: string;
  current_location: string;
  vigor: StatValue;           // 体力
  clarity: StatValue;         // 心力
  financial_power: FinancialPowerLevel;
  credit: CreditValue;
  active_effects: StatusEffect[];
}

// ==================== 顶层响应 ====================

/**
 * 游戏响应 - 完整的游戏状态快照
 */
export interface GameResponse {
  broadcast_area: BroadcastArea;
  dynamic_view: DynamicView;
  player_status_area: PlayerStatusArea;
}

// ==================== UI 相关类型 ====================

/**
 * 信息流消息（用于UI展示）
 */
export interface TickerMessage {
  type: string;
  color: string;
  text: string;
  icon: React.ReactNode;
}

// ==================== 主题系统 ====================

/**
 * 视觉原型 - 10种预设的基础风格模板
 */
export type VisualArchetype = 
  // 🏙️ 城市动作线
  | 'tense-urban'      // 紧张城市：后巷、追逐、对峙
  | 'action-intense'   // 激烈动作：赛车、枪战、爆炸
  | 'neon-carnival'    // 霓虹狂欢：夜店、派对、混乱
  // 💼 社会商业线
  | 'corporate-cold'   // 冷酷财团：交易、谈判、办公室
  | 'tech-startup'     // 科技创业：实验室、创业公司、科技展
  | 'daily-cozy'       // 日常温馨：咖啡馆、家庭、日常对话
  // 🎭 文化艺术线
  | 'artistic-flow'    // 艺术律动：画廊、音乐厅、创作空间
  | 'contemplative'    // 沉思哲学：图书馆、寺庙、深度对话
  // 🌙 情感暗流线
  | 'noir-mystery'     // 黑色悬疑：调查、推理、阴谋
  | 'sensual-haze';    // 情欲迷雾：私密空间、欲望、诱惑

/**
 * 视觉微调参数（可选）
 * 用于在原型基础上进行细微调整
 */
export interface VisualOverrides {
  accentColor?: string;        // 主题强调色（覆盖原型默认霓虹色）
  scanlineSpeed?: string;      // 扫描线速度（如 "2s", "5s"）
  comicIntensity?: number;     // 漫画强度 0-1
  glitchEffect?: boolean;      // 是否启用故障效果
  saturation?: string;         // 饱和度（如 "80%", "120%"）
}

/**
 * 游戏主题元数据
 */
export interface ThemeMetadata {
  id: string;                    // 主题唯一标识
  title: string;                 // 主题标题
  description: string;           // 主题描述
  tags: string[];                // 主题标签（氛围、类型等）
  icon?: string;                 // 主题图标（emoji）
  visualArchetype: VisualArchetype;  // 选择的视觉原型
  visualOverrides?: VisualOverrides; // 可选的视觉微调
}

/**
 * 游戏主题 - 包含完整的场景序列
 */
export interface GameTheme extends ThemeMetadata {
  scenarios: GameResponse[];  // 该主题下的所有场景
}

// ==================== 近场交互系统（简化版） ====================

/**
 * 剧情单元（Plot Unit）
 * 叙事序列中的基本单位
 */
export interface PlotUnit {
  /** 单元ID（可选） */
  unit_id?: string;
  
  /** 类型 */
  type: 'Narrative' | 'InterventionPoint' | 'InteractionTurn';
  
  /** 发言者 */
  actor: string;
  
  /** 内容 */
  content: string;
  
  /** 介入点提示（仅 InterventionPoint 有） */
  hint?: string;
}

/**
 * 近场交互模式
 */
export type NearFieldMode = 
  | 'PLAYING'        // 自动播放叙事
  | 'INTERVENTION'   // 等待玩家选择（介入/路过）
  | 'INTERACTION';   // 交互中（等待玩家输入）

/**
 * 近场交互状态（简化版）
 */
export interface NearFieldState {
  /** 是否在近场交互中 */
  active: boolean;
  
  /** 当前场景ID */
  sceneId: string | null;
  
  /** 场景的完整叙事序列（叙事模式显示） */
  narrativeSequence: PlotUnit[];
  
  /** 当前显示到第几条（0-based索引） */
  displayIndex: number;
  
  /** 当前模式 */
  mode: NearFieldMode;
  
  /** 介入点提示 */
  interventionHint: string | null;
  
  /** ✅ 交互对话序列（交互模式显示，来自 INTERACT 响应的 new_events） */
  interactionEvents: PlotUnit[];
  
  /** ✨ 当前场景完整数据（用于访问 transition 配置） */
  currentSceneData?: import('./story.types').SceneData;
}