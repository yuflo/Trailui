/**
 * Near-Field Interaction - End-to-End Test Suite
 * 近场交互 - 端到端测试套件
 * 
 * 测试覆盖：
 * - 完整流程（场景A → 场景B）
 * - 所有分支（LOAD_SCENE, INTERACT, PASS）
 * - 场景切换
 * - 状态管理
 * - 事件系统
 */

import { GameEngine } from '../core/GameEngine';
import type { EngineEvent } from '../../types';

/**
 * 测试工具函数
 */
const runTest = async (testName: string, testFn: () => Promise<void>) => {
  try {
    await testFn();
    console.log(`✅ ${testName}`);
  } catch (error) {
    console.error(`❌ ${testName}`);
    console.error(error);
    throw error;
  }
};

/**
 * 主测试函数
 */
export async function runNearFieldE2ETests() {
  console.log('\n========================================');
  console.log('Near-Field E2E Test Suite');
  console.log('========================================\n');

  // ========================================
  // Test 1: 引擎初始化
  // ========================================
  await runTest('Test 1: Engine initialization', async () => {
    const engine = new GameEngine({ debug: true });
    await engine.initialize();

    const state = engine.getCurrentState();
    
    if (!state) {
      throw new Error('State not initialized');
    }
    
    if (state.nearfield_active !== false) {
      throw new Error('nearfield_active should be false initially');
    }

    console.log('  ✓ Engine initialized');
    console.log('  ✓ nearfield_active = false');
  });

  // ========================================
  // Test 2: 加载故事
  // ========================================
  await runTest('Test 2: Load story', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');

    const state = engine.getCurrentState();
    
    if (!state.currentStoryId) {
      throw new Error('Story not loaded');
    }
    
    if (state.currentStoryId !== 'tense-alley') {
      throw new Error(`Expected tense-alley, got ${state.currentStoryId}`);
    }

    console.log('  ✓ Story loaded: tense-alley');
  });

  // ========================================
  // Test 3: 进入近场交互 - 场景A
  // ========================================
  await runTest('Test 3: Enter nearfield (Scene A)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');

    // 监听事件
    let sceneLoadedEventReceived = false;
    engine.on('nearfield_scene_loaded', (event) => {
      sceneLoadedEventReceived = true;
    });

    // 进入场景A
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');

    const state = engine.getCurrentState();
    
    if (!state.nearfield_active) {
      throw new Error('nearfield_active should be true');
    }
    
    if (state.current_scene_id !== 'SCENE_A_BAR_ENTRANCE') {
      throw new Error(`Expected SCENE_A_BAR_ENTRANCE, got ${state.current_scene_id}`);
    }
    
    if (state.scene_history_context.length !== 3) {
      throw new Error(`Expected 3 events, got ${state.scene_history_context.length}`);
    }
    
    if (!state.awaiting_action_type) {
      throw new Error('awaiting_action_type should be set');
    }
    
    if (state.awaiting_action_type.type !== 'AWAITING_INTERVENTION') {
      throw new Error(`Expected AWAITING_INTERVENTION, got ${state.awaiting_action_type.type}`);
    }
    
    if (!sceneLoadedEventReceived) {
      throw new Error('nearfield_scene_loaded event not received');
    }

    console.log('  ✓ Entered nearfield mode');
    console.log('  ✓ Scene loaded: SCENE_A_BAR_ENTRANCE');
    console.log('  ✓ History: 3 events');
    console.log('  ✓ awaiting_action_type: AWAITING_INTERVENTION');
    console.log('  ✓ Event received: nearfield_scene_loaded');
  });

  // ========================================
  // Test 4: INTERACT turn_1 - 场景A
  // ========================================
  await runTest('Test 4: INTERACT turn_1 (Scene A)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');

    // 监听事件
    let eventsReceivedEventCount = 0;
    engine.on('nearfield_events_received', (event) => {
      eventsReceivedEventCount++;
    });

    // 玩家交互
    await engine.nearFieldInteract('让我来处理');

    const state = engine.getCurrentState();
    
    // 应该有5个事件（3个LOAD_SCENE + 2个turn_1）
    if (state.scene_history_context.length !== 5) {
      throw new Error(`Expected 5 events, got ${state.scene_history_context.length}`);
    }
    
    // 检查Player的content被填充
    const playerTurn = state.scene_history_context.find(
      e => e.type === 'InteractionTurn' && e.actor === 'Player'
    );
    
    if (!playerTurn || playerTurn.content !== '让我来处理') {
      throw new Error('Player turn content not filled correctly');
    }
    
    // 检查awaiting_action_type
    if (!state.awaiting_action_type || state.awaiting_action_type.type !== 'AWAITING_INTERACTION') {
      throw new Error('awaiting_action_type should be AWAITING_INTERACTION');
    }
    
    if (eventsReceivedEventCount !== 1) {
      throw new Error('nearfield_events_received event not received');
    }

    console.log('  ✓ INTERACT turn_1 completed');
    console.log('  ✓ History: 5 events (3 + 2)');
    console.log('  ✓ Player content filled: "让我来处理"');
    console.log('  ✓ awaiting_action_type: AWAITING_INTERACTION');
    console.log('  ✓ Event received: nearfield_events_received');
  });

  // ========================================
  // Test 5: INTERACT turn_2 - 场景A
  // ========================================
  await runTest('Test 5: INTERACT turn_2 (Scene A)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');
    await engine.nearFieldInteract('让我来处理');

    // turn_2
    await engine.nearFieldInteract('别对女孩动粗');

    const state = engine.getCurrentState();
    
    // 应该有7个事件（3 + 2 + 2）
    if (state.scene_history_context.length !== 7) {
      throw new Error(`Expected 7 events, got ${state.scene_history_context.length}`);
    }
    
    // 检查Player的turn_2 content
    const playerTurns = state.scene_history_context.filter(
      e => e.type === 'InteractionTurn' && e.actor === 'Player'
    );
    
    if (playerTurns.length !== 2) {
      throw new Error('Expected 2 Player turns');
    }
    
    if (playerTurns[1].content !== '别对女孩动粗') {
      throw new Error('Player turn_2 content not filled correctly');
    }

    console.log('  ✓ INTERACT turn_2 completed');
    console.log('  ✓ History: 7 events (3 + 2 + 2)');
    console.log('  ✓ Player turn_2 content: "别对女孩动粗"');
  });

  // ========================================
  // Test 6: INTERACT turn_3 (强制收敛) - 场景A
  // ========================================
  await runTest('Test 6: INTERACT turn_3 - Scene ends (Scene A)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');
    await engine.nearFieldInteract('让我来处理');
    await engine.nearFieldInteract('别对女孩动粗');

    // 监听场景结束事件
    let sceneEndedEventReceived = false;
    engine.on('nearfield_scene_ended', (event) => {
      sceneEndedEventReceived = true;
    });

    // turn_3（强制收敛）
    await engine.nearFieldInteract('冷静一下');

    const state = engine.getCurrentState();
    
    // 应该有11个事件（3 + 2 + 2 + 4）
    if (state.scene_history_context.length !== 11) {
      throw new Error(`Expected 11 events, got ${state.scene_history_context.length}`);
    }
    
    // 检查awaiting_action_type
    if (!state.awaiting_action_type || state.awaiting_action_type.type !== 'SCENE_ENDED') {
      throw new Error('awaiting_action_type should be SCENE_ENDED');
    }
    
    // 检查场景结束事件
    if (!sceneEndedEventReceived) {
      throw new Error('nearfield_scene_ended event not received');
    }

    console.log('  ✓ INTERACT turn_3 completed');
    console.log('  ✓ History: 11 events (强制收敛叙事)');
    console.log('  ✓ awaiting_action_type: SCENE_ENDED');
    console.log('  ✓ Event received: nearfield_scene_ended');
  });

  // ========================================
  // Test 7: 场景切换（A → B）
  // ========================================
  await runTest('Test 7: Scene transition (A → B)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');
    await engine.nearFieldInteract('让我来处理');
    await engine.nearFieldInteract('别对女孩动粗');
    await engine.nearFieldInteract('冷静一下');

    const state1 = engine.getCurrentState();
    
    // 场景A结束后，current_scene_id应该自动更新为场景B
    if (state1.current_scene_id !== 'SCENE_B_BAR_INTERIOR') {
      throw new Error(`Expected SCENE_B_BAR_INTERIOR, got ${state1.current_scene_id}`);
    }
    
    // history应该被清空（准备加载场景B）
    if (state1.scene_history_context.length !== 0) {
      throw new Error(`Expected empty history, got ${state1.scene_history_context.length}`);
    }

    // 加载场景B
    await engine.enterNearField('SCENE_B_BAR_INTERIOR');

    const state2 = engine.getCurrentState();
    
    // 应该有3个新事件
    if (state2.scene_history_context.length !== 3) {
      throw new Error(`Expected 3 events, got ${state2.scene_history_context.length}`);
    }
    
    // 检查awaiting_action_type
    if (!state2.awaiting_action_type || state2.awaiting_action_type.type !== 'AWAITING_INTERVENTION') {
      throw new Error('awaiting_action_type should be AWAITING_INTERVENTION');
    }

    console.log('  ✓ Scene A ended');
    console.log('  ✓ current_scene_id auto-updated: SCENE_B_BAR_INTERIOR');
    console.log('  ✓ History cleared');
    console.log('  ✓ Scene B loaded: 3 events');
  });

  // ========================================
  // Test 8: PASS - 场景A
  // ========================================
  await runTest('Test 8: PASS action (Scene A)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');

    // 监听场景结束事件
    let sceneEndedEventReceived = false;
    engine.on('nearfield_scene_ended', (event) => {
      sceneEndedEventReceived = true;
    });

    // 玩家选择PASS
    await engine.nearFieldPass();

    const state = engine.getCurrentState();
    
    // 应该有5个事件（3 + 2）
    if (state.scene_history_context.length !== 5) {
      throw new Error(`Expected 5 events, got ${state.scene_history_context.length}`);
    }
    
    // 检查awaiting_action_type
    if (!state.awaiting_action_type || state.awaiting_action_type.type !== 'SCENE_ENDED') {
      throw new Error('awaiting_action_type should be SCENE_ENDED');
    }
    
    // 检查场景结束事件
    if (!sceneEndedEventReceived) {
      throw new Error('nearfield_scene_ended event not received');
    }

    console.log('  ✓ PASS action completed');
    console.log('  ✓ History: 5 events (剪枝叙事)');
    console.log('  ✓ awaiting_action_type: SCENE_ENDED');
    console.log('  ✓ Event received: nearfield_scene_ended');
  });

  // ========================================
  // Test 9: 场景B - gen #3b演示（turn_2插入叙事）
  // ========================================
  await runTest('Test 9: Scene B - gen #3b (narrative insertion)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');
    await engine.enterNearField('SCENE_B_BAR_INTERIOR');

    // turn_1
    await engine.nearFieldInteract('别怕');

    const state1 = engine.getCurrentState();
    // 应该有5个事件（3 + 2）
    if (state1.scene_history_context.length !== 5) {
      throw new Error(`Expected 5 events, got ${state1.scene_history_context.length}`);
    }

    // turn_2（演示gen #3b）
    await engine.nearFieldInteract('告诉我真相');

    const state2 = engine.getCurrentState();
    
    // 应该有8个事件（3 + 2 + 3）
    // turn_2有3个事件：Player + Narrative + NPC
    if (state2.scene_history_context.length !== 8) {
      throw new Error(`Expected 8 events, got ${state2.scene_history_context.length}`);
    }
    
    // 检查中间插入的Narrative
    const turn2Events = state2.scene_history_context.slice(5, 8);
    if (turn2Events[1].type !== 'Narrative') {
      throw new Error('Expected Narrative event in turn_2');
    }

    console.log('  ✓ Scene B loaded');
    console.log('  ✓ turn_1: 2 events');
    console.log('  ✓ turn_2: 3 events (Player + Narrative + NPC)');
    console.log('  ✓ gen #3b演示成功');
  });

  // ========================================
  // Test 10: 退出近场交互
  // ========================================
  await runTest('Test 10: Exit nearfield', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');

    // 退出
    engine.exitNearField();

    const state = engine.getCurrentState();
    
    if (state.nearfield_active !== false) {
      throw new Error('nearfield_active should be false');
    }
    
    if (state.current_scene_id !== null) {
      throw new Error('current_scene_id should be null');
    }
    
    if (state.scene_history_context.length !== 0) {
      throw new Error('scene_history_context should be empty');
    }
    
    if (state.awaiting_action_type !== null) {
      throw new Error('awaiting_action_type should be null');
    }

    console.log('  ✓ Exited nearfield mode');
    console.log('  ✓ State cleared');
  });

  // ========================================
  // Test 11: NearFieldManager辅助方法
  // ========================================
  await runTest('Test 11: NearFieldManager helper methods', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');

    const manager = engine.getNearFieldManager();
    
    // 初始状态
    if (manager.isActive()) {
      throw new Error('isActive() should be false');
    }
    
    if (manager.getCurrentSceneId() !== null) {
      throw new Error('getCurrentSceneId() should be null');
    }

    // 进入近场交互
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');
    
    if (!manager.isActive()) {
      throw new Error('isActive() should be true');
    }
    
    if (manager.getCurrentSceneId() !== 'SCENE_A_BAR_ENTRANCE') {
      throw new Error('getCurrentSceneId() should be SCENE_A_BAR_ENTRANCE');
    }
    
    const history = manager.getSceneHistory();
    if (history.length !== 3) {
      throw new Error('getSceneHistory() should return 3 events');
    }
    
    const actionType = manager.getAwaitingActionType();
    if (!actionType || actionType.type !== 'AWAITING_INTERVENTION') {
      throw new Error('getAwaitingActionType() should be AWAITING_INTERVENTION');
    }

    console.log('  ✓ isActive() works');
    console.log('  ✓ getCurrentSceneId() works');
    console.log('  ✓ getSceneHistory() works');
    console.log('  ✓ getAwaitingActionType() works');
  });

  // ========================================
  // Test 12: PLAYING_NARRATIVE自动播放（场景A）
  // ========================================
  await runTest('Test 12: PLAYING_NARRATIVE auto-play (Scene A)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');

    // 进入场景A
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');

    const state1 = engine.getCurrentState();
    
    // LOAD_SCENE返回2个事件，next_action_type = PLAYING_NARRATIVE
    if (state1.scene_history_context.length !== 2) {
      throw new Error(`Expected 2 events, got ${state1.scene_history_context.length}`);
    }
    
    if (!state1.awaiting_action_type || state1.awaiting_action_type.type !== 'PLAYING_NARRATIVE') {
      throw new Error('awaiting_action_type should be PLAYING_NARRATIVE');
    }

    console.log('  ✓ LOAD_SCENE returned 2 events');
    console.log('  ✓ next_action_type = PLAYING_NARRATIVE');

    // 等待自动播放完成（1.5秒）
    await new Promise(resolve => setTimeout(resolve, 1500));

    const state2 = engine.getCurrentState();
    
    // 自动播放后应该有4个事件（2 + 2）
    if (state2.scene_history_context.length !== 4) {
      throw new Error(`Expected 4 events after auto-play, got ${state2.scene_history_context.length}`);
    }
    
    // 自动播放后应该变为AWAITING_INTERVENTION
    if (!state2.awaiting_action_type || state2.awaiting_action_type.type !== 'AWAITING_INTERVENTION') {
      throw new Error('awaiting_action_type should be AWAITING_INTERVENTION after auto-play');
    }

    console.log('  ✓ Auto-play completed');
    console.log('  ✓ Total events: 4 (2 + 2)');
    console.log('  ✓ next_action_type = AWAITING_INTERVENTION');
  });

  // ========================================
  // Test 13: PLAYING_NARRATIVE交互后触发（场景B）
  // ========================================
  await runTest('Test 13: PLAYING_NARRATIVE after interaction (Scene B)', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');

    // 进入场景B
    await engine.enterNearField('SCENE_B_BAR_INTERIOR');

    // turn_1和turn_2
    await engine.nearFieldInteract('别害怕');
    await engine.nearFieldInteract('告诉我真相');

    // turn_3（触发PLAYING_NARRATIVE）
    await engine.nearFieldInteract('我可以帮你');

    const state1 = engine.getCurrentState();
    
    // turn_3返回2个事件，next_action_type = PLAYING_NARRATIVE
    if (!state1.awaiting_action_type || state1.awaiting_action_type.type !== 'PLAYING_NARRATIVE') {
      throw new Error('awaiting_action_type should be PLAYING_NARRATIVE');
    }

    console.log('  ✓ turn_3 triggered PLAYING_NARRATIVE');

    // 等待自动播放完成
    await new Promise(resolve => setTimeout(resolve, 1500));

    const state2 = engine.getCurrentState();
    
    // 应该追加了环境叙事（2个事件）
    const totalEvents = state2.scene_history_context.length;
    if (totalEvents < 11) {  // 3(LOAD) + 2(t1) + 3(t2) + 2(t3) + 2(REQUEST) = 12
      throw new Error(`Expected at least 11 events, got ${totalEvents}`);
    }
    
    // 自动播放后应该变回AWAITING_INTERACTION
    if (!state2.awaiting_action_type || state2.awaiting_action_type.type !== 'AWAITING_INTERACTION') {
      throw new Error('awaiting_action_type should be AWAITING_INTERACTION after auto-play');
    }

    console.log('  ✓ Environment narrative auto-played');
    console.log('  ✓ next_action_type = AWAITING_INTERACTION');
  });

  // ========================================
  // Test 14: 错误处理
  // ========================================
  await runTest('Test 14: Error handling', async () => {
    const engine = new GameEngine({ debug: false });
    await engine.initialize();
    await engine.startGame('tense-alley');

    // 测试1: 未进入nearfield时调用interact
    let errorCaught = false;
    try {
      await engine.nearFieldInteract('test');
    } catch (error) {
      errorCaught = true;
    }
    
    if (!errorCaught) {
      throw new Error('Should throw error when not in nearfield mode');
    }

    // 测试2: 空intent_text
    await engine.enterNearField('SCENE_A_BAR_ENTRANCE');
    
    errorCaught = false;
    try {
      await engine.nearFieldInteract('');
    } catch (error) {
      errorCaught = true;
    }
    
    if (!errorCaught) {
      throw new Error('Should throw error for empty intent_text');
    }

    // 测试3: 无效场景ID
    engine.exitNearField();
    
    errorCaught = false;
    try {
      await engine.enterNearField('INVALID_SCENE');
    } catch (error) {
      errorCaught = true;
    }
    
    if (!errorCaught) {
      throw new Error('Should throw error for invalid scene ID');
    }

    console.log('  ✓ Error handling works correctly');
  });

  console.log('\n========================================');
  console.log('All E2E Tests Completed! 🎉');
  console.log('========================================\n');
}

// 导出测试运行器
export default runNearFieldE2ETests;
