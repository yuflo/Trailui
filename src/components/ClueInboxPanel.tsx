/**
 * ClueInboxPanel - 线索收件箱面板
 * 
 * 使用新的架构：
 * - useClueInbox Hook
 * - ClueService / StoryService
 * - 完全基于实例数据
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Inbox, 
  Target, 
  Eye, 
  CheckCircle, 
  Loader2,
  MapPin,
  TrendingUp,
  Users
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { useClueInbox } from '../hooks/useClueInbox';
import type { ClueRecord, StoryInstance } from '../types/instance.types';

interface ClueInboxPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId?: string;
  onClueTracked?: () => void; // 🔥 新增：线索追踪成功后的回调，用于通知父组件刷新状态
  onEnterStory?: (clueId: string) => void; // 🔥 新增：进入故事的回调
}

/**
 * 线索收件箱面板组件
 */
export function ClueInboxPanel({ 
  open, 
  onOpenChange,
  playerId = 'demo-player',
  onClueTracked, // 🔥 接收回调
  onEnterStory // 🔥 接收进入故事回调
}: ClueInboxPanelProps) {
  const [selectedClueIndex, setSelectedClueIndex] = useState(0);
  const [trackingClueId, setTrackingClueId] = useState<string | null>(null);
  
  // 使用新的Hook
  const {
    clues,
    storyInstances,
    isLoading,
    error,
    stats,
    trackClue,
    getStoryInstance,
    loadClues
  } = useClueInbox(playerId);
  
  // 🔥 方案2：面板打开时自动刷新数据
  useEffect(() => {
    if (open) {
      console.log('[ClueInboxPanel] 🔄 Panel opened, refreshing clues...');
      loadClues();
    }
  }, [open, loadClues]);
  
  /**
   * 处理追踪线索
   */
  const handleTrackClue = async (clueId: string) => {
    setTrackingClueId(clueId);
    
    try {
      await trackClue(clueId);
      console.log('[ClueInboxPanel] ✅ Successfully tracked clue:', clueId);
      
      // 🔥 调用回调通知父组件刷新状态
      if (onClueTracked) {
        console.log('[ClueInboxPanel] 📢 Calling onClueTracked callback...');
        onClueTracked();
        console.log('[ClueInboxPanel] ✅ onClueTracked callback completed');
      }
    } catch (error) {
      console.error('[ClueInboxPanel] ❌ Failed to track clue:', error);
    } finally {
      setTrackingClueId(null);
    }
  };
  
  /**
   * 获取状态显示信息
   */
  const getStatusInfo = (clue: ClueRecord) => {
    const story = getStoryInstance(clue.clue_id);
    
    if (clue.status === 'completed' || story?.status === 'completed') {
      return {
        color: 'bg-green-500/20 text-green-300 border-green-500/50',
        dotColor: 'bg-green-400',
        label: '已完成'
      };
    } else if (clue.status === 'tracking' && story) {
      return {
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        dotColor: 'bg-yellow-400',
        label: '追踪中'
      };
    } else if (clue.status === 'read') {
      return {
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
        dotColor: 'bg-blue-400',
        label: '已读'
      };
    } else {
      return {
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
        dotColor: 'bg-cyan-400',
        label: '未读'
      };
    }
  };
  
  const currentClue = clues[selectedClueIndex];
  const currentStory = currentClue ? getStoryInstance(currentClue.clue_id) : null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[90vw] h-[85vh] max-w-7xl sm:max-w-7xl bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-xl border-yellow-500/50 p-0 comic-outline halftone-bg overflow-hidden flex flex-col"
      >
        <DialogHeader className="p-6 pb-4 border-b border-slate-700/50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl text-white enhanced-title">
            <Inbox className="w-6 h-6 text-yellow-400" />
            线索收件箱
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            共 {stats.total} 条线索 · 
            未读 {stats.unread} · 
            追踪中 {stats.tracking} · 
            已完成 {stats.completed}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：线索列表 */}
          <div className="w-1/3 border-r border-slate-700/50 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {clues.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-xs">暂无线索</p>
                    <p className="text-[10px] mt-2">从世界信息流中提取线索</p>
                  </div>
                ) : (
                  clues.map((clue, idx) => {
                    const statusInfo = getStatusInfo(clue);
                    
                    return (
                      <motion.div
                        key={clue.clue_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedClueIndex(idx)}
                        className={`p-3 rounded cursor-pointer transition-all ${
                          selectedClueIndex === idx
                            ? 'bg-yellow-500/20 border-2 border-yellow-400/60'
                            : 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-yellow-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusInfo.dotColor}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium leading-snug mb-1 ${
                              selectedClueIndex === idx ? 'text-yellow-200' : 'text-gray-300'
                            }`}>
                              {clue.title}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] px-1.5 py-0 h-4 ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧：线索详情 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {currentClue ? (
              <ClueDetailView
                clue={currentClue}
                story={currentStory}
                isTracking={trackingClueId === currentClue.clue_id}
                onTrack={handleTrackClue}
                onEnterStory={onEnterStory} // 🔥 传递进入故事回调
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                选择一个线索查看详情
              </div>
            )}
          </div>
        </div>
        
        {/* 加载/错误提示 */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          </div>
        )}
        
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-300 px-4 py-2 rounded border border-red-500/50">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * 线索详情视图
 */
function ClueDetailView({
  clue,
  story,
  isTracking,
  onTrack,
  onEnterStory // 🔥 接收进入故事回调
}: {
  clue: ClueRecord;
  story: StoryInstance | null;
  isTracking: boolean;
  onTrack: (clueId: string) => void;
  onEnterStory?: (clueId: string) => void; // 🔥 接收进入故事回调
}) {
  // 未追踪状态
  if (!story) {
    return (
      <div className="flex flex-col h-full p-4">
        {/* 标题区 */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-1">
              <Target className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <h3 className="text-white enhanced-title break-words">
                {clue.title}
              </h3>
            </div>
            <Badge variant="outline" className="flex-shrink-0 bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
              未追踪
            </Badge>
          </div>
          <div className="text-[10px] text-gray-500 break-all">
            ID: {clue.clue_id}
          </div>
        </div>

        <Separator className="bg-slate-700/50 mb-3" />

        {/* 线索摘要 */}
        <div className="flex-1 overflow-auto">
          <div className="text-xs text-gray-400 mb-2">线索摘要</div>
          <p className="text-sm text-gray-200 break-words mb-3">
            {clue.description}
          </p>
          
          <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-cyan-300 mb-1 break-words">
                  追踪此线索
                </div>
                <p className="text-xs text-cyan-200 break-words opacity-90">
                  追踪此线索将开启关联的故事线。你可以前往对应场景展开调查。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <Button
            onClick={() => onTrack(clue.clue_id)}
            disabled={isTracking}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg"
          >
            {isTracking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                追踪中...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                开始追踪
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 已追踪状态 - 显示故事实例详情
  const isCompleted = story.status === 'completed';
  
  return (
    <div className="flex flex-col h-full">
      {/* 🔍 DEBUG: 添加渲染日志 */}
      {(() => {
        console.log(`[ClueDetailView] 🎨 RENDERING - Clue: ${clue.clue_id}`);
        console.log(`[ClueDetailView]   - Clue Status: ${clue.status}`);
        console.log(`[ClueDetailView]   - Story Instance ID: ${story.instance_id}`);
        console.log(`[ClueDetailView]   - Story Status: ${story.status}`);
        console.log(`[ClueDetailView]   - Progress: ${story.completed_scenes.length}/${story.scene_sequence.length} scenes`);
        console.log(`[ClueDetailView]   - Progress %: ${story.progress_percentage}%`);
        console.log(`[ClueDetailView]   - Current Scene ID: ${story.current_scene_id}`);
        console.log(`[ClueDetailView]   - Completed Scenes: [${story.completed_scenes.join(', ')}]`);
        console.log(`[ClueDetailView]   - Scene Sequence: [${story.scene_sequence.join(', ')}]`);
        console.log(`[ClueDetailView]   - isCompleted (derived): ${isCompleted}`);
        console.log(`[ClueDetailView]   - Component render timestamp: ${Date.now()}`);
        return null;
      })()}
      
      {/* Header：故事标题 */}
      <div className="p-4 pb-3 border-b border-slate-700/50">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 flex-1">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Target className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            )}
            <h3 className="text-white enhanced-title break-words">
              {story.story_data.title}
            </h3>
          </div>
          <Badge 
            variant="outline" 
            className={`flex-shrink-0 ${
              isCompleted 
                ? 'bg-green-500/20 text-green-300 border-green-500/50'
                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
            }`}
          >
            {isCompleted ? '已完成' : '追踪中'}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <Target className="w-3 h-3" />
          <span>{clue.clue_id}</span>
        </div>
      </div>

      {/* 故事进度 */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">故事进度</span>
          <span className="text-sm text-white font-medium">
            {story.progress_percentage}%
          </span>
        </div>
        <Progress value={story.progress_percentage} className="h-2" />
        <div className="mt-2 text-[10px] text-gray-500">
          已完成 {story.completed_scenes.length} / {story.scene_sequence.length} 个场景
        </div>
      </div>

      {/* 故事详情 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 故事描述 */}
          <div>
            <div className="text-xs text-gray-400 mb-2">故事简介</div>
            <p className="text-sm text-gray-200 break-words">
              {story.story_data.description}
            </p>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* 场景列表 */}
          <div>
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              场景进度
            </div>
            <div className="space-y-2">
              {story.scene_sequence.map((sceneId, idx) => {
                const isCompleted = story.completed_scenes.includes(sceneId);
                const isCurrent = story.current_scene_id?.includes(sceneId);
                
                return (
                  <div
                    key={sceneId}
                    className={`p-2 rounded text-xs ${
                      isCurrent
                        ? 'bg-yellow-500/20 border border-yellow-500/50'
                        : isCompleted
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-slate-700/30 border border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : isCurrent ? (
                        <Target className="w-3 h-3 text-yellow-400" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-gray-500" />
                      )}
                      <span className={
                        isCurrent ? 'text-yellow-200' : 
                        isCompleted ? 'text-green-200' : 
                        'text-gray-400'
                      }>
                        场景 {idx + 1}: {sceneId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* 故事元数据 */}
          <div>
            <div className="text-xs text-gray-400 mb-2">故事信息</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-gray-500">故事实例ID:</span>
                <code className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded">
                  {story.instance_id}
                </code>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-gray-500">状态:</span>
                <span>{story.status}</span>
              </div>
              {story.started_at && (
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-gray-500">开始时间:</span>
                  <span>{new Date(story.started_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 底部行动按钮 */}
      {!isCompleted && (
        <div className="p-4 border-t border-slate-700/50">
          <Button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            onClick={() => {
              // 🔥 调用进入故事回调
              if (onEnterStory) {
                console.log('[ClueInboxPanel] Enter story:', story.instance_id);
                onEnterStory(clue.clue_id);
              }
            }}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            继续故事
          </Button>
        </div>
      )}
    </div>
  );
}