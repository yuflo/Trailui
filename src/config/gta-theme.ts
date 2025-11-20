/**
 * GTA风格主题配置
 * Tokyo Faded Poster 设计系统
 * 
 * 砖红(#A83C3C) + 深红黑 + 纯白 三色系统
 */

// ==================== 配色系统 ====================
export const GTA_COLORS = {
  // 主色
  PRIMARY: '#A83C3C',      // 砖红
  BLACK: '#000000',        // 纯黑
  WHITE: '#FFFFFF',        // 纯白
  
  // 背景色
  BG_DARK: 'rgba(20, 15, 15, 0.92)',
  BG_OVERLAY: 'rgba(0, 0, 0, 0.5)',
  
  // ✅ Figma原稿：卡片类型色（渐变起始色）
  ALERT: '#EF4444',        // 红色 - ALERT (Figma精确值)
  RUMOR: '#8B5CF6',        // 紫色 - RUMOR (✅ 修正为Figma值)
  SOCIAL: '#06B6D4',       // 青色 - SOCIAL
  TRADE: '#FBBF24',        // 黄色 - TRADE
  
  // ✅ Figma原稿：卡片类型色（渐变结束色）
  ALERT_TO: '#DC2626',     // 红色渐变终点
  RUMOR_TO: '#7C3AED',     // 紫色渐变终点
  SOCIAL_TO: '#0891B2',    // 青色渐变终点
  TRADE_TO: '#F59E0B',     // 黄色渐变终点
  
  // ✅ Figma原稿：卡片浅色背景
  ALERT_LIGHT: '#FEE2E2',   // 浅红色背景
  RUMOR_LIGHT: '#EDE9FE',   // 浅紫色背景
  SOCIAL_LIGHT: '#CFFAFE',  // 浅青色背景
  TRADE_LIGHT: '#FEF3C7',   // 浅黄色背景
  
  // 状态色
  TEXT_DARK: '#1e2939',
  TEXT_LIGHT: '#CCCCCC',
  TEXT_MUTED: '#6a7282',
} as const;

// ==================== 边框样式 ====================
export const GTA_BORDERS = {
  // 主面板边框
  PANEL: {
    width: '4px',
    color: GTA_COLORS.PRIMARY,
    style: 'solid',
  },
  
  // 卡片边框
  CARD: {
    width: '3px',
    color: GTA_COLORS.BLACK,
    style: 'solid',
  },
  
  // 小组件边框
  WIDGET: {
    width: '6px',
    color: GTA_COLORS.BLACK,
    style: 'solid',
  },
} as const;

// ==================== 阴影系统 ====================
export const GTA_SHADOWS = {
  // 主面板阴影
  PANEL: '0px 0px 0px 2px rgba(0,0,0,0.5), 8px 8px 0px 0px rgba(0,0,0,0.7), 10px 10px 0px 0px #a83c3c',
  
  // ✅ Figma原稿：卡片阴影（简化版：2px外框 + 4px偏移）
  CARD_ALERT: '0 0 0 2px #EF4444, 4px 4px 0 #000',
  CARD_RUMOR: '0 0 0 2px #8B5CF6, 4px 4px 0 #000',
  CARD_SOCIAL: '0 0 0 2px #06B6D4, 4px 4px 0 #000',
  CARD_TRADE: '0 0 0 2px #FBBF24, 4px 4px 0 #000',
  
  // ✅ Figma原稿：徽章多层边框
  BADGE_ALERT: '0 0 0 2px #FFFFFF, 3px 3px 0 #000',
  BADGE_RUMOR: '0 0 0 2px #FFFFFF, 3px 3px 0 #000',
  BADGE_SOCIAL: '0 0 0 2px #FFFFFF, 3px 3px 0 #000',
  BADGE_TRADE: '0 0 0 2px #FFFFFF, 3px 3px 0 #000',
  
  // 玩家状态卡阴影
  PLAYER_STATUS: '0px 0px 0px 4px #fbbf24, 12px 12px 0px 0px #000000, 14px 14px 0px 0px #ef4444',
  
  // 按钮阴影
  BUTTON: '0 0 0 2px #A83C3C, 3px 3px 0 #000',
  BUTTON_HOVER: '0 0 0 2px #A83C3C, 4px 4px 0 #000',
  
  // 头像边框阴影
  AVATAR: '0px 0px 0px 2px #ffffff, 3px 3px 0px 0px rgba(0,0,0,0.4)',
  
  // WANTED卡阴影
  WANTED: '0px 0px 0px 3px #ffffff, 10px 10px 0px 0px #000000',
} as const;

// ==================== 发光效果 ====================
export const GTA_GLOWS = {
  ALERT: '0 0 20px rgba(239, 68, 68, 0.4)',
  RUMOR: '0 0 20px rgba(168, 85, 247, 0.4)',
  SOCIAL: '0 0 20px rgba(6, 182, 212, 0.4)',
  TRADE: '0 0 20px rgba(251, 191, 36, 0.4)',
} as const;

// ==================== 圆角系统 ====================
export const GTA_RADIUS = {
  NONE: '0px',
  SM: '2px',
  MD: '4px',
  CIRCLE: '1.67772e+07px', // Figma原稿的超大圆角值
} as const;

// ==================== 字体系统 ====================
export const GTA_FONTS = {
  TITLE: "'Bangers', cursive",
  MONO: "'Inter:Black', sans-serif",
  BODY: "'Inter:Medium', sans-serif",
  NUMBER: "'Rajdhani:Bold', sans-serif",
} as const;

// ==================== 文本阴影 ====================
export const GTA_TEXT_SHADOWS = {
  TITLE: '3px 3px 0 #A83C3C, -1px -1px 0 rgba(255,255,255,0.3)',
  SUBTITLE: '1px 1px 2px rgba(0,0,0,0.8)',
} as const;

// ==================== 渐变系统 ====================
export const GTA_GRADIENTS = {
  SPRAY_PAINT: 'linear-gradient(90deg, #A83C3C 0%, #C85454 50%, #A83C3C 100%)',
  ICON_BADGE: 'linear-gradient(to bottom right, #dc2626, #991b1b)',
  WANTED_BG: 'linear-gradient(to right, #dc2626, #b91c1c, #991b1b)',
  HP_BAR: 'linear-gradient(to right, #fb2c36, #e7000b)',
  MP_BAR: 'linear-gradient(to right, #2b7fff, #155dfc)',
} as const;

// ==================== 工具函数：生成边框样式 ====================
export function createBorderStyle(type: 'panel' | 'card' | 'widget') {
  const config = GTA_BORDERS[type.toUpperCase() as keyof typeof GTA_BORDERS];
  return {
    borderWidth: config.width,
    borderColor: config.color,
    borderStyle: config.style,
  };
}

// ==================== 工具函数：生成卡片样式 ====================
export function createCardStyle(type: 'alert' | 'rumor' | 'social' | 'trade') {
  const colorKey = type.toUpperCase() as keyof typeof GTA_COLORS;
  const shadowKey = `CARD_${type.toUpperCase()}` as keyof typeof GTA_SHADOWS;
  const glowKey = type.toUpperCase() as keyof typeof GTA_GLOWS;
  
  return {
    borderColor: GTA_COLORS.BLACK,
    borderWidth: '3px',
    boxShadow: GTA_SHADOWS[shadowKey],
    filter: `drop-shadow(${GTA_GLOWS[glowKey]})`,
  };
}