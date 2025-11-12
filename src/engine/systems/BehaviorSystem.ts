/**
 * Behavior System
 * 
 * 行为系统
 * 负责管理行为流（玩家行为、NPC行为、系统叙事）
 */

import type { BehaviorItem } from '../../types';

/**
 * 扩展的行为项（包含UI特定字段）
 */
export interface ExtendedBehaviorItem extends BehaviorItem {
  isPlayer?: boolean;
  isSystem?: boolean;
}

/**
 * 行为系统类
 */
export class BehaviorSystem {
  private behaviorHistory: ExtendedBehaviorItem[] = [];
  
  /**
   * 添加玩家行为
   */
  addPlayerBehavior(narrative: string): ExtendedBehaviorItem {
    const behavior: ExtendedBehaviorItem = {
      actor: 'player',
      name: '你',
      behavior_type: 'Action',
      narrative_snippet: narrative,
      isPlayer: true,
    };
    
    this.behaviorHistory.push(behavior);
    return behavior;
  }
  
  /**
   * 添加NPC行为（批量）
   */
  addNpcBehaviors(behaviors: BehaviorItem[]): void {
    this.behaviorHistory.push(...behaviors);
  }
  
  /**
   * 添加系统叙事
   */
  addSystemNarrative(narrative: string): ExtendedBehaviorItem {
    const behavior: ExtendedBehaviorItem = {
      actor: 'system',
      narrative_snippet: narrative,
      isSystem: true,
    };
    
    this.behaviorHistory.push(behavior);
    return behavior;
  }
  
  /**
   * 获取行为历史
   */
  getHistory(): ExtendedBehaviorItem[] {
    return [...this.behaviorHistory];
  }
  
  /**
   * 清空行为历史
   */
  clearHistory(): void {
    this.behaviorHistory = [];
  }
  
  /**
   * 设置行为历史（用于初始化）
   */
  setHistory(behaviors: BehaviorItem[]): void {
    this.behaviorHistory = [...behaviors];
  }
  
  /**
   * 获取最后N条行为
   */
  getLastNBehaviors(n: number): ExtendedBehaviorItem[] {
    return this.behaviorHistory.slice(-n);
  }
}
