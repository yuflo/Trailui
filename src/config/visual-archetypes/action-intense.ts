/**
 * Visual Archetype: Action Intense
 * 激烈动作：赛车、枪战、爆炸
 * 
 * 城市动作线 - 第二原型
 * 适用于高强度动作场景
 */

import type { VisualArchetypeConfig } from './types';

export const actionIntenseArchetype: VisualArchetypeConfig = {
  id: 'action-intense',
  name: '激烈动作',
  description: '高强度动作氛围，适合赛车、枪战、爆炸场景',
  category: '城市动作线',
  suitableFor: ['赛车', '枪战', '爆炸', '追逐战', '激烈冲突'],
  
  cssVariables: {
    scanlineDuration: '1.5s',
    scanlineOpacity: 0.5,
    scanlineVisibility: 1,
    halftoneSize: '18px',
    halftoneOpacity: 0.12,
    themeNeon: '#ff6f00',         // GTA橙
    themeSaturation: '110%',
    comicIntensity: 1.0,
    panelGlow: '0 0 25px rgba(255, 111, 0, 0.3)',
  },
};
