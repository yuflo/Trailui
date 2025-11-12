/**
 * Hong Kong Stories Registry
 * 
 * 香港故事注册表 - 管理Hong Kong世界的所有可用故事
 * 
 * ✨ Demo阶段：所有故事数据统一在demo-story-map.data.ts中管理
 * 
 * 添加新故事时，在此注册：
 * 1. 导入故事模块
 * 2. 在 hongKongStories 中添加条目
 */

// ✨ Demo阶段暂时不导入任何故事模块
// 所有故事数据由demo-story-map.data.ts统一管理
// import corporateTower from './corporate-tower';
// import neonMarket from './neon-market';

/**
 * Hong Kong 故事注册表
 * 
 * key: 故事ID（必须与故事配置中的 id 一致）
 * value: 故事模块（包含 config 和 scenarios）
 * 
 * ✨ Demo阶段为空，由demo-story-map管理
 */
export const hongKongStories = {
  // ✨ Demo阶段：使用demo-story-map.data.ts
  // 添加更多Hong Kong故事
  // 'corporate-tower': corporateTower,
  // 'neon-market': neonMarket,
};

/**
 * 获取所有Hong Kong故事ID
 */
export function getHongKongStoryIds(): string[] {
  return Object.keys(hongKongStories);
}

/**
 * 检查故事是否在Hong Kong世界中注册
 */
export function isHongKongStory(storyId: string): boolean {
  return storyId in hongKongStories;
}

/**
 * 获取Hong Kong故事模块
 */
export function getHongKongStory(storyId: string) {
  return hongKongStories[storyId as keyof typeof hongKongStories];
}
