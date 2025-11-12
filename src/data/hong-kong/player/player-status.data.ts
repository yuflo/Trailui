/**
 * Player Status Data - Hong Kong
 * 
 * 玩家状态Mock数据
 * 
 * ✨ Demo阶段：提供默认玩家状态
 * 📦 上线后：从后端API或存档加载
 */

import type { PlayerStatusArea } from '../../../types';

/**
 * 默认玩家状态
 * 
 * 用于：
 * - 新游戏初始化
 * - 重置玩家状态
 * - Demo演示
 * 
 * @note Mock数据 - Demo阶段使用，上线后从后端API获取
 */
export const DEFAULT_PLAYER_STATUS: PlayerStatusArea = {
  world_time: '23:45',
  current_location: '尖沙咀',
  vigor: {
    value: 80,
    max: 100
  },
  clarity: {
    value: 75,
    max: 100
  },
  financial_power: '温饱',
  credit: {
    value: 50
  },
  active_effects: []
};

/**
 * 玩家存档Mock数据（可选）
 * 
 * Demo阶段可以提供几个预设状态：
 * - 满状态
 * - 低状态
 * - 特殊效果状态
 * 
 * 用于测试不同UI显示效果
 */
export const MOCK_PLAYER_SAVES = {
  // 满血满状态
  full: {
    world_time: '12:00',
    current_location: '中环',
    vigor: { value: 100, max: 100 },
    clarity: { value: 100, max: 100 },
    financial_power: '豪富' as const,
    credit: { value: 100 },
    active_effects: []
  },
  
  // 危险状态
  danger: {
    world_time: '03:15',
    current_location: '深水埗',
    vigor: { value: 15, max: 100 },
    clarity: { value: 20, max: 100 },
    financial_power: '贫困' as const,
    credit: { value: 10 },
    active_effects: [
      { name: '疲惫', description: '体力恢复速度-50%', type: 'debuff' as const },
      { name: '焦虑', description: '心力消耗+20%', type: 'debuff' as const }
    ]
  },
  
  // Buff状态
  buffed: {
    world_time: '18:30',
    current_location: '旺角',
    vigor: { value: 90, max: 100 },
    clarity: { value: 95, max: 100 },
    financial_power: '富裕' as const,
    credit: { value: 75 },
    active_effects: [
      { name: '精力充沛', description: '所有行动消耗-20%', type: 'buff' as const },
      { name: '清晰思维', description: '洞察力+30%', type: 'buff' as const }
    ]
  }
} as const;
