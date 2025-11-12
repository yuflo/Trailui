/**
 * Clue Data Access - API Implementation
 * 
 * 线索数据访问 - API实现
 * 上线时使用，对接后端API
 * 
 * @note 上线前实现
 */

import type { IClueDataAccess } from '../../../types/data-access.types';
import type { ClueData } from '../../../types';

/**
 * 线索数据访问API实现类
 * 
 * @note API实现 - 上线时对接后端API
 */
export class ClueDataAccessApi implements IClueDataAccess {
  private baseUrl: string;
  
  /**
   * 构造函数
   * @param baseUrl API基础URL，默认为 '/api/v1'
   */
  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * 根据ID查找线索
   * 
   * @param clueId 线索ID
   * @returns 线索数据或null
   * 
   * @todo 上线时实现
   * @example
   * // API调用示例
   * // GET /api/v1/clues/{clueId}
   * // Response: ClueData | { error: string }
   */
  async findById(clueId: string): Promise<ClueData | null> {
    // TODO: 上线时实现
    // const response = await fetch(`${this.baseUrl}/clues/${clueId}`);
    // if (!response.ok) {
    //   console.error(`[ClueDataAccessApi] Failed to fetch clue: ${clueId}`);
    //   return null;
    // }
    // return response.json();
    
    throw new Error('ClueDataAccessApi.findById() - API implementation pending');
  }
  
  /**
   * 根据故事ID获取所有关联线索
   * 
   * @param storyId 故事ID
   * @returns 线索数组
   * 
   * @todo 上线时实现
   * @example
   * // API调用示例
   * // GET /api/v1/stories/{storyId}/clues
   * // Response: ClueData[]
   */
  async getByStoryId(storyId: string): Promise<ClueData[]> {
    // TODO: 上线时实现
    // const response = await fetch(`${this.baseUrl}/stories/${storyId}/clues`);
    // if (!response.ok) {
    //   console.error(`[ClueDataAccessApi] Failed to fetch clues for story: ${storyId}`);
    //   return [];
    // }
    // return response.json();
    
    throw new Error('ClueDataAccessApi.getByStoryId() - API implementation pending');
  }
  
  /**
   * 获取所有线索
   * 
   * @returns 所有线索数组
   * 
   * @todo 上线时实现
   * @example
   * // API调用示例
   * // GET /api/v1/clues
   * // Response: ClueData[]
   */
  async getAll(): Promise<ClueData[]> {
    // TODO: 上线时实现
    // const response = await fetch(`${this.baseUrl}/clues`);
    // if (!response.ok) {
    //   console.error(`[ClueDataAccessApi] Failed to fetch all clues`);
    //   return [];
    // }
    // return response.json();
    
    throw new Error('ClueDataAccessApi.getAll() - API implementation pending');
  }
}
