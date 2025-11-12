/**
 * Visual Archetype: Sensual Haze
 * 情欲迷雾：私密空间、欲望、诱惑
 * 
 * 情感暗流线 - 第二原型
 * 适用于情感、私密场景
 */

import type { VisualArchetypeConfig } from './types';

export const sensualHazeArchetype: VisualArchetypeConfig = {
  id: 'sensual-haze',
  name: '情欲迷雾',
  description: '私密情感氛围，适合私密空间、欲望、诱惑场景',
  category: '情感暗流线',
  suitableFor: ['私密空间', '欲望', '诱惑', '情感交流', '浪漫'],
  
  cssVariables: {
    scanlineDuration: '7s',
    scanlineOpacity: 0.12,
    scanlineVisibility: 0.6,
    halftoneSize: '32px',
    halftoneOpacity: 0.06,
    themeNeon: '#ec407a',         // 粉红色
    themeSaturation: '75%',
    comicIntensity: 0.5,
    panelGlow: '0 0 20px rgba(236, 64, 122, 0.2)',
  },
};
