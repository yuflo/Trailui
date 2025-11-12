/**
 * Visual Archetype: Artistic Flow
 * 艺术律动：画廊、音乐厅、创作空间
 * 
 * 文化艺术线 - 第一原型
 * 适用于艺术、音乐场景
 */

import type { VisualArchetypeConfig } from './types';

export const artisticFlowArchetype: VisualArchetypeConfig = {
  id: 'artistic-flow',
  name: '艺术律动',
  description: '艺术创作氛围，适合画廊、音乐厅、创作空间场景',
  category: '文化艺术线',
  suitableFor: ['画廊', '音乐厅', '创作空间', '艺术展', '音乐演出'],
  
  cssVariables: {
    scanlineDuration: '4s',
    scanlineOpacity: 0.25,
    scanlineVisibility: 0.8,
    halftoneSize: '28px',
    halftoneOpacity: 0.1,
    themeNeon: '#ab47bc',         // 紫色
    themeSaturation: '85%',
    comicIntensity: 0.7,
    panelGlow: '0 0 22px rgba(171, 71, 188, 0.25)',
  },
};
