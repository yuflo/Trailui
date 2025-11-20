/**
 * TickerService - Ticker服务（business层）
 * 
 * 负责提供世界信息流消息
 * 使用 DataAccessFactory 访问数据
 */

import type { 
  TickerMessageData, 
  BroadcastMessageData,
  ITickerService
} from '../../../types';
import { DataAccessFactory } from '../../data-access/DataAccessFactory';

/**
 * Ticker服务（静态方法）
 */
export class TickerService {
  /**
   * 获取世界信息流（远场探索）
   * 
   * @param count 消息数量
   * @returns 广播消息数组（从消息池中随机采样）
   */
  static async getBroadcastStream(count: number): Promise<BroadcastMessageData[]> {
    const worldInfoDataAccess = DataAccessFactory.createWorldInfoDataAccess();
    const messages = await worldInfoDataAccess.getBroadcastMessages(count);
    
    console.log(`[TickerService] Broadcast stream via DataAccess: ${messages.length} messages`);
    console.log(`[TickerService] Extractable clues in stream: ${messages.filter(m => m.extractable_clue_id).length}`);
    
    return messages;
  }
  
  /**
   * 获取随机的Ticker消息
   * @deprecated 使用 getBroadcastStream() 代替
   */
  static async getRandomMessage(): Promise<TickerMessageData> {
    const messages = await this.getBroadcastStream(1);
    const msg = messages[0];
    
    // 转换为兼容的TickerMessageData格式
    return {
      type: msg.category,
      color: msg.color,
      text: msg.text,
      // 保留新字段以支持线索提取
      ...msg
    } as any;
  }
  
  /**
   * 获取多个随机Ticker消息（不重复）
   * 
   * @param count 获取数量
   * @returns 随机选择的消息数组（不重复）
   */
  static async getMessages(count: number): Promise<TickerMessageData[]> {
    const messages = await this.getBroadcastStream(count);
    
    // 转换为TickerMessageData格式
    return messages.map(msg => ({
      type: msg.category,
      color: msg.color,
      text: msg.text,
      ...msg
    } as any));
  }
}

/**
 * TickerServiceAdapter - 适配器类
 * 
 * 用于 TickerSystem，将静态方法包装成实例方法
 */
export class TickerServiceAdapter implements ITickerService {
  async getBroadcastStream(count: number): Promise<BroadcastMessageData[]> {
    return TickerService.getBroadcastStream(count);
  }
  
  async getRandomMessage(): Promise<TickerMessageData> {
    return TickerService.getRandomMessage();
  }
  
  async getMessages(count: number): Promise<TickerMessageData[]> {
    return TickerService.getMessages(count);
  }
  
  getNextMessage(): TickerMessageData {
    // 返回默认消息
    return {
      type: '系统',
      color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      text: '暂无消息',
    };
  }
  
  resetCycle(): void {
    // 无操作
  }
}
