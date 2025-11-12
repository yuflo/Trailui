/**
 * Visual Service Implementation
 * 
 * 视觉服务实现
 * 负责应用视觉原型配置到 DOM
 */

import type { IVisualService } from '../../../types';
import type { VisualArchetype, VisualOverrides, AppliedVisualConfig } from '../../../types';
import { archetypeRegistry, getAllArchetypeIds, getArchetype } from '../../../config';

/**
 * 视觉服务实现类
 */
export class VisualServiceImpl implements IVisualService {
  private currentConfig: AppliedVisualConfig | null = null;
  
  /**
   * 获取所有可用的视觉原型
   */
  getAllArchetypes(): VisualArchetype[] {
    return getAllArchetypeIds();
  }
  
  /**
   * 应用视觉原型到DOM
   */
  applyArchetype(archetypeId: VisualArchetype, overrides?: VisualOverrides): AppliedVisualConfig {
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
    
    // 保存当前配置
    this.currentConfig = {
      archetype: archetypeId,
      cssVariables: finalCssVars,
      overrides,
    };
    
    return this.currentConfig;
  }
  
  /**
   * 清除当前视觉原型
   */
  clearArchetype(): void {
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
    
    this.currentConfig = null;
  }
  
  /**
   * 获取当前应用的视觉配置
   */
  getCurrentConfig(): AppliedVisualConfig | null {
    return this.currentConfig;
  }
}
