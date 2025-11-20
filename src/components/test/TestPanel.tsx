/**
 * 测试面板组件 - GTA风格重构版
 * 
 * Phase 5验证工具：
 * - 快速测试多线索隔离
 * - 查看系统状态
 * - 性能监控
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { InstanceCacheManager } from '../../engine/cache/InstanceCacheManager';
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
      const clues = ClueService.getPlayerClues('demo-player');
      const allInstances = StoryService.getAllInstances();
      const storyInstances = allInstances.filter(si => si.player_id === 'demo-player');
      
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

  // ⚠️ Phase 6.1: 以下测试函数暂时禁用，需要适配新的 API
  
  // 测试1: 深拷贝保护
  const testDeepCopyProtection = () => {
    const testName = '深拷贝保护测试';
    setTestResults(prev => [...prev, { 
      name: testName, 
      status: 'failed',
      message: '⚠️ 测试已过时，需要适配 Phase 6.1 新API',
      timestamp: Date.now()
    }]);
  };

  // 测试2: 多实例隔离
  const testMultiInstanceIsolation = () => {
    const testName = '多实例数据隔离测试';
    setTestResults(prev => [...prev, { 
      name: testName, 
      status: 'failed',
      message: '⚠️ 测试已过时，需要适配 Phase 6.1 新API',
      timestamp: Date.now()
    }]);
  };

  // 测试3: 性能测试
  const testPerformance = () => {
    const testName = '深拷贝性能测试';
    setTestResults(prev => [...prev, { 
      name: testName, 
      status: 'failed',
      message: '⚠️ 测试已过时，需要适配 Phase 6.1 新API',
      timestamp: Date.now()
    }]);
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
    <div className="p-6 border-[3px] border-black bg-[#1a0a0c]/95" style={{
      boxShadow: '0px 0px 0px 2px #00d4ff, 4px 4px 0px 0px #000000',
      filter: 'drop-shadow(0 0 12px rgba(0, 212, 255, 0.3))'
    }}>
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-[#00d4ff]" />
            <h2 className="text-[#00d4ff]">测试面板 - Phase 5 验证工具</h2>
          </div>
          <Badge 
            variant="outline" 
            className="border-[3px] border-black bg-[#00d4ff]/20 text-[#00d4ff]"
          >
            Dev Tools
          </Badge>
        </div>

        {/* 系统统计 - GTA硬边卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div 
            className="p-4 border-[3px] border-black bg-[#1a0a0c]"
            style={{
              boxShadow: '0px 0px 0px 2px #00d4ff, 3px 3px 0px 0px #000000'
            }}
          >
            <div className="text-white/60 text-sm">线索数量</div>
            <div className="text-2xl text-[#00d4ff] mt-1">{stats.clueCount}</div>
          </div>
          <div 
            className="p-4 border-[3px] border-black bg-[#1a0a0c]"
            style={{
              boxShadow: '0px 0px 0px 2px #a855f7, 3px 3px 0px 0px #000000'
            }}
          >
            <div className="text-white/60 text-sm">故事实例</div>
            <div className="text-2xl text-[#a855f7] mt-1">{stats.storyInstanceCount}</div>
          </div>
          <div 
            className="p-4 border-[3px] border-black bg-[#1a0a0c]"
            style={{
              boxShadow: '0px 0px 0px 2px #fbbf24, 3px 3px 0px 0px #000000'
            }}
          >
            <div className="text-white/60 text-sm">叙事缓存</div>
            <div className="text-2xl text-[#fbbf24] mt-1">{stats.narrativeCacheCount}</div>
          </div>
          <div 
            className="p-4 border-[3px] border-black bg-[#1a0a0c]"
            style={{
              boxShadow: '0px 0px 0px 2px #39ff14, 3px 3px 0px 0px #000000'
            }}
          >
            <div className="text-white/60 text-sm">存储大小</div>
            <div className="text-2xl text-[#39ff14] mt-1">{stats.storageSize} KB</div>
          </div>
        </div>

        {/* 测试控制 - GTA按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={runAllTests}
            className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black border-[3px] border-black"
            style={{ boxShadow: '3px 3px 0 #000' }}
          >
            <TestTube2 className="w-4 h-4 mr-2" />
            运行所有测试
          </Button>
          <Button
            onClick={testDeepCopyProtection}
            variant="outline"
            className="border-[3px] border-black hover:bg-[#00d4ff]/10"
          >
            深拷贝测试
          </Button>
          <Button
            onClick={testMultiInstanceIsolation}
            variant="outline"
            className="border-[3px] border-black hover:bg-[#a855f7]/10"
          >
            隔离测试
          </Button>
          <Button
            onClick={testPerformance}
            variant="outline"
            className="border-[3px] border-black hover:bg-[#fbbf24]/10"
          >
            性能测试
          </Button>
        </div>

        {/* 测试结果 - GTA硬边卡片 */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white">测试结果</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 border-[3px] border-black ${
                    result.status === 'passed'
                      ? 'bg-[#39ff14]/10'
                      : result.status === 'failed'
                      ? 'bg-[#ef4444]/10'
                      : 'bg-[#1a0a0c]'
                  }`}
                  style={{
                    boxShadow: result.status === 'passed' 
                      ? '0 0 0 2px #39ff14, 3px 3px 0 #000'
                      : result.status === 'failed'
                      ? '0 0 0 2px #ef4444, 3px 3px 0 #000'
                      : '3px 3px 0 #000'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.status === 'passed' && (
                        <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                      )}
                      {result.status === 'failed' && (
                        <XCircle className="w-4 h-4 text-[#ef4444]" />
                      )}
                      {result.status === 'pending' && (
                        <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
                      )}
                      <span className="text-white">{result.name}</span>
                    </div>
                    {result.timestamp && (
                      <span className="text-xs text-white/50">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  {result.message && (
                    <div className="mt-2 text-sm text-white/80 ml-6">
                      {result.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 危险操作 */}
        <div className="pt-4 border-t-[3px] border-black">
          <Button
            onClick={clearAllCache}
            variant="outline"
            className="border-[3px] border-[#ef4444] hover:bg-[#ef4444]/10 text-[#ef4444]"
            style={{ boxShadow: '3px 3px 0 #000' }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空所有缓存
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="text-xs text-white/60 space-y-1">
          <p>💡 <strong>测试说明</strong>:</p>
          <p>• 深拷贝测试: 验证缓存数据不会被外部修改污染</p>
          <p>• 隔离测试: 验证多个故事实例数据完全独立</p>
          <p>• 性能测试: 验证深拷贝性能 {'(目标 < 5ms/次)'}</p>
        </div>
      </div>
    </div>
  );
}