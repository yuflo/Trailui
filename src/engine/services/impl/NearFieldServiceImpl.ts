/**
 * Near-Field Interaction Service Implementation
 * 近场交互服务实现
 * 
 * 职责：
 * - 实现统一的advance()接口
 * - 三层Key查找Mock数据（通过DataAccess）
 * - 填充玩家意图文本
 * - 无状态操作（Demo阶段）
 * 
 * 设计理念：
 * - Service层无状态（前端维护scene_history_context）
 * - 使用DataAccess接口访问场景数据
 * - Demo阶段返回Mock数据，上线后改为LLM API调用
 */

import type { 
  INearFieldService, 
  AdvanceRequest, 
  AdvanceResponse,
  NearFieldEvent,
  InteractionTurnEvent,
  ISceneDataAccess,
  IStoryDataAccess,
  SceneData
} from '../../../types';

/**
 * 近场交互服务实现类
 * 
 * ✅ Phase X 重构：
 * - 新增 IStoryDataAccess 依赖（用于读取 narrative_sequence）
 * - 支持 narrative_sequence 循环播放
 */
export class NearFieldServiceImpl implements INearFieldService {
  /**
   * 构造函数 - 依赖注入DataAccess
   * @param sceneDataAccess 场景数据访问接口（旧Mock数据）
   * @param storyDataAccess 故事数据访问接口（新Demo数据）
   */
  constructor(
    private sceneDataAccess: ISceneDataAccess,
    private storyDataAccess: IStoryDataAccess
  ) {
    console.log(`[NearFieldService] Initialized with SceneDataAccess and StoryDataAccess`);
  }

  /**
   * 推进场景状态（统一入口）
   * 
   * 这是近场交互的唯一接口，处理所有场景状态流转：
   * - LOAD_SCENE: 加载场景的叙事序列（gen #3）
   * - INTERACT: 玩家介入或交互（gen #4a/4b）
   * - PASS: 玩家选择路过（剪枝）
   * - REQUEST_NARRATIVE: 请求后续叙事（gen #3b，自动调用）
   * 
   * @param request 场景推进请求
   * @returns 场景推进响应（包含新事件、实体更新、下一步指令）
   */
  async advance(request: AdvanceRequest): Promise<AdvanceResponse> {
    const { story_id, current_scene_id, scene_history_context, player_action } = request;

    console.log(`[NearFieldService] advance() called:`);
    console.log(`  - story_id: ${story_id}`);
    console.log(`  - scene_id: ${current_scene_id}`);
    console.log(`  - action: ${player_action.type}`);
    console.log(`  - narrative_index: ${('narrative_index' in player_action) ? player_action.narrative_index : 'N/A'}`);
    console.log(`  - history length: ${scene_history_context.length}`);

    // Step 2: 根据action_type分支处理
    let response: AdvanceResponse;

    switch (player_action.type) {
      case "LOAD_SCENE":
        // ✅ Phase X: 使用新逻辑（读取 narrative_sequence）
        response = await this.handleLoadScene(
          story_id, 
          current_scene_id, 
          player_action.narrative_index || 0
        );
        break;

      case "INTERACT":
        // ✅ 保留原逻辑（使用旧Mock数据）
        const sceneData = await this.getSceneData(story_id, current_scene_id);
        response = await this.handleInteract(
          story_id,
          current_scene_id,
          sceneData, 
          scene_history_context, 
          player_action.intent_text || '',
          player_action.narrative_index
        );
        break;

      case "PASS":
        // ✅ Phase X: 使用新逻辑（返回叙事循环）
        response = await this.handlePass(
          story_id, 
          current_scene_id, 
          player_action.narrative_index
        );
        break;

      case "REQUEST_NARRATIVE":
        // ✅ Phase X: 使用新逻辑（循环播放）
        response = await this.handleRequestNarrative(
          story_id, 
          current_scene_id, 
          player_action.narrative_index
        );
        break;

      default:
        throw new Error(`Unknown player_action type: ${(player_action as any).type}`);
    }

    // Step 3: 填充Player的交互内容
    response = this.fillPlayerIntentText(response, player_action);

    console.log(`[NearFieldService] Response generated:`);
    console.log(`  - new_events: ${response.new_events.length}`);
    console.log(`  - next_action: ${response.next_action_type.type}`);
    console.log(`  - scene_over: ${response.scene_status.is_scene_over}`);

    return response;
  }

  /**
   * 获取场景Mock数据（通过DataAccess）
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @returns 场景数据
   * @throws Error 如果场景不存在
   */
  private async getSceneData(storyId: string, sceneId: string): Promise<any> {
    // ✅ 使用DataAccess获取场景的所有Mock数据
    const sceneData = await this.sceneDataAccess.getAllSceneMocks(storyId, sceneId);

    if (!sceneData || Object.keys(sceneData).length === 0) {
      throw new Error(`Scene not found: ${storyId}:${sceneId}`);
    }

    return sceneData;
  }

  /**
   * 处理 LOAD_SCENE 行动
   * 
   * ✅ Phase X 重构：读取 narrative_sequence 的前N个片段
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @param narrativeIndex 叙事索引（通常为0）
   * @returns advance响应
   */
  private async handleLoadScene(
    storyId: string,
    sceneId: string,
    narrativeIndex: number
  ): Promise<AdvanceResponse> {
    console.log(`[NearFieldService] Handling LOAD_SCENE (narrative_index: ${narrativeIndex})`);

    // 1. 读取场景数据
    const scene = await this.storyDataAccess.getSceneById(storyId, sceneId);
    
    if (!scene || !scene.narrative_sequence || scene.narrative_sequence.length === 0) {
      throw new Error(`Scene not found or has no narrative_sequence: ${storyId}:${sceneId}`);
    }
    
    const narrativeSequence = scene.narrative_sequence;
    console.log(`[NearFieldService] Narrative sequence loaded: ${narrativeSequence.length} units`);
    
    // 2. 读取前N个片段（暂定2个）
    const loadCount = Math.min(2, narrativeSequence.length);
    const events: NearFieldEvent[] = [];
    
    for (let i = 0; i < loadCount; i++) {
      const unit = narrativeSequence[i];
      events.push({
        unit_id: `N_${i}`,
        type: 'Narrative',  // LOAD_SCENE 只返回叙事，不返回介入点
        actor: unit.actor,
        content: unit.content
      } as NearFieldEvent);
    }
    
    console.log(`[NearFieldService] Generated ${events.length} events for LOAD_SCENE`);
    
    // 3. 构建响应
    return {
      story_id: storyId,
      current_scene_id: sceneId,
      new_events: events,
      entity_updates: [],
      scene_status: {
        is_scene_over: false,
        next_scene_id: null,
        is_story_over: false,
        new_clue: null
      },
      next_action_type: {
        type: 'PLAYING_NARRATIVE',
        narrative_index: loadCount  // ← 下次从第loadCount个开始
      }
    };
  }

  /**
   * 处理 INTERACT 行动
   * 
   * 玩家介入或交互（gen #4a/4b）
   * 通过calculateTurn()计算当前轮次，查找对应的响应数据
   * 
   * ✅ Phase X: 新增 narrative_index 参数（用于交互结束后返回叙事）
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @param sceneData 场景数据（旧Mock）
   * @param history 场景历史上下文
   * @param intentText 玩家意图文本
   * @param narrativeIndex 叙事索引（可选）
   * @returns advance响应
   */
  private async handleInteract(
    storyId: string,
    sceneId: string,
    sceneData: any, 
    history: NearFieldEvent[], 
    intentText: string,
    narrativeIndex?: number
  ): Promise<AdvanceResponse> {
    // 计算当前是第几轮交互
    const turnNumber = this.calculateTurn(history);

    console.log(`[NearFieldService] Handling INTERACT turn_${turnNumber} (narrative_index: ${narrativeIndex || 'N/A'})`);

    if (!sceneData.INTERACT) {
      throw new Error(`INTERACT data not found in scene`);
    }

    // 三层Key查找：sceneData.INTERACT[turn_N]
    const turnKey = `turn_${turnNumber}`;
    let response = sceneData.INTERACT[turnKey];

    // 如果没有找到对应turn，使用default（fallback）
    if (!response && sceneData.INTERACT.default) {
      console.log(`[NearFieldService] Turn ${turnNumber} not found, using default`);
      response = sceneData.INTERACT.default;
    }

    if (!response) {
      throw new Error(
        `INTERACT turn_${turnNumber} not found and no default provided`
      );
    }

    // ✅ Phase X: 确保所有响应都包含 narrative_index
    if (narrativeIndex !== undefined && response.next_action_type) {
      // 对于 PLAYING_NARRATIVE：从介入点之后继续
      // 对于 AWAITING_INTERACTION：保持当前位置（不推进）
      const updatedIndex = response.next_action_type.type === 'PLAYING_NARRATIVE' 
        ? narrativeIndex + 1 
        : narrativeIndex;
      
      response = {
        ...response,
        next_action_type: {
          ...response.next_action_type,
          narrative_index: updatedIndex
        }
      };
    }

    return response;
  }

  /**
   * 处理 PASS 行动
   * 
   * ✅ Phase X 重构：玩家路过后继续播放下一个叙事片段
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @param narrativeIndex 当前介入点的索引
   * @returns advance响应
   */
  private async handlePass(
    storyId: string,
    sceneId: string,
    narrativeIndex: number
  ): Promise<AdvanceResponse> {
    console.log(`[NearFieldService] Handling PASS (narrative_index: ${narrativeIndex})`);
    
    // 1. 生成"路过"叙事
    const passEvent: NearFieldEvent = {
      unit_id: `PASS_${narrativeIndex}`,
      type: 'Narrative',
      actor: 'System',
      content: '你选择了装作没看见，继续前行。'
    } as NearFieldEvent;
    
    // 2. 继续播放下一个片段（narrativeIndex + 1）
    return {
      story_id: storyId,
      current_scene_id: sceneId,
      new_events: [passEvent],
      entity_updates: [],
      scene_status: {
        is_scene_over: false,
        next_scene_id: null,
        is_story_over: false,
        new_clue: null
      },
      next_action_type: {
        type: 'PLAYING_NARRATIVE',
        narrative_index: narrativeIndex + 1  // ← 继续播放下一个
      }
    };
  }

  /**
   * 处理 REQUEST_NARRATIVE 行动
   * 
   * ✅ Phase X 重构：循环播放 narrative_sequence
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @param narrativeIndex 当前叙事索引
   * @returns advance响应
   */
  private async handleRequestNarrative(
    storyId: string,
    sceneId: string,
    narrativeIndex: number
  ): Promise<AdvanceResponse> {
    console.log(`[NearFieldService] Handling REQUEST_NARRATIVE (narrative_index: ${narrativeIndex})`);
    
    // 1. 读取场景数据
    const scene = await this.storyDataAccess.getSceneById(storyId, sceneId);
    
    if (!scene || !scene.narrative_sequence) {
      throw new Error(`Scene not found: ${storyId}:${sceneId}`);
    }
    
    const narrativeSequence = scene.narrative_sequence;
    
    // 2. 检查是否播放完毕
    if (narrativeIndex >= narrativeSequence.length) {
      console.log(`[NearFieldService] All narrative units played, scene ends`);
      return {
        story_id: storyId,
        current_scene_id: sceneId,
        new_events: [],
        entity_updates: [],
        scene_status: {
          is_scene_over: true,
          next_scene_id: null,
          is_story_over: false,
          new_clue: null
        },
        next_action_type: {
          type: 'SCENE_ENDED',
          narrative_index: narrativeIndex
        } as any
      };
    }
    
    // 3. 读取当前片段
    const currentUnit = narrativeSequence[narrativeIndex];
    
    console.log(`[NearFieldService] Playing unit ${narrativeIndex}: ${currentUnit.type} by ${currentUnit.actor}`);
    
    // 4. 生成事件
    const event: NearFieldEvent = {
      unit_id: `N_${narrativeIndex}`,
      type: currentUnit.type === 'InterventionPoint' ? 'InterventionPoint' : 'Narrative',
      actor: currentUnit.actor,
      content: currentUnit.content,
      ...(currentUnit.type === 'InterventionPoint' && currentUnit.hint ? {
        hint: currentUnit.hint,
        // ✅ 从narrative_sequence的policy读取max_turns
        policy: currentUnit.policy || { type: 'manual', max_turns: 3 }
      } : {})
    } as NearFieldEvent;
    
    // 5. 判断下一步
    let nextActionType: any;
    
    if (currentUnit.type === 'InterventionPoint') {
      // 介入点：暂停，等待玩家选择
      nextActionType = {
        type: 'AWAITING_INTERVENTION',
        narrative_index: narrativeIndex  // ← 保持当前索引（暂停）
      };
    } else {
      // 普通叙事：继续播放
      nextActionType = {
        type: 'PLAYING_NARRATIVE',
        narrative_index: narrativeIndex + 1  // ← 索引+1
      };
    }
    
    // 6. 返回响应
    return {
      story_id: storyId,
      current_scene_id: sceneId,
      new_events: [event],
      entity_updates: [],
      scene_status: {
        is_scene_over: false,
        next_scene_id: null,
        is_story_over: false,
        new_clue: null
      },
      next_action_type: nextActionType
    };
  }

  /**
   * 计算当前交互轮次
   * 
   * 通过扫描scene_history_context，统计已发生的InteractionTurn事件
   * 轮次 = (Player的InteractionTurn数量) + 1
   * 
   * 逻辑说明：
   * - 场景开始：history为空 → turn_1
   * - turn_1完成后：history有2个InteractionTurn（Player + NPC）→ turn_2
   * - turn_2完成后：history有4个InteractionTurn（2 * 2）→ turn_3
   * 
   * @param history 场景历史上下文
   * @returns 当前轮次（从1开始）
   */
  private calculateTurn(history: NearFieldEvent[]): number {
    // 统计Player的InteractionTurn事件数量
    const playerTurns = history.filter(
      event => event.type === "InteractionTurn" && event.actor === "Player"
    ).length;

    // 当前轮次 = 已完成的Player交互数 + 1
    const turnNumber = playerTurns + 1;

    console.log(`[NearFieldService] calculateTurn(): ${playerTurns} player turns → turn_${turnNumber}`);

    return turnNumber;
  }

  /**
   * 填充Player的交互内容
   * 
   * 在响应的new_events中，找到所有actor="Player"的InteractionTurn
   * 将player_action.intent_text填充到其content字段
   * 
   * 原理：
   * - Mock数据中，Player的turn没有content（或content为空字符串）
   * - Service层根据前端传来的intent_text，填充到Player的turn中
   * - 这样前端在渲染时，就能显示玩家输入的内容
   * 
   * @param response advance响应
   * @param playerAction 玩家行动
   * @returns 填充后的响应
   */
  private fillPlayerIntentText(
    response: AdvanceResponse, 
    playerAction: AdvanceRequest['player_action']
  ): AdvanceResponse {
    // 只有INTERACT行动才需要填充
    if (playerAction.type !== "INTERACT") {
      return response;
    }

    const intentText = playerAction.intent_text;

    if (!intentText) {
      console.warn(`[NearFieldService] INTERACT action has no intent_text`);
      return response;
    }

    // 深拷贝响应，避免修改原始Mock数据
    const filledResponse = JSON.parse(JSON.stringify(response)) as AdvanceResponse;

    // 填充Player的交互内容
    filledResponse.new_events = filledResponse.new_events.map((event) => {
      if (
        event.type === "InteractionTurn" && 
        event.actor === "Player" && 
        (!event.content || event.content === "")
      ) {
        return {
          ...event,
          content: intentText
        } as InteractionTurnEvent;
      }
      return event;
    });

    console.log(`[NearFieldService] Filled Player intent_text: "${intentText}"`);

    return filledResponse;
  }
}
