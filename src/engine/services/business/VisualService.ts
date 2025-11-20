/**
 * VisualService - 视觉原型业务服务（静态方法）
 * 
 * Phase 6.2: 从 VisualServiceImpl 完全迁移到 business 层
 * - 完全无状态（静态方法）
 * - 状态存储在内存中（不需要持久化）
 * - 负责应用视觉原型配置到 DOM
 */

import type { VisualArchetype, VisualOverrides, AppliedVisualConfig } from '../../../types';
import { getAllArchetypeIds, getArchetype } from '../../../config';

/**
 * 当前应用的视觉配置（内存状态）
 */
let currentConfig: AppliedVisualConfig | null = null;

/**
 * 视觉服务
 */
export class VisualService {
  /**
   * 获取所有可用的视觉原型
   * 🔥 从 VisualServiceImpl 迁移
   */
  static getAllArchetypes(): VisualArchetype[] {
    return getAllArchetypeIds();
  }
  
  /**
   * 应用视觉原型到DOM
   * 🔥 从 VisualServiceImpl 迁移
   * 
   * @param archetypeId 视觉原型ID
   * @param overrides 可选的微调参数
   * @returns 应用后的配置
   */
  static applyArchetype(archetypeId: VisualArchetype, overrides?: VisualOverrides): AppliedVisualConfig {
    const archetype = getArchetype(archetypeId);
    
    if (!archetype) {
      throw new Error(`Visual archetype not found: ${archetypeId}`);
    }
    
    const root = document.documentElement;
    
    // 设置 data-visual-archetype 属性
    root.setAttribute('data-visual-archetype', archetypeId);
    
    // 应用原型的CSS变量
    const cssVars = archetype.cssVariables;
    root.style.setProperty('--scanline-duration', cssVars.scanlineDuration);
    root.style.setProperty('--scanline-opacity', cssVars.scanlineOpacity.toString());
    root.style.setProperty('--scanline-visibility', cssVars.scanlineVisibility.toString());
    root.style.setProperty('--halftone-size', cssVars.halftoneSize);
    root.style.setProperty('--halftone-opacity', cssVars.halftoneOpacity.toString());
    root.style.setProperty('--theme-neon', cssVars.themeNeon);
    root.style.setProperty('--theme-saturation', cssVars.themeSaturation);
    root.style.setProperty('--comic-intensity', cssVars.comicIntensity.toString());
    root.style.setProperty('--panel-glow', cssVars.panelGlow);
    
    // 应用微调参数（覆盖原型默认值）
    const finalCssVars: Record<string, string | number> = { ...cssVars };
    
    if (overrides) {
      if (overrides.accentColor) {
        root.style.setProperty('--theme-neon', overrides.accentColor);
        finalCssVars.themeNeon = overrides.accentColor;
      }
      
      if (overrides.scanlineSpeed) {
        root.style.setProperty('--scanline-duration', overrides.scanlineSpeed);
        finalCssVars.scanlineDuration = overrides.scanlineSpeed;
      }
      
      if (overrides.comicIntensity !== undefined) {
        root.style.setProperty('--comic-intensity', overrides.comicIntensity.toString());
        finalCssVars.comicIntensity = overrides.comicIntensity;
      }
      
      if (overrides.saturation) {
        root.style.setProperty('--theme-saturation', overrides.saturation);
        finalCssVars.themeSaturation = overrides.saturation;
      }
    }
    
    // 保存当前配置（内存状态）
    currentConfig = {
      archetype: archetypeId,
      cssVariables: finalCssVars,
      overrides,
    };
    
    console.log(`[VisualService] ✅ Applied archetype: ${archetypeId}`);
    
    return currentConfig;
  }
  
  /**
   * 清除当前视觉原型
   * 🔥 从 VisualServiceImpl 迁移
   */
  static clearArchetype(): void {
    const root = document.documentElement;
    
    // 移除属性
    root.removeAttribute('data-visual-archetype');
    
    // 移除CSS变量
    root.style.removeProperty('--scanline-duration');
    root.style.removeProperty('--scanline-opacity');
    root.style.removeProperty('--scanline-visibility');
    root.style.removeProperty('--halftone-size');
    root.style.removeProperty('--halftone-opacity');
    root.style.removeProperty('--theme-neon');
    root.style.removeProperty('--theme-saturation');
    root.style.removeProperty('--comic-intensity');
    root.style.removeProperty('--panel-glow');
    
    currentConfig = null;
    
    console.log('[VisualService] ✅ Cleared archetype');
  }
  
  /**
   * 获取当前应用的视觉配置
   * 🔥 从 VisualServiceImpl 迁移
   * 
   * @returns 当前配置，如果未应用则返回 null
   */
  static getCurrentConfig(): AppliedVisualConfig | null {
    return currentConfig;
  }
}
