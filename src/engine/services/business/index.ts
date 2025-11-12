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
export { MockSceneProvider, MockNPCProvider, MockEventProvider } from './MockDataProvider'; // 🔥 导出 mock 数据