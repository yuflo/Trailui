/**
 * Player Data Access - Mock Implementation
 * 
 * 玩家数据访问 - Mock实现
 * Demo阶段从静态数据文件读取
 * 上线后替换为ApiPlayerDataAccess
 */

import type { IPlayerDataAccess } from '../../../types/data-access.types';
import type { PlayerStatusArea } from '../../../types';
import { DEFAULT_PLAYER_STATUS, MOCK_PLAYER_SAVES } from '../../../data/hong-kong/player';

/**
 * 玩家数据访问Mock实现类
 * 
 * @note Demo实现 - 从静态player-status.data.ts读取
 */
export class PlayerDataAccessMock implements IPlayerDataAccess {
  /**
   * 获取默认玩家状态
   * 
   * @returns 默认状态的深拷贝
   */
  async getDefaultStatus(): Promise<PlayerStatusArea> {
    console.log('[PlayerDataAccessMock] Returning default player status');
    return this.deepCopy(DEFAULT_PLAYER_STATUS);
  }
  
  /**
   * 加载玩家状态
   * 
   * @param saveId 存档ID（可选）
   * @returns 玩家状态的深拷贝
   * @note Demo阶段：从MOCK_PLAYER_SAVES加载预设状态
   */
  async loadStatus(saveId?: string): Promise<PlayerStatusArea> {
    if (!saveId) {
      console.log('[PlayerDataAccessMock] No saveId, returning default status');
      return this.getDefaultStatus();
    }
    
    // Demo: 从预设存档加载
    const mockSave = MOCK_PLAYER_SAVES[saveId as keyof typeof MOCK_PLAYER_SAVES];
    
    if (!mockSave) {
      console.warn(`[PlayerDataAccessMock] Save not found: ${saveId}, returning default`);
      return this.getDefaultStatus();
    }
    
    console.log(`[PlayerDataAccessMock] Loaded save: ${saveId}`);
    return this.deepCopy(mockSave);
  }
  
  /**
   * 保存玩家状态
   * 
   * @param status 玩家状态
   * @param saveId 存档ID（可选）
   * @note Demo阶段：仅输出到控制台
   */
  async saveStatus(status: PlayerStatusArea, saveId?: string): Promise<void> {
    console.log('[PlayerDataAccessMock] Saving player status (mock):', {
      saveId: saveId || 'default',
      location: status.current_location,
      vigor: status.vigor.value,
      clarity: status.clarity.value
    });
    
    // Demo阶段：实际不保存，仅模拟
    // 上线后：调用 API 保存到服务器
  }
  
  /**
   * 删除存档
   * 
   * @param saveId 存档ID
   * @note Demo阶段：仅输出到控制台
   */
  async deleteSave(saveId: string): Promise<void> {
    console.log(`[PlayerDataAccessMock] Deleting save (mock): ${saveId}`);
    
    // Demo阶段：实际不删除，仅模拟
    // 上线后：调用 API 删除服务器存档
  }
  
  /**
   * 获取所有存档列表
   * 
   * @returns 存档信息数组
   * @note Demo阶段：返回MOCK_PLAYER_SAVES的keys
   */
  async listSaves(): Promise<Array<{ id: string; timestamp: number; location: string }>> {
    const saves = Object.entries(MOCK_PLAYER_SAVES).map(([id, save], index) => ({
      id,
      timestamp: Date.now() - index * 86400000, // 模拟不同时间
      location: save.current_location
    }));
    
    console.log(`[PlayerDataAccessMock] Listing ${saves.length} mock saves`);
    return saves;
  }
  
  /**
   * 深拷贝辅助方法
   * @param obj 要拷贝的对象
   * @returns 深拷贝后的对象
   */
  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
