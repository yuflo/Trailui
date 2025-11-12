/**
 * Visual Archetype: Noir Mystery
 * 黑色悬疑：调查、推理、阴谋
 * 
 * 情感暗流线 - 第一原型
 * 适用于悬疑、推理场景
 */

import type { VisualArchetypeConfig } from './types';

export const noirMysteryArchetype: VisualArchetypeConfig = {
  id: 'noir-mystery',
  name: '黑色悬疑',
  description: '悬疑推理氛围，适合调查、推理、阴谋场景',
  category: '情感暗流线',
  suitableFor: ['调查', '推理', '阴谋', '侦探工作', '神秘事件'],
  
  cssVariables: {
    scanlineDuration: '6s',
    scanlineOpacity: 0.15,
    scanlineVisibility: 0.7,
    halftoneSize: '38px',
    halftoneOpacity: 0.05,
    themeNeon: '#8b5cf6',         // 深紫色
    themeSaturation: '55%',
    comicIntensity: 0.4,
    panelGlow: '0 0 12px rgba(139, 92, 246, 0.12)',
  },
};
