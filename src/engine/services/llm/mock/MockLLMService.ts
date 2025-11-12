/**
 * Mock LLM服务实现
 * 
 * Demo阶段使用预定义数据模拟LLM响应
 * 上线后切换到真实LLM实现
 */

import type {
  ISceneNarrativeGenerationService,
  INPCDialogueService,
  IPlayerChoiceGenerationService,
  IFreeformInputProcessingService
} from '../interfaces/ILLMService';
import type { NarrativeUnit } from '../../../../types/instance.types';

// ============================================
// Mock场景叙事生成服务
// ============================================

export class MockSceneNarrativeService implements ISceneNarrativeGenerationService {
  async generateSceneNarrative(request: any): Promise<any> {
    // Demo阶段：返回预定义叙事
    const mockNarrative: NarrativeUnit[] = [
      {
        id: 'unit-1',
        type: 'Narrative',
        actor: 'System',
        content: `【${request.sceneTemplate.location}】${request.sceneTemplate.background_info}`,
        mood: 'tense'
      },
      {
        id: 'unit-2',
        type: 'Narrative',
        actor: 'System',
        content: `天气：${request.sceneTemplate.weather}，时间：${request.sceneTemplate.time_of_day}。`,
      },
      {
        id: 'unit-3',
        type: 'Narrative',
        actor: 'System',
        content: `你的目标：${request.sceneTemplate.objective}`,
      },
      {
        id: 'unit-4',
        type: 'InterventionPoint',
        interventionType: 'dialogue',
        content: '【介入时机点】你可以选择如何行动...',
        choices: [
          { id: 'choice-1', text: '直接询问' },
          { id: 'choice-2', text: '先观察周围' },
          { id: 'choice-3', text: '保持沉默' }
        ]
      }
    ];
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      narrativeUnits: mockNarrative,
      metadata: {
        llmModel: 'mock',
        tokenCount: 0,
        generatedAt: Date.now()
      }
    };
  }
}

// ============================================
// Mock NPC对话服务
// ============================================

export class MockNPCDialogueService implements INPCDialogueService {
  async generateNPCResponse(request: any): Promise<any> {
    // Demo阶段：简单规则匹配
    const mockResponses: Record<string, {
      response: string;
      mood: string;
      delta: number;
    }> = {
      '快递员': {
        response: '（警惕地看着你）你为什么要找他？',
        mood: 'suspicious',
        delta: -5
      },
      '酒吧': {
        response: '这里不是你该问的地方。',
        mood: 'hostile',
        delta: -10
      },
      '帮派': {
        response: '（眼神闪躲）我什么都不知道...',
        mood: 'fearful',
        delta: 0
      },
      'default': {
        response: '我不太明白你的意思...',
        mood: 'neutral',
        delta: 0
      }
    };
    
    // 简单匹配
    const matchedKey = Object.keys(mockResponses).find(key =>
      request.playerInput.includes(key)
    );
    
    const result = mockResponses[matchedKey || 'default'];
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      npcResponse: result.response,
      emotionalState: {
        mood: result.mood,
        intensity: 0.7
      },
      relationshipDelta: result.delta,
      triggeredEvents: [],
      metadata: {
        llmModel: 'mock',
        tokenCount: 0,
        generatedAt: Date.now()
      }
    };
  }
}

// ============================================
// Mock玩家选择生成服务
// ============================================

export class MockPlayerChoiceGenerationService implements IPlayerChoiceGenerationService {
  async generatePlayerChoices(request: any): Promise<any> {
    // Demo阶段：返回通用选项
    const mockChoices = [
      {
        id: 'choice-1',
        text: '直接询问',
        type: 'dialogue' as const,
        expectedEffect: {
          difficulty: 'medium' as const,
          risk: 'medium' as const
        }
      },
      {
        id: 'choice-2',
        text: '旁敲侧击',
        type: 'dialogue' as const,
        expectedEffect: {
          difficulty: 'easy' as const,
          risk: 'low' as const
        }
      },
      {
        id: 'choice-3',
        text: '观察环境',
        type: 'observation' as const,
        expectedEffect: {
          difficulty: 'easy' as const,
          risk: 'low' as const
        }
      }
    ];
    
    if (request.constraints.includePassOption) {
      mockChoices.push({
        id: 'choice-pass',
        text: '保持沉默',
        type: 'observation' as const,
        expectedEffect: {
          difficulty: 'trivial' as const,
          risk: 'low' as const
        }
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      choices: mockChoices,
      metadata: {
        llmModel: 'mock',
        tokenCount: 0,
        generatedAt: Date.now()
      }
    };
  }
}

// ============================================
// Mock自由输入处理服务
// ============================================

export class MockFreeformInputProcessingService implements IFreeformInputProcessingService {
  async processFreeformInput(request: any): Promise<any> {
    // Demo阶段：简单意图识别
    const input = request.playerInput.toLowerCase();
    
    let actionType: any = 'observation';
    let target: string | undefined;
    let goal = '观察周围';
    let isAllowed = true;
    let difficulty: any = 'easy';
    
    if (input.includes('跟踪') || input.includes('跟随')) {
      actionType = 'stealth';
      goal = '跟踪目标';
      difficulty = 'hard';
    } else if (input.includes('攻击') || input.includes('打')) {
      actionType = 'combat';
      goal = '发起攻击';
      isAllowed = false; // 不允许暴力
    } else if (input.includes('说') || input.includes('问') || input.includes('询问')) {
      actionType = 'dialogue';
      goal = '与NPC对话';
      difficulty = 'medium';
    } else if (input.includes('走') || input.includes('去') || input.includes('离开')) {
      actionType = 'movement';
      goal = '移动到其他地点';
      difficulty = 'easy';
    }
    
    const outcomeNarrative: NarrativeUnit[] = isAllowed ? [
      {
        id: 'freeform-1',
        type: 'Narrative',
        actor: 'System',
        content: `你尝试${goal}...`
      },
      {
        id: 'freeform-2',
        type: 'Narrative',
        actor: 'System',
        content: difficulty === 'hard' 
          ? '这并不容易，需要小心行事。' 
          : '看起来可以尝试一下。'
      }
    ] : [
      {
        id: 'freeform-error',
        type: 'Narrative',
        actor: 'System',
        content: '你不能这么做。暴力不是解决问题的方法。'
      }
    ];
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      interpretedIntent: {
        actionType,
        target,
        goal
      },
      feasibility: {
        isAllowed,
        difficulty,
        requiredCheck: difficulty === 'hard' ? {
          skillType: '潜行',
          threshold: 15
        } : undefined
      },
      outcomeNarrative,
      stateChanges: {},
      metadata: {
        llmModel: 'mock',
        tokenCount: 0,
        generatedAt: Date.now()
      }
    };
  }
}
