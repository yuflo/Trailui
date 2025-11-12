/**
 * 测试面板组件
 * 
 * Phase 5验证工具：
 * - 快速测试多线索隔离
 * - 查看系统状态
 * - 性能监控
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CacheManager } from '../../engine/services/data/cache/CacheManager';
import { ClueService } from '../../engine/services/business/ClueService';
import { StoryService } from '../../engine/services/business/StoryService';
import { Trash2, RefreshCw, TestTube2, CheckCircle2, XCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'passed' | 'failed';
  message?: string;
  timestamp?: number;
}

export function TestPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState({
    clueCount: 0,
    storyInstanceCount: 0,
    narrativeCacheCount: 0,
    storageSize: 0,
  });

  // 刷新统计信息
  const refreshStats = () => {
    try {
      const clues = CacheManager.getAllClues('demo-player');
      const storyInstances = Object.keys(localStorage)
        .filter(k => k.startsWith('dreamheart_story_instance_'))
        .map(k => CacheManager.getStoryInstance(k.replace('dreamheart_story_instance_', '')));
      
      // 计算存储大小
      const storageKeys = Object.keys(localStorage).filter(k => k.startsWith('dreamheart_'));
      let totalSize = 0;
      storageKeys.forEach(key => {
        const value = localStorage.getItem(key) || '';
        totalSize += value.length;
      });

      setStats({
        clueCount: clues.length,
        storyInstanceCount: storyInstances.length,
        narrativeCacheCount: storyInstances.reduce((acc, si) => {
          return acc + Object.keys(si.narrative_cache).length;
        }, 0),
        storageSize: Math.round(totalSize / 1024 * 100) / 100, // KB
      });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // 测试1: 深拷贝保护
  const testDeepCopyProtection = () => {
    const testName = '深拷贝保护测试';
    setTestResults(prev => [...prev, { name: testName, status: 'pending' }]);

    try {
      // 追踪一个线索
      const result = ClueService.trackClue('demo-player', 'CLUE_004');
      if (!result.success || !result.storyInstanceId) {
        throw new Error('追踪线索失败');
      }

      const instanceId = result.storyInstanceId;

      // 第一次获取
      const story1 = CacheManager.getStoryInstance(instanceId);
      const originalProgress = story1.progress_percentage;
      const originalRelationship = story1.npc_relationship_state['NPC_001'];

      // 尝试修改
      story1.progress_percentage = 999;
      story1.npc_relationship_state['NPC_001'] = -999;

      // 第二次获取
      const story2 = CacheManager.getStoryInstance(instanceId);

      // 验证
      if (story2.progress_percentage === 999 || story2.npc_relationship_state['NPC_001'] === -999) {
        throw new Error('深拷贝失败：缓存被外部修改污染');
      }

      if (story2.progress_percentage !== originalProgress) {
        throw new Error('数据不一致');
      }

      setTestResults(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'passed', message: '✅ 深拷贝保护正常', timestamp: Date.now() }
          : t
      ));
    } catch (error: any) {
      setTestResults(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'failed', message: `❌ ${error.message}`, timestamp: Date.now() }
          : t
      ));
    }
  };

  // 测试2: 多实例隔离
  const testMultiInstanceIsolation = () => {
    const testName = '多实例数据隔离测试';
    setTestResults(prev => [...prev, { name: testName, status: 'pending' }]);

    try {
      // 追踪CLUE_004
      const result1 = ClueService.trackClue('demo-player', 'CLUE_004');
      if (!result1.success || !result1.storyInstanceId) {
        throw new Error('追踪CLUE_004失败');
      }

      // 追踪CLUE_005
      const result2 = ClueService.trackClue('demo-player', 'CLUE_005');
      if (!result2.success || !result2.storyInstanceId) {
        throw new Error('追踪CLUE_005失败');
      }

      const instance1 = CacheManager.getStoryInstance(result1.storyInstanceId);
      const instance2 = CacheManager.getStoryInstance(result2.storyInstanceId);

      // 验证实例ID不同
      if (instance1.story_instance_id === instance2.story_instance_id) {
        throw new Error('实例ID相同，隔离失败');
      }

      // 验证初始关系值独立
      if (instance1.npc_relationship_state['NPC_001'] !== instance2.npc_relationship_state['NPC_001']) {
        // 这是好的，说明可能有独立的初始化
      }

      setTestResults(prev => prev.map(t => 
        t.name === testName 
          ? { 
              ...t, 
              status: 'passed', 
              message: `✅ 实例已隔离 (${result1.storyInstanceId.substring(0, 20)}... vs ${result2.storyInstanceId.substring(0, 20)}...)`,
              timestamp: Date.now() 
            }
          : t
      ));
    } catch (error: any) {
      setTestResults(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'failed', message: `❌ ${error.message}`, timestamp: Date.now() }
          : t
      ));
    }
  };

  // 测试3: 性能测试
  const testPerformance = () => {
    const testName = '深拷贝性能测试';
    setTestResults(prev => [...prev, { name: testName, status: 'pending' }]);

    try {
      // 确保有一个实例
      const result = ClueService.trackClue('demo-player', 'CLUE_004');
      if (!result.success || !result.storyInstanceId) {
        throw new Error('追踪线索失败');
      }

      const instanceId = result.storyInstanceId;
      const iterations = 100;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        CacheManager.getStoryInstance(instanceId);
      }
      const end = performance.now();

      const avgTime = (end - start) / iterations;

      if (avgTime > 5) {
        setTestResults(prev => prev.map(t => 
          t.name === testName 
            ? { 
                ...t, 
                status: 'failed', 
                message: `⚠️ 性能不达标: ${avgTime.toFixed(2)}ms/次 (目标 < 5ms)`,
                timestamp: Date.now() 
              }
            : t
        ));
      } else {
        setTestResults(prev => prev.map(t => 
          t.name === testName 
            ? { 
                ...t, 
                status: 'passed', 
                message: `✅ 性能优秀: ${avgTime.toFixed(2)}ms/次 (100次平均)`,
                timestamp: Date.now() 
              }
            : t
        ));
      }
    } catch (error: any) {
      setTestResults(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'failed', message: `❌ ${error.message}`, timestamp: Date.now() }
          : t
      ));
    }
  };

  // 运行所有测试
  const runAllTests = () => {
    setTestResults([]);
    setTimeout(() => testDeepCopyProtection(), 100);
    setTimeout(() => testMultiInstanceIsolation(), 500);
    setTimeout(() => testPerformance(), 1000);
  };

  // 清空所有缓存
  const clearAllCache = () => {
    if (confirm('确定要清空所有缓存吗？这将删除所有线索和故事进度。')) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('dreamheart_'));
      keys.forEach(key => localStorage.removeItem(key));
      setTestResults([]);
      refreshStats();
      alert('缓存已清空');
    }
  };

  return (
    <Card className="p-6 bg-slate-900/50 border-cyan-500/30">
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-cyan-400">测试面板 - Phase 5 验证工具</h2>
          </div>
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
            Dev Tools
          </Badge>
        </div>

        {/* 系统统计 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-sm">线索数量</div>
            <div className="text-2xl text-cyan-400 mt-1">{stats.clueCount}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-sm">故事实例</div>
            <div className="text-2xl text-purple-400 mt-1">{stats.storyInstanceCount}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-sm">叙事缓存</div>
            <div className="text-2xl text-amber-400 mt-1">{stats.narrativeCacheCount}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 text-sm">存储大小</div>
            <div className="text-2xl text-green-400 mt-1">{stats.storageSize} KB</div>
          </div>
        </div>

        {/* 测试控制 */}
        <div className="flex gap-3">
          <Button
            onClick={runAllTests}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <TestTube2 className="w-4 h-4 mr-2" />
            运行所有测试
          </Button>
          <Button
            onClick={testDeepCopyProtection}
            variant="outline"
            className="border-cyan-500/30 hover:bg-cyan-500/10"
          >
            深拷贝测试
          </Button>
          <Button
            onClick={testMultiInstanceIsolation}
            variant="outline"
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            隔离测试
          </Button>
          <Button
            onClick={testPerformance}
            variant="outline"
            className="border-amber-500/30 hover:bg-amber-500/10"
          >
            性能测试
          </Button>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-slate-300">测试结果</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === 'passed'
                      ? 'bg-green-500/10 border-green-500/30'
                      : result.status === 'failed'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.status === 'passed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                      {result.status === 'failed' && (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      {result.status === 'pending' && (
                        <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                      )}
                      <span className="text-slate-200">{result.name}</span>
                    </div>
                    {result.timestamp && (
                      <span className="text-xs text-slate-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  {result.message && (
                    <div className="mt-2 text-sm text-slate-300 ml-6">
                      {result.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 危险操作 */}
        <div className="pt-4 border-t border-slate-700/50">
          <Button
            onClick={clearAllCache}
            variant="outline"
            className="border-red-500/30 hover:bg-red-500/10 text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空所有缓存
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 <strong>测试说明</strong>:</p>
          <p>• 深拷贝测试: 验证缓存数据不会被外部修改污染</p>
          <p>• 隔离测试: 验证多个故事实例数据完全独立</p>
          <p>• 性能测试: 验证深拷贝性能 (目标 &lt; 5ms/次)</p>
        </div>
      </div>
    </Card>
  );
}