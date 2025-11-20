/**
 * Business Services 导出
 * 
 * 所有业务服务都是无状态的静态类
 */

export { ClueService } from './ClueService';
export { StoryService } from './StoryService';
export { SceneService } from './SceneService'; // 🔥 新增
export { NPCService } from './NPCService';
export { NarrativeService } from './NarrativeService';
export { TickerService, TickerServiceAdapter } from './TickerService'; // 🔥 新增（包含适配器）
export { VisualService } from './VisualService'; // 🔥 Phase 6.2: 新增
export { NearFieldService } from './NearFieldService'; // 🔥 Phase 6.3: 新增
export { MockSceneProvider, MockNPCProvider, MockEventProvider } from './MockDataProvider'; // 🔥 导出 mock 数据