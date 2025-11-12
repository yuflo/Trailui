/**
 * Turn Manager
 * 
 * 回合管理器
 * 负责处理回合推进和场景切换
 * Demo阶段支持max_turns强制结束
 */

import type { 
  TurnResult, 
  ScenarioSnapshot, 
  StatDelta, 
  RapportDelta,
  IStoryDataAccess 
} from '../../types';
import { StateManager } from './StateManager';
import { StatSystem } from '../systems/StatSystem';
import { RapportSystem } from '../systems/RapportSystem';
import { BehaviorSystem } from '../systems/BehaviorSystem';

/**
 * 回合管理器类
 */
export class TurnManager {
  private stateManager: StateManager;
  private statSystem: StatSystem;
  private rapportSystem: RapportSystem;
  private behaviorSystem: BehaviorSystem;
  private storyDataAccess: IStoryDataAccess;
  
  /** Demo阶段：当前场景的回合计数 */
  private sceneTurnCount: number = 0;
  
  /** Demo阶段：当前场景ID */
  private currentSceneId: string | null = null;
  
  constructor(
    stateManager: StateManager,
    statSystem: StatSystem,
    rapportSystem: RapportSystem,
    behaviorSystem: BehaviorSystem,
    storyDataAccess: IStoryDataAccess
  ) {
    this.stateManager = stateManager;
    this.statSystem = statSystem;
    this.rapportSystem = rapportSystem;
    this.behaviorSystem = behaviorSystem;
    this.storyDataAccess = storyDataAccess;
  }
  
  /**
   * 设置当前场景ID（用于追踪max_turns）
   */
  setCurrentScene(sceneId: string): void {
    if (this.currentSceneId !== sceneId) {
      this.currentSceneId = sceneId;
      this.sceneTurnCount = 0;
      console.log(`[TurnManager] Scene changed to: ${sceneId}, turn count reset`);
    }
  }
  
  /**
   * 检查是否达到max_turns限制（异步方法）
   */
  private async checkMaxTurns(): Promise<boolean> {
    if (!this.currentSceneId) {
      return false;
    }
    
    // ✅ 使用DataAccess获取场景数据
    const scene = await this.storyDataAccess.getSceneById('demo-story', this.currentSceneId);
    if (!scene) {
      return false;
    }
    
    return this.sceneTurnCount >= scene.max_turns;
  }
  
  /**
   * 提交玩家意图，推进回合
   */
  async submitAction(intentText: string): Promise<TurnResult> {
    const currentScenario = this.stateManager.getCurrentScenario();
    
    if (!currentScenario) {
      return {
        success: false,
        scenario: null,
        turnIndex: this.stateManager.getCurrentTurnIndex(),
        statDeltas: [],
        rapportDeltas: [],
        isEnding: false,
        error: 'No current scenario',
      };
    }
    
    // Demo阶段：检查max_turns限制
    const isMaxTurnsReached = await this.checkMaxTurns();
    if (isMaxTurnsReached) {
      console.log(`[TurnManager] Max turns reached (${this.sceneTurnCount}), scene ending`);
      return {
        success: false,
        scenario: currentScenario,
        turnIndex: this.stateManager.getCurrentTurnIndex(),
        statDeltas: [],
        rapportDeltas: [],
        isEnding: true,
        error: 'Scene completed (max turns reached)',
      };
    }
    
    // 1. 添加玩家行为到历史
    this.behaviorSystem.addPlayerBehavior(intentText);
    
    // 2. Demo阶段：增加回合计数
    this.sceneTurnCount++;
    console.log(`[TurnManager] Turn ${this.sceneTurnCount} in scene ${this.currentSceneId}`);
    
    // 3. 推进到下一个场景（Demo阶段可能返回相同场景）
    const success = this.stateManager.advanceTurn();
    const newScenario = this.stateManager.getCurrentScenario();
    
    if (!success || !newScenario) {
      return {
        success: false,
        scenario: null,
        turnIndex: this.stateManager.getCurrentTurnIndex(),
        statDeltas: [],
        rapportDeltas: [],
        isEnding: false,
        error: 'Failed to advance turn',
      };
    }
    
    // 4. 计算数值变化
    const statDeltas = this.statSystem.detectChanges(
      {
        vigor: currentScenario.player_status_area.vigor,
        clarity: currentScenario.player_status_area.clarity,
      },
      {
        vigor: newScenario.player_status_area.vigor,
        clarity: newScenario.player_status_area.clarity,
      }
    );
    
    // 5. 计算关系值变化
    const rapportDeltas: RapportDelta[] = [];
    const oldNpcs = currentScenario.dynamic_view.involved_entities;
    const newNpcs = newScenario.dynamic_view.involved_entities;
    
    // 对比相同ID的NPC
    for (const newNpc of newNpcs) {
      const oldNpc = oldNpcs.find(n => n.id === newNpc.id);
      if (oldNpc) {
        const delta = this.rapportSystem.detectChange(oldNpc, newNpc);
        if (delta) {
          rapportDeltas.push(delta);
        }
      }
    }
    
    // 6. 添加NPC行为到历史
    this.behaviorSystem.addNpcBehaviors(newScenario.dynamic_view.behavior_stream);
    
    // 7. 添加系统叙事（如果有）
    if (newScenario.dynamic_view.system_narrative) {
      this.behaviorSystem.addSystemNarrative(newScenario.dynamic_view.system_narrative);
    }
    
    // 8. 判断是否结束（Demo阶段检查max_turns或最后回合）
    const isEnding = this.stateManager.isLastTurn() || this.checkMaxTurns();
    
    return {
      success: true,
      scenario: newScenario,
      turnIndex: this.stateManager.getCurrentTurnIndex(),
      statDeltas,
      rapportDeltas,
      isEnding,
    };
  }
  
  /**
   * 跳转到指定回合
   */
  goToTurn(turnIndex: number): TurnResult {
    const success = this.stateManager.goToTurn(turnIndex);
    
    if (!success) {
      return {
        success: false,
        scenario: null,
        turnIndex: this.stateManager.getCurrentTurnIndex(),
        statDeltas: [],
        rapportDeltas: [],
        isEnding: false,
        error: 'Invalid turn index',
      };
    }
    
    const scenario = this.stateManager.getCurrentScenario();
    
    return {
      success: true,
      scenario,
      turnIndex: this.stateManager.getCurrentTurnIndex(),
      statDeltas: [],
      rapportDeltas: [],
      isEnding: this.stateManager.isLastTurn(),
    };
  }
}
