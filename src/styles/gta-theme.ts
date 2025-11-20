/**
 * GTA 风格主题系统
 * 
 * 设计规范：Tokyo Faded Poster + GTA V/VI 美式讽刺漫画
 * 配色系统：砖红 + 深红黑 + 纯白
 */

// ==================== 颜色系统 ====================
export const GTA_COLORS = {
  // 主色调
  PRIMARY_RED: '#a83c3c',      // 砖红
  DARK_BG: 'rgba(20, 15, 15, 0.92)', // 深红黑背景
  WHITE: '#FFFFFF',            // 纯白
  BLACK: '#000000',            // 纯黑
  
  // 卡片类型色
  ALERT: '#ef4444',            // 红色 - ALERT
  RUMOR: '#a855f7',            // 紫色 - RUMOR
  SOCIAL: '#06b6d4',           // 青色 - SOCIAL
  TRADE: '#fbbf24',            // 黄色 - TRADE
  
  // 辅助色
  GRAY_DARK: '#1e2939',
  GRAY_MID: '#364153',
  GRAY_LIGHT: '#6a7282',
  GRAY_LIGHTER: '#d1d5dc',
  
  // 渐变色
  GRADIENT_RED_START: '#fb2c36',
  GRADIENT_RED_END: '#e7000b',
  GRADIENT_BLUE_START: '#2b7fff',
  GRADIENT_BLUE_END: '#155dfc',
} as const;

// ==================== GTA 边框系统 ====================
export const GTA_BORDER = {
  // 主边框
  WIDTH: '4px',
  WIDTH_THICK: '6px',
  WIDTH_THIN: '3px',
  STYLE: 'solid',
  COLOR: GTA_COLORS.PRIMARY_RED,
  
  // 卡片边框
  CARD_BORDER_CLASS: 'border-[3px] border-black',
  PANEL_BORDER_CLASS: 'border-4 border-solid',
} as const;

// ==================== GTA 阴影系统 ====================
export const GTA_SHADOW = {
  // 主面板阴影（红色强调）
  PANEL: '0px 0px 0px 2px rgba(0,0,0,0.5), 8px 8px 0px 0px rgba(0,0,0,0.7), 10px 10px 0px 0px #a83c3c',
  
  // 卡片阴影（根据类型）
  ALERT: '0px 0px 0px 3px #ffffff, 10px 10px 0px 0px #000000, 12px 12px 0px 0px #ef4444',
  RUMOR: '0px 0px 0px 3px #ffffff, 10px 10px 0px 0px #000000, 12px 12px 0px 0px #a855f7',
  SOCIAL: '0px 0px 0px 3px #ffffff, 10px 10px 0px 0px #000000, 12px 12px 0px 0px #06b6d4',
  TRADE: '0px 0px 0px 3px #ffffff, 10px 10px 0px 0px #000000, 12px 12px 0px 0px #fbbf24',
  
  // 通用阴影
  SMALL: '3px 3px 0 #000',
  MEDIUM: '0 0 0 2px #A83C3C, 3px 3px 0 #000',
  LARGE: '0 0 0 2px #A83C3C, 4px 4px 0 #000',
  
  // 发光效果
  GLOW_RED: '0 0 20px rgba(168, 60, 60, 0.6)',
  GLOW_YELLOW: '0 0 20px rgba(251, 191, 36, 0.6)',
} as const;

// ==================== GTA 字体系统 ====================
export const GTA_TYPOGRAPHY = {
  // 标题字体（Bangers）
  TITLE_FAMILY: "'Bangers', cursive",
  TITLE_SIZE: '24px',
  TITLE_LINE_HEIGHT: '0.9',
  TITLE_SHADOW: '3px 3px 0 #A83C3C, -1px -1px 0 rgba(255,255,255,0.3)',
  
  // 副标题字体
  SUBTITLE_SIZE: '10px',
  SUBTITLE_TRACKING: '0.25em',
  SUBTITLE_COLOR: '#CCCCCC',
} as const;

// ==================== 工具函数 ====================

/**
 * 获取卡片类型对应的颜色
 */
export function getCardTypeColor(type: 'alert' | 'rumor' | 'social' | 'trade'): string {
  const colorMap = {
    alert: GTA_COLORS.ALERT,
    rumor: GTA_COLORS.RUMOR,
    social: GTA_COLORS.SOCIAL,
    trade: GTA_COLORS.TRADE,
  };
  return colorMap[type];
}

/**
 * 获取卡片类型对应的阴影
 */
export function getCardTypeShadow(type: 'alert' | 'rumor' | 'social' | 'trade'): string {
  const shadowMap = {
    alert: GTA_SHADOW.ALERT,
    rumor: GTA_SHADOW.RUMOR,
    social: GTA_SHADOW.SOCIAL,
    trade: GTA_SHADOW.TRADE,
  };
  return shadowMap[type];
}

/**
 * 生成 GTA 面板边框样式对象
 */
export function getPanelBorderStyle() {
  return {
    borderColor: GTA_COLORS.PRIMARY_RED,
    boxShadow: GTA_SHADOW.PANEL,
  };
}
