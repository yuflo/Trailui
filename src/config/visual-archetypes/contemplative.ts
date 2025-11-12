/**
 * Visual Archetype: Contemplative
 * 沉思哲学：图书馆、寺庙、深度对话
 * 
 * 文化艺术线 - 第二原型
 * 适用于沉思、哲学场景
 */

import type { VisualArchetypeConfig } from './types';

export const contemplativeArchetype: VisualArchetypeConfig = {
  id: 'contemplative',
  name: '沉思哲学',
  description: '沉静思考氛围，适合图书馆、寺庙、深度对话场景',
  category: '文化艺术线',
  suitableFor: ['图书馆', '寺庙', '深度对话', '哲学讨论', '冥想'],
  
  cssVariables: {
    scanlineDuration: '10s',
    scanlineOpacity: 0.08,
    scanlineVisibility: 0.3,
    halftoneSize: '45px',
    halftoneOpacity: 0.03,
    themeNeon: '#7986cb',         // 淡蓝色
    themeSaturation: '40%',
    comicIntensity: 0.2,
    panelGlow: '0 0 8px rgba(121, 134, 203, 0.08)',
  },
};
