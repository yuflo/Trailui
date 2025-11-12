/**
 * Stat System
 * 
 * 数值系统
 * 负责检测和计算玩家数值变化（体力、心力）
 */

import type { StatValue, StatDelta } from '../../types';

/**
 * 数值系统类
 */
export class StatSystem {
  /**
   * 检测数值变化
   * 
   * @param oldStats 旧数值
   * @param newStats 新数值
   * @returns 数值变化数组
   */
  detectChanges(
    oldStats: { vigor: StatValue; clarity: StatValue },
    newStats: { vigor: StatValue; clarity: StatValue }
  ): StatDelta[] {
    const deltas: StatDelta[] = [];
    
    // 检测体力变化
    const vigorDelta = newStats.vigor.value - oldStats.vigor.value;
    if (vigorDelta !== 0) {
      deltas.push({
        type: 'vigor',
        oldValue: oldStats.vigor,
        newValue: newStats.vigor,
        delta: vigorDelta,
      });
    }
    
    // 检测心力变化
    const clarityDelta = newStats.clarity.value - oldStats.clarity.value;
    if (clarityDelta !== 0) {
      deltas.push({
        type: 'clarity',
        oldValue: oldStats.clarity,
        newValue: newStats.clarity,
        delta: clarityDelta,
      });
    }
    
    return deltas;
  }
  
  /**
   * 计算数值变化百分比
   */
  calculateChangePercentage(oldValue: number, newValue: number, max: number): number {
    const delta = newValue - oldValue;
    return (delta / max) * 100;
  }
  
  /**
   * 判断数值是否处于危险区域
   */
  isDangerZone(value: number, max: number, threshold: number = 0.25): boolean {
    return (value / max) <= threshold;
  }
  
  /**
   * 判断数值是否已满
   */
  isFull(value: number, max: number): boolean {
    return value >= max;
  }
}
