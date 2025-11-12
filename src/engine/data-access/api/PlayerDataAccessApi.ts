/**
 * Player Data Access - API Implementation
 * 
 * 玩家数据访问 - API实现
 * 上线后使用，调用后端API
 */

import type { IPlayerDataAccess } from '../../../types/data-access.types';
import type { PlayerStatusArea } from '../../../types';

/**
 * 玩家数据访问API实现类
 * 
 * @note 上线后实现 - 调用后端API
 * @note 当前为占位符，实际需要后端API地址和认证
 */
export class PlayerDataAccessApi implements IPlayerDataAccess {
  private apiBaseUrl: string;
  
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  async getDefaultStatus(): Promise<PlayerStatusArea> {
    // TODO: 调用 GET /api/player/default
    throw new Error('Not implemented - use PlayerDataAccessMock for demo');
  }
  
  async loadStatus(saveId?: string): Promise<PlayerStatusArea> {
    // TODO: 调用 GET /api/player/saves/:saveId
    throw new Error('Not implemented - use PlayerDataAccessMock for demo');
  }
  
  async saveStatus(status: PlayerStatusArea, saveId?: string): Promise<void> {
    // TODO: 调用 POST /api/player/saves
    throw new Error('Not implemented - use PlayerDataAccessMock for demo');
  }
  
  async deleteSave(saveId: string): Promise<void> {
    // TODO: 调用 DELETE /api/player/saves/:saveId
    throw new Error('Not implemented - use PlayerDataAccessMock for demo');
  }
  
  async listSaves(): Promise<Array<{ id: string; timestamp: number; location: string }>> {
    // TODO: 调用 GET /api/player/saves
    throw new Error('Not implemented - use PlayerDataAccessMock for demo');
  }
}
