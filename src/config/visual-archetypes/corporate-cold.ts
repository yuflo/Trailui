/**
 * Visual Archetype: Corporate Cold
 * 冷酷财团：交易、谈判、办公室
 * 
 * 社会商业线 - 第一原型
 * 适用于商业、财团场景
 */

import type { VisualArchetypeConfig } from './types';

export const corporateColdArchetype: VisualArchetypeConfig = {
  id: 'corporate-cold',
  name: '冷酷财团',
  description: '冷静专业的商业氛围，适合交易、谈判、办公室场景',
  category: '社会商业线',
  suitableFor: ['交易', '谈判', '办公室', '商业会议', '财团决策'],
  
  cssVariables: {
    scanlineDuration: '5s',
    scanlineOpacity: 0.2,
    scanlineVisibility: 1,
    halftoneSize: '35px',
    halftoneOpacity: 0.06,
    themeNeon: '#ffeb3b',         // GTA黄
    themeSaturation: '60%',
    comicIntensity: 0.5,
    panelGlow: '0 0 15px rgba(255, 235, 59, 0.15)',
  },
};
