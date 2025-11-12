/**
 * Scene Data Access - Mock Implementation
 * 
 * 场景Mock数据访问 - Mock实现
 * Demo阶段从scenes/目录的静态数据读取
 * 上线后替换为LLM API调用
 */

import type { ISceneDataAccess } from '../../../types/data-access.types';
import { sceneABarEntrance } from '../../../data/hong-kong/scenes/scene-a-bar-entrance.data';
import { sceneBBarInterior } from '../../../data/hong-kong/scenes/scene-b-bar-interior.data';

/**
 * 场景Mock数据注册表
 * 
 * Key: storyId:sceneId
 * Value: Scene Mock数据对象
 */
const sceneMockRegistry: Record<string, any> = {
  'demo-story:scene-a': sceneABarEntrance,
  'demo-story:scene-b': sceneBBarInterior,
};

/**
 * 场景数据访问Mock实现类
 * 
 * @note Demo实现 - 从静态scenes/目录读取
 * @note 上线后改为LLM API调用，根据场景上下文生成响应
 */
export class SceneDataAccessMock implements ISceneDataAccess {
  /**
   * 根据三层Key获取场景Mock响应数据
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @param mockKey Mock数据Key（如 'LOAD_SCENE', 'INTERACT_turn_1', 'PASS'）
   * @returns Mock响应数据或null
   * 
   * @example
   * // 加载场景
   * getSceneMock('demo-story', 'scene-a', 'LOAD_SCENE')
   * 
   * @example
   * // 玩家交互第1轮
   * getSceneMock('demo-story', 'scene-a', 'INTERACT_turn_1')
   */
  async getSceneMock(storyId: string, sceneId: string, mockKey: string): Promise<any | null> {
    const registryKey = `${storyId}:${sceneId}`;
    const sceneMockData = sceneMockRegistry[registryKey];
    
    if (!sceneMockData) {
      console.warn(`[SceneDataAccessMock] Scene not found: ${registryKey}`);
      return null;
    }
    
    // 解析mockKey（支持INTERACT_turn_1这种格式）
    let mockResponse = null;
    
    if (mockKey === 'LOAD_SCENE' || mockKey === 'PASS') {
      // 简单Key，直接访问
      mockResponse = sceneMockData[mockKey];
    } else if (mockKey.startsWith('INTERACT_')) {
      // INTERACT_turn_X格式，需要解析turn
      const turnMatch = mockKey.match(/^INTERACT_(.+)$/);
      if (turnMatch && sceneMockData.INTERACT) {
        const turnKey = turnMatch[1];  // 'turn_1', 'turn_2', etc.
        mockResponse = sceneMockData.INTERACT[turnKey];
      }
    }
    
    if (!mockResponse) {
      console.warn(`[SceneDataAccessMock] Mock key not found: ${mockKey} in scene: ${registryKey}`);
      return null;
    }
    
    console.log(`[SceneDataAccessMock] Loaded mock: ${registryKey} -> ${mockKey}`);
    return mockResponse;
  }
  
  /**
   * 获取场景的所有Mock数据
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @returns Mock数据对象（原始结构）
   */
  async getAllSceneMocks(storyId: string, sceneId: string): Promise<Record<string, any>> {
    const registryKey = `${storyId}:${sceneId}`;
    const sceneMockData = sceneMockRegistry[registryKey];
    
    if (!sceneMockData) {
      console.warn(`[SceneDataAccessMock] Scene not found: ${registryKey}`);
      return {};
    }
    
    console.log(`[SceneDataAccessMock] Loaded all mocks for scene: ${registryKey}`);
    return sceneMockData;
  }
}
