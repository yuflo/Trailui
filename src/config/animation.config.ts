/**
 * Animation Configuration
 * 
 * 全局动画配置
 * 定义动画时长、缓动函数等
 */

/**
 * 动画配置
 */
export const animationConfig = {
  /**
   * 过渡时长
   */
  durations: {
    /** 极快 - 用于微交互 */
    fastest: 100,
    /** 很快 - 用于即时反馈 */
    faster: 150,
    /** 快速 - 用于普通过渡 */
    fast: 200,
    /** 正常 - 用于大部分动画 */
    normal: 300,
    /** 慢速 - 用于重要动画 */
    slow: 500,
    /** 很慢 - 用于戏剧性效果 */
    slower: 700,
    /** 极慢 - 用于场景切换 */
    slowest: 1000,
  },

  /**
   * 缓动函数
   */
  easings: {
    /** 默认缓动 */
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    /** 线性 */
    linear: 'linear',
    /** 缓入 */
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    /** 缓出 */
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    /** 缓入缓出 */
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    /** 弹性效果 */
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  /**
   * 数值变化指示器动画
   */
  statIndicator: {
    /** 显示时长 */
    displayDuration: 2000,
    /** 淡出时长 */
    fadeOutDuration: 300,
    /** Y轴移动距离 */
    translateY: -30,
  },

  /**
   * 主题切换动画
   */
  themeTransition: {
    /** 切换时长 */
    duration: 600,
    /** 缓动函数 */
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * 进度条流光效果
   */
  progressShimmer: {
    /** 动画时长 */
    duration: 2000,
    /** 是否启用 */
    enabled: true,
  },

  /**
   * 打字机效果
   */
  typewriter: {
    /** 每个字符的间隔（毫秒） */
    charInterval: 30,
    /** 光标闪烁间隔 */
    cursorBlinkInterval: 500,
  },

  /**
   * 模态框动画
   */
  modal: {
    /** 进场时长 */
    enterDuration: 300,
    /** 退场时长 */
    exitDuration: 200,
    /** 缩放起始值 */
    scaleFrom: 0.95,
  },

  /**
   * Ticker消息滚动
   */
  ticker: {
    /** 更新间隔 */
    updateInterval: 5000,
    /** 过渡时长 */
    transitionDuration: 500,
  },
} as const;

/**
 * 动画预设
 */
export const animationPresets = {
  /** 淡入 */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /** 从下方滑入 */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  /** 缩放 */
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  /** 数值变化 */
  statChange: {
    initial: { opacity: 0, y: 0, scale: 0.8 },
    animate: { opacity: 1, y: -30, scale: 1 },
    exit: { opacity: 0, y: -40, scale: 0.8 },
  },
} as const;
