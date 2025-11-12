/**
 * Visual Archetype: Tense Urban
 * 紧张城市：后巷、追逐、对峙
 * 
 * 城市动作线 - 第一原型
 * 适用于紧张、悬疑的城市场景
 */

import type { VisualArchetypeConfig } from './types';

export const tenseUrbanArchetype: VisualArchetypeConfig = {
  id: 'tense-urban',
  name: '紧张城市',
  description: '快节奏的城市氛围，适合后巷对峙、追逐场景',
  category: '城市动作线',
  suitableFor: ['后巷', '追逐', '对峙', '街头冲突', '紧张谈判'],
  
  cssVariables: {
    scanlineDuration: '2s',
    scanlineOpacity: 0.4,
    scanlineVisibility: 1,
    halftoneSize: '15px',
    halftoneOpacity: 0.1,
    themeNeon: '#00d4ff',         // GTA蓝
    themeSaturation: '80%',
    comicIntensity: 0.8,
    panelGlow: '0 0 20px rgba(0, 212, 255, 0.2)',
  },
};
