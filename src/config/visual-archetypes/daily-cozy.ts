/**
 * Visual Archetype: Daily Cozy
 * 日常温馨：咖啡馆、家庭、日常对话
 * 
 * 社会商业线 - 第三原型
 * 适用于温馨、日常场景
 */

import type { VisualArchetypeConfig } from './types';

export const dailyCozyArchetype: VisualArchetypeConfig = {
  id: 'daily-cozy',
  name: '日常温馨',
  description: '温馨舒适的日常氛围，适合咖啡馆、家庭、日常对话场景',
  category: '社会商业线',
  suitableFor: ['咖啡馆', '家庭', '日常对话', '放松时刻', '温馨场景'],
  
  cssVariables: {
    scanlineDuration: '8s',
    scanlineOpacity: 0.1,
    scanlineVisibility: 0.5,
    halftoneSize: '40px',
    halftoneOpacity: 0.04,
    themeNeon: '#ffa726',         // 暖橙色
    themeSaturation: '50%',
    comicIntensity: 0.3,
    panelGlow: '0 0 10px rgba(255, 167, 38, 0.1)',
  },
};
