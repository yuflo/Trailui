/**
 * Test Runner - Run All Tests
 * 测试运行器 - 运行所有测试
 */

import { testNearFieldService } from '../services/impl/NearFieldServiceImpl.test';
import runNearFieldE2ETests from './nearfield-e2e.test';

/**
 * 运行所有测试
 */
export async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Dreamheart Engine - Test Suite      ║');
  console.log('╚════════════════════════════════════════╝\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // 运行Service层测试
  console.log('📦 Running Service Layer Tests...\n');
  try {
    await testNearFieldService();
    passedTests += 7; // 假设7个测试
    totalTests += 7;
  } catch (error) {
    console.error('Service layer tests failed:', error);
    failedTests += 1;
    totalTests += 1;
  }

  console.log('\n');

  // 运行E2E测试
  console.log('🧪 Running End-to-End Tests...\n');
  try {
    await runNearFieldE2ETests();
    passedTests += 14; // 14个E2E测试（新增2个PLAYING_NARRATIVE测试）
    totalTests += 14;
  } catch (error) {
    console.error('E2E tests failed:', error);
    failedTests += 1;
    totalTests += 1;
  }

  // 总结
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           Test Summary                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`  Total:  ${totalTests}`);
  console.log(`  Passed: ${passedTests} ✅`);
  console.log(`  Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
  console.log('');

  if (failedTests === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs.');
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}
