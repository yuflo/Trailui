/**
 * Ticker Service Implementation
 * 
 * Ticker服务实现
 * 负责提供世界信息流消息
 * 
 * @note 使用DataAccess接口，Demo阶段用Mock实现，上线后切换为API实现
 */

import type { 
  ITickerService, 
  TickerMessageData, 
  BroadcastMessageData,
  IWorldInfoDataAccess 
} from '../../../types';
import { tickerMessages } from '../../../data/hong-kong/world-info';  // 保留旧Ticker（近场交互用）

/**
 * Ticker服务实现类
 * 
 * 使用DataAccess接口访问广播消息
 */
export class TickerServiceImpl implements ITickerService {
  /** 当前循环播放索引（Demo功能） */
  private currentIndex: number = 0;
  
  /**
   * 构造函数 - 依赖注入DataAccess
   * @param worldInfoDataAccess 世界信息数据访问接口
   */
  constructor(private worldInfoDataAccess: IWorldInfoDataAccess) {}
  
  /**
   * 获取世界信息流（远场探索）
   * 
   * @param count 消息数量
   * @returns 广播消息数组（从消息池中随机采样）
   * @note ✅ 使用DataAccess获取广播消息
   */
  async getBroadcastStream(count: number): Promise<BroadcastMessageData[]> {
    // ✅ 使用DataAccess获取广播消息（已包含随机采样逻辑）
    const messages = await this.worldInfoDataAccess.getBroadcastMessages(count);
    
    console.log(`[TickerService] Broadcast stream via DataAccess: ${messages.length} messages`);
    console.log(`[TickerService] Extractable clues in stream: ${messages.filter(m => m.extractable_clue_id).length}`);
    
    return messages;
  }
  
  /**
   * 获取随机的Ticker消息
   * @deprecated 使用 getBroadcastStream() 代替
   * @note ✅ 使用DataAccess获取（异步方法）
   */
  async getRandomMessage(): Promise<TickerMessageData> {
    const messages = await this.worldInfoDataAccess.getBroadcastMessages(1);
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
   * @note ✅ 使用DataAccess获取
   */
  async getMessages(count: number): Promise<TickerMessageData[]> {
    // ✅ 使用DataAccess获取消息
    const messages = await this.worldInfoDataAccess.getBroadcastMessages(count);
    
    // 转换为TickerMessageData格式
    return messages.map(msg => ({
      type: msg.category,
      color: msg.color,
      text: msg.text,
      ...msg
    } as any));
  }
  
  /**
   * 获取下一条Ticker消息（循环播放）
   * 
   * @returns Ticker消息
   * @note Demo功能：按顺序循环返回消息，播放完毕后重新开始
   */
  getNextMessage(): TickerMessageData {
    if (tickerMessages.length === 0) {
      // 防御性编程：如果没有消息，返回默认消息
      return {
        type: '系统',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        text: '暂无消息',
      };
    }
    
    // 获取当前索引的消息
    const message = tickerMessages[this.currentIndex];
    
    // 递增索引，循环回到开头
    this.currentIndex = (this.currentIndex + 1) % tickerMessages.length;
    
    return message;
  }
  
  /**
   * 重置循环播放位置
   * 
   * @note Demo功能：将播放位置重置到开头
   */
  resetCycle(): void {
    this.currentIndex = 0;
  }
}
