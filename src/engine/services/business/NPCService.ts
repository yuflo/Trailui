/**
 * NPCService - NPC业务服务（无状态）
 * 
 * 职责：
 * - 生成NPC对话（LLM模拟）
 * - 管理NPC状态（关系值、情绪）
 * - 处理玩家与NPC的交互
 */

import { InstanceCacheManager } from '../../cache/InstanceCacheManager';
import { MockNPCProvider } from './MockDataProvider';
import type { LLMDialogueRecord, NPCInstance } from '../../../types/instance.types';

/**
 * NPC服务
 */
export class NPCService {
  /**
   * 🔥 生成NPC对话
   * 
   * Demo: 使用 MockNPCProvider 返回预设对话
   * 正式版: 调用 LLM API 动态生成个性化对话
   * 
   * @param npcInstanceId - NPC实例ID
   * @param playerInput - 玩家输入
   * @param context - 对话上下文
   * @returns NPC回复文本
   */
  static generateNPCDialogue(
    npcInstanceId: string,
    playerInput: string,
    context?: any
  ): string {
    const npcInstance = InstanceCacheManager.getNPCInstance(npcInstanceId);
    if (!npcInstance) {
      throw new Error(`[NPCService] NPC instance not found: ${npcInstanceId}`);
    }
    
    // 🔥 Demo: 使用 mock 数据
    const response = MockNPCProvider.generateNPCDialogue(
      npcInstance.npc_template_id,
      playerInput,
      {
        npcState: npcInstance.current_state,
        interactionHistory: this.getInteractionHistory(npcInstanceId),
        ...context
      }
    );
    
    // 🔥 正式版替换成：
    // const response = await LLMService.generateDialogue({
    //   npcProfile: npcInstance.npc_data,
    //   npcState: npcInstance.current_state,
    //   playerInput: playerInput,
    //   conversationHistory: this.getDialogueHistory(npcInstanceId),
    //   sceneContext: getSceneContext(npcInstance.story_instance_id)
    // });
    
    // 保存对话到 Cache（数据库）
    const dialogueRecord: LLMDialogueRecord = {
      record_id: `dialogue_${npcInstanceId}_${Date.now()}`,
      npc_instance_id: npcInstanceId,
      story_instance_id: npcInstance.story_instance_id,
      player_id: npcInstance.player_id,
      turn_number: this.getNextTurnNumber(npcInstanceId),
      player_input: playerInput,
      npc_response: response,
      npc_state_snapshot: { ...npcInstance.current_state },
      created_at: Date.now(),
      llm_model: 'mock-gpt-4', // Demo阶段
      generation_params: {
        temperature: 0.9,
        max_tokens: 300
      }
    };
    
    InstanceCacheManager.saveLLMDialogue(dialogueRecord);
    
    // 更新交互统计
    this.updateInteractionStats(npcInstanceId);
    
    console.log(`[NPCService] ✅ Generated dialogue for NPC: ${npcInstanceId}`);
    return response;
  }
  
  /**
   * 获取对话历史
   */
  static getDialogueHistory(npcInstanceId: string, limit: number = 10): LLMDialogueRecord[] {
    return InstanceCacheManager.getLLMDialogueHistory(npcInstanceId, limit);
  }
  
  /**
   * 获取交互历史摘要
   */
  private static getInteractionHistory(npcInstanceId: string): string[] {
    const npcInstance = InstanceCacheManager.getNPCInstance(npcInstanceId);
    if (!npcInstance) {
      return [];
    }
    
    return npcInstance.interaction_summary.revealed_secrets || [];
  }
  
  /**
   * 获取下一个对话轮次编号
   */
  private static getNextTurnNumber(npcInstanceId: string): number {
    const history = this.getDialogueHistory(npcInstanceId, 1000);
    return history.length + 1;
  }
  
  /**
   * 更新交互统计
   */
  private static updateInteractionStats(npcInstanceId: string): void {
    const npcInstance = InstanceCacheManager.getNPCInstance(npcInstanceId);
    if (!npcInstance) {
      return;
    }
    
    InstanceCacheManager.updateNPCInstance(npcInstanceId, {
      ...npcInstance.current_state
    });
    
    // 更新交互摘要（直接修改实例，因为这是统计数据）
    const instance = InstanceCacheManager.getNPCInstance(npcInstanceId);
    if (instance) {
      instance.interaction_summary.total_interactions += 1;
      instance.interaction_summary.last_interaction_at = Date.now();
    }
  }
  
  /**
   * 🔥 更新NPC状态（关系值、情绪等）
   * 
   * @param npcInstanceId - NPC实例ID
   * @param stateUpdates - 状态更新
   */
  static updateNPCState(
    npcInstanceId: string,
    stateUpdates: {
      relationship?: number;
      mood?: 'hostile' | 'neutral' | 'friendly' | 'fearful';
      alertness?: number;
      trust_level?: number;
    }
  ): void {
    InstanceCacheManager.updateNPCInstance(npcInstanceId, stateUpdates);
    
    console.log(`[NPCService] ✅ Updated NPC state: ${npcInstanceId}`, stateUpdates);
  }
  
  /**
   * 获取NPC当前状态
   */
  static getNPCState(npcInstanceId: string) {
    const npcInstance = InstanceCacheManager.getNPCInstance(npcInstanceId);
    return npcInstance ? npcInstance.current_state : null;
  }
  
  /**
   * 获取场景中的所有NPC
   */
  static getSceneNPCs(sceneInstanceId: string): NPCInstance[] {
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      return [];
    }
    
    return InstanceCacheManager.getNPCInstances(sceneInstance.npc_instance_ids);
  }
  
  /**
   * 🔥 触发NPC秘密揭示
   * 
   * Demo: 手动添加秘密
   * 正式版: LLM根据对话动态判断
   */
  static revealSecret(npcInstanceId: string, secret: string): void {
    const npcInstance = InstanceCacheManager.getNPCInstance(npcInstanceId);
    if (!npcInstance) {
      throw new Error(`[NPCService] NPC instance not found: ${npcInstanceId}`);
    }
    
    const revealedSecrets = [...npcInstance.interaction_summary.revealed_secrets];
    if (!revealedSecrets.includes(secret)) {
      revealedSecrets.push(secret);
      
      // 更新实例
      npcInstance.interaction_summary.revealed_secrets = revealedSecrets;
      
      console.log(`[NPCService] ✅ NPC revealed secret: ${secret}`);
    }
  }
}
