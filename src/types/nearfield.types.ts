/**
 * Dreamheart Engine - Near-Field Interaction Type Definitions
 * 
 * 近场交互类型系统定义
 * 
 * 设计理念：
 * - 基于原文档的统一advance接口设计
 * - 前端作为"纯渲染器"
 * - Service层无状态（Demo阶段）
 * - 三层Key结构的Mock数据
 */

// ==================== 事件类型 ====================

/**
 * 近场交互事件（统一事件类型）
 * 
 * 所有近场交互中发生的事件，包括：
 * - Narrative: 纯叙事（无交互）
 * - InterventionPoint: 介入点（玩家可选择介入或路过）
 * - InteractionTurn: 交互回合（玩家与NPC的对话）
 */
export type NearFieldEvent = 
  | NarrativeEvent 
  | InterventionPointEvent 
  | InteractionTurnEvent;

/**
 * 叙事事件
 * 
 * 纯叙述性内容，无玩家交互
 * 例如：环境描述、NPC独白、系统叙事等
 */
export interface NarrativeEvent {
  /** 事件唯一ID */
  unit_id: string;
  
  /** 事件类型标识 */
  type: "Narrative";
  
  /** 发言者（System, NPC名字等） */
  actor: string;
  
  /** 叙事内容 */
  content: string;
  
  /**
   * 是否为场景末节点
   * 
   * Demo阶段：在 mock 数据中预定义
   * 正式线上：由 LLM 标记
   * 
   * 当 is_terminal = true 时，场景叙事结束
   * 前端根据 SceneData.transition 决定下一步流转
   */
  is_terminal?: boolean;
}

/**
 * 介入点事件
 * 
 * 玩家可以选择"介入"或"路过"的时机点
 * 介入后进入交互模式，路过则剪枝后续预定叙事
 * 
 * 原文档说明：
 * "当玩家在第一个介入点选择'介入'（INTERACT），
 *  前端将丢弃（剪枝）所有后续未播放的预定叙事。"
 */
export interface InterventionPointEvent {
  /** 事件唯一ID */
  unit_id: string;
  
  /** 事件类型标识 */
  type: "InterventionPoint";
  
  /** 发言者（通常是NPC） */
  actor: string;
  
  /** NPC的对话内容 */
  content: string;
  
  /** 给玩家的提示文本 */
  hint: string;
  
  /** 交互策略（结束引导策略） */
  policy: InteractionPolicy;
}

/**
 * 交互回合事件
 * 
 * 玩家与NPC的回合制对话
 * 每一轮包含2个InteractionTurn：
 * - Player的turn（content由前端填充）
 * - NPC的turn（content由Mock数据提供）
 */
export interface InteractionTurnEvent {
  /** 事件唯一ID */
  unit_id: string;
  
  /** 事件类型标识 */
  type: "InteractionTurn";
  
  /** 发言者（Player 或 NPC名字） */
  actor: string;
  
  /** 
   * 对话内容
   * 注意：Player的turn没有content，由前端填充玩家输入
   */
  content?: string;
}

// ==================== 策略与状态 ====================

/**
 * 交互策略（结束引导策略）
 * 
 * 定义交互的收敛条件和目标
 * 原文档说明：
 * "玩家与 AI 在'结束引导策略'的上下文中进行多轮回合制交互"
 */
export interface InteractionPolicy {
  /** 最大交互轮数 */
  max_turns: number;
  
  /** 收敛目标（描述性文本） */
  goal: string;
  
  /** 约束条件（可选） */
  constraints?: string;
}

/**
 * 实体状态更新
 * 
 * 用于驱动游戏UI中的实体状态面板
 * 例如：NPC的composure（镇定值）、status（状态描述）
 */
export interface EntityUpdate {
  /** 实体ID（如 NPC_FAT_TANG） */
  entity_id: string;
  
  /** 镇定值（0-100） */
  composure?: number;
  
  /** 状态描述（如"烦躁"、"被激怒"） */
  status?: string;
  
  // 未来可扩展其他状态字段
}

/**
 * 场景状态
 * 
 * 描述场景的收敛状态和下一步流转
 */
export interface SceneStatus {
  /** 场景是否结束 */
  is_scene_over: boolean;
  
  /** 下一个场景ID（如果场景结束） */
  next_scene_id: string | null;
  
  /** 故事是否结束 */
  is_story_over: boolean;
  
  /** 新获得的线索（可选） */
  new_clue: any | null;  // TODO: 使用ClueData类型
  
  /** 当前交互策略（可选） */
  interaction_policy?: {
    max_turns: number;
    current_turn: number;
  };
}

// ==================== 请求与响应 ====================

/**
 * 玩家行动类型
 * 
 * 定义玩家可以执行的4种行动：
 * - LOAD_SCENE: 加载场景（gen #3）
 * - INTERACT: 介入或交互（gen #4a/4b）
 * - PASS: 路过（剪枝）
 * - REQUEST_NARRATIVE: 请求后续叙事（gen #3b，自动调用）
 */
export type PlayerAction =
  | LoadSceneAction
  | InteractAction
  | PassAction
  | RequestNarrativeAction;

/**
 * LOAD_SCENE 行动
 * 
 * 玩家刚从"故事线"点击进来，请求加载第一个场景的叙事序列
 * 
 * ✅ Phase X: 新增 narrative_index
 * - 通常为0（从头开始）
 */
export interface LoadSceneAction {
  type: "LOAD_SCENE";
  intent_text: null;
  /** 叙事索引（可选，默认0） */
  narrative_index?: number;
}

/**
 * INTERACT 行动
 * 
 * 玩家在"介入点"或"交互中"发起了行动
 * intent_text包含玩家的文本输入
 * 
 * ✅ Phase X: 新增 narrative_index
 * - 记录介入时的叙事位置
 * - 用于交互结束后返回叙事循环
 */
export interface InteractAction {
  type: "INTERACT";
  intent_text: string;
  /** 叙事索引（可选） */
  narrative_index?: number;
}

/**
 * PASS 行动
 * 
 * 玩家在"介入点"选择了"路过"
 * 
 * ✅ Phase X: 新增 narrative_index
 * - 记录当前介入点的位置
 * - 路过后从这个位置+1继续播放
 */
export interface PassAction {
  type: "PASS";
  intent_text: null;
  /** 叙事索引（必需） */
  narrative_index: number;
}

/**
 * REQUEST_NARRATIVE 行动
 * 
 * 交互（gen #4）结束后，前端根据后端的next_action_type指令，
 * 自动调用此类型，以请求后续的叙事（gen #3b）
 * 
 * 注意：这是自动调用的，前端不需要手动触发
 * 
 * ✅ Phase X: 新增 narrative_index
 * - 指示应该读取 narrative_sequence 的哪个片段
 * - 循环播放的核心参数
 */
export interface RequestNarrativeAction {
  type: "REQUEST_NARRATIVE";
  intent_text: null;
  /** 叙事索引（必需） */
  narrative_index: number;
}

/**
 * advance 请求
 * 
 * 统一的场景推进请求
 * 这是近场交互的唯一入口
 */
export interface AdvanceRequest {
  /** 故事ID */
  story_id: string;
  
  /** 当前场景ID */
  current_scene_id: string;
  
  /**
   * 场景历史上下文（Demo阶段前端维护）
   * 
   * 包含当前Scene中所有已发生事件的完整历史数组
   * 
   * Demo阶段：前端负责传递完整的scene_history_context
   * 正式版：这部分历史将由后端的"Story Memory"模块管理，
   *         前端只需传递player_action
   */
  scene_history_context: NearFieldEvent[];
  
  /** 玩家的行动指令 */
  player_action: PlayerAction;
}

/**
 * advance 响应
 * 
 * 统一的场景推进响应
 * 包含新事件、实体更新、场景状态和下一步行动指令
 */
export interface AdvanceResponse {
  /** 故事ID */
  story_id: string;
  
  /** 当前场景ID */
  current_scene_id: string;
  
  /**
   * 新事件列表
   * 
   * 后端返回的"新事件"列表
   * 前端只需接收此数组并逐个渲染/播放即可
   * 
   * 可能是：
   * - narrative (gen #3)
   * - interaction turn (gen #4a)
   * - forced conclusion (gen #3b / #4b)
   */
  new_events: NearFieldEvent[];
  
  /**
   * 伴随的UI状态更新
   * 
   * 用于驱动游戏UI中的实体状态面板
   * 例如：NPC的composure变化
   */
  entity_updates: EntityUpdate[];
  
  /** 场景的收敛策略与状态 */
  scene_status: SceneStatus;
  
  /**
   * 前端的下一步行动指引
   * 
   * 这是前端状态机的驱动指令
   * 前端根据此字段决定下一步UI行为
   */
  next_action_type: NextActionType;
}

// ==================== 前端状态机指令 ====================

/**
 * 下一步行动指令类型
 * 
 * 定义前端应该执行的下一步操作
 * 这是Service层驱动前端状态机的核心机制
 */
export type NextActionType =
  | AwaitingInterventionAction
  | AwaitingInteractionAction
  | PlayingNarrativeAction
  | SceneEndedAction;

/**
 * AWAITING_INTERVENTION 指令
 * 
 * 前端应该：
 * 1. 播放new_events（直到InterventionPoint）
 * 2. 显示[介入]和[路过]按钮
 * 
 * ✅ Phase X: 新增 narrative_index
 * - 用于记录当前介入点在 narrative_sequence 中的位置
 * - 玩家"路过"后，从这个位置+1继续播放
 */
export interface AwaitingInterventionAction {
  type: "AWAITING_INTERVENTION";
  /** 当前叙事索引（可选） */
  narrative_index?: number;
}

/**
 * AWAITING_INTERACTION 指令
 * 
 * 前端应该：
 * 1. 播放new_events（交互回合）
 * 2. 激活输入框，等待玩家下一轮输入
 * 
 * ✅ Phase X: 新增 narrative_index
 * - 用于交互结束后返回叙事循环
 * - 记录应该从 narrative_sequence 的哪个位置继续
 */
export interface AwaitingInteractionAction {
  type: "AWAITING_INTERACTION";
  /** 当前叙事索引（可选） */
  narrative_index?: number;
}

/**
 * PLAYING_NARRATIVE 指令
 * 
 * 前端应该：
 * 1. 播放new_events
 * 2. 播放完毕后，立即自动再次调用 advance 并传入
 *    player_action: { type: "REQUEST_NARRATIVE", narrative_index: ... }
 * 
 * 注意：这是自动触发的，前端不需要等待用户操作
 * 
 * ✅ Phase X: 新增 narrative_index
 * - 指示下次 REQUEST_NARRATIVE 应该读取哪个片段
 * - 循环播放的核心机制
 */
export interface PlayingNarrativeAction {
  type: "PLAYING_NARRATIVE";
  /** 下一次叙事索引（必需） */
  narrative_index: number;
}

/**
 * SCENE_ENDED 指令
 * 
 * 前端应该：
 * 1. 播放new_events
 * 2. 检查scene_status
 * 3. 如果next_scene_id存在，则调用LOAD_SCENE加载新场景
 * 4. 如果is_story_over为true，则退出近场交互
 */
export interface SceneEndedAction {
  type: "SCENE_ENDED";
}

// ==================== Mock 数据结构 ====================

/**
 * 场景Mock数据结构
 * 
 * 用于Demo阶段的三层Key查找：
 * mockData[scene_id][action_type][turn_N]
 */
export interface SceneMockData {
  /** 场景ID */
  scene_id: string;
  
  /** LOAD_SCENE 动作的响应 */
  LOAD_SCENE: AdvanceResponse;
  
  /** INTERACT 动作的响应（多轮） */
  INTERACT: {
    [key: string]: AdvanceResponse;  // turn_1, turn_2, turn_3, ..., default
  };
  
  /** PASS 动作的响应 */
  PASS: AdvanceResponse;
  
  /** REQUEST_NARRATIVE 动作的响应（可选） */
  REQUEST_NARRATIVE?: AdvanceResponse;
}

/**
 * 场景Mock数据注册表
 * 
 * 所有场景的Mock数据集合
 */
export interface ScenesMockDataRegistry {
  [sceneId: string]: Omit<SceneMockData, 'scene_id'>;
}
