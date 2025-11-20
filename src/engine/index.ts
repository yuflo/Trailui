/**
 * Engine Entry Point
 * 
 * 引擎系统统一导出
 */

export { GameEngine } from './core/GameEngine';
export { ServiceContainer } from './services/ServiceContainer';

// 导出系统（如果需要单独使用）
export { StatSystem, RapportSystem, BehaviorSystem, TickerSystem } from './systems';
export type { ExtendedBehaviorItem, TickerMessageWithIcon } from './systems';

// 导出服务（如果需要单独使用）
export { StoryServiceImpl, VisualServiceImpl } from './services';

// 🔥 Phase 3: 导出新的Business Services
export { ClueService, StoryService, NPCService, NarrativeService, TickerService } from './services/business';