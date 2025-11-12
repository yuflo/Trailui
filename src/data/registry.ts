/**
 * World Registry
 * 
 * 世界注册表 - 管理所有可用的游戏世界/DLC
 * 
 * 添加新世界时，在此注册
 */

import type { HongKongWorld } from './hong-kong';

/**
 * 世界注册表
 * 
 * 使用动态导入来支持代码分割和按需加载
 */
export const WORLDS = {
  'hong-kong': () => import('./hong-kong'),
  // 未来的DLC世界
  // 'tokyo': () => import('./tokyo'),
  // 'neo-seoul': () => import('./neo-seoul'),
  // 'night-city': () => import('./night-city'),
} as const;

/**
 * 世界ID类型
 */
export type WorldId = keyof typeof WORLDS;

/**
 * 默认世界
 */
export const DEFAULT_WORLD: WorldId = 'hong-kong';

/**
 * 获取所有已注册的世界ID
 */
export function getAllWorldIds(): WorldId[] {
  return Object.keys(WORLDS) as WorldId[];
}

/**
 * 检查世界是否已注册
 */
export function isWorldRegistered(worldId: string): worldId is WorldId {
  return worldId in WORLDS;
}

/**
 * 加载世界包
 * 
 * @param worldId - 世界ID
 * @returns 世界包数据
 */
export async function loadWorld(worldId: WorldId) {
  const worldModule = await WORLDS[worldId]();
  return worldModule.hongKongWorld; // TODO: 需要统一接口
}

/**
 * 世界元数据
 * 
 * 用于显示世界选择器等UI
 */
export const WORLD_METADATA: Record<WorldId, {
  id: WorldId;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}> = {
  'hong-kong': {
    id: 'hong-kong',
    name: '香港',
    description: '赛博朋克风格的香港城市，霓虹闪烁的街道与暗流涌动的地下世界',
    icon: '🇭🇰',
    available: true,
  },
  // 未来的DLC
  // 'tokyo': {
  //   id: 'tokyo',
  //   name: '东京',
  //   description: '未来科技与传统文化交织的东京，地下街的霓虹与高楼的冷光',
  //   icon: '🇯🇵',
  //   available: false, // DLC未发布
  // },
};
