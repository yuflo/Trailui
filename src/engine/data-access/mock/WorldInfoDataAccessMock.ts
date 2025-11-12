/**
 * World Info Data Access - Mock Implementation
 * 
 * 世界信息数据访问 - Mock实现
 * Demo阶段从broadcast-messages.data.ts读取
 * 上线后替换为ApiWorldInfoDataAccess
 */

import type { IWorldInfoDataAccess } from '../../../types/data-access.types';
import type { BroadcastMessageData } from '../../../types';
import { broadcastMessages } from '../../../data/hong-kong/world-info/broadcast-messages.data';

/**
 * 世界信息数据访问Mock实现类
 * 
 * @note Demo实现 - 从静态broadcast-messages.data.ts读取
 */
export class WorldInfoDataAccessMock implements IWorldInfoDataAccess {
  /**
   * 获取广播消息流（随机采样）
   * 
   * @param count 消息数量
   * @returns 广播消息数组
   */
  async getBroadcastMessages(count: number): Promise<BroadcastMessageData[]> {
    // 如果请求数量大于等于总数，返回所有消息
    if (count >= broadcastMessages.length) {
      console.log(`[WorldInfoDataAccessMock] Returning all ${broadcastMessages.length} messages`);
      return [...broadcastMessages];
    }
    
    // Fisher-Yates洗牌算法 - 随机采样
    const indices = Array.from({ length: broadcastMessages.length }, (_, i) => i);
    
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // 取前count个索引对应的消息
    const sampledMessages = indices.slice(0, count).map(i => broadcastMessages[i]);
    
    console.log(`[WorldInfoDataAccessMock] Sampled ${sampledMessages.length} messages`);
    console.log(`[WorldInfoDataAccessMock] Extractable clues in sample: ${sampledMessages.filter(m => m.extractable_clue_id).length}`);
    
    return sampledMessages;
  }
  
  /**
   * 获取所有广播消息
   * 
   * @returns 所有消息数组
   */
  async getAllBroadcastMessages(): Promise<BroadcastMessageData[]> {
    console.log(`[WorldInfoDataAccessMock] Returning all ${broadcastMessages.length} messages`);
    return [...broadcastMessages];
  }
}
