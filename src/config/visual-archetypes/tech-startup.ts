/**
 * Visual Archetype: Tech Startup
 * 科技创业：实验室、创业公司、科技展
 * 
 * 社会商业线 - 第二原型
 * 适用于科技、创新场景
 */

import type { VisualArchetypeConfig } from './types';

export const techStartupArchetype: VisualArchetypeConfig = {
  id: 'tech-startup',
  name: '科技创业',
  description: '创新科技氛围，适合实验室、创业公司、科技展场景',
  category: '社会商业线',
  suitableFor: ['实验室', '创业公司', '科技展', '创新项目', '技术演示'],
  
  cssVariables: {
    scanlineDuration: '3s',
    scanlineOpacity: 0.35,
    scanlineVisibility: 1,
    halftoneSize: '25px',
    halftoneOpacity: 0.08,
    themeNeon: '#00f0ff',         // 青色
    themeSaturation: '90%',
    comicIntensity: 0.6,
    panelGlow: '0 0 18px rgba(0, 240, 255, 0.2)',
  },
};
