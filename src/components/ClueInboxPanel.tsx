/**
 * ClueInboxPanel - 线索收件箱面板
 * 
 * 使用新的架构：
 * - useClueInbox Hook
 * - ClueService / StoryService
 * - 完全基于实例数据
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, 
  Target, 
  Eye, 
  CheckCircle, 
  Loader2,
  MapPin,
  TrendingUp,
  Users,
  Play,
  AlertCircle // 🔥 新增：提示图标
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { useClueInbox } from '../hooks/useClueInbox';
// ❌ 移除：不再在这里调用 useGameEngine
// import { useGameEngine } from '../hooks/useGameEngine';
import type { ClueRecord, StoryInstance } from '../types/instance.types';
import type { TrackedStoryData } from '../types'; // 🔥 新增：类型导入

interface ClueInboxPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId?: string;
  trackClue: (clueId: string) => Promise<any>; // 🔥 修复双实例：从App接收trackClue方法
  onEnterStory?: (clueId: string) => void;
  activeStory: TrackedStoryData | null; // 🔥 KISS方案1：从App接收activeStory
}

/**
 * 线索收件箱面板组件
 */
export function ClueInboxPanel({ 
  open, 
  onOpenChange,
  playerId = 'demo-player',
  trackClue, // 🔥 修复双实例：从App接收trackClue方法
  onEnterStory, // 🔥 接收进入故事回调
  activeStory // 🔥 KISS方案1：从App接收activeStory
}: ClueInboxPanelProps) {
  console.log('[ClueInboxPanel] 🏗️ COMPONENT MOUNT/RENDER @ ' + Date.now());
  console.log('[ClueInboxPanel] 📍 Component: ClueInboxPanel.tsx');
  
  const [selectedClueIndex, setSelectedClueIndex] = useState(0);
  const [trackingClueId, setTrackingClueId] = useState<string | null>(null);
  
  // 使用新的Hook（只用于数据加载和显示）
  const {
    clues,
    storyInstances,
    isLoading,
    error,
    stats,
    getStoryInstance,
    loadClues
  } = useClueInbox(playerId);
  
  // ❌ 移除：不再调用 useGameEngine
  // const { activeStory } = useGameEngine();
  
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
      // ✅ 使用 GameEngine 的 trackClue（触发事件系统）
      await trackClue(clueId);
      console.log('[ClueInboxPanel] ✅ Successfully tracked clue via GameEngine:', clueId);
      
      // ✅ 手动刷新面板数据（因为useClueInbox不监听事件）
      await loadClues();
      console.log('[ClueInboxPanel] ✅ Panel data refreshed');
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
        color: 'bg-white/90 text-black border-[3px] border-black',
        dotColor: 'bg-[#64748b]',
        label: '已读'
      };
    } else {
      return {
        color: 'bg-[#fbbf24]/20 text-black border-[3px] border-black',
        dotColor: 'bg-[#fbbf24]',
        label: '未读'
      };
    }
  };
  
  const currentClue = clues[selectedClueIndex];
  const currentStory = currentClue ? getStoryInstance(currentClue.clue_id) : null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[90vw] h-[85vh] max-w-7xl sm:max-w-7xl bg-[#140f0f]/95 backdrop-blur-xl border-[3px] border-black p-0 overflow-hidden flex flex-col"
        style={{
          boxShadow: '0px 0px 0px 2px #A83C3C, 4px 4px 0px 0px #000000'
        }}
      >
        <DialogHeader className="p-6 pb-4 border-b-[3px] border-black flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl text-white">
            <Inbox className="w-6 h-6 text-[#fbbf24]" />
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
                          <div className={`w-2 h-2 mt-1.5 flex-shrink-0 ${statusInfo.dotColor}`}></div>
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
                activeStory={activeStory} // 🔥 KISS案：传递活跃故事
                isTracking={trackingClueId === currentClue.clue_id}
                onTrack={handleTrackClue}
                onEnterStory={onEnterStory} // 🔥 传递进入故事回调
                onClose={() => onOpenChange(false)} // 🔥 传递关闭面板回调
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
  activeStory, // 🔥 KISS方案：接收活跃故事
  isTracking,
  onTrack,
  onEnterStory, // 🔥 接收进入故事回调
  onClose // 🔥 接收关闭面板回调
}: {
  clue: ClueRecord;
  story: StoryInstance | null;
  activeStory: TrackedStoryData | null; // 🔥 KISS方案：接收活跃故事
  isTracking: boolean;
  onTrack: (clueId: string) => void;
  onEnterStory?: (clueId: string) => void; // 🔥 接收进入故事回调
  onClose?: () => void; // 🔥 接收关闭面板回调
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
              <h3 className="text-white break-words">
                {clue.title}
              </h3>
            </div>
            <Badge variant="outline" className="flex-shrink-0 bg-white/90 text-black border-[3px] border-black">
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
          <div className="text-xs text-gray-400 mb-2">���索摘要</div>
          <p className="text-sm text-gray-200 break-words mb-3">
            {clue.description}
          </p>
          
          <div className="p-3 bg-[#fbbf24]/20 border-[3px] border-black">
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-black mb-1 break-words">
                  追踪此线索
                </div>
                <p className="text-xs text-gray-800 break-words opacity-90">
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
            className="w-full bg-[#A83C3C] hover:bg-[#C85454] text-white border-[3px] border-black"
            style={{
              boxShadow: '0 0 0 2px #A83C3C, 3px 3px 0 #000'
            }}
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
            <h3 className="text-white break-words">
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
                        <div className="w-3 h-3 border-[3px] border-gray-500" />
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
      {!isCompleted && (() => {
        const isNotStarted = story.status === 'not_started';
        
        // 🔥 KISS方案：判断是否正在进行其他故事
        const isCurrentStory = activeStory?.entry_clue_id === clue.clue_id;
        const isPlayingOther = activeStory && !isCurrentStory;
        
        const buttonDisabled = isPlayingOther;
        const buttonClass = buttonDisabled 
          ? "w-full opacity-50 cursor-not-allowed bg-gray-600 border-[3px] border-black"
          : "w-full bg-[#A83C3C] hover:bg-[#C85454] text-white border-[3px] border-black";
        const buttonStyle = buttonDisabled
          ? undefined
          : { boxShadow: '0 0 0 2px #A83C3C, 3px 3px 0 #000' };
        
        return (
          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <Button
              disabled={buttonDisabled}
              className={buttonClass}
              style={buttonStyle}
              onClick={() => {
                if (isNotStarted) {
                  console.log('[ClueInboxPanel] 🎬 Enter story:', story.instance_id);
                  onEnterStory?.(clue.clue_id);
                } else {
                  console.log('[ClueInboxPanel] ⏩ Continue story:', story.instance_id);
                  onClose?.();
                }
              }}
            >
              {isPlayingOther ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  正在进行其他故事
                </>
              ) : isNotStarted ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  进入故事
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  继续故事
                </>
              )}
            </Button>
            
            {/* 🔥 KISS方案：提示当前进行中的故事 */}
            {isPlayingOther && activeStory && (
              <div className="text-center text-amber-400 text-xs flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>当前正在进行：{activeStory.title}</span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}