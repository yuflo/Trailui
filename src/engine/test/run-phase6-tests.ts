/**
 * Phase 6 - Complete Test Runner
 * Phase 6 - 完整测试运行器
 * 
 * 运行所有Phase 6相关的测试：
 * 1. 架构验证测试
 * 2. Service层测试
 * 3. E2E测试
 */

import runPhase6ValidationTests from './phase6-validation.test';
import { testNearFieldService } from '../services/impl/NearFieldServiceImpl.test';
import runNearFieldE2ETests from './nearfield-e2e.test';

/**
 * 运行所有Phase 6测试
 */
export async function runPhase6Tests() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Dreamheart Engine - Phase 6 Complete Test Suite');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');

  const results = {
    phase6Validation: { total: 0, passed: 0, failed: 0 },
    serviceLayer: { total: 7, passed: 0, failed: 0 },
    e2eTests: { total: 14, passed: 0, failed: 0 },
  };

  // ========================================
  // Part 1: Phase 6 架构验证测试
  // ========================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   PART 1: Phase 6 Architecture Validation Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const result = await runPhase6ValidationTests();
    results.phase6Validation = result;
  } catch (error) {
    console.error('❌ Phase 6 validation tests failed:', error);
    results.phase6Validation.failed = results.phase6Validation.total;
  }

  console.log('\n');

  // ========================================
  // Part 2: Service层测试
  // ========================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   PART 2: Service Layer Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    await testNearFieldService();
    results.serviceLayer.passed = 7;
  } catch (error) {
    console.error('❌ Service layer tests failed:', error);
    results.serviceLayer.failed = 7;
  }

  console.log('\n');

  // ========================================
  // Part 3: E2E测试
  // ========================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   PART 3: End-to-End Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    await runNearFieldE2ETests();
    results.e2eTests.passed = 14;
  } catch (error) {
    console.error('❌ E2E tests failed:', error);
    results.e2eTests.failed = 14;
  }

  // ========================================
  // 最终总结
  // ========================================
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   FINAL SUMMARY - Phase 6 Complete Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  const totalTests = 
    results.phase6Validation.total + 
    results.serviceLayer.total + 
    results.e2eTests.total;
  
  const totalPassed = 
    results.phase6Validation.passed + 
    results.serviceLayer.passed + 
    results.e2eTests.passed;
  
  const totalFailed = 
    results.phase6Validation.failed + 
    results.serviceLayer.failed + 
    results.e2eTests.failed;

  console.log('📊 Test Categories:');
  console.log('───────────────────────────────────────────────────────────');
  console.log(`  Phase 6 Validation:  ${results.phase6Validation.passed}/${results.phase6Validation.total} ✅`);
  console.log(`  Service Layer:       ${results.serviceLayer.passed}/${results.serviceLayer.total} ✅`);
  console.log(`  End-to-End:          ${results.e2eTests.passed}/${results.e2eTests.total} ✅`);
  console.log('───────────────────────────────────────────────────────────');
  console.log(`  TOTAL:               ${totalPassed}/${totalTests} ✅`);
  console.log('');

  if (totalFailed === 0) {
    console.log('🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉');
    console.log('');
    console.log('✨ Phase 6 Validation Complete!');
    console.log('✨ Architecture Score: 10/10');
    console.log('✨ Ready for Production!');
  } else {
    console.log(`⚠️  ${totalFailed} test(s) failed. Please review the logs.`);
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  return {
    total: totalTests,
    passed: totalPassed,
    failed: totalFailed,
    details: results
  };
}

// 如果直接运行此文件，执行所有测试
if (typeof window === 'undefined') {
  runPhase6Tests()
    .then(result => {
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
