/**
 * Engine Test Script
 * 
 * 简单的测试脚本，验证引擎功能
 * 可以在浏览器控制台中运行
 */

import { GameEngine } from './core/GameEngine';

/**
 * 测试引擎基本功能
 */
export async function testEngine() {
  console.log('=== Dreamheart Engine Test ===\n');
  
  try {
    // 1. 创建引擎实例
    console.log('1. Creating engine...');
    const engine = new GameEngine({ debug: true });
    
    // 2. 初始化
    console.log('2. Initializing engine...');
    await engine.initialize();
    
    // 3. 获取所有故事
    console.log('3. Getting all stories...');
    const stories = await engine.getAllStories();
    console.log(`   Found ${stories.length} stories:`, stories.map(s => s.id));
    
    // 4. 开始游戏
    console.log('4. Starting game with "demo-story"...');
    const initialState = await engine.startGame('demo-story');
    console.log('   Initial state:', initialState);
    console.log('   Current scenario:', initialState.currentScenario?.dynamic_view.scene_setting);
    
    // 5. 提交玩家意图
    console.log('5. Submitting player action...');
    const result = await engine.submitAction('我安慰她');
    console.log('   Turn result:', result);
    console.log('   Stat deltas:', result.statDeltas);
    console.log('   Rapport deltas:', result.rapportDeltas);
    
    // 6. 获取当前状态
    console.log('6. Getting current state...');
    const currentState = engine.getCurrentState();
    console.log('   Current turn:', currentState.currentTurnIndex);
    console.log('   Total turns:', currentState.allScenarios.length);
    
    // 7. 获取行为历史
    console.log('7. Getting behavior history...');
    const history = engine.getBehaviorHistory();
    console.log(`   Behavior history (${history.length} items):`);
    history.forEach((behavior, i) => {
      console.log(`   ${i + 1}. [${behavior.actor}] ${behavior.narrative_snippet}`);
    });
    
    // 8. 测试Ticker系统
    console.log('8. Testing ticker system...');
    const tickerSystem = engine.getTickerSystem();
    const messages = tickerSystem.getMessages();
    console.log(`   Current ticker messages (${messages.length}):`);
    
    // 9. 销毁引擎
    console.log('9. Destroying engine...');
    engine.destroy();
    
    console.log('\n=== Test Complete ===');
    
    return {
      success: true,
      stories,
      initialState,
      turnResult: result,
      finalState: currentState,
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error,
    };
  }
}

// 导出到全局，方便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).testEngine = testEngine;
  console.log('Test function available: window.testEngine()');
}
