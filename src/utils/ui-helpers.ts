/**
 * UI Helper Functions
 * 
 * UI相关的辅助函数
 */

import type { RapportSentiment } from '../types';

/**
 * 获取关系情感的颜色类名
 */
export function getRapportColor(sentiment: RapportSentiment): string {
  const colorMap: Record<RapportSentiment, string> = {
    '恐惧': 'text-red-400',
    '警惕': 'text-orange-400',
    '中立': 'text-gray-400',
    '友好': 'text-green-400',
    '敌对': 'text-red-500',
    '未知': 'text-purple-400',
  };
  
  return colorMap[sentiment] || 'text-gray-400';
}

/**
 * 获取Ticker消息的图标
 */
export function getTickerIcon(type: string): React.ReactNode {
  // 这个函数将在 App.tsx 中导入图标后使用
  return null;
}
