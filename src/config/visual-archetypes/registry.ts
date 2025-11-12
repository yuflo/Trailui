/**
 * Visual Archetype Registry
 * 
 * 视觉原型注册表 - 管理所有可用原型
 */

import type { VisualArchetype, VisualArchetypeConfig } from './types';
import { tenseUrbanArchetype } from './tense-urban';
import { actionIntenseArchetype } from './action-intense';
import { neonCarnivalArchetype } from './neon-carnival';
import { corporateColdArchetype } from './corporate-cold';
import { techStartupArchetype } from './tech-startup';
import { dailyCozyArchetype } from './daily-cozy';
import { artisticFlowArchetype } from './artistic-flow';
import { contemplativeArchetype } from './contemplative';
import { noirMysteryArchetype } from './noir-mystery';
import { sensualHazeArchetype } from './sensual-haze';

/**
 * 视觉原型注册表
 */
export const archetypeRegistry: Record<VisualArchetype, VisualArchetypeConfig> = {
  // 🏙️ 城市动作线
  'tense-urban': tenseUrbanArchetype,
  'action-intense': actionIntenseArchetype,
  'neon-carnival': neonCarnivalArchetype,
  
  // 💼 社会商业线
  'corporate-cold': corporateColdArchetype,
  'tech-startup': techStartupArchetype,
  'daily-cozy': dailyCozyArchetype,
  
  // 🎭 文化艺术线
  'artistic-flow': artisticFlowArchetype,
  'contemplative': contemplativeArchetype,
  
  // 🌙 情感暗流线
  'noir-mystery': noirMysteryArchetype,
  'sensual-haze': sensualHazeArchetype,
};

/**
 * 获取所有可用的视觉原型ID
 */
export function getAllArchetypeIds(): VisualArchetype[] {
  return Object.keys(archetypeRegistry) as VisualArchetype[];
}

/**
 * 获取视觉原型配置
 */
export function getArchetype(id: VisualArchetype): VisualArchetypeConfig | undefined {
  return archetypeRegistry[id];
}

/**
 * 检查原型是否存在
 */
export function isArchetypeValid(id: string): id is VisualArchetype {
  return id in archetypeRegistry;
}

/**
 * 按分类获取原型
 */
export function getArchetypesByCategory(category: string): VisualArchetypeConfig[] {
  return Object.values(archetypeRegistry).filter(
    archetype => archetype.category === category
  );
}

/**
 * 获取所有分类
 */
export function getAllCategories(): string[] {
  const categories = new Set(
    Object.values(archetypeRegistry).map(a => a.category)
  );
  return Array.from(categories);
}
