/**
 * Narrative Clue Service Implementation
 * 
 * 叙事线索服务实现
 * 负责提供叙事线索的管理和随机获取功能
 * 
 * @note Demo实现 - 从静态数据文件读取，上线后改为从LLM/API获取
 */

import type { INarrativeClueService, NarrativeThread } from '../../../types';

/**
 * 故事线索数据映射
 * 
 * Key: storyId
 * Value: 该故事的线索数组
 */
const storyCluesMap: Record<string, NarrativeThread[]> = {};

/**
 * 叙事线索服务实现类
 * 
 * Demo阶段从静态数据文件读取线索
 * 上线后替换为从后端API或LLM动态生成
 */
export class NarrativeClueServiceImpl implements INarrativeClueService {
  /**
   * 注册故事的线索数据
   * 
   * @param storyId 故事ID
   * @param clues 线索数组
   * @note Demo功能：手动注册故事线索数据
   */
  registerStoryClues(storyId: string, clues: NarrativeThread[]): void {
    storyCluesMap[storyId] = clues;
  }
  
  /**
   * 获取指定故事的随机线索
   * 
   * @param storyId 故事ID
   * @param count 线索数量
   * @returns 随机线索数组
   */
  getRandomClues(storyId: string, count: number): NarrativeThread[] {
    const allClues = storyCluesMap[storyId];
    
    if (!allClues || allClues.length === 0) {
      console.warn(`[NarrativeClueService] No clues found for story: ${storyId}`);
      return [];
    }
    
    // Demo逻辑：随机抽取指定数量的线索（不重复）
    const shuffled = [...allClues].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, allClues.length));
  }
  
  /**
   * 获取指定故事的所有线索
   * 
   * @param storyId 故事ID
   * @returns 所有线索
   */
  getAllClues(storyId: string): NarrativeThread[] {
    const allClues = storyCluesMap[storyId];
    
    if (!allClues) {
      console.warn(`[NarrativeClueService] No clues found for story: ${storyId}`);
      return [];
    }
    
    return [...allClues];
  }
  
  /**
   * 刷新线索（重新随机获取）
   * 
   * @param storyId 故事ID
   * @param count 线索数量
   * @returns 新的随机线索数组
   */
  refreshClues(storyId: string, count: number): NarrativeThread[] {
    // Demo逻辑：直接调用 getRandomClues 即可
    return this.getRandomClues(storyId, count);
  }
  
  /**
   * 🆕 标记场景为已完成
   * 
   * @note 这是一个占位方法，实际逻辑在 GameEngine 中实现
   */
  async markSceneCompleted(
    clueId: string, 
    sceneId: string,
    completionClueId?: string
  ): Promise<void> {
    console.warn('[NarrativeClueService] markSceneCompleted called but not implemented in service layer');
    console.warn('[NarrativeClueService] This should be handled by GameEngine event listeners');
  }
  
  /**
   * 🆕 标记故事为已完成
   * 
   * @note 这是一个占位方法，实际逻辑在 GameEngine 中实现
   */
  async markStoryCompleted(
    clueId: string,
    completionClueId?: string
  ): Promise<void> {
    console.warn('[NarrativeClueService] markStoryCompleted called but not implemented in service layer');
    console.warn('[NarrativeClueService] This should be handled by GameEngine event listeners');
  }
}
