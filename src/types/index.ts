/**
 * Dreamheart Engine - Type System Entry Point
 * 
 * 统一导出所有类型定义
 */

// ==================== 导出原有类型（向后兼容） ====================
export * from './game.types';

// ==================== 导出新类型系统 ====================

// 故事类型
export type {
  StoryMetadata,
  StoryConfig,
  DemoSceneData,
  DemoStoryMeta,
  DemoStoryMap,
} from './story.types';

// 场景类型
export type {
  BehaviorType,
  MessageType,
  EffectType,
  RapportSentiment,
  FinancialPowerLevel,
  AmbientMessage,
  PoliceScanner,
  UnderworldChatter,
  SocialFeed,
  PersonalChannel,
  ThreadHook,
  BroadcastArea,
  Rapport,
  NPCEntity,
  BehaviorItem,
  AvailablePlayerBehavior,
  NarrativeThread,
  DynamicView,
  StatValue,
  CreditValue,
  StatusEffect,
  PlayerStatusArea,
  ScenarioSnapshot,
  ScenarioSequence,
  // 剧本系统类型（新增）
  PlotUnitType,
  PlotUnit,
  ScenePlot,
} from './scenario.types';

// 视觉类型
export type {
  VisualArchetype,
  VisualOverrides,
  VisualArchetypeConfig,
  AppliedVisualConfig,
} from './visual.types';

// 服务类型
export type {
  IStoryService,
  IVisualService,
  ITickerService,
  TickerMessageData,
  BroadcastMessageData,
  INarrativeClueService,
  IFreedomMirrorService,
  IClueService,
  ClueStatus,
  ClueData,
  TrackedStoryData,
  SceneSequenceItem,
  INearFieldService,
} from './service.types';

// 引擎类型
export type {
  GameState,
  StatDelta,
  RapportDelta,
  TurnResult,
  EngineEventType,
  EngineEvent,
  EventListener,
  EngineConfig,
} from './engine.types';

// 引擎枚举（新增）
export { GameSessionState, MirrorMode } from './engine.types';

// 近场交互类型
export type {
  NearFieldEvent,
  NarrativeEvent,
  InterventionPointEvent,
  InteractionTurnEvent,
  InteractionPolicy,
  EntityUpdate,
  SceneStatus,
  PlayerAction,
  LoadSceneAction,
  InteractAction,
  PassAction,
  RequestNarrativeAction,
  AdvanceRequest,
  AdvanceResponse,
  NextActionType,
  AwaitingInterventionAction,
  AwaitingInteractionAction,
  PlayingNarrativeAction,
  SceneEndedAction,
  SceneMockData,
  ScenesMockDataRegistry,
} from './nearfield.types';

// 数据访问层类型（新增）
export type {
  IClueDataAccess,
  IStoryDataAccess,
  IWorldInfoDataAccess,
  ISceneDataAccess,
} from './data-access.types';

// 🔥 Phase 3: 实例类型系统
export type {
  StoryInstance,
  SceneInstance,
  NPCInstance,
  ClueRecord,
  NarrativeUnit,
  LLMSceneNarrativeRecord,
  LLMDialogueRecord,
} from './instance.types';