/**
 * 全局常量配置
 * Dreamheart引擎 - 统一配置管理
 */

// ==================== 动画参数 ====================
export const ANIMATION = {
  // 列动画
  COLUMN_DELAY_STEP: 0.1,
  SPRING_STIFFNESS: 300,
  SPRING_DAMPING: 25,
  
  // 雨滴效果
  RAIN_DROP_COUNT: 20,
  RAIN_DURATION_MIN: 1,
  RAIN_DURATION_MAX: 3,
  RAIN_DELAY_MAX: 2,
} as const;

// ==================== 布局常量 ====================
export const LAYOUT = {
  MAX_WIDTH: 'max-w-screen-2xl',
  PADDING_TOP: 'pt-4',
  PADDING_X: 'px-4',
  PANEL_HEIGHT: '700px',
} as const;

// ==================== 测试配置 ====================
export const TEST = {
  DEFAULT_STORY_ID: 'story_001',
} as const;
