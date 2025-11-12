/**
 * LLM服务接口定义
 * 
 * 为未来LLM集成预留清晰接口
 * Demo阶段使用Mock实现，上线后切换到真实LLM
 */

import type { NarrativeUnit } from '../../../../types/instance.types';

// ============================================
// 场景叙事生成服务
// ============================================

export interface ISceneNarrativeGenerationService {
  /**
   * 为场景生成叙事序列
   * 
   * @param request - 生成请求
   * @returns 叙事单元列表 + 元数据
   */
  generateSceneNarrative(request: {
    storyInstanceId: string;
    sceneId: string;
    sceneTemplate: {
      title: string;
      location: string;
      time_of_day: string;
      weather: string;
      background_info: string;
      objective: string;
    };
    playerContext: {
      playerId: string;
      previousScenes: string[];
      relationshipState: Record<string, number>;
      discoveredClues: string[];
    };
    options?: {
      length?: 'short' | 'medium' | 'long';
      tone?: 'tense' | 'casual' | 'mysterious';
    };
  }): Promise<{
    narrativeUnits: NarrativeUnit[];
    metadata: {
      llmModel: string;
      tokenCount: number;
      generatedAt: number;
    };
  }>;
}

// ============================================
// NPC对话服务
// ============================================

export interface INPCDialogueService {
  /**
   * 生成NPC对玩家输入的响应
   * 
   * @param request - 对话请求
   * @returns NPC响应 + 状态变化
   */
  generateNPCResponse(request: {
    sceneId: string;
    npcId: string;
    playerInput: string;
    npcState: {
      personality: string;
      currentMood: string;
      relationship: number;
      knownSecrets: string[];
    };
    conversationHistory: Array<{
      speaker: string;
      content: string;
      timestamp: number;
    }>;
    sceneConstraints: {
      availableTopics: string[];
      forbiddenTopics: string[];
      objectiveHints: string[];
    };
  }): Promise<{
    npcResponse: string;
    emotionalState: {
      mood: string;
      intensity: number;
    };
    relationshipDelta: number;
    triggeredEvents: Array<{
      eventId: string;
      eventType: 'clue_revealed' | 'trust_gained' | 'suspicion_raised';
      payload: any;
    }>;
    metadata: {
      llmModel: string;
      tokenCount: number;
      generatedAt: number;
    };
  }>;
}

// ============================================
// 玩家选择生成服务
// ============================================

export interface IPlayerChoiceGenerationService {
  /**
   * 根据当前情境生成玩家可选择的行动
   * 
   * @param request - 选择生成请求
   * @returns 可选行动列表
   */
  generatePlayerChoices(request: {
    sceneId: string;
    interventionPointId: string;
    situationContext: {
      narrative: string;
      presentNPCs: string[];
      availableItems: string[];
      environmentState: Record<string, any>;
    };
    playerCapabilities: {
      skills: string[];
      items: string[];
      relationships: Record<string, number>;
    };
    constraints: {
      minChoices: number;
      maxChoices: number;
      includePassOption: boolean;
    };
  }): Promise<{
    choices: Array<{
      id: string;
      text: string;
      type: 'dialogue' | 'action' | 'observation';
      requirements?: {
        minRelationship?: number;
        requiredSkills?: string[];
        requiredItems?: string[];
      };
      expectedEffect?: {
        difficulty: 'easy' | 'medium' | 'hard';
        risk: 'low' | 'medium' | 'high';
      };
    }>;
    metadata: {
      llmModel: string;
      tokenCount: number;
      generatedAt: number;
    };
  }>;
}

// ============================================
// 自由输入处理服务
// ============================================

export interface IFreeformInputProcessingService {
  /**
   * 处理玩家自由文本输入
   * 
   * @param request - 输入处理请求
   * @returns 意图解析 + 结果叙事
   */
  processFreeformInput(request: {
    playerInput: string;
    currentState: {
      sceneId: string;
      storyState: any;
      playerState: any;
      npcStates: Record<string, any>;
    };
    worldRules: {
      allowedActions: string[];
      physicsConstraints: Record<string, any>;
      narrativeConstraints: string[];
    };
  }): Promise<{
    interpretedIntent: {
      actionType: 'dialogue' | 'movement' | 'stealth' | 'combat' | 'observation';
      target?: string;
      goal: string;
    };
    feasibility: {
      isAllowed: boolean;
      difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'impossible';
      requiredCheck?: {
        skillType: string;
        threshold: number;
      };
    };
    outcomeNarrative: NarrativeUnit[];
    stateChanges: {
      playerStateDelta?: Record<string, any>;
      npcStateDelta?: Record<string, Record<string, any>>;
      sceneStateDelta?: Record<string, any>;
      triggeredEvents?: Array<{
        eventId: string;
        eventType: string;
        payload: any;
      }>;
    };
    metadata: {
      llmModel: string;
      tokenCount: number;
      generatedAt: number;
    };
  }>;
}
