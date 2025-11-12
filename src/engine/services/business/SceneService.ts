/**
 * SceneService - 场景业务服务（无状态）
 * 
 * 职责：
 * - 生成场景叙事（LLM模拟）
 * - 管理场景事件
 * - 处理玩家选择
 */

import { InstanceCacheManager } from '../../cache/InstanceCacheManager';
import { MockSceneProvider, MockEventProvider } from './MockDataProvider';
import type { LLMSceneNarrativeRecord } from '../../../types/instance.types';

/**
 * 场景服务
 */
export class SceneService {
  /**
   * 🔥 生成场景叙事
   * 
   * Demo: 使用 MockSceneProvider 返回预设文本
   * 正式版: 调用 LLM API 动态生成
   * 
   * @param sceneInstanceId - 场景实例ID
   * @param playerContext - 玩家上下文（用于个性化生成）
   * @returns 场景叙事文本
   */
  static generateSceneNarrative(
    sceneInstanceId: string,
    playerContext?: any
  ): string {
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      throw new Error(`[SceneService] Scene instance not found: ${sceneInstanceId}`);
    }
    
    // 🔥 Demo: 使用 mock 数据
    const narrative = MockSceneProvider.generateSceneNarrative(
      sceneInstance.scene_template_id,
      playerContext
    );
    
    // 🔥 正式版替换成：
    // const narrative = await LLMService.generateNarrative({
    //   sceneTemplate: sceneInstance.scene_data,
    //   playerContext: playerContext,
    //   storyHistory: getStoryHistory(sceneInstance.story_instance_id)
    // });
    
    // 保存生成的叙事到 Cache（数据库）
    const narrativeRecord: LLMSceneNarrativeRecord = {
      record_id: `narrative_${sceneInstanceId}_${Date.now()}`,
      scene_instance_id: sceneInstanceId,
      story_instance_id: sceneInstance.story_instance_id,
      player_id: sceneInstance.player_id,
      narrative_text: narrative,
      generated_at: Date.now(),
      is_active: true,
      llm_model: 'mock-gpt-4', // Demo阶段
      generation_params: {
        temperature: 0.8,
        max_tokens: 500
      }
    };
    
    InstanceCacheManager.saveLLMSceneNarrative(narrativeRecord);
    
    console.log(`[SceneService] ✅ Generated narrative for scene: ${sceneInstanceId}`);
    return narrative;
  }
  
  /**
   * 获取场景的当前叙事
   */
  static getSceneNarrative(sceneInstanceId: string): string | null {
    const narrative = InstanceCacheManager.getLLMSceneNarrative(sceneInstanceId);
    return narrative ? narrative.narrative_text : null;
  }
  
  /**
   * 🔥 获取场景事件
   * 
   * Demo: 使用 MockEventProvider 返回预设事件
   * 正式版: 从数据库查询或LLM动态生成
   */
  static getSceneEvents(sceneInstanceId: string): any[] {
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      return [];
    }
    
    // 🔥 Demo: 使用 mock 数据
    return MockEventProvider.getSceneEvents(sceneInstance.scene_template_id);
    
    // 🔥 正式版替换成：
    // return await EventDatabase.getSceneEvents(sceneInstance.scene_template_id);
  }
  
  /**
   * 触发场景事件
   */
  static triggerEvent(sceneInstanceId: string, eventId: string): void {
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      throw new Error(`[SceneService] Scene instance not found: ${sceneInstanceId}`);
    }
    
    // 记录触发的事件
    const triggeredEvents = [...sceneInstance.triggered_events];
    if (!triggeredEvents.includes(eventId)) {
      triggeredEvents.push(eventId);
    }
    
    InstanceCacheManager.updateSceneInstance(sceneInstanceId, {
      triggered_events: triggeredEvents
    });
    
    console.log(`[SceneService] ✅ Triggered event: ${eventId} in scene: ${sceneInstanceId}`);
  }
  
  /**
   * 检查事件是否已触发
   */
  static isEventTriggered(sceneInstanceId: string, eventId: string): boolean {
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      return false;
    }
    
    return sceneInstance.triggered_events.includes(eventId);
  }
}
