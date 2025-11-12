/**
 * Layout Configuration
 * 
 * 全局布局配置
 * 定义间距、尺寸、断点等
 */

/**
 * 布局配置
 */
export const layoutConfig = {
  /**
   * 三栏布局比例
   */
  threeColumn: {
    /** 左栏宽度（广播区域） */
    left: '300px',
    /** 中栏宽度（动态视图） */
    center: 'minmax(0, 1fr)',
    /** 右栏宽度（玩家状态） */
    right: '320px',
    /** 栏间间距 */
    gap: '1rem',
  },

  /**
   * 响应式断点
   */
  breakpoints: {
    /** 手机 */
    mobile: '640px',
    /** 平板 */
    tablet: '768px',
    /** 桌面 */
    desktop: '1024px',
    /** 大屏 */
    wide: '1280px',
    /** 超宽 */
    ultrawide: '1536px',
  },

  /**
   * 容器宽度
   */
  container: {
    /** 最大宽度 */
    maxWidth: '1920px',
    /** 内边距 */
    padding: '1rem',
  },

  /**
   * 面板配置
   */
  panel: {
    /** 边框圆角 */
    borderRadius: '0.625rem',
    /** 内边距 */
    padding: '1rem',
    /** 边框宽度 */
    borderWidth: '1px',
    /** 玻璃态背景透明度 */
    glassOpacity: 0.1,
  },

  /**
   * 卡片配置
   */
  card: {
    /** 边框圆角 */
    borderRadius: '0.5rem',
    /** 内边距 */
    padding: '0.75rem 1rem',
    /** 最小高度 */
    minHeight: '3rem',
  },

  /**
   * 间距系统
   */
  spacing: {
    /** 0.25rem = 4px */
    xs: '0.25rem',
    /** 0.5rem = 8px */
    sm: '0.5rem',
    /** 0.75rem = 12px */
    md: '0.75rem',
    /** 1rem = 16px */
    lg: '1rem',
    /** 1.5rem = 24px */
    xl: '1.5rem',
    /** 2rem = 32px */
    '2xl': '2rem',
    /** 3rem = 48px */
    '3xl': '3rem',
  },

  /**
   * Z-index层级
   */
  zIndex: {
    /** 背景层 */
    background: -1,
    /** 默认层 */
    base: 0,
    /** 浮动层 */
    elevated: 10,
    /** 下拉菜单层 */
    dropdown: 100,
    /** 固定层 */
    sticky: 200,
    /** 遮罩层 */
    overlay: 500,
    /** 模态框层 */
    modal: 1000,
    /** 提示层 */
    popover: 1500,
    /** Toast层 */
    toast: 2000,
  },

  /**
   * 滚动区域配置
   */
  scroll: {
    /** 滚动条宽度 */
    barWidth: '8px',
    /** 滚动条圆角 */
    barRadius: '4px',
  },
} as const;

/**
 * 媒体查询辅助函数
 */
export const mediaQueries = {
  mobile: `@media (max-width: ${layoutConfig.breakpoints.mobile})`,
  tablet: `@media (max-width: ${layoutConfig.breakpoints.tablet})`,
  desktop: `@media (min-width: ${layoutConfig.breakpoints.desktop})`,
  wide: `@media (min-width: ${layoutConfig.breakpoints.wide})`,
  ultrawide: `@media (min-width: ${layoutConfig.breakpoints.ultrawide})`,
} as const;
