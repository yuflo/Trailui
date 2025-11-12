/**
 * Scene Data Access - API Implementation
 * 
 * 场景数据访问 - API实现（LLM调用）
 * 上线时使用，对接LLM API生成场景响应
 * 
 * @note 上线前实现
 */

import type { ISceneDataAccess } from '../../../types/data-access.types';

/**
 * 场景数据访问API实现类
 * 
 * @note API实现 - 上线时对接LLM API
 * @note 这个DataAccess与其他不同，它调用LLM生成内容，而不是简单的数据获取
 */
export class SceneDataAccessApi implements ISceneDataAccess {
  private baseUrl: string;
  
  /**
   * 构造函数
   * @param baseUrl API基础URL，默认为 '/api/v1'
   */
  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * 根据三层Key获取场景响应数据（LLM生成）
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @param mockKey Action类型（'LOAD_SCENE', 'INTERACT_turn_1'等）
   * @returns LLM生成的响应数据
   * 
   * @todo 上线时实现
   * @example
   * // API调用示例（POST，因为需要发送上下文）
   * // POST /api/v1/scenes/generate
   * // Body: {
   * //   story_id: 'demo-story',
   * //   scene_id: 'scene-a',
   * //   action_type: 'INTERACT',
   * //   turn: 1,
   * //   player_intent: '我想帮助小雪',
   * //   scene_history: [...]
   * // }
   * // Response: AdvanceResponse
   */
  async getSceneMock(storyId: string, sceneId: string, mockKey: string): Promise<any | null> {
    // TODO: 上线时实现
    // 
    // 上线时这个方法会：
    // 1. 解析mockKey，确定action_type和turn
    // 2. 收集场景上下文（历史事件、NPC状态等）
    // 3. 调用LLM API生成响应
    // 4. 返回生成的AdvanceResponse
    //
    // const response = await fetch(`${this.baseUrl}/scenes/generate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     story_id: storyId,
    //     scene_id: sceneId,
    //     action_key: mockKey,
    //     // ... 其他上下文数据
    //   })
    // });
    // 
    // if (!response.ok) {
    //   console.error(`[SceneDataAccessApi] Failed to generate scene response`);
    //   return null;
    // }
    // 
    // return response.json();
    
    throw new Error('SceneDataAccessApi.getSceneMock() - LLM API implementation pending');
  }
  
  /**
   * 获取场景的所有Mock数据
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @returns Mock数据（API模式下不适用）
   * 
   * @note API模式下此方法不适用，因为内容是动态生成的
   */
  async getAllSceneMocks(storyId: string, sceneId: string): Promise<Record<string, any>> {
    console.warn('[SceneDataAccessApi] getAllSceneMocks() is not applicable in API mode');
    return {};
  }
}
