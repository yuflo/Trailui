/**
 * NarrativeService - 叙事服务
 * 
 * 核心职责：
 * - 管理场景叙事的生成和缓存
 * - 处理玩家与NPC的交互
 * - 调用LLM服务生成动态内容
 * - 保存LLM生成历史
 * - 管理叙事线索数据（registerStoryClues, getRandomClues）
 */

import { InstanceCacheManager } from '../../cache/InstanceCacheManager';
import { LLMServiceFactory } from '../llm/LLMServiceFactory';
import { NPCService } from './NPCService';
import type { NarrativeUnit, NarrativeThread } from '../../../types/instance.types';

/**
 * 故事线索数据映射
 * 
 * Key: storyId
 * Value: 该故事的线索数组
 */
const storyCluesMap: Record<string, NarrativeThread[]> = {};

/**
 * 叙事服务
 */
export class NarrativeService {
  /**
   * 🔥 加载场景叙事（带缓存）
   * 
   * 工作流程：
   * 1. 检查Cache，如果有则直接返回
   * 2. 如果没有，调用LLM生成
   * 3. 保存到Cache
   * 4. 返回叙事内容
   */
  static async loadSceneNarrative(sceneInstanceId: string): Promise<NarrativeUnit[]> {
    // 1. 检查缓存
    const cached = InstanceCacheManager.getLLMSceneNarrative(sceneInstanceId);
    if (cached) {
      console.log(`[NarrativeService] ✅ Cache hit: ${sceneInstanceId}`);
      return cached.narrative_units;
    }
    
    // 2. 获取场景实例
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      throw new Error(`[NarrativeService] Scene instance not found: ${sceneInstanceId}`);
    }
    
    // 3. 获取故事实例
    const storyInstance = InstanceCacheManager.getStoryInstance(sceneInstance.story_instance_id);
    if (!storyInstance) {
      throw new Error(`[NarrativeService] Story instance not found: ${sceneInstance.story_instance_id}`);
    }
    
    // 4. 构建玩家上下文
    const playerContext = {
      playerId: sceneInstance.player_id,
      previousScenes: storyInstance.completed_scenes,
      relationshipState: this.getRelationshipState(sceneInstance.story_instance_id),
      discoveredClues: []
    };
    
    // 5. 调用LLM生成叙事
    const llmService = LLMServiceFactory.getNarrativeService();
    const result = await llmService.generateSceneNarrative({
      storyInstanceId: sceneInstance.story_instance_id,
      sceneId: sceneInstance.scene_template_id,
      sceneTemplate: sceneInstance.scene_data,
      playerContext
    });
    
    // 6. 保存到缓存
    InstanceCacheManager.saveLLMSceneNarrative({
      record_id: this.generateUUID(),
      player_id: sceneInstance.player_id,
      story_instance_id: sceneInstance.story_instance_id,
      scene_instance_id: sceneInstanceId,
      scene_template_id: sceneInstance.scene_template_id,
      narrative_units: result.narrativeUnits,
      llm_model: result.metadata.llmModel,
      token_count: result.metadata.tokenCount,
      generated_at: result.metadata.generatedAt,
      version: 1,
      is_active: true
    });
    
    console.log(`[NarrativeService] ✅ Generated narrative: ${sceneInstanceId}`);
    return result.narrativeUnits;
  }
  
  /**
   * 🔥 处理玩家选择（与NPC对话）
   * 
   * 工作流程：
   * 1. 获取NPC实例
   * 2. 获取对话历史
   * 3. 调用LLM生成响应
   * 4. 保存对话记录
   * 5. 更新NPC状态
   * 6. 返回响应
   */
  static async handlePlayerChoice(
    sceneInstanceId: string,
    npcInstanceId: string,
    playerInput: string
  ): Promise<{
    npcResponse: string;
    emotionalState: {
      mood: string;
      intensity: number;
    };
    relationshipDelta: number;
  }> {
    // 1. 获取NPC实例
    const npc = InstanceCacheManager.getNPCInstance(npcInstanceId);
    if (!npc) {
      throw new Error(`[NarrativeService] NPC instance not found: ${npcInstanceId}`);
    }
    
    // 2. 获取对话历史
    const history = InstanceCacheManager.getLLMDialogueHistory(npcInstanceId, 10);
    
    // 3. 构建对话历史格式
    const conversationHistory = history.flatMap(r => [
      {
        speaker: 'Player',
        content: r.player_input,
        timestamp: r.timestamp
      },
      {
        speaker: npc.npc_data.name,
        content: r.npc_response,
        timestamp: r.timestamp
      }
    ]);
    
    // 4. 调用LLM生成响应
    const llmService = LLMServiceFactory.getDialogueService();
    const result = await llmService.generateNPCResponse({
      sceneId: sceneInstanceId,
      npcId: npc.npc_template_id,
      playerInput,
      npcState: {
        personality: npc.npc_data.personality.traits.join(', '),
        currentMood: npc.current_state.current_mood,
        relationship: npc.current_state.relationship,
        knownSecrets: [] // TODO: 从NPC模板获取
      },
      conversationHistory,
      sceneConstraints: {
        availableTopics: [],
        forbiddenTopics: [],
        objectiveHints: []
      }
    });
    
    // 5. 保存对话记录
    const turnNumber = history.length + 1;
    InstanceCacheManager.saveLLMDialogue({
      record_id: this.generateUUID(),
      player_id: npc.player_id,
      story_instance_id: npc.story_instance_id,
      scene_instance_id: sceneInstanceId,
      npc_instance_id: npcInstanceId,
      player_input: playerInput,
      npc_response: result.npcResponse,
      emotional_state: result.emotionalState,
      relationship_delta: result.relationshipDelta,
      triggered_events: result.triggeredEvents,
      llm_model: result.metadata.llmModel,
      token_count: result.metadata.tokenCount,
      timestamp: result.metadata.generatedAt,
      turn_number: turnNumber
    });
    
    // 6. 更新NPC状态
    NPCService.updateRelationship(npcInstanceId, result.relationshipDelta);
    NPCService.updateMood(npcInstanceId, result.emotionalState.mood);
    
    console.log(`[NarrativeService] ✅ Generated NPC response: ${npc.npc_data.name}`);
    return result;
  }
  
  /**
   * 🔥 处理自由输入
   */
  static async processFreeformInput(
    sceneInstanceId: string,
    playerInput: string
  ): Promise<{
    interpretedIntent: any;
    feasibility: any;
    outcomeNarrative: NarrativeUnit[];
  }> {
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      throw new Error(`[NarrativeService] Scene instance not found: ${sceneInstanceId}`);
    }
    
    // 调用LLM处理自由输入
    const llmService = LLMServiceFactory.getFreeformService();
    const result = await llmService.processFreeformInput({
      playerInput,
      currentState: {
        sceneId: sceneInstanceId,
        storyState: {},
        playerState: {},
        npcStates: {}
      },
      worldRules: {
        allowedActions: ['dialogue', 'observation', 'movement', 'stealth'],
        physicsConstraints: {},
        narrativeConstraints: []
      }
    });
    
    console.log(`[NarrativeService] ✅ Processed freeform input: ${playerInput}`);
    return result;
  }
  
  /**
   * 🔥 获取对话历史
   */
  static getDialogueHistory(npcInstanceId: string, limit: number = 10) {
    return InstanceCacheManager.getLLMDialogueHistory(npcInstanceId, limit);
  }
  
  /**
   * 辅助方法：获取关系状态
   */
  private static getRelationshipState(storyInstanceId: string): Record<string, number> {
    const npcs = NPCService.getStoryNPCs(storyInstanceId);
    const relationshipState: Record<string, number> = {};
    
    npcs.forEach(npc => {
      relationshipState[npc.npc_template_id] = npc.current_state.relationship;
    });
    
    return relationshipState;
  }
  
  /**
   * 辅助方法：生成UUID
   */
  private static generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // ========== 叙事线索管理功能（从 NarrativeClueServiceImpl 迁移） ==========
  
  /**
   * 注册故事的线索数据
   * 
   * @param storyId 故事ID
   * @param clues 线索数组
   */
  static registerStoryClues(storyId: string, clues: NarrativeThread[]): void {
    storyCluesMap[storyId] = clues;
    console.log(`[NarrativeService] Registered ${clues.length} clues for story: ${storyId}`);
  }
  
  /**
   * 获取指定故事的随机线索
   * 
   * @param storyId 故事ID
   * @param count 线索数量
   * @returns 随机线索数组
   */
  static getRandomClues(storyId: string, count: number): NarrativeThread[] {
    const allClues = storyCluesMap[storyId];
    
    if (!allClues || allClues.length === 0) {
      console.warn(`[NarrativeService] No clues found for story: ${storyId}`);
      return [];
    }
    
    // 随机抽取指定数量的线索（不重复）
    const shuffled = [...allClues].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, allClues.length));
  }
  
  /**
   * 获取指定故事的所有线索
   * 
   * @param storyId 故事ID
   * @returns 所有线索
   */
  static getAllClues(storyId: string): NarrativeThread[] {
    const allClues = storyCluesMap[storyId];
    
    if (!allClues) {
      console.warn(`[NarrativeService] No clues found for story: ${storyId}`);
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
  static refreshClues(storyId: string, count: number): NarrativeThread[] {
    return this.getRandomClues(storyId, count);
  }
}