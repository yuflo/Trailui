/**
 * Hong Kong World Package
 * 
 * 香港世界包 - 完整的DLC内容包
 * 包含故事、世界信息等所有数据
 */

import { hongKongStories, getHongKongStoryIds, isHongKongStory, getHongKongStory } from './stories';
import { tickerMessages, broadcastMessages } from './world-info';
import { scenesMockData } from './scenes';

/**
 * Hong Kong 世界配置
 */
export const hongKongWorld = {
  id: 'hong-kong',
  name: '香港',
  description: '赛博朋克风格的香港城市，霓虹闪烁的街道与暗流涌动的地下世界',
  
  // 故事注册表
  stories: hongKongStories,
  
  // 世界数据
  worldInfo: {
    tickerMessages,
    broadcastMessages,
  },
  
  // 近场交互场景数据
  scenes: scenesMockData,
  
  // 辅助方法
  getStoryIds: getHongKongStoryIds,
  isStory: isHongKongStory,
  getStory: getHongKongStory,
  
  // 线索数据获取方法（延迟加载以避免循环依赖）
  async getClues() {
    const { clueRegistry } = await import('./clues');
    return clueRegistry;
  },
};

// 导出类型
export type HongKongWorld = typeof hongKongWorld;

// 导出子模块
export * from './stories';
export * from './world-info';
export * from './clues';
export * from './scenes';
export * from './narrative-clues';
