/**
 * Ticker System
 * 
 * 信息流系统
 * 负责管理世界信息流消息的定时更新
 */

import type { ITickerService, TickerMessageData } from '../../types';

/**
 * Ticker消息（包含图标）
 * 扩展支持广播消息字段（远场探索）
 */
export interface TickerMessageWithIcon extends TickerMessageData {
  icon?: React.ReactNode;
  id: string;
  timestamp: number;
  // 远场探索字段（可选）
  message_id?: string;
  category?: string;
  extractable_clue_id?: string | null;
}

/**
 * Ticker系统类
 */
export class TickerSystem {
  private messages: TickerMessageWithIcon[] = [];
  private intervalId: number | null = null;
  private tickerService: ITickerService;
  private updateInterval: number;
  private maxMessages: number;
  private listeners: ((messages: TickerMessageWithIcon[]) => void)[] = [];
  
  constructor(tickerService: ITickerService, options?: {
    updateInterval?: number;
    maxMessages?: number;
  }) {
    this.tickerService = tickerService;
    this.updateInterval = options?.updateInterval || 8000; // 默认8秒
    this.maxMessages = options?.maxMessages || 10; // 默认保留10条
  }
  
  /**
   * 启动Ticker系统
   */
  start(): void {
    if (this.intervalId !== null) {
      return; // 已经启动
    }
    
    this.intervalId = window.setInterval(() => {
      this.addRandomMessage();
    }, this.updateInterval);
  }
  
  /**
   * 停止Ticker系统
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * 添加随机消息
   */
  private async addRandomMessage(): Promise<void> {
    const messageData = await this.tickerService.getRandomMessage();
    const message: TickerMessageWithIcon = {
      ...messageData,
      id: `ticker-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    
    // 添加到消息列表（最新的在前面）
    this.messages = [message, ...this.messages].slice(0, this.maxMessages);
    
    // 通知所有监听器
    this.notifyListeners();
  }
  
  /**
   * 手动添加消息
   */
  addMessage(messageData: TickerMessageData): void {
    const message: TickerMessageWithIcon = {
      ...messageData,
      id: `ticker-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    
    this.messages = [message, ...this.messages].slice(0, this.maxMessages);
    this.notifyListeners();
  }
  
  /**
   * 手动刷新消息（添加随机消息）
   * 
   * @note 用于手动刷新按钮触发
   */
  async refresh(): Promise<void> {
    await this.addRandomMessage();
  }
  
  /**
   * 完全刷新消息列表（一次性替换为20条新消息）
   * 
   * @note 用于手动刷新按钮触发，展示固定20条消息
   */
  async refreshAll(): Promise<void> {
    // 从服务获取20条不重复的随机消息
    const messageDataList = await this.tickerService.getMessages(20);
    
    // 转换为带ID和时间戳的消息
    this.messages = messageDataList.map((messageData, index) => ({
      ...messageData,
      id: `ticker-${Date.now()}-${index}`,
      timestamp: Date.now() + index, // 确保每条消息有不同的时间戳
    }));
    
    // 通知所有监听器
    this.notifyListeners();
  }
  
  /**
   * 获取当前消息列表
   */
  getMessages(): TickerMessageWithIcon[] {
    return [...this.messages];
  }
  
  /**
   * 清空消息
   */
  clearMessages(): void {
    this.messages = [];
    this.notifyListeners();
  }
  
  /**
   * 订阅消息更新
   */
  subscribe(listener: (messages: TickerMessageWithIcon[]) => void): () => void {
    this.listeners.push(listener);
    
    // 返回取消订阅函数
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.messages]);
    });
  }
  
  /**
   * 设置更新间隔
   */
  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
    
    // 如果正在运行，重启以应用新间隔
    if (this.intervalId !== null) {
      this.stop();
      this.start();
    }
  }
}
