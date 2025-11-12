/**
 * Data Access Factory
 * 
 * 数据访问工厂类
 * 根据环境配置决定使用Mock还是API实现
 * 
 * 使用方式：
 * - Demo阶段：DataAccessFactory.setMode('mock')
 * - 上线后：DataAccessFactory.setMode('api')
 * 
 * 优势：
 * - Service层代码无需修改
 * - 只需在ServiceContainer初始化时切换模式
 * - 便于测试和开发
 */

import type { 
  IClueDataAccess, 
  IStoryDataAccess, 
  IWorldInfoDataAccess,
  ISceneDataAccess,
  IPlayerDataAccess 
} from '../../types/data-access.types';

// Mock实现
import { 
  ClueDataAccessMock, 
  StoryDataAccessMock, 
  WorldInfoDataAccessMock,
  SceneDataAccessMock,
  PlayerDataAccessMock 
} from './mock';

// API实现（上线后启用）
// import { 
//   ClueDataAccessApi, 
//   StoryDataAccessApi, 
//   WorldInfoDataAccessApi,
//   SceneDataAccessApi 
// } from './api';

/**
 * 数据访问模式
 */
export type DataAccessMode = 'mock' | 'api';

/**
 * 数据访问工厂类
 * 
 * 单例模式，统一管理数据访问实例的创建
 */
export class DataAccessFactory {
  /** 当前模式（默认为mock） */
  private static mode: DataAccessMode = 'mock';
  
  /** API基础URL（API模式下使用） */
  private static apiBaseUrl: string = '/api/v1';
  
  /**
   * 设置数据访问模式
   * 
   * @param mode 'mock' | 'api'
   * 
   * @example
   * // Demo阶段
   * DataAccessFactory.setMode('mock');
   * 
   * @example
   * // 上线后
   * DataAccessFactory.setMode('api');
   */
  static setMode(mode: DataAccessMode): void {
    this.mode = mode;
    console.log(`[DataAccessFactory] Mode set to: ${mode}`);
  }
  
  /**
   * 设置API基础URL
   * 
   * @param baseUrl API基础URL
   * 
   * @example
   * DataAccessFactory.setApiBaseUrl('https://api.dreamheart.com/v1');
   */
  static setApiBaseUrl(baseUrl: string): void {
    this.apiBaseUrl = baseUrl;
    console.log(`[DataAccessFactory] API base URL set to: ${baseUrl}`);
  }
  
  /**
   * 获取当前模式
   */
  static getMode(): DataAccessMode {
    return this.mode;
  }
  
  /**
   * 创建Clue数据访问实例
   * 
   * @returns IClueDataAccess实例（Mock或API）
   */
  static createClueDataAccess(): IClueDataAccess {
    if (this.mode === 'api') {
      // TODO: 上线后启用
      // return new ClueDataAccessApi(this.apiBaseUrl);
      throw new Error('[DataAccessFactory] API mode not implemented yet - use mock mode');
    }
    
    return new ClueDataAccessMock();
  }
  
  /**
   * 创建Story数据访问实例
   * 
   * @returns IStoryDataAccess实例（Mock或API）
   */
  static createStoryDataAccess(): IStoryDataAccess {
    if (this.mode === 'api') {
      // TODO: 上线后启用
      // return new StoryDataAccessApi(this.apiBaseUrl);
      throw new Error('[DataAccessFactory] API mode not implemented yet - use mock mode');
    }
    
    return new StoryDataAccessMock();
  }
  
  /**
   * 创建WorldInfo数据访问实例
   * 
   * @returns IWorldInfoDataAccess实例（Mock或API）
   */
  static createWorldInfoDataAccess(): IWorldInfoDataAccess {
    if (this.mode === 'api') {
      // TODO: 上线后启用
      // return new WorldInfoDataAccessApi(this.apiBaseUrl);
      throw new Error('[DataAccessFactory] API mode not implemented yet - use mock mode');
    }
    
    return new WorldInfoDataAccessMock();
  }
  
  /**
   * 创建Scene数据访问实例
   * 
   * @returns ISceneDataAccess实例（Mock或API）
   */
  static createSceneDataAccess(): ISceneDataAccess {
    if (this.mode === 'api') {
      // TODO: 上线后启用
      // return new SceneDataAccessApi(this.apiBaseUrl);
      throw new Error('[DataAccessFactory] API mode not implemented yet - use mock mode');
    }
    
    return new SceneDataAccessMock();
  }
  
  /**
   * 创建Player数据访问实例
   * 
   * @returns IPlayerDataAccess实例（Mock或API）
   */
  static createPlayerDataAccess(): IPlayerDataAccess {
    if (this.mode === 'api') {
      // TODO: 上线后启用
      // return new PlayerDataAccessApi(this.apiBaseUrl);
      throw new Error('[DataAccessFactory] API mode not implemented yet - use mock mode');
    }
    
    return new PlayerDataAccessMock();
  }
}
