/**
 * useClueInbox Hook
 * 
 * 封装线索收件箱的业务逻辑
 * 使用新的Service层（ClueService, StoryService）
 */

import { useState, useEffect, useCallback } from 'react';
import { ClueService, StoryService } from '../engine/services/business';
import type { ClueRecord, StoryInstance } from '../types/instance.types';

/**
 * 线索收件箱Hook
 */
export function useClueInbox(playerId: string = 'demo-player') {
  const [clues, setClues] = useState<ClueRecord[]>([]);
  const [storyInstances, setStoryInstances] = useState<Map<string, StoryInstance>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 🔥 加载线索收件箱
   */
  const loadClues = useCallback(async () => {
    console.log('[useClueInbox.loadClues] 🔄 Starting to load clues for player:', playerId);
    console.log('[useClueInbox.loadClues] 📊 Timestamp:', Date.now());
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. 获取所有线索
      console.log('[useClueInbox.loadClues] 📡 Calling ClueService.getPlayerClues()...');
      const allClues = ClueService.getPlayerClues(playerId);
      
      console.log('[useClueInbox.loadClues] ✅ ClueService.getPlayerClues() returned:', {
        count: allClues.length,
        clueIds: allClues.map(c => c.clue_id),
        clueTitles: allClues.map(c => c.title),
        clueStatuses: allClues.map(c => c.status)
      });
      
      // 🔍 详细打印每个线索的状态
      allClues.forEach((clue, idx) => {
        console.log(`[useClueInbox.loadClues]   [${idx}] Clue: ${clue.clue_id}`);
        console.log(`[useClueInbox.loadClues]      - Status: ${clue.status}`);
        console.log(`[useClueInbox.loadClues]      - Story Instance ID: ${clue.story_instance_id}`);
        console.log(`[useClueInbox.loadClues]      - Completed At: ${clue.completed_at || 'null'}`);
      });
      
      setClues(allClues);
      console.log('[useClueInbox.loadClues] 📝 Updated clues state (React will re-render)');
      
      // 2. 加载所有已追踪线索的故事实例
      const trackedClues = allClues.filter(c => c.story_instance_id !== null);
      console.log('[useClueInbox.loadClues] 🔍 Tracked clues:', trackedClues.length);
      
      const instancesMap = new Map<string, StoryInstance>();
      
      for (const clue of trackedClues) {
        if (clue.story_instance_id) {
          console.log(`[useClueInbox.loadClues] 📡 Loading story instance: ${clue.story_instance_id} for clue: ${clue.clue_id}`);
          const instance = StoryService.getStoryInstance(clue.story_instance_id);
          
          if (instance) {
            console.log(`[useClueInbox.loadClues]   ✅ Story instance loaded:`, {
              instance_id: instance.instance_id,
              status: instance.status,
              progress: `${instance.completed_scenes.length}/${instance.scene_sequence.length}`,
              progress_percentage: instance.progress_percentage,
              current_scene_id: instance.current_scene_id,
              completed_scenes: instance.completed_scenes
            });
            instancesMap.set(clue.clue_id, instance);
          } else {
            console.warn(`[useClueInbox.loadClues]   ⚠️ Story instance not found: ${clue.story_instance_id}`);
          }
        }
      }
      
      setStoryInstances(instancesMap);
      console.log('[useClueInbox.loadClues] 📝 Updated storyInstances state (React will re-render)');
      
      console.log('[useClueInbox.loadClues] ✅ Loaded clues:', {
        total: allClues.length,
        tracked: trackedClues.length,
        instances: instancesMap.size
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载失败';
      setError(errorMsg);
      console.error('[useClueInbox] ❌ Failed to load:', err);
    } finally {
      setIsLoading(false);
      console.log('[useClueInbox.loadClues] 🏁 Loading complete');
    }
  }, [playerId]);
  
  // ✅ 阶段3修复：删除trackClue方法（冗余调用路径）
  // trackClue应该通过GameEngine调用以触发事件系统
  // ClueInboxPanel现在直接使用useGameEngine.trackClue()
  
  /**
   * 🔥 标记线索为已读
   */
  const markAsRead = useCallback((clueId: string) => {
    ClueService.markClueAsRead(clueId);
    loadClues();
  }, [loadClues]);
  
  /**
   * 🔥 完成线索
   */
  const completeClue = useCallback((clueId: string) => {
    ClueService.completeClue(clueId);
    loadClues();
  }, [loadClues]);
  
  /**
   * 🔥 获取线索的故事实例
   */
  const getStoryInstance = useCallback((clueId: string): StoryInstance | null => {
    return storyInstances.get(clueId) || null;
  }, [storyInstances]);
  
  /**
   * 🔥 获取统计信息
   */
  const stats = {
    total: clues.length,
    unread: clues.filter(c => c.status === 'unread').length,
    tracking: clues.filter(c => c.status === 'tracking').length,
    completed: clues.filter(c => c.status === 'completed').length
  };
  
  // 初始加载
  useEffect(() => {
    loadClues();
  }, [loadClues]);
  
  return {
    clues,
    storyInstances,
    isLoading,
    error,
    stats,
    // 方法
    loadClues,
    markAsRead,
    completeClue,
    getStoryInstance
  };
}