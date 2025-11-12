/**
 * World Info Data Access - API Implementation
 * 
 * 世界信息数据访问 - API实现
 * 上线时使用，对接后端API
 * 
 * @note 上线前实现
 */

import type { IWorldInfoDataAccess } from '../../../types/data-access.types';
import type { BroadcastMessageData } from '../../../types';

/**
 * 世界信息数据访问API实现类
 * 
 * @note API实现 - 上线时对接后端API
 */
export class WorldInfoDataAccessApi implements IWorldInfoDataAccess {
  private baseUrl: string;
  
  /**
   * 构造函数
   * @param baseUrl API基础URL，默认为 '/api/v1'
   */
  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * 获取广播消息流（随机采样）
   * 
   * @param count 消息数量
   * @returns 广播消息数组
   * 
   * @todo 上线时实现
   * @example
   * // API调用示例
   * // GET /api/v1/world-info/broadcast?count=20
   * // Response: BroadcastMessageData[]
   */
  async getBroadcastMessages(count: number): Promise<BroadcastMessageData[]> {
    // TODO: 上线时实现
    // const response = await fetch(`${this.baseUrl}/world-info/broadcast?count=${count}`);
    // if (!response.ok) {
    //   console.error(`[WorldInfoDataAccessApi] Failed to fetch broadcast messages`);
    //   return [];
    // }
    // return response.json();
    
    throw new Error('WorldInfoDataAccessApi.getBroadcastMessages() - API implementation pending');
  }
  
  /**
   * 获取所有广播消息
   * 
   * @returns 所有消息数组
   * 
   * @todo 上线时实现
   * @example
   * // API调用示例
   * // GET /api/v1/world-info/broadcast/all
   * // Response: BroadcastMessageData[]
   */
  async getAllBroadcastMessages(): Promise<BroadcastMessageData[]> {
    // TODO: 上线时实现
    // const response = await fetch(`${this.baseUrl}/world-info/broadcast/all`);
    // if (!response.ok) {
    //   console.error(`[WorldInfoDataAccessApi] Failed to fetch all broadcast messages`);
    //   return [];
    // }
    // return response.json();
    
    throw new Error('WorldInfoDataAccessApi.getAllBroadcastMessages() - API implementation pending');
  }
}
