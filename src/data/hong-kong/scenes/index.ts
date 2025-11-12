/**
 * Hong Kong Scenes - Mock Data Registry
 * 香港场景 - Mock数据注册表
 * 
 * 统一管理所有近场交互场景的Mock数据
 * 
 * 使用方式：
 * ```typescript
 * import { scenesMockData } from './data/hong-kong/scenes';
 * 
 * const sceneData = scenesMockData["SCENE_A_BAR_ENTRANCE"];
 * const loadResponse = sceneData.LOAD_SCENE;
 * const interactTurn1 = sceneData.INTERACT.turn_1;
 * ```
 */

import { sceneABarEntrance } from './scene-a-bar-entrance.data';
import { sceneBBarInterior } from './scene-b-bar-interior.data';
import type { ScenesMockDataRegistry } from '../../../types';

/**
 * 近场交互场景Mock数据注册表
 * 
 * ✨ Demo阶段：使用与demo-story-map一致的scene_id命名
 * 
 * 三层Key结构：
 * - scenes[scene_id] → 场景数据
 * - scenes[scene_id][action_type] → 行动分支
 * - scenes[scene_id][action_type][turn_N] → 具体轮次
 */
export const scenesMockData: ScenesMockDataRegistry = {
  "scene-a": sceneABarEntrance,  // ✨ 统一使用小写短ID，与demo-story-map一致
  "scene-b": sceneBBarInterior,
  
  // 未来可以继续添加场景：
  // "scene-c": sceneCUnderground,
  // "scene-d": sceneDRooftop,
};

// 导出单个场景数据（可选）
export { sceneABarEntrance } from './scene-a-bar-entrance.data';
export { sceneBBarInterior } from './scene-b-bar-interior.data';
