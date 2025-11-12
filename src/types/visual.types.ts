/**
 * Dreamheart Engine - Visual Configuration Types
 * 
 * 视觉配置类型定义
 * 用于定义视觉原型和视觉微调参数
 */

/**
 * 视觉原型 - 10种预设的基础风格模板
 * 
 * 这些原型定义了不同场景类型的基础视觉风格
 * 每个原型包含独特的配色、动画速度、扫描线效果等
 */
export type VisualArchetype = 
  // 🏙️ 城市动作线
  | 'tense-urban'      // 紧张城市：后巷、追逐、对峙
  | 'action-intense'   // 激烈动作：赛车、枪战、爆炸
  | 'neon-carnival'    // 霓虹狂欢：夜店、派对、混乱
  // 💼 社会商业线
  | 'corporate-cold'   // 冷酷财团：交易、谈判、办公室
  | 'tech-startup'     // 科技创业：实验室、创业公司、科技展
  | 'daily-cozy'       // 日常温馨：咖啡馆、家庭、日常对话
  // 🎭 文化艺术线
  | 'artistic-flow'    // 艺术律动：画廊、音乐厅、创作空间
  | 'contemplative'    // 沉思哲学：图书馆、寺庙、深度对话
  // 🌙 情感暗流线
  | 'noir-mystery'     // 黑色悬疑：调查、推理、阴谋
  | 'sensual-haze';    // 情欲迷雾：私密空间、欲望、诱惑

/**
 * 视觉微调参数（可选）
 * 
 * 用于在原型基础上进行细微调整
 * 所有参数都是可选的，未指定的参数将使用原型默认值
 */
export interface VisualOverrides {
  /** 主题强调色（覆盖原型默认霓虹色） */
  accentColor?: string;
  
  /** 扫描线速度（如 "2s", "5s"） */
  scanlineSpeed?: string;
  
  /** 漫画强度 0-1 */
  comicIntensity?: number;
  
  /** 是否启用故障效果 */
  glitchEffect?: boolean;
  
  /** 饱和度（如 "80%", "120%"） */
  saturation?: string;
}

/**
 * 视觉原型配置
 * 
 * 定义单个视觉原型的完整配置
 */
export interface VisualArchetypeConfig {
  /** 原型ID */
  id: VisualArchetype;
  
  /** 原型名称 */
  name: string;
  
  /** 原型描述 */
  description: string;
  
  /** 原型分类 */
  category: '城市动作线' | '社会商业线' | '文化艺术线' | '情感暗流线';
  
  /** 适用场景类型 */
  suitableFor: string[];
  
  /** CSS变量映射 */
  cssVariables: {
    /** 扫描线动画持续时间 */
    scanlineDuration: string;
    
    /** 扫描线透明度 0-1 */
    scanlineOpacity: number;
    
    /** 扫描线可见度 0-1 */
    scanlineVisibility: number;
    
    /** 半色调网点大小 */
    halftoneSize: string;
    
    /** 半色调透明度 0-1 */
    halftoneOpacity: number;
    
    /** 主题霓虹色 */
    themeNeon: string;
    
    /** 主题饱和度 */
    themeSaturation: string;
    
    /** 漫画强度 0-2 */
    comicIntensity: number;
    
    /** 面板光晕效果 */
    panelGlow: string;
  };
}

/**
 * 应用的视觉配置
 * 
 * 将原型配置和微调参数合并后的最终配置
 */
export interface AppliedVisualConfig {
  /** 原型ID */
  archetype: VisualArchetype;
  
  /** 最终CSS变量 */
  cssVariables: Record<string, string | number>;
  
  /** 应用的微调参数 */
  overrides?: VisualOverrides;
}
