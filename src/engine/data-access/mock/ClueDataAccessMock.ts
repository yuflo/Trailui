/**
 * Clue Data Access - Mock Implementation
 * 
 * 线索数据访问 - Mock实现
 * Demo阶段从静态数据文件读取
 * 上线后替换为ApiClueDataAccess
 */

import type { IClueDataAccess } from '../../../types/data-access.types';
import type { ClueData } from '../../../types';
import { clueRegistry } from '../../../data/hong-kong/clues/clue-registry.data';

/**
 * 线索数据访问Mock实现类
 * 
 * @note Demo实现 - 从静态clue-registry.data.ts读取
 */
export class ClueDataAccessMock implements IClueDataAccess {
  /**
   * 根据ID查找线索
   * 
   * @param clueId 线索ID
   * @returns 线索数据的副本（防止外部修改）或null
   */
  async findById(clueId: string): Promise<ClueData | null> {
    const clue = clueRegistry.find(c => c.clue_id === clueId);
    
    if (!clue) {
      console.log(`[ClueDataAccessMock] Clue not found: ${clueId}`);
      return null;
    }
    
    // 返回副本，防止外部修改原始数据
    return { ...clue };
  }
  
  /**
   * 根据故事ID获取所有关联线索
   * 
   * @param storyId 故事ID
   * @returns 线索数组的副本
   */
  async getByStoryId(storyId: string): Promise<ClueData[]> {
    const clues = clueRegistry
      .filter(c => c.story_id === storyId)
      .map(c => ({ ...c }));
    
    console.log(`[ClueDataAccessMock] Found ${clues.length} clues for story: ${storyId}`);
    
    return clues;
  }
  
  /**
   * 获取所有线索
   * 
   * @returns 所有线索数组的副本
   */
  async getAll(): Promise<ClueData[]> {
    console.log(`[ClueDataAccessMock] Returning all ${clueRegistry.length} clues`);
    return clueRegistry.map(c => ({ ...c }));
  }
}
