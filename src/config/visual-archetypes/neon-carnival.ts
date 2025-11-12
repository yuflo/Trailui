/**
 * Visual Archetype: Neon Carnival
 * 霓虹狂欢：夜店、派对、混乱
 * 
 * 城市动作线 - 第三原型
 * 适用于夜生活、混乱场景
 */

import type { VisualArchetypeConfig } from './types';

export const neonCarnivalArchetype: VisualArchetypeConfig = {
  id: 'neon-carnival',
  name: '霓虹狂欢',
  description: '狂野的夜生活氛围，适合夜店、派对、混乱场景',
  category: '城市动作线',
  suitableFor: ['夜店', '派对', '狂欢', '混乱', '醉酒'],
  
  cssVariables: {
    scanlineDuration: '1.2s',
    scanlineOpacity: 0.6,
    scanlineVisibility: 1,
    halftoneSize: '12px',
    halftoneOpacity: 0.15,
    themeNeon: '#ff00ff',         // GTA粉
    themeSaturation: '130%',
    comicIntensity: 1.2,
    panelGlow: '0 0 30px rgba(255, 0, 255, 0.4)',
  },
};
