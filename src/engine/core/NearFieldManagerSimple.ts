/**
 * Near-Field Interaction Manager (Simplified Version)
 * 近场交互管理器（简化版）
 * 
 * 设计理念：
 * - 单一数据源：narrativeSequence 就是唯一的真实数据
 * - 索引控制：通过 displayIndex 控制显示
 * - 极简状态机：只有 3 个模式
 * - 无事件历史：不维护 scene_history_context
 * - 同步操作：减少异步和事件传递
 */

import type { PlotUnit, NearFieldMode, NearFieldState } from '../../types/game.types';
import type { StateManager } from './StateManager';
import type { GameEngine } from './GameEngine';

export class NearFieldManagerSimple {
  private stateManager: StateManager;
  private gameEngine: GameEngine;

  constructor(stateManager: StateManager, gameEngine: GameEngine) {
    this.stateManager = stateManager;
    this.gameEngine = gameEngine;
    
    console.log('[NearFieldManagerSimple] Initialized');
  }

  /**
   * 进入近场交互模式并加载场景
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   */
  async enterScene(storyId: string, sceneId: string): Promise<void> {
    console.log(`[NearFieldManagerSimple] 🎬 Entering scene: ${sceneId} in story: ${storyId}`);
    
    try {
      // 1. 从数据层加载场景的完整数据
      const { DataAccessFactory } = await import('../data-access/DataAccessFactory');
      const storyDataAccess = DataAccessFactory.createStoryDataAccess();
      const sceneData = await storyDataAccess.getSceneById(storyId, sceneId);
      
      if (!sceneData || !sceneData.narrative_sequence || sceneData.narrative_sequence.length === 0) {
        throw new Error(`Scene ${sceneId} has no narrative sequence`);
      }
      
      console.log(`[NearFieldManagerSimple] ✅ Loaded scene: "${sceneData.title}" with ${sceneData.narrative_sequence.length} narrative units`);
      
      // 2. 初始化近场状态
      const state = this.stateManager.getInternalState();
      
      // ✨ 保存当前故事ID（用于场景流转）
      state.currentStoryId = storyId;
      
      state.nearfield = {
        active: true,
        sceneId: sceneId,
        narrativeSequence: sceneData.narrative_sequence,
        displayIndex: -1,  // 从-1开始，表示还没开始播放
        mode: 'PLAYING',
        interventionHint: null,
        interactionEvents: [],  // ✅ 初始化为空数组
        currentSceneData: sceneData  // ✨ 保存完整场景数据
      };
      
      // 同步到旧字段（向后兼容）
      state.nearfield_active = true;
      state.current_scene_id = sceneId;
      state.scene_history_context = [];
      state.current_narrative_sequence = sceneData.narrative_sequence;
      state.current_narrative_index = -1;
      state.awaiting_action_type = { type: 'PLAYING_NARRATIVE' };
      
      // 3. 开始自动播放
      this.playNext();
      
      // 4. 触发UI更新
      this.gameEngine.emit('nearfieldUpdated', {
        nearfield: state.nearfield
      });
      
    } catch (error) {
      console.error('[NearFieldManagerSimple] Failed to enter scene:', error);
      throw error;
    }
  }

  /**
   * 自动播放下一条叙事
   * 
   * 核心播放逻辑：
   * 1. displayIndex++
   * 2. 检查当前单元类型
   * 3. 根据类型决定是否继续播放或暂停
   */
  playNext(): void {
    const state = this.stateManager.getInternalState();
    const { nearfield } = state;
    
    if (!nearfield.active) {
      console.warn('[NearFieldManagerSimple] Nearfield not active');
      return;
    }
    
    // 1. 推进索引
    nearfield.displayIndex++;
    
    // 同步到旧字段
    state.current_narrative_index = nearfield.displayIndex;
    
    console.log(`[NearFieldManagerSimple] playNext: displayIndex=${nearfield.displayIndex}`);
    
    // 2. 检查是否超出序列范围（保护性检查）
    if (nearfield.displayIndex >= nearfield.narrativeSequence.length) {
      console.warn('[NearFieldManagerSimple] Reached end of narrative_sequence without terminal marker');
      this.endScene();
      return;
    }
    
    // 3. 获取当前单元
    const currentUnit = nearfield.narrativeSequence[nearfield.displayIndex];
    
    console.log(`[NearFieldManagerSimple] Current unit:`, currentUnit);
    
    // 4. 根据类型决定下一步
    if (currentUnit.type === 'Narrative') {
      // 4.1 检查是否为场景末节点
      if ('is_terminal' in currentUnit && currentUnit.is_terminal) {
        console.log('[NearFieldManagerSimple] Terminal narrative reached');
        this.handleSceneTerminal();
        return;
      }
      
      // 4.2 普通叙事：设置模式为 PLAYING，延迟后继续
      state.nearfield = {
        ...nearfield,
        mode: 'PLAYING'
      };
      state.awaiting_action_type = { type: 'PLAYING_NARRATIVE' };
      
      // 触发UI更新
      this.gameEngine.emit('nearfieldUpdated', {
        nearfield: state.nearfield
      });
      
      // 延迟1秒后继续播放
      setTimeout(() => this.playNext(), 1000);
      
    } else if (currentUnit.type === 'InterventionPoint') {
      // 介入点：暂停，等待玩家选择
      state.nearfield = {
        ...nearfield,
        mode: 'INTERVENTION',
        interventionHint: currentUnit.hint || null
      };
      state.awaiting_action_type = { type: 'AWAITING_INTERVENTION' };
      
      console.log('[NearFieldManagerSimple] Intervention point reached');
      
      // 触发UI更新
      this.gameEngine.emit('nearfieldUpdated', {
        nearfield: state.nearfield
      });
      
      // 不再自动播放，等待用户操作
      
    } else if (currentUnit.type === 'InteractionTurn') {
      // 交互回合：等待用户输入
      state.nearfield = {
        ...nearfield,
        mode: 'INTERACTION'
      };
      state.awaiting_action_type = { type: 'AWAITING_INTERACTION' };
      
      console.log('[NearFieldManagerSimple] Interaction turn');
      
      // 触发UI更新
      this.gameEngine.emit('nearfieldUpdated', {
        nearfield: state.nearfield
      });
      
      // 不自动播放，等待用户输入
    }
  }

  /**
   * 玩家选择"路过"
   * 直接跳过介入点，继续播放
   */
  handlePass(): void {
    console.log('[NearFieldManagerSimple] Player passed');
    
    const state = this.stateManager.getInternalState();
    const { nearfield } = state;
    
    if (nearfield.mode !== 'INTERVENTION') {
      console.warn('[NearFieldManagerSimple] Not at intervention point');
      return;
    }
    
    // 创建新的 nearfield 对象，清除介入提示
    state.nearfield = {
      ...nearfield,
      interventionHint: null
    };
    
    // 继续播放
    this.playNext();
  }

  /**
   * 玩家选择"介入"（输入意图）
   * 
   * ✅ 正确设计：调用 Service 获取 INTERACT 响应，将 new_events 存入 interactionEvents
   * 
   * @param intentText 玩家输入的意图文本
   */
  async handleIntervention(intentText: string): Promise<void> {
    console.log('========================================');
    console.log('[NearFieldManagerSimple] handleIntervention() called');
    console.log('  - Player input:', intentText);
    
    const state = this.stateManager.getInternalState();
    const { nearfield } = state;
    
    console.log('  - Current mode:', nearfield.mode);
    console.log('  - Current interactionEvents length:', nearfield.interactionEvents.length);
    
    if (nearfield.mode !== 'INTERVENTION' && nearfield.mode !== 'INTERACTION') {
      console.warn('[NearFieldManagerSimple] ❌ Not at intervention/interaction point! mode =', nearfield.mode);
      return;
    }
    
    // 1. TODO: 调用 NearFieldService.advance() 获取 INTERACT 响应
    // Demo 阶段：使用 mock 数据
    const mockInteractResponse = this.getMockInteractResponse(intentText);
    console.log('  - Mock response generated:', mockInteractResponse.new_events.length, 'events');
    
    // 2. 创建新的 nearfield 对象（确保 React 能检测到变化���
    state.nearfield = {
      ...nearfield,
      interactionEvents: [
        ...nearfield.interactionEvents,
        ...mockInteractResponse.new_events
      ],
      interventionHint: null,
      mode: 'INTERACTION'
    };
    
    console.log('  - ✅ Events added! Total interactionEvents:', state.nearfield.interactionEvents.length);
    console.log('  - Events:', state.nearfield.interactionEvents.map(e => `${e.actor}: ${e.content.substring(0, 20)}...`));
    console.log('  - ✅ Mode switched to: INTERACTION');
    
    // 3. 更新状态
    state.awaiting_action_type = { type: 'AWAITING_INTERACTION' };
    
    // 5. 触发UI更新（显示交互界面）
    console.log('  - 🔥 Emitting nearfieldUpdated event...');
    this.gameEngine.emit('nearfieldUpdated', {
      nearfield: state.nearfield
    });
    
    // 6. 检查是否结束交互（基于响应的 scene_status）
    if (mockInteractResponse.scene_status?.interaction_policy?.current_turn === 3) {
      console.log('[NearFieldManagerSimple] Interaction ended (max turns reached)');
      // 延迟后继续叙事
      setTimeout(() => {
        nearfield.mode = 'PLAYING';
        this.playNext();
      }, 1500);
    } else {
      console.log('[NearFieldManagerSimple] ✅ Waiting for next player input (turn', mockInteractResponse.scene_status?.interaction_policy?.current_turn, '/ 3)');
      // 保持交互模式，等待用户继续输入
    }
    console.log('========================================');
  }

  /**
   * 处理场景终点
   * 
   * 当检测到 is_terminal = true 时调用
   * 根据 SceneData.transition 决定下一步流转
   */
  private async handleSceneTerminal(): Promise<void> {
    console.log('[NearFieldManagerSimple] ✨ Handling scene terminal');
    
    const state = this.stateManager.getInternalState();
    const { nearfield } = state;
    
    // 获取当前场景的流转配置
    const currentSceneData = nearfield.currentSceneData;
    
    if (!currentSceneData || !currentSceneData.transition) {
      console.warn('[NearFieldManagerSimple] No transition config found, falling back to endScene()');
      this.endScene();
      return;
    }
    
    const { transition } = currentSceneData;
    
    console.log('[NearFieldManagerSimple] Transition config:', transition);
    
    // 1. 检查是否为故事终点
    if (transition.is_story_terminal) {
      console.log('[NearFieldManagerSimple] 🏁 Story terminal reached');
      
      // ✨ 立即设置为"正在结束"状态，防止用户继续操作
      state.nearfield = {
        ...nearfield,
        mode: 'PLAYING' // 设置为 PLAYING，这样 handlePass 会拒绝操作
      };
      state.awaiting_action_type = { type: 'SCENE_ENDED' };
      
      // 触发 UI 更新
      this.gameEngine.emit('nearfieldUpdated', {
        nearfield: state.nearfield
      });
      
      // 触发故事结束事件
      this.gameEngine.emit('story_ended', {
        storyId: state.currentStoryId,
        completionClueId: transition.completion_clue_id
      });
      
      // ✨ 延迟后自动退出近场交互
      setTimeout(() => {
        console.log('[NearFieldManagerSimple] 🚪 Story complete, exiting nearfield');
        this.exitNearField();
      }, 2000); // 2秒延迟，让用户看到最后的叙事内容
      
      return;
    }
    
    // 2. 检查是否有下一个场景
    if (transition.next_scene_id) {
      console.log(`[NearFieldManagerSimple] ➡️ Transitioning to next scene: ${transition.next_scene_id}`);
      
      // 触发场景流转事件（供UI层监听，显示过场动画等）
      this.gameEngine.emit('scene_transition', {
        fromSceneId: nearfield.sceneId,
        toSceneId: transition.next_scene_id,
        completionClueId: transition.completion_clue_id
      });
      
      // ✨ 自动加载下一个场景
      const storyId = state.currentStoryId;
      if (!storyId) {
        console.error('[NearFieldManagerSimple] ❌ No current story ID, cannot transition');
        this.exitNearField(); // 清理近场状态
        return;
      }
      
      // 延迟加载下一个场景（给UI时间显示过场动画）
      setTimeout(async () => {
        try {
          console.log(`[NearFieldManagerSimple] ⏱️ Delay complete, loading next scene: ${transition.next_scene_id}`);
          await this.enterScene(storyId, transition.next_scene_id!);
        } catch (error) {
          console.error('[NearFieldManagerSimple] ❌ Failed to load next scene:', error);
          this.exitNearField(); // 清理近场状态
        }
      }, 1500); // 1.5秒延迟
      
      return;
    }
    
    // 3. 兜底：无配置时退出近场交互
    console.warn('[NearFieldManagerSimple] No next_scene_id and not terminal, exiting nearfield');
    this.exitNearField();
  }
  
  /**
   * 结束当前场景（兜底方法）
   */
  private endScene(): void {
    console.log('[NearFieldManagerSimple] Scene ended (fallback)');
    
    const state = this.stateManager.getInternalState();
    
    // Demo阶段：简单地设置为场景结束状态
    state.nearfield.mode = 'PLAYING';
    state.awaiting_action_type = { type: 'SCENE_ENDED' };
    
    this.gameEngine.emit('nearfield_scene_ended', {
      sceneId: state.nearfield.sceneId
    });
  }

  /**
   * 退出近场交互模式
   */
  exitNearField(): void {
    console.log('[NearFieldManagerSimple] Exiting nearfield');
    
    const state = this.stateManager.getInternalState();
    
    // 重置近场状态
    state.nearfield = {
      active: false,
      sceneId: null,
      narrativeSequence: [],
      displayIndex: -1,
      mode: 'PLAYING',
      interventionHint: null,
      interactionEvents: []
    };
    
    // 同步到旧字段
    state.nearfield_active = false;
    state.current_scene_id = null;
    state.scene_history_context = [];
    state.current_narrative_sequence = null;
    state.current_narrative_index = -1;
    state.awaiting_action_type = null;
    
    this.gameEngine.emit('nearfieldUpdated', {
      nearfield: state.nearfield
    });
  }

  /**
   * 检查是否在近场交互中
   */
  isActive(): boolean {
    const state = this.stateManager.getInternalState();
    return state.nearfield?.active || false;
  }

  /**
   * 获取当前场景ID
   */
  getCurrentSceneId(): string | null {
    const state = this.stateManager.getInternalState();
    return state.nearfield?.sceneId || null;
  }

  // ========== 私有辅助方法 ==========



  /**
   * 获取 Mock 交互响应（Demo阶段）
   * 
   * 返回 INTERACT turn_N 的响应数据
   */
  private getMockInteractResponse(playerInput: string): any {
    const state = this.stateManager.getInternalState();
    const currentTurn = state.nearfield.interactionEvents.length / 2 + 1; // 每轮有2个事件（Player + NPC）
    
    // 根据轮次返回不同的响应
    if (currentTurn === 1) {
      return {
        new_events: [
          {
            unit_id: "T001_P",
            type: "InteractionTurn",
            actor: "Player",
            content: playerInput
          },
          {
            unit_id: "T001_N",
            type: "InteractionTurn",
            actor: "肥棠",
            content: "（斜眼看你）\"哪来的多管闲事的？这是我们的私事，你最好别掺和。\""
          }
        ],
        scene_status: {
          interaction_policy: {
            max_turns: 3,
            current_turn: 1
          }
        }
      };
    } else if (currentTurn === 2) {
      return {
        new_events: [
          {
            unit_id: "T002_P",
            type: "InteractionTurn",
            actor: "Player",
            content: playerInput
          },
          {
            unit_id: "T002_N",
            type: "InteractionTurn",
            actor: "肥棠",
            content: "（拍桌）\"动粗？我看你是想找死！这娘们偷了我三十万的货，我还没动粗呢！\""
          }
        ],
        scene_status: {
          interaction_policy: {
            max_turns: 3,
            current_turn: 2
          }
        }
      };
    } else {
      return {
        new_events: [
          {
            unit_id: "T003_P",
            type: "InteractionTurn",
            actor: "Player",
            content: playerInput
          },
          {
            unit_id: "T003_N",
            type: "InteractionTurn",
            actor: "肥棠",
            content: "（猛地站起）\"你TM再多说一句试试？！信不信我连你一起揍！\""
          }
        ],
        scene_status: {
          interaction_policy: {
            max_turns: 3,
            current_turn: 3
          }
        }
      };
    }
  }
}
