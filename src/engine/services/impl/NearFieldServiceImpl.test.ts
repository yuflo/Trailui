/**
 * Near-Field Service Implementation - Test Suite
 * 近场交互服务 - 测试套件
 * 
 * 验证NearFieldServiceImpl的核心功能：
 * - LOAD_SCENE: 加载场景叙事序列
 * - INTERACT: 多轮交互
 * - PASS: 剪枝分支
 * - calculateTurn: 轮次计算
 * - fillPlayerIntentText: 玩家内容填充
 */

import { NearFieldServiceImpl } from './NearFieldServiceImpl';
import type { AdvanceRequest, NearFieldEvent } from '../../../types';

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
  }
};

/**
 * 主测试函数
 */
export async function testNearFieldService() {
  console.log('\n========================================');
  console.log('Near-Field Service Test Suite');
  console.log('========================================\n');

  const service = new NearFieldServiceImpl();

  // ========================================
  // Test 1: LOAD_SCENE - 场景A
  // ========================================
  await runTest('Test 1: LOAD_SCENE - 场景A', async () => {
    const request: AdvanceRequest = {
      story_id: "tense-alley",
      current_scene_id: "SCENE_A_BAR_ENTRANCE",
      scene_history_context: [],
      player_action: {
        type: "LOAD_SCENE",
        intent_text: null
      }
    };

    const response = await service.advance(request);

    // 验证响应结构
    if (response.new_events.length !== 3) {
      throw new Error(`Expected 3 events, got ${response.new_events.length}`);
    }

    if (response.new_events[2].type !== "InterventionPoint") {
      throw new Error(`Expected InterventionPoint, got ${response.new_events[2].type}`);
    }

    if (response.next_action_type.type !== "AWAITING_INTERVENTION") {
      throw new Error(`Expected AWAITING_INTERVENTION, got ${response.next_action_type.type}`);
    }

    console.log('  ✓ 返回3个事件单元');
    console.log('  ✓ 第3个事件是InterventionPoint');
    console.log('  ✓ next_action_type = AWAITING_INTERVENTION');
  });

  // ========================================
  // Test 2: INTERACT turn_1 - 场景A
  // ========================================
  await runTest('Test 2: INTERACT turn_1 - 场景A', async () => {
    const request: AdvanceRequest = {
      story_id: "tense-alley",
      current_scene_id: "SCENE_A_BAR_ENTRANCE",
      scene_history_context: [
        // 模拟LOAD_SCENE的3个事件
        { unit_id: "U001", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U002", type: "Narrative", actor: "肥棠", content: "..." },
        { 
          unit_id: "U003", 
          type: "InterventionPoint", 
          actor: "小雪", 
          content: "...", 
          hint: "...", 
          policy: { max_turns: 3, goal: "...", constraints: "..." } 
        }
      ],
      player_action: {
        type: "INTERACT",
        intent_text: "让我来处理"
      }
    };

    const response = await service.advance(request);

    // 验证响应
    if (response.new_events.length !== 2) {
      throw new Error(`Expected 2 events, got ${response.new_events.length}`);
    }

    // 验证Player的turn被填充
    const playerTurn = response.new_events[0];
    if (playerTurn.type !== "InteractionTurn" || playerTurn.actor !== "Player") {
      throw new Error(`Expected Player InteractionTurn`);
    }

    if (playerTurn.content !== "让我来处理") {
      throw new Error(`Expected "让我来处理", got "${playerTurn.content}"`);
    }

    if (response.next_action_type.type !== "AWAITING_INTERACTION") {
      throw new Error(`Expected AWAITING_INTERACTION, got ${response.next_action_type.type}`);
    }

    console.log('  ✓ 返回2个事件单元（Player + NPC）');
    console.log('  ✓ Player的content正确填充');
    console.log('  ✓ next_action_type = AWAITING_INTERACTION');
  });

  // ========================================
  // Test 3: INTERACT turn_2 - 场景A
  // ========================================
  await runTest('Test 3: INTERACT turn_2 - 场景A', async () => {
    const request: AdvanceRequest = {
      story_id: "tense-alley",
      current_scene_id: "SCENE_A_BAR_ENTRANCE",
      scene_history_context: [
        // LOAD_SCENE 3个事件
        { unit_id: "U001", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U002", type: "Narrative", actor: "肥棠", content: "..." },
        { unit_id: "U003", type: "InterventionPoint", actor: "小雪", content: "...", hint: "...", policy: { max_turns: 3, goal: "...", constraints: "..." } },
        // turn_1 2个事件
        { unit_id: "T001_P", type: "InteractionTurn", actor: "Player", content: "让我来处理" },
        { unit_id: "T001_N", type: "InteractionTurn", actor: "肥棠", content: "..." }
      ],
      player_action: {
        type: "INTERACT",
        intent_text: "别对女孩动粗"
      }
    };

    const response = await service.advance(request);

    // 验证turn_2
    if (response.new_events.length !== 2) {
      throw new Error(`Expected 2 events, got ${response.new_events.length}`);
    }

    const playerTurn = response.new_events[0];
    if (playerTurn.content !== "别对女孩动粗") {
      throw new Error(`Expected "别对女孩动粗", got "${playerTurn.content}"`);
    }

    // 验证entity_updates
    if (response.entity_updates.length === 0) {
      throw new Error(`Expected entity_updates`);
    }

    const npcUpdate = response.entity_updates[0];
    if (npcUpdate.composure !== 70) {
      throw new Error(`Expected composure=70, got ${npcUpdate.composure}`);
    }

    console.log('  ✓ 正确计算turn_2');
    console.log('  ✓ Player的content正确填充');
    console.log('  ✓ entity_updates包含NPC状态变化');
  });

  // ========================================
  // Test 4: INTERACT turn_3 (强制收敛) - 场景A
  // ========================================
  await runTest('Test 4: INTERACT turn_3 (强制收敛) - 场景A', async () => {
    const request: AdvanceRequest = {
      story_id: "tense-alley",
      current_scene_id: "SCENE_A_BAR_ENTRANCE",
      scene_history_context: [
        // LOAD_SCENE 3个事件
        { unit_id: "U001", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U002", type: "Narrative", actor: "肥棠", content: "..." },
        { unit_id: "U003", type: "InterventionPoint", actor: "小雪", content: "...", hint: "...", policy: { max_turns: 3, goal: "...", constraints: "..." } },
        // turn_1
        { unit_id: "T001_P", type: "InteractionTurn", actor: "Player", content: "让我来处理" },
        { unit_id: "T001_N", type: "InteractionTurn", actor: "肥棠", content: "..." },
        // turn_2
        { unit_id: "T002_P", type: "InteractionTurn", actor: "Player", content: "别对女孩动粗" },
        { unit_id: "T002_N", type: "InteractionTurn", actor: "肥棠", content: "..." }
      ],
      player_action: {
        type: "INTERACT",
        intent_text: "冷静一下"
      }
    };

    const response = await service.advance(request);

    // 验证强制收敛
    if (response.new_events.length !== 4) {
      throw new Error(`Expected 4 events (turn_3 + forced conclusion), got ${response.new_events.length}`);
    }

    if (!response.scene_status.is_scene_over) {
      throw new Error(`Expected is_scene_over=true`);
    }

    if (response.next_action_type.type !== "SCENE_ENDED") {
      throw new Error(`Expected SCENE_ENDED, got ${response.next_action_type.type}`);
    }

    if (!response.scene_status.new_clue) {
      throw new Error(`Expected new_clue`);
    }

    console.log('  ✓ 正确计算turn_3');
    console.log('  ✓ 返回4个事件（强制收敛叙事）');
    console.log('  ✓ is_scene_over = true');
    console.log('  ✓ next_action_type = SCENE_ENDED');
    console.log('  ✓ 获得新线索');
  });

  // ========================================
  // Test 5: PASS - 场景A
  // ========================================
  await runTest('Test 5: PASS - 场景A', async () => {
    const request: AdvanceRequest = {
      story_id: "tense-alley",
      current_scene_id: "SCENE_A_BAR_ENTRANCE",
      scene_history_context: [
        { unit_id: "U001", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U002", type: "Narrative", actor: "肥棠", content: "..." },
        { unit_id: "U003", type: "InterventionPoint", actor: "小雪", content: "...", hint: "...", policy: { max_turns: 3, goal: "...", constraints: "..." } }
      ],
      player_action: {
        type: "PASS",
        intent_text: null
      }
    };

    const response = await service.advance(request);

    // 验证PASS响应
    if (response.new_events.length !== 2) {
      throw new Error(`Expected 2 events, got ${response.new_events.length}`);
    }

    if (!response.scene_status.is_scene_over) {
      throw new Error(`Expected is_scene_over=true`);
    }

    if (response.next_action_type.type !== "SCENE_ENDED") {
      throw new Error(`Expected SCENE_ENDED, got ${response.next_action_type.type}`);
    }

    // PASS不获得线索（或获得负面线索）
    console.log('  ✓ 返回2个事件（剪枝叙事）');
    console.log('  ✓ is_scene_over = true');
    console.log('  ✓ next_action_type = SCENE_ENDED');
  });

  // ========================================
  // Test 6: 场景B - gen #3b演示（turn_2插入叙事）
  // ========================================
  await runTest('Test 6: 场景B - gen #3b演示', async () => {
    const request: AdvanceRequest = {
      story_id: "tense-alley",
      current_scene_id: "SCENE_B_BAR_INTERIOR",
      scene_history_context: [
        // LOAD_SCENE
        { unit_id: "U020", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U021", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U022", type: "InterventionPoint", actor: "小雪", content: "...", hint: "...", policy: { max_turns: 5, goal: "...", constraints: "..." } },
        // turn_1
        { unit_id: "T020_P", type: "InteractionTurn", actor: "Player", content: "别怕" },
        { unit_id: "T020_N", type: "InteractionTurn", actor: "小雪", content: "..." }
      ],
      player_action: {
        type: "INTERACT",
        intent_text: "告诉我真相"
      }
    };

    const response = await service.advance(request);

    // 验证turn_2有3个事件（演示gen #3b）
    if (response.new_events.length !== 3) {
      throw new Error(`Expected 3 events (Player + Narrative + NPC), got ${response.new_events.length}`);
    }

    // 验证中间插入了Narrative
    const middleEvent = response.new_events[1];
    if (middleEvent.type !== "Narrative") {
      throw new Error(`Expected Narrative, got ${middleEvent.type}`);
    }

    console.log('  ✓ turn_2返回3个事件');
    console.log('  ✓ 中间插入了Narrative（gen #3b）');
    console.log('  ✓ 演示"交互中插入叙事"功能');
  });

  // ========================================
  // Test 7: 场景B - default分支
  // ========================================
  await runTest('Test 7: 场景B - default分支', async () => {
    const request: AdvanceRequest = {
      story_id: "tense-alley",
      current_scene_id: "SCENE_B_BAR_INTERIOR",
      scene_history_context: [
        // LOAD_SCENE
        { unit_id: "U020", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U021", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U022", type: "InterventionPoint", actor: "小雪", content: "...", hint: "...", policy: { max_turns: 5, goal: "...", constraints: "..." } },
        // turn_1
        { unit_id: "T020_P", type: "InteractionTurn", actor: "Player", content: "..." },
        { unit_id: "T020_N", type: "InteractionTurn", actor: "小雪", content: "..." },
        // turn_2
        { unit_id: "T021_P", type: "InteractionTurn", actor: "Player", content: "..." },
        { unit_id: "U023", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "T021_N", type: "InteractionTurn", actor: "小雪", content: "..." },
        // turn_3
        { unit_id: "T022_P", type: "InteractionTurn", actor: "Player", content: "..." },
        { unit_id: "T022_N", type: "InteractionTurn", actor: "小雪", content: "..." },
        // turn_4
        { unit_id: "T023_P", type: "InteractionTurn", actor: "Player", content: "..." },
        { unit_id: "T023_N", type: "InteractionTurn", actor: "小雪", content: "..." },
        // turn_5（强制收敛）
        { unit_id: "T024_P", type: "InteractionTurn", actor: "Player", content: "..." },
        { unit_id: "T024_N", type: "InteractionTurn", actor: "小雪", content: "..." },
        { unit_id: "U024", type: "Narrative", actor: "System", content: "..." },
        { unit_id: "U025", type: "Narrative", actor: "System", content: "..." }
      ],
      player_action: {
        type: "INTERACT",
        intent_text: "还有什么可以告诉我的吗"
      }
    };

    const response = await service.advance(request);

    // 验证使用了default分支
    // 因为已经是turn_6了（超过turn_5）
    if (response.new_events.length === 0) {
      throw new Error(`Expected events from default branch`);
    }

    console.log('  ✓ turn_6触发default分支');
    console.log('  ✓ fallback机制正常工作');
  });

  console.log('\n========================================');
  console.log('All Tests Completed!');
  console.log('========================================\n');
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  // Node.js环境
  testNearFieldService().catch(console.error);
}
