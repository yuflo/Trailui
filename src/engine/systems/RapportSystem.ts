/**
 * Rapport System
 * 
 * 关系系统
 * 负责检测和计算NPC关系值变化
 */

import type { NPCEntity, RapportDelta, RapportSentiment } from '../../types';

/**
 * 关系系统类
 */
export class RapportSystem {
  /**
   * 检测关系值变化
   * 
   * @param oldNpc 旧的NPC状态
   * @param newNpc 新的NPC状态
   * @returns 关系值变化，如果没有变化则返回null
   */
  detectChange(oldNpc: NPCEntity, newNpc: NPCEntity): RapportDelta | null {
    const oldIntensity = oldNpc.rapport.intensity;
    const newIntensity = newNpc.rapport.intensity;
    const delta = newIntensity - oldIntensity;
    
    // 没有变化
    if (delta === 0 && oldNpc.rapport.sentiment === newNpc.rapport.sentiment) {
      return null;
    }
    
    return {
      npc: newNpc,
      oldIntensity,
      newIntensity,
      delta,
    };
  }
  
  /**
   * 获取关系情感的颜色类名
   */
  getSentimentColor(sentiment: RapportSentiment): string {
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
   * 获取关系强度的描述
   */
  getIntensityDescription(intensity: number): string {
    if (intensity >= 80) return '非常强烈';
    if (intensity >= 60) return '较强';
    if (intensity >= 40) return '中等';
    if (intensity >= 20) return '较弱';
    return '微弱';
  }
  
  /**
   * 判断关系是否为正面
   */
  isPositive(sentiment: RapportSentiment): boolean {
    return sentiment === '友好';
  }
  
  /**
   * 判断关系是否为负面
   */
  isNegative(sentiment: RapportSentiment): boolean {
    return sentiment === '恐惧' || sentiment === '敌对';
  }
  
  /**
   * 判断关系是否为中性
   */
  isNeutral(sentiment: RapportSentiment): boolean {
    return sentiment === '中立' || sentiment === '未知';
  }
}
