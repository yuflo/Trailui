import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Users, 
  MessageSquare, 
  Target, 
  Heart, 
  Brain, 
  Clock, 
  MapPin,
  Send,
  X,
  CloudRain,
  Eye,
  Shield,
  Zap,
  AlertCircle,
  TrendingUp,
  Hash,
  Loader2,
  RefreshCw,
  Inbox,
  CheckCircle,
  Lock,
  Unlock,
  Play,
  TestTube2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { ScrollArea } from './components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Textarea } from './components/ui/textarea';
import { Separator } from './components/ui/separator';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

// 导入类型定义 - 使用新的类型系统
import type { NPCEntity, StoryConfig } from './types';

// 导入新的 Hook
import { useGameEngine } from './hooks';
import { getRapportColor } from './utils';

// 导入Service容器（用于线索提取和收件箱）
import { ServiceContainer } from './engine/services/ServiceContainer';

// 🔥 Phase 3: 导入新的引擎工具
import { ClueInitializer } from './engine/utils/ClueInitializer';
import { ClueService, StoryService } from './engine/services/business'; // 🔥 导入新的 Service（Phase 6）

// 导入主题选择器组件
import { ThemeSelector } from './components/ThemeSelector';

// 导入新的UI组件（方案B重构）
import { NarrativeView } from './components/NarrativeView';
import { InteractionView } from './components/InteractionView';
import { EmptyStateView } from './components/EmptyStateView';
import { ClueInboxPanel } from './components/ClueInboxPanel'; // 🔥 Phase 3: 新的线索收件箱组件
import { TestPanel } from './components/test/TestPanel'; // 🔥 Phase 5: 测试面板

// ==================== 动画变量 ====================
// 页面加载瀑布流动画
const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  })
};

// ==================== 主组件 ====================
export default function App() {
  // 使用新的游戏引擎 Hook
  const {
    gameState,
    currentScenario,
    behaviorHistory,
    tickerMessages,
    isProcessing,
    statDeltas,
    rapportDeltas,
    // 近场叙事状态（新增）
    displayedPlotUnits,
    // 叙事线索状态和方法（新增）
    narrativeClues,
    refreshNarrativeClues,
    // 世界信息流操作（新增）
    refreshTicker,
    // ========== Phase 6 新增：线索驱动的故事系统 ==========
    trackedStories,
    sessionState,
    activeStory,
    trackClue,
    enterStory,
    exitStory,
    getTrackedStories,
    getActiveStory,
    // ========== Phase X 新增：独立玩家状态 ==========
    playerStatus,
    updatePlayerVigor,
    updatePlayerClarity,
    updatePlayerLocation,
    updatePlayerTime,
    // ========== 现有方法 ==========
    getAllStories,
    startGame,
    submitAction,
    switchStory,
    handlePass,
    handleIntervention,
    // ========== Phase X 新增：近场交互操作 ==========
    enterNearField,
  } = useGameEngine();
  
  // 从 gameState 解构近场交互标识
  const { nearfield_active } = gameState;
  
  // UI 状态
  const [intentText, setIntentText] = useState('');
  const [stories, setStories] = useState<StoryConfig[]>([]);
  const [currentStoryId, setCurrentStoryId] = useState<string>('demo-story');  // ✨ 使用统一的demo-story
  const [selectedNpc, setSelectedNpc] = useState<NPCEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClueIndex, setSelectedClueIndex] = useState<number>(0);
  const [isClueDrawerOpen, setIsClueDrawerOpen] = useState(false);
  const behaviorStreamRef = useRef<HTMLDivElement>(null);
  
  // 线索系统状态（新增）
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isMessageDetailOpen, setIsMessageDetailOpen] = useState(false);
  const [extractedClues, setExtractedClues] = useState<any[]>([]);
  const [isExtractingClue, setIsExtractingClue] = useState(false);
  const [isTrackingClue, setIsTrackingClue] = useState(false);
  const [trackingClueId, setTrackingClueId] = useState<string | null>(null);
  const [trackedStoriesMap, setTrackedStoriesMap] = useState<Map<string, any>>(new Map()); // 追踪的故事数据包缓存（clue_id -> TrackedStoryData）

  // 打字机效果状态
  const [displayedSceneSetting, setDisplayedSceneSetting] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 交互反馈状态
  const [clickedVerbIndex, setClickedVerbIndex] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 🔥 Phase 5: 开发者模式
  const [isDevMode, setIsDevMode] = useState(false);

  // ========== 方案B重构：计算自由镜显示模式（简化版 + 交互分离）==========
  const freeMirrorMode = useMemo(() => {
    const { nearfield } = gameState;
    
    console.log('==========================================');
    console.log('[App] 🎯 Computing freeMirrorMode:');
    console.log('  - nearfield.active:', nearfield.active);
    console.log('  - nearfield.mode:', nearfield.mode);
    console.log('  - nearfield.displayIndex:', nearfield.displayIndex);
    console.log('  - nearfield.narrativeSequence.length:', nearfield.narrativeSequence.length);
    console.log('  - nearfield.interactionEvents.length:', nearfield.interactionEvents?.length || 0);
    console.log('  - sessionState:', sessionState);
    
    // 1. 未进入故事或近场未激活
    if (!nearfield.active || sessionState !== 'playing') {
      console.log('[App] ❌ Condition 1 failed!');
      console.log('  - nearfield.active:', nearfield.active);
      console.log('  - sessionState:', sessionState);
      console.log('  → freeMirrorMode = idle');
      console.log('==========================================');
      return 'idle';
    }
    
    // 2. ✅ 交互模式：玩家正在与NPC对话
    if (nearfield.mode === 'INTERACTION') {
      console.log('[App] ✅ Condition 2 matched!');
      console.log('  → freeMirrorMode = INTERACTION');
      console.log('  → Will display InteractionView with', nearfield.interactionEvents?.length || 0, 'events');
      console.log('==========================================');
      return 'interaction';
    }
    
    // 3. ✅ 叙事模式：播放叙事或介入点
    if (nearfield.mode === 'PLAYING' || nearfield.mode === 'INTERVENTION') {
      console.log('[App] ✅ Condition 3 matched!');
      console.log('  → freeMirrorMode = NARRATIVE');
      console.log('==========================================');
      return 'narrative';
    }
    
    // 4. 默认：idle
    console.log('[App] ⚠️ No condition matched, defaulting to idle');
    console.log('==========================================');
    console.log('[App] freeMirrorMode = idle (fallback)');
    return 'idle';
  }, [gameState.nearfield, sessionState]);

  // ========== 🔍 调试：监听 extractedClues 变化 ==========
  useEffect(() => {
    console.log('[App.extractedClues] 📊 State changed:', {
      count: extractedClues.length,
      clueIds: extractedClues.map(c => c.clue_id),
      titles: extractedClues.map(c => c.title),
      stackTrace: new Error().stack
    });
  }, [extractedClues]);
  
  // ========== Phase 6：仅加载线索收件箱，不自动启动游戏 ==========
  // 🔥 Phase 3: 使用ClueInitializer初始化新架构数据
  // ⚠️ 注意：必须在 GameEngine 初始化完成后执行（等待 trackedStories 不为 null）
  useEffect(() => {
    // 等待 GameEngine 初始化完成（trackedStories 从 undefined 变为数组）
    if (trackedStories === undefined) {
      console.log('[App.initClues] ⏸️ Waiting for GameEngine initialization...');
      return; // GameEngine 还未初始化
    }
    
    console.log('[App.initClues] 🚀 GameEngine initialized, starting clue initialization...');
    
    const initClues = async () => {
      try {
        // 1. 添加Demo线索（已禁用 - 用户应从空收件箱开始）
        console.log('[App.initClues] Step 1: Skipping demo clues (user starts with empty inbox)');
        // ClueInitializer.addDemoClues(); // ← 注释掉，不再默认添加线索
        
        // 2. 初始化线索收件箱（迁移旧数据）
        console.log('[App.initClues] Step 2: Initializing clue inbox...');
        ClueInitializer.initializeClueInbox('demo-player');
        
        // 3. 旧系统兼容（保留）
        console.log('[App.initClues] Step 3: Loading clue inbox (legacy)...');
        await loadClueInbox();
        
        console.log('[App] ✅ Clue inbox initialized (new architecture)');
      } catch (error) {
        console.error('[App] Failed to load clue inbox:', error);
      }
    };
    
    initClues();
  }, [trackedStories]); // 依赖 trackedStories，确保在 GameEngine 初始化后执行
  
  // ========== 🆕 监听 trackedStories 变化，自动刷新收件箱中的故事数据 ==========
  useEffect(() => {
    if (!trackedStories || trackedStories.length === 0) return;
    
    console.log('[App] 📢 trackedStories updated, refreshing tracked stories map');
    
    const refreshStoriesMap = async () => {
      const newStoriesMap = new Map<string, any>();
      
      for (const story of trackedStories) {
        // trackedStories 已经包含完整的故事数据
        newStoriesMap.set(story.entry_clue_id, story);
        console.log(`[App] 🔄 Updated story data: ${story.entry_clue_id}, status: ${story.status}`);
      }
      
      setTrackedStoriesMap(newStoriesMap);
      console.log(`[App] ✅ Refreshed ${newStoriesMap.size} tracked stories in UI`);
    };
    
    refreshStoriesMap();
  }, [trackedStories]);

  // 打字机效果
  useEffect(() => {
    if (!currentScenario) return;
    
    const text = currentScenario.dynamic_view.scene_setting;
    setIsTyping(true);
    setDisplayedSceneSetting('');
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedSceneSetting(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentScenario?.dynamic_view.scene_setting]);

  // 自动滚动行为流
  useEffect(() => {
    if (behaviorStreamRef.current) {
      behaviorStreamRef.current.scrollTop = behaviorStreamRef.current.scrollHeight;
    }
  }, [behaviorHistory]);

  // 视觉原型由引擎自动应用，无需手动处理

  // 主题切换处理
  const handleThemeChange = async (storyId: string) => {
    setIsTransitioning(true);
    
    setTimeout(async () => {
      try {
        await switchStory(storyId);
        setCurrentStoryId(storyId);
        setIntentText('');
        setSelectedNpc(null);
        setIsModalOpen(false);
        setDisplayedSceneSetting('');
        
        setTimeout(() => setIsTransitioning(false), 50);
      } catch (error) {
        console.error('Failed to switch story:', error);
        setIsTransitioning(false);
      }
    }, 300);
  };

  // 发送意图（介入）
  const sendIntent = async () => {
    if (intentText.trim() === '' || isProcessing) return;

    try {
      // ✅ 检查是否在近场交互模式（介入点或交互中 - 简化版）
      if (gameState.nearfield.mode === 'INTERVENTION' ||
          gameState.nearfield.mode === 'INTERACTION') {
        // 近场交互：介入或继续交互
        await handleIntervention(intentText);
      } else {
        // 正常的冲突模式交互（旧系统）
        await submitAction(intentText);
      }
      
      setIntentText('');
      setIsFocused(false);  // 关闭输入框
      
      // 发送成功闪光
      setJustSent(true);
      setTimeout(() => setJustSent(false), 500);
    } catch (error) {
      console.error('Failed to submit action:', error);
    }
  };

  // 快��动词点击（Phase 3 - 带涟漪反馈）
  const handleVerbClick = (description: string, index: number) => {
    setIntentText(prev => prev ? `${prev} ${description}` : description);
    
    // 触发涟漪动画
    setClickedVerbIndex(index);
    setTimeout(() => setClickedVerbIndex(null), 400);
    
    // 聚焦输入框并添加脉冲
    setIsFocused(true);
  };

  // 辅助函数：为 ticker 消息添��������标
  const getTickerMessageIcon = (type: string) => {
    switch(type) {
      case '社交': return <MessageSquare className="w-3.5 h-3.5" />;
      case '媒体': return <TrendingUp className="w-3.5 h-3.5" />;
      case '传闻': return <Users className="w-3.5 h-3.5" />;
      default: return <Radio className="w-3.5 h-3.5" />;
    }
  };
  
  // 处理点击消息
  const handleMessageClick = (msg: any) => {
    console.log('[UI] Message clicked:', msg);
    setSelectedMessage(msg);
    setIsMessageDetailOpen(true);
  };
  
  // 检查线索是否已提取
  const isClueExtracted = (clueId: string): boolean => {
    const result = extractedClues.some(clue => clue.clue_id === clueId);
    console.log('[isClueExtracted] 🔍 Checking clue:', {
      clueId,
      extractedCluesCount: extractedClues.length,
      extractedClueIds: extractedClues.map(c => c.clue_id),
      isExtracted: result
    });
    return result;
  };
  
  // 提取线索
  const handleExtractClue = async () => {
    console.log('[handleExtractClue] 🎯 Starting extraction...', {
      selectedMessage,
      hasMessage: !!selectedMessage,
      hasClueId: !!selectedMessage?.extractable_clue_id,
      clueId: selectedMessage?.extractable_clue_id
    });
    
    if (!selectedMessage || !selectedMessage.extractable_clue_id) return;
    
    // 检查是否已提取
    if (isClueExtracted(selectedMessage.extractable_clue_id)) {
      console.log('[handleExtractClue] ⚠️ Clue already extracted, showing toast');
      toast.info('此线索已在收件箱中', {
        description: '请打开线索收件箱查看详情'
      });
      return;
    }
    
    setIsExtractingClue(true);
    console.log('[handleExtractClue] 📡 Calling ClueService.extractClue()...');
    
    try {
      const clueService = ServiceContainer.getInstance().getClueService();
      const clue = await clueService.extractClue(
        selectedMessage.message_id,
        selectedMessage.extractable_clue_id
      );
      
      console.log('[handleExtractClue] ✅ ClueService returned:', clue);
      console.log('[handleExtractClue] 📝 Current extractedClues before update:', extractedClues.map(c => c.clue_id));
      
      // 更��提取的线索列表
      setExtractedClues(prev => {
        const newList = [...prev, clue];
        console.log('[handleExtractClue] 📝 Updated extractedClues:', newList.map(c => c.clue_id));
        return newList;
      });
      
      // 🔥 方案1：提取后立即刷新收件箱状态（无需打开即可更新）
      console.log('[handleExtractClue] 🔄 Refreshing inbox after extraction...');
      await loadClueInbox();
      
      // 显示成功提示
      toast.success('线索提取成功', {
        description: `「${clue.title}」已加入收件箱`
      });
      
      // 不关闭弹窗，让玩家自己操作
      // setIsMessageDetailOpen(false); // ← 移除
    } catch (error) {
      console.error('[UI] Failed to extract clue:', error);
      toast.error('线索提取失败', {
        description: '请稍后重试'
      });
    } finally {
      setIsExtractingClue(false);
    }
  };
  
  // ========== Phase 6：使用新的 trackClue Hook ==========
  const handleTrackClue = async (clueId: string) => {
    setIsTrackingClue(true);
    setTrackingClueId(clueId);
    
    try {
      const storyData = await trackClue(clueId);
      
      console.log('[UI] Tracking clue, opening story:', storyData);
      
      // 更新extractedClues中对应线索的状态
      setExtractedClues(prev => prev.map(clue => 
        clue.clue_id === clueId ? { ...clue, status: 'tracking' } : clue
      ));
      
      // 🔥 追踪后刷新收件箱状态（确保badge计数更新）
      console.log('[handleTrackClue] 🔄 Refreshing inbox after tracking...');
      await loadClueInbox();
      
      // 显示成功提示
      toast.success('追踪开启成功', {
        description: `故事「${storyData.title}」已就绪`
      });
    } catch (error) {
      console.error('[UI] Failed to track clue:', error);
      toast.error('追踪失败', {
        description: '请稍后重试'
      });
    } finally {
      setIsTrackingClue(false);
      setTrackingClueId(null);
    }
  };
  
  // ========== Phase 6 新增：进入故事 ==========
  const handleEnterStory = async (clueId: string) => {
    console.log('[App] handleEnterStory called with clueId:', clueId);
    try {
      await enterStory(clueId);
      
      console.log('[App] enterStory completed, checking state:', {
        sessionState,
        nearfield_active,
        current_narrative_sequence: gameState.current_narrative_sequence
      });
      
      // 关闭收件箱
      setIsClueDrawerOpen(false);
      
      toast.success('进入故事成功', {
        description: '开始你的冒险'
      });
    } catch (error) {
      console.error('[UI] Failed to enter story:', error);
      toast.error('进入故事失败', {
        description: '请稍后重试'
      });
    }
  };
  

  // 加载线索收件箱
  const loadClueInbox = async () => {
    console.log('[loadClueInbox] 🔄 Starting to load clue inbox... (Called by:', new Error().stack?.split('\n')[2]?.trim() || 'unknown', ')');
    try {
      // 🔥 改用新的 ClueService.getPlayerClues()，它从 InstanceCacheManager 读取数据
      console.log('[loadClueInbox] 📡 Calling ClueService.getPlayerClues()...');
      
      const inbox = ClueService.getPlayerClues();
      
      console.log('[loadClueInbox] ✅ ClueService returned:', inbox);
      console.log('[loadClueInbox] 📊 Inbox stats:', {
        totalClues: inbox.length,
        clueIds: inbox.map(c => c.clue_id),
        clueTitles: inbox.map(c => c.title),
        clueStatuses: inbox.map(c => c.status)
      });
      
      setExtractedClues(inbox);
      
      console.log('[loadClueInbox] 📝 Set extractedClues state to:', inbox.length, 'clues');
      console.log('[loadClueInbox] 🔍 Clue inbox details:', inbox.map(c => ({ 
        id: c.clue_id, 
        title: c.title, 
        status: c.status 
      })));
      
      // ✨ 为所有已追踪的线索加载故事数据（从StoryService获取）
      const trackedClues = inbox.filter(clue => clue.status === 'tracking' || clue.status === 'tracked');
      if (trackedClues.length > 0) {
        const newStoriesMap = new Map<string, any>();
        
        for (const clue of trackedClues) {
          try {
            // ✅ 修复：应该获取已存在的故事实例，而不是重新追踪
            if (clue.story_instance_id) {
              const storyInstance = StoryService.getStoryInstance(clue.story_instance_id);
              if (storyInstance) {
                newStoriesMap.set(clue.clue_id, storyInstance);
                console.log(`[UI] Loaded story data for tracked clue: ${clue.clue_id}`);
              }
            }
          } catch (error) {
            console.warn(`[UI] Failed to load story data for clue ${clue.clue_id}:`, error);
          }
        }
        
        setTrackedStoriesMap(newStoriesMap);
        console.log(`[UI] Loaded ${newStoriesMap.size} tracked story data packages`);
      }
    } catch (error) {
      console.error('[UI] Failed to load clue inbox:', error);
    }
  };
  
  // 初始化时加载线索收件箱
  useEffect(() => {
    loadClueInbox();
  }, []);

  // ========== Phase 6：修改加载逻辑，只在处理中显示加载 ==========
  // 不再依赖 currentScenario，因为空状态也是合法状态
  
  const focusNpc = currentScenario?.dynamic_view.involved_entities[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-4 relative overflow-hidden">
      {/* 背景网格效果 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      {/* 顶部导航栏 */}
      <div className="relative z-20 max-w-screen-2xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-slate-950/80 backdrop-blur-xl border-2 border-cyan-900/50 rounded px-6 py-3 shadow-lg shadow-cyan-500/20 comic-outline">
          <div className="flex items-center gap-3">
            <motion.div 
              className="text-3xl tracking-wider text-[#00d4ff] comic-text neon-glow" 
              style={{ fontFamily: 'var(--font-comic)' }}
              animate={{
                textShadow: [
                  '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.5)',
                  '0 0 20px rgba(0, 212, 255, 1), 0 0 40px rgba(0, 212, 255, 0.7)',
                  '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              DREAMHEART
            </motion.div>
            <Badge variant="outline" className="text-xs border-2 border-cyan-800/70 text-cyan-300 bg-cyan-950/30">
              ��擎演示
            </Badge>
          </div>
          {/* ========== Phase 6：显示当前故事（只读，无选择器） ========== */}
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className="text-sm border-2 border-cyan-800/70 text-cyan-300 bg-cyan-950/30 px-4 py-1.5"
            >
              {sessionState === 'playing' && activeStory ? (
                <>
                  <span className="mr-2">📖</span>
                  <span>{activeStory.title}</span>
                </>
              ) : sessionState === 'ready' ? (
                <span className="text-yellow-400">已追踪 {trackedStories.length} 个故事</span>
              ) : (
                <span className="text-gray-500">未启动故事</span>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* 雨滴效果 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-8 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
            initial={{ top: '-10%', left: `${Math.random() * 100}%` }}
            animate={{ top: '110%' }}
            transition={{
              duration: 1 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <motion.div 
        className="grid grid-cols-12 gap-4 max-w-screen-2xl mx-auto h-[calc(95vh-5rem)] relative z-10"
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* ========== 左栏：���界感知区 ========== */}
        <motion.div 
          className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={columnVariants}
        >
          {/* 场景氛围 */}
          {currentScenario && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-black/50 comic-outline halftone-bg">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-white">{currentScenario.player_status_area.current_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{currentScenario.player_status_area.world_time.split(' - ')[0]}</span>
                    </div>
                  </div>
                  <Separator className="bg-slate-700/50" />
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <CloudRain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed">{currentScenario.broadcast_area.ambient_channel[0]?.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 世界信息流 - 自适应高度 */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/20 flex-1 min-h-0 flex flex-col comic-outline halftone-bg scanline-overlay">
            <CardHeader className="pb-2 flex-shrink-0 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2 enhanced-title">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <Radio className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    世界信息流
                  </CardTitle>
                  {/* 在线信号指示器 */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ 
                        opacity: [1, 0.3, 1],
                        scale: [1, 0.8, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="text-xs text-purple-300">LIVE</span>
                  </div>
                </div>
                {/* 手动刷新按钮 */}
                <motion.button
                  onClick={refreshTicker}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="p-1.5 rounded hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-colors border border-transparent hover:border-purple-500/30"
                  title="刷新频道"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
              <ScrollArea className="h-full px-3 py-3">
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {tickerMessages.map((msg, idx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 300, 
                          damping: 25,
                          delay: idx * 0.05
                        }}
                        className="group"
                      >
                        <div 
                          onClick={() => handleMessageClick(msg)}
                          className="relative p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/40 transition-all hover:bg-slate-800/60 overflow-hidden cursor-pointer"
                        >
                          {/* 广播扫描线效果 */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/5 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{
                              repeat: Infinity,
                              duration: 3,
                              delay: idx * 0.5,
                              ease: 'linear'
                            }}
                          />
                          
                          <div className="relative z-10">
                            {/* 频道标签 - 更紧凑 */}
                            <div className="flex items-center gap-1.5 mb-1">
                              <Badge 
                                variant="outline" 
                                className={`${msg.color} border text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5`}
                              >
                                <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                                {msg.type}
                              </Badge>
                              {/* 线索指示器 */}
                              {msg.extractable_clue_id && (
                                <Badge 
                                  variant="outline" 
                                  className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5"
                                >
                                  <Target className="w-2.5 h-2.5" />
                                  线索
                                </Badge>
                              )}
                            </div>
                            {/* 广播内容 */}
                            <p className="text-[11px] text-gray-300 leading-snug">
                              {msg.text}
                            </p>
                            {/* 已提取提示 */}
                            {msg.extractable_clue_id && isClueExtracted(msg.extractable_clue_id) && (
                              <div className="mt-1.5 flex items-center gap-1">
                                <Badge 
                                  variant="outline" 
                                  className="bg-green-500/20 text-green-300 border-green-500/50 text-[9px] px-1.5 py-0 h-4"
                                >
                                  已提取
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>


        </motion.div>

        {/* ========== 中栏：交互分镜区 ========== */}
        <motion.div 
          className="col-span-12 lg:col-span-6 flex flex-col gap-4 h-full overflow-hidden"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={columnVariants}
        >
          {/* 场景与行为流 */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-black/50 flex-grow flex flex-col min-h-0 comic-outline halftone-bg scanline-overlay">
            <CardHeader className="flex-shrink-0 border-b border-slate-700/50 pb-3">
              <CardTitle className="flex items-center gap-2 enhanced-title">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Eye className="w-5 h-5 text-cyan-400" />
                </motion.div>
                自由镜
                <Badge variant="outline" className="ml-auto text-xs border-cyan-800/50 text-cyan-300">
                  交互分镜区
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-full min-h-0 flex-grow">
              {/* ========== 方案B重构：基于 freeMirrorMode 的清晰条件渲染 ========== */}
              
              {/* 空状态 */}
              {freeMirrorMode === 'idle' && (
                <EmptyStateView 
                  sessionState={sessionState}
                  onOpenClueInbox={() => setIsClueDrawerOpen(true)}
                />
              )}

              {/* 近场叙事模式（简化版）*/}
              {freeMirrorMode === 'narrative' && (
                <NarrativeView 
                  narrativeSequence={gameState.nearfield.narrativeSequence}
                  displayIndex={gameState.nearfield.displayIndex}
                />
              )}

              {/* 交互模式 */}
              {freeMirrorMode === 'interaction' && (
                <InteractionView 
                  interactionEvents={gameState.nearfield.interactionEvents}
                  sceneSetting={displayedSceneSetting}
                  isTyping={isTyping}
                />
              )}
            </CardContent>
          </Card>

          {/* 意图输入栏 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-shrink-0"
          >
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-black/50 comic-outline halftone-bg">
              <CardContent className="p-4 space-y-3">
                {/* 基于 nearfield.mode 的条件渲染（简化版）*/}
                {gameState.nearfield.mode === 'INTERVENTION' ? (
                  // 介入时机点：显示"路过"/"介入"选项
                  <div className="space-y-3">
                    <div className="text-center py-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 font-semibold">遇到介入时机点</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePass}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1 border-2 border-gray-500 hover:border-gray-400 hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        路过
                      </Button>
                      
                      <Button
                        onClick={() => setIsFocused(true)}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        介入
                      </Button>
                    </div>
                    
                    <AnimatePresence>
                      {isFocused && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Textarea
                            value={intentText}
                            onChange={(e) => setIntentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                                e.preventDefault();
                                sendIntent();
                              }
                            }}
                            placeholder="输入你的行动..."
                            className="min-h-[80px] bg-slate-800/50 border-slate-600 focus:border-cyan-400 resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={sendIntent}
                              disabled={isProcessing || intentText.trim() === ''}
                              className="flex-1"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  处理中...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  发送
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setIsFocused(false);
                                setIntentText('');
                              }}
                              variant="outline"
                            >
                              取消
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : gameState.nearfield.mode === 'INTERACTION' ? (
                  // 交互模式：显示简洁输入框
                  <div className="space-y-2">
                    <Textarea
                      value={intentText}
                      onChange={(e) => setIntentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                          e.preventDefault();
                          sendIntent();
                        }
                      }}
                      placeholder="输入你的行动..."
                      className="min-h-[80px] bg-slate-800/50 border-slate-600 focus:border-cyan-400 resize-none"
                      autoFocus
                    />
                    <Button
                      onClick={sendIntent}
                      disabled={isProcessing || intentText.trim() === ''}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          执行
                        </>
                      )}
                    </Button>
                  </div>
                ) : freeMirrorMode === 'narrative' ? (
                  <div className="text-center py-8 text-gray-500">
                    <Play className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p>叙事播放中...</p>
                  </div>
                ) : freeMirrorMode === 'idle' ? (
                  // 剧情���停：显示介入时机点交互
                  <div className="text-center py-8 text-gray-500">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>未进入故事</p>
                  </div>
                ) : (
                  // 冲突交互模式：显示完整交互区
                  <>

                    {/* 上下文动词 */}
                    {currentScenario && (
                      <div className="flex flex-wrap gap-2">
                        {currentScenario.dynamic_view.available_player_behaviors.map((verb, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerbClick(verb.description, idx)}
                        className="bg-slate-800/50 border-2 border-slate-600 hover:bg-slate-700 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all text-[11px] transform hover:skew-x-[-2deg] cursor-pointer"
                      >
                        {verb.description}
                      </Button>
                      {/* 涟漪效果 */}
                      <AnimatePresence>
                        {clickedVerbIndex === idx && (
                          <motion.div
                            className="absolute inset-0 rounded border-2 border-cyan-400 pointer-events-none"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                          />
                        )}
                        </AnimatePresence>
                      </motion.div>
                      ))}
                      </div>
                    )}

                {/* 意图画布 */}
                <div className="relative">
                  <motion.div
                    initial={false}
                    animate={{
                      boxShadow: isFocused
                        ? '0 0 20px rgba(6, 182, 212, 0.5)'
                        : '0 0 0px rgba(6, 182, 212, 0)'
                    }}
                    transition={{ duration: 0.3 }}
                    className="rounded"
                  >
                    <Textarea
                      value={intentText}
                      onChange={(e) => setIntentText(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendIntent();
                        }
                      }}
                      placeholder="输入你的意图 (例如: [愤怒地] 质问他 //他撒���了//)"
                      className="min-h-[80px] pr-24 bg-slate-800/50 border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/50 text-gray-100 placeholder:text-gray-500 resize-none transition-all"
                      disabled={isProcessing}
                    />
                  </motion.div>
                  
                  {/* 发送按钮 - 带状态动画 */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {!isProcessing && intentText.trim() && (
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(6, 182, 212, 0.3)',
                            '0 0 20px rgba(6, 182, 212, 0.6)',
                            '0 0 10px rgba(6, 182, 212, 0.3)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="rounded"
                      >
                        <Button
                          onClick={sendIntent}
                          className="bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-bold transition-all border-2 border-black relative overflow-hidden"
                        >
                          <span className="flex items-center gap-2 relative z-10">
                            <Send className="w-4 h-4 animate-pulse" />
                            执行
                          </span>
                          {/* 发送成功闪光 */}
                          <AnimatePresence>
                            {justSent && (
                              <motion.div
                                className="absolute inset-0 bg-white/40 pointer-events-none"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                              />
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    )}
                    {!isProcessing && !intentText.trim() && (
                      <Button
                        disabled
                        className="bg-[#00d4ff]/30 text-black/50 font-bold cursor-not-allowed border-2 border-black/30"
                      >
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          执行
                        </span>
                      </Button>
                    )}
                    {isProcessing && (
                      <Button
                        disabled
                        className="bg-slate-700 text-white font-bold cursor-wait border-2 border-slate-600"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          思考中
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ========== 右栏：状态与���点 ========== */}
        <motion.div 
          className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={columnVariants}
        >
          {/* 玩家数值 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-black/50 comic-outline halftone-bg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg enhanced-title">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Heart className="w-5 h-5 text-red-400" />
                  </motion.div>
                  玩家数值
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* ========== Phase X：使用独立的 playerStatus（在所有会话状态下都显示）========== */}
                {playerStatus ? (
                  <>
                {/* 数值网格 - 2x2紧凑布局 */}
                <div className="grid grid-cols-2 gap-2">
                  {/* 体力 */}
                  <motion.div 
                    className="relative p-2.5 bg-slate-800/50 rounded border-2 border-green-500/30 shadow-[0_0_10px_rgba(57,255,20,0.1)] overflow-hidden"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(57,255,20,0.5)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-[#39ff14]" />
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-400 leading-none">体力</div>
                        <div className="relative">
                          <motion.div
                            key={playerStatus.vigor.value}
                            initial={{ scale: 1.2, color: statDeltas.vigor && statDeltas.vigor > 0 ? '#10b981' : statDeltas.vigor && statDeltas.vigor < 0 ? '#ef4444' : '#39ff14' }}
                            animate={{ scale: 1, color: '#39ff14' }}
                            className="font-bold text-sm text-[#39ff14]"
                          >
                            {playerStatus.vigor.value}<span className="text-xs text-gray-500">/{playerStatus.vigor.max}</span>
                          </motion.div>
                          <AnimatePresence>
                            {statDeltas.vigor !== undefined && statDeltas.vigor !== 0 && (
                              <motion.span
                                className={`absolute -top-3 right-0 text-xs font-bold ${statDeltas.vigor > 0 ? 'text-green-400' : 'text-red-400'}`}
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: -3 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.5 }}
                              >
                                {statDeltas.vigor > 0 ? '+' : ''}{statDeltas.vigor}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={(playerStatus.vigor.value / playerStatus.vigor.max) * 100}
                      className="h-1.5 bg-slate-950"
                      indicatorClassName="bg-[#39ff14] shadow-[0_0_8px_#39ff14]"
                      shimmer
                    />
                  </motion.div>

                  {/* 心力 */}
                  <motion.div 
                    className="relative p-2.5 bg-slate-800/50 rounded border-2 border-blue-500/30 shadow-[0_0_10px_rgba(0,212,255,0.1)] overflow-hidden"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(0,212,255,0.5)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-5 h-5 text-[#00d4ff]" />
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-400 leading-none">心力</div>
                        <div className="relative">
                          <motion.div
                            key={playerStatus.clarity.value}
                            initial={{ scale: 1.2, color: statDeltas.clarity && statDeltas.clarity > 0 ? '#3b82f6' : statDeltas.clarity && statDeltas.clarity < 0 ? '#ef4444' : '#00d4ff' }}
                            animate={{ scale: 1, color: '#00d4ff' }}
                            className="font-bold text-sm text-[#00d4ff]"
                          >
                            {playerStatus.clarity.value}<span className="text-xs text-gray-500">/{playerStatus.clarity.max}</span>
                          </motion.div>
                          <AnimatePresence>
                            {statDeltas.clarity !== undefined && statDeltas.clarity !== 0 && (
                              <motion.span
                                className={`absolute -top-3 right-0 text-xs font-bold ${statDeltas.clarity > 0 ? 'text-green-400' : 'text-red-400'}`}
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: -3 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.5 }}
                              >
                                {statDeltas.clarity > 0 ? '+' : ''}{statDeltas.clarity}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={(playerStatus.clarity.value / playerStatus.clarity.max) * 100}
                      className="h-1.5 bg-slate-950"
                      indicatorClassName="bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]"
                      shimmer
                    />
                  </motion.div>

                  {/* 财力 */}
                  <motion.div 
                    className="p-2.5 bg-slate-800/50 rounded border-2 border-yellow-500/30 shadow-[0_0_10px_rgba(255,235,59,0.1)]"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(255,235,59,0.5)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 text-[#ffeb3b] flex items-center justify-center font-bold">¥</div>
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-400 leading-none">财力</div>
                        <div className="font-bold text-sm text-[#ffeb3b]">{playerStatus.financial_power}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* 信用 */}
                  <motion.div 
                    className="p-2.5 bg-slate-800/50 rounded border-2 border-cyan-500/30 shadow-[0_0_10px_rgba(0,212,255,0.1)]"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(0,212,255,0.5)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#00d4ff]" />
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-400 leading-none">信用</div>
                        <div className="font-bold text-sm text-[#00d4ff]">{playerStatus.credit.value}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* 状��效果 - 横向Badge布局 */}
                {playerStatus.active_effects.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[10px] text-gray-400 mb-1.5">状态</div>
                    <div className="flex flex-wrap gap-1.5">
                      <AnimatePresence>
                        {playerStatus.active_effects.map((effect, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            title={effect.description}
                          >
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-0.5 ${
                                effect.type === 'debuff'
                                  ? 'bg-red-900/30 border-red-500/50 text-red-300'
                                  : 'bg-green-900/30 border-green-500/50 text-green-300'
                              }`}
                            >
                              {effect.type === 'debuff' ? '⚠' : '✓'} {effect.name}
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                </>
                ) : (
                  // ========== 空状态：玩家数据未初始化 ==========
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">数据加载中...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 实体焦点 */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-black/50 flex-grow flex flex-col min-h-0 comic-outline halftone-bg scanline-overlay">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg enhanced-title">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Users className="w-5 h-5 text-purple-400" />
                </motion.div>
                实体焦点
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden min-h-0 p-4">
              {/* ========== Phase 6：条件渲染实体列表 ========== */}
              {currentScenario && focusNpc ? (
                <ScrollArea className="h-full">
                  <div className="space-y-2 pr-2">
                    {currentScenario.dynamic_view.involved_entities.map((npc, idx) => {
                    const isFocus = idx === 0;
                    
                    // 关系值颜色映射
                    const getRapportColorDot = (sentiment: string) => {
                      if (sentiment === '友好' || sentiment === '信任') return 'bg-green-400';
                      if (sentiment === '敌对' || sentiment === '愤怒') return 'bg-red-400';
                      if (sentiment === '紧张' || sentiment === '警惕') return 'bg-yellow-400';
                      return 'bg-gray-400';
                    };
                    
                    const getRapportGradient = (sentiment: string) => {
                      if (sentiment === '友好' || sentiment === '信任') return 'from-green-500 to-emerald-400';
                      if (sentiment === '敌对' || sentiment === '愤怒') return 'from-red-500 to-rose-400';
                      if (sentiment === '紧张' || sentiment === '警惕') return 'from-yellow-500 to-orange-400';
                      return 'from-gray-500 to-slate-400';
                    };
                    
                    const getRapportColor = (sentiment: string, intensity: number) => {
                      if (sentiment === '友好' || sentiment === '信任') return 'text-green-400';
                      if (sentiment === '敌对' || sentiment === '愤怒') return 'text-red-400';
                      if (sentiment === '紧张' || sentiment === '警惕') return 'text-yellow-400';
                      return 'text-gray-400';
                    };
                    
                    // 心防百分比 (假设最大100)
                    const composureValue = parseInt(npc.composure?.match(/\d+/)?.[0] || '50');
                    const composurePercent = composureValue;
                    
                    return (
                      <motion.div
                        key={npc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        whileHover={{ scale: isFocus ? 1.01 : 1.005 }}
                        onClick={() => {
                          setSelectedNpc(npc);
                          setIsModalOpen(true);
                        }}
                        className={`
                          relative rounded cursor-pointer transition-all overflow-hidden
                          ${isFocus 
                            ? 'p-3 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-cyan-500/60 hover:border-cyan-400 shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                            : 'px-3 py-2 bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/40 hover:bg-slate-800/60'
                          }
                        `}
                      >
                        {isFocus ? (
                          // ========== 焦点NPC - 可视化仪表盘 ==========
                          <>
                            {/* 扫描框四角光点 */}
                            <motion.div 
                              className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-400"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div 
                              className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-cyan-400"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            />
                            <motion.div 
                              className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-cyan-400"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                            />
                            <motion.div 
                              className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-400"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                            />
                            
                            {/* 扫描线动画 */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none"
                              animate={{ y: ['-100%', '200%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />
                            
                            <div className="relative z-10">
                              {/* 顶部：名字 + 脉冲指示器 */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    className="w-2 h-2 rounded-full bg-cyan-400"
                                    animate={{ 
                                      scale: [1, 1.3, 1],
                                      opacity: [1, 0.5, 1]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                  <span className="font-semibold text-white text-sm">{npc.name}</span>
                                </div>
                                <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-[10px] px-1.5 py-0">
                                  TARGET
                                </Badge>
                              </div>
                              
                              {/* 状态摘要 */}
                              <div className="flex items-start gap-1.5 mb-2">
                                <Eye className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-300 leading-snug">{npc.status_summary}</p>
                              </div>
                              
                              {/* 数据可视化区 */}
                              <div className="space-y-2 mt-3">
                                {/* 关系值 - 渐变进度条 */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <Heart className={`w-3 h-3 ${getRapportColor(npc.rapport.sentiment, npc.rapport.intensity)}`} />
                                      <span className="text-[10px] text-gray-400">关系</span>
                                    </div>
                                    <span className={`text-xs font-medium ${getRapportColor(npc.rapport.sentiment, npc.rapport.intensity)}`}>
                                      {npc.rapport.sentiment}
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <motion.div
                                      className={`h-full bg-gradient-to-r ${getRapportGradient(npc.rapport.sentiment)} shadow-[0_0_8px_currentColor]`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${npc.rapport.intensity}%` }}
                                      transition={{ duration: 0.8, delay: 0.2 }}
                                    />
                                  </div>
                                </div>
                                
                                {/* 心防 - 环形进度 */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 text-blue-400" />
                                    <span className="text-[10px] text-gray-400">心防</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* 简化圆环（用渐变边框模拟） */}
                                    <div className="relative w-6 h-6">
                                      <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          fill="none"
                                          stroke="rgb(15, 23, 42)"
                                          strokeWidth="2"
                                        />
                                        <motion.circle
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          fill="none"
                                          stroke="url(#shieldGradient)"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeDasharray={`${2 * Math.PI * 10}`}
                                          initial={{ strokeDashoffset: 2 * Math.PI * 10 }}
                                          animate={{ strokeDashoffset: 2 * Math.PI * 10 * (1 - composurePercent / 100) }}
                                          transition={{ duration: 0.8, delay: 0.3 }}
                                        />
                                        <defs>
                                          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                          </linearGradient>
                                        </defs>
                                      </svg>
                                    </div>
                                    <span className="text-xs text-blue-300 font-medium">{composureValue}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          // ========== 其他NPC - 紧凑单行 ==========
                          <div className="flex items-center gap-2">
                            {/* 关系值着色圆点 */}
                            <motion.div
                              className={`w-2 h-2 rounded-full ${getRapportColorDot(npc.rapport.sentiment)} flex-shrink-0`}
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.8, 1, 0.8]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            
                            {/* 名字 */}
                            <span className="text-xs text-gray-300 font-medium flex-1">{npc.name}</span>
                            
                            {/* 微型状态图标 */}
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-gray-500" />
                              <Shield className="w-3 h-3 text-gray-500" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
              ) : (
                // ========== 空状态：未进入故事 ==========
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">未进入故事</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* NPC详情模态�� */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-cyan-500 border-3 shadow-2xl shadow-[0_0_40px_rgba(6,182,212,0.5)] max-w-lg comic-outline halftone-bg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2 enhanced-title">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Hash className="w-6 h-6 text-cyan-400" />
                </motion.div>
                {selectedNpc?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                查看实体的详细信息和已知线索
              </DialogDescription>
            </DialogHeader>
            
            {selectedNpc && (
              <div className="space-y-4 pt-2">
              <div>
                <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">已知背景摘要</div>
                <p className="text-gray-100 leading-relaxed">
                  {selectedNpc.id === 'NPC-001'
                    ? "你只知道她是你童年的邻居，几年前嫁给了一个商人，之后就很少联系了。"
                    : "你对他几乎一无所知。"}
                </p>
              </div>
              
              <Separator className="bg-slate-600/70" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">当前状态</div>
                  <p className="text-gray-100">{selectedNpc.status_summary}</p>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">心防 (Composure)</div>
                  <p className="text-gray-100">{selectedNpc.composure}</p>
                </div>
              </div>
              
              <div>
                <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">与你的关系 (Rapport)</div>
                <p className={getRapportColor(selectedNpc.rapport.sentiment, selectedNpc.rapport.intensity)}>
                  {selectedNpc.rapport.sentiment} ({selectedNpc.rapport.intensity})
                </p>
              </div>
              
              <div>
                <div className="text-xs uppercase text-gray-400 mb-2 font-semibold tracking-wider">已知线索</div>
                <ul className="space-y-1.5">
                  {selectedNpc.id === 'NPC-001' && behaviorHistory.length > 0 ? (
                    <>
                      <li className="text-xs text-gray-100 flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>她似乎在害怕某个他们。</span>
                      </li>
                      <li className="text-xs text-gray-100 flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>她对商人这个词反应异常。</span>
                      </li>
                    </>
                  ) : (
                    <li className="text-xs text-gray-400 italic">暂无线索</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* 消息详情弹窗 - 线索提取 */}
      <Dialog open={isMessageDetailOpen} onOpenChange={setIsMessageDetailOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-purple-500 border-3 shadow-2xl shadow-[0_0_40px_rgba(168,85,247,0.5)] max-w-lg comic-outline halftone-bg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2 enhanced-title">
                <Radio className="w-6 h-6 text-purple-400" />
                消息详情
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                查看消息内容和可提取的线索
              </DialogDescription>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-4 pt-4">
                {/* 消息信息 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`${selectedMessage.color} border text-xs px-2 py-1`}
                    >
                      {selectedMessage.type || selectedMessage.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {selectedMessage.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-100 leading-relaxed">
                    {selectedMessage.text}
                  </p>
                </div>
                
                <Separator className="bg-slate-600/70" />
                
                {/* 线索提取区 */}
                {selectedMessage.extractable_clue_id ? (
                  isClueExtracted(selectedMessage.extractable_clue_id) ? (
                    // 已提取状态
                    <div className="p-4 bg-green-900/20 rounded-lg border-2 border-green-500/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-green-300 mb-1">
                            线索已提取
                          </div>
                          <p className="text-xs text-green-200 leading-relaxed">
                            此线索已在你的收件箱中。打开收件箱查看详情并开始追踪。
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 可提取状态
                    <div className="space-y-3">
                      <div className="p-4 bg-yellow-900/20 rounded-lg border-2 border-yellow-500/30">
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-yellow-300 mb-1">
                              可提取线索
                            </div>
                            <p className="text-xs text-yellow-200 leading-relaxed">
                              此消息包含可以提取的线索信息。提取后将加入你的线索收件箱，可用于开启新的故事线。
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleExtractClue}
                        disabled={isExtractingClue}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-lg"
                      >
                        {isExtractingClue ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            提取中...
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            提取线索
                          </>
                        )}
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 leading-relaxed">
                          此消息不包含可提取的线索。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* 叙事线索 - 收件箱浮动按钮 */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.button
          onClick={() => {
            // 🔥 Phase 3: ClueInboxPanel内部已使用useClueInbox自动加载
            // loadClueInbox(); 
            setIsClueDrawerOpen(true);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-shadow"
        >
          <Inbox className="w-6 h-6 text-white" />
          {(() => {
            // 只计数在追踪中的线索（正在进行的故事）
            console.log('[ClueInbox Badge] 🔍 Calculating badge count:', {
              totalClues: extractedClues.length,
              cluesStatus: extractedClues.map(c => ({ id: c.clue_id, status: c.status })),
              trackingCount: extractedClues.filter(clue => clue.status === 'tracking').length,
              untrackedCount: extractedClues.filter(clue => clue.status === 'untracked').length,
              unreadCount: extractedClues.filter(clue => clue.status === 'unread').length,
              completedCount: extractedClues.filter(clue => clue.status === 'completed').length,
            });
            const trackingCount = extractedClues.filter(clue => clue.status === 'tracking').length;
            return trackingCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
              >
                {trackingCount}
              </motion.div>
            );
          })()}
        </motion.button>
      </motion.div>

      {/* 🔥 Phase 5: 开发者模式按钮 */}
      <motion.div
        className="fixed bottom-6 left-24 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsDevMode(!isDevMode)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-4 rounded-full shadow-2xl transition-all ${
            isDevMode 
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/50 hover:shadow-cyan-500/70' 
              : 'bg-gradient-to-br from-slate-700 to-slate-600 shadow-slate-500/30 hover:shadow-slate-500/50'
          }`}
        >
          <TestTube2 className="w-6 h-6 text-white" />
          {isDevMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            />
          )}
        </motion.button>
      </motion.div>

      {/* 线索收件箱 - 全屏沉浸式简报 */}
      {/* 🔥 Phase 3: 使用新的ClueInboxPanel组件 */}
      <ClueInboxPanel 
        open={isClueDrawerOpen}
        onOpenChange={setIsClueDrawerOpen}
        playerId="demo-player"
        onClueTracked={loadClueInbox} // 🔥 追踪线索后刷新 App 的 extractedClues 状态
        onEnterStory={handleEnterStory} // 🔥 进入故事回调
      />

      {/* 🔥 Phase 5: 开发者模式 - 测试面板 */}
      {isDevMode && (
        <div className="fixed bottom-24 left-6 right-6 z-50 max-w-4xl max-h-[70vh] overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <TestPanel />
          </motion.div>
        </div>
      )}
      
      {/* ========== 旧版本线索收件箱（保留作为备份，可删除）========== */}
      {false && <Dialog open={isClueDrawerOpen} onOpenChange={setIsClueDrawerOpen}>
        <DialogContent 
          className="w-[90vw] h-[85vh] max-w-7xl sm:max-w-7xl bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-xl border-yellow-500/50 p-0 comic-outline halftone-bg overflow-hidden flex flex-col"
        >
          <DialogHeader className="p-6 pb-4 border-b border-slate-700/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-2xl text-white enhanced-title">
              <Inbox className="w-6 h-6 text-yellow-400" />
              线索收件箱
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              共 {extractedClues.length} 条线索 · 点击线索追踪开启故事
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* 左侧：线索列表 */}
            <div className="w-1/3 border-r border-slate-700/50 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {extractedClues.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-xs">暂无线索</p>
                      <p className="text-[10px] mt-2">从世界信息流中提取线索</p>
                    </div>
                  ) : (
                    extractedClues.map((clue, idx) => (
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
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            trackedStoriesMap.get(clue.clue_id)?.status === 'completed' ? 'bg-blue-400' :
                            clue.status === 'tracking' ? 'bg-green-400' : 
                            clue.status === 'completed' ? 'bg-blue-400' : 
                            'bg-yellow-400'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium leading-snug mb-1 ${
                              selectedClueIndex === idx ? 'text-yellow-200' : 'text-gray-300'
                            }`}>
                              {clue.title}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] px-1.5 py-0 h-4 ${
                                trackedStoriesMap.get(clue.clue_id)?.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                                clue.status === 'tracking' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 
                                clue.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/50' : 
                                'bg-blue-500/20 text-blue-300 border-blue-500/50'
                              }`}
                            >
                              {trackedStoriesMap.get(clue.clue_id)?.status === 'completed' ? '已完成' :
                               clue.status === 'tracking' ? '追踪中' : 
                               clue.status === 'completed' ? '已完成' : 
                               '未追踪'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* 右侧：线索详情 */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {extractedClues.length > 0 && extractedClues[selectedClueIndex] ? (
                <motion.div
                  key={selectedClueIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="clue-detail-panel h-full flex flex-col"
                >
                  {(() => {
                    const currentClue = extractedClues[selectedClueIndex];
                    const trackedStory = trackedStoriesMap.get(currentClue.clue_id);
                    
                    // ========== ✅ 修复：使用 else if 链式判断，优先判断 currentClue.status ==========
                    
                    // 1. 未追踪状态：简洁展示
                    if (currentClue.status === 'untracked') {
                      return (
                        <div className="flex flex-col h-full p-4">
                          {/* 标题区 */}
                          <div className="mb-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-1">
                                <Target className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                <h3 className="text-white enhanced-title break-words">
                                  {currentClue.title}
                                </h3>
                              </div>
                              <Badge variant="outline" className="flex-shrink-0 bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                                未追踪
                              </Badge>
                            </div>
                            <div className="id-text text-gray-500 break-all">
                              ID: {currentClue.clue_id}
                            </div>
                          </div>

                          <Separator className="bg-slate-700/50 mb-3" />

                          {/* 线索摘要 */}
                          <div className="flex-1 overflow-auto">
                            <div className="section-label text-gray-400 mb-2">线索摘要</div>
                            <p className="text-gray-200 break-words mb-3">
                              {currentClue.summary}
                            </p>
                            
                            <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                              <div className="flex items-start gap-2">
                                <Eye className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="text-cyan-300 mb-1 break-words">
                                    追踪此线索
                                  </div>
                                  <p className="text-cyan-200 break-words opacity-90">
                                    追踪此线索将开启关联的故事线。你可以前往对应场景展开调查。
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 底部按钮 */}
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <Button
                              onClick={() => handleTrackClue(currentClue.clue_id)}
                              disabled={isTrackingClue && trackingClueId === currentClue.clue_id}
                              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg"
                            >
                              {isTrackingClue && trackingClueId === currentClue.clue_id ? (
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
                    
                    // ========== ✅ 2. 已完成状态（优先于追踪中状态判断）==========
                    else if (currentClue.status === 'completed') {
                      if (!trackedStory) {
                        // 已完成但数据缺失
                        return (
                          <div className="flex items-center justify-center h-full p-4">
                            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30 max-w-md">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-blue-300 mb-2">故事已完成</h4>
                                  <p className="text-blue-200 break-words">
                                    此线索的故事已完成。数据正在加载中...
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // 已完成且有数据（这里显示完成的故事信息）
                      return (
                        <div className="flex flex-col h-full">
                          {/* Header：故事标题 */}
                          <div className="p-4 pb-3 border-b border-slate-700/50">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div className="flex items-center gap-2 flex-1">
                                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <h3 className="text-white enhanced-title break-words">
                                  {trackedStory.title}
                                </h3>
                              </div>
                              <Badge variant="outline" className="flex-shrink-0 bg-blue-500/20 text-blue-300 border-blue-500/50">
                                已完成
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 ml-7">
                              <Target className="w-3 h-3" />
                              <span className="break-words">源于线索：{currentClue.title}</span>
                            </div>
                          </div>

                          {/* 中部：故事总结 + 完成场景 */}
                          <div className="flex-1 overflow-hidden grid grid-cols-[40%_1fr] gap-4 p-4">
                            {/* 左侧：故事总结 */}
                            <ScrollArea className="h-full">
                              <div className="pr-3">
                                <div className="section-label text-gray-400 mb-2">故事总结</div>
                                <div className="p-3 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30 mb-3">
                                  <p className="text-gray-200 break-words leading-relaxed">
                                    {trackedStory.description}
                                  </p>
                                </div>
                                
                                {trackedStory.completion_time && (
                                  <div className="p-2 bg-slate-800/50 rounded text-[10px] text-gray-400">
                                    完成时间：{new Date(trackedStory.completion_time).toLocaleString('zh-CN')}
                                  </div>
                                )}
                              </div>
                            </ScrollArea>

                            {/* 右侧：已完成的场景 */}
                            <ScrollArea className="h-full">
                              <div className="pr-2">
                                <div className="section-label text-gray-400 mb-3">完成的场景</div>
                                
                                <div className="relative space-y-1">
                                  {trackedStory.scene_sequence.map((scene: any, index: number) => {
                                    const isCompleted = trackedStory.progress?.completed_scenes?.includes(scene.scene_id) || scene.status === 'unlocked';
                                    
                                    return (
                                      <div key={scene.scene_id} className="relative">
                                        {/* 连接线 */}
                                        {index < trackedStory.scene_sequence.length - 1 && (
                                          <div 
                                            className="absolute left-[0.4375rem] top-8 w-0.5 h-10 bg-blue-500/30"
                                          />
                                        )}
                                        
                                        {/* 场景卡片 */}
                                        <div 
                                          className={`relative flex items-start gap-3 p-3 rounded-lg border ${
                                            isCompleted
                                              ? 'bg-blue-900/10 border-blue-500/30'
                                              : 'bg-gray-900/20 border-gray-600/20'
                                          }`}
                                        >
                                          {/* 完成图标 */}
                                          <div className="flex-shrink-0 mt-0.5">
                                            {isCompleted ? (
                                              <CheckCircle className="w-4 h-4 text-blue-400" />
                                            ) : (
                                              <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
                                            )}
                                          </div>

                                          {/* 场景信息 */}
                                          <div className="flex-1 min-w-0">
                                            <div className={`break-words ${
                                              isCompleted ? 'text-blue-300' : 'text-gray-400'
                                            }`}>
                                              {scene.title}
                                            </div>
                                            <div className="id-text text-gray-500 break-all mt-0.5">
                                              {scene.scene_id}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </ScrollArea>
                          </div>

                          {/* Footer：完成信息 */}
                          <div className="p-4 pt-3 border-t border-slate-700/50">
                            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30 text-center">
                              <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                              <p className="text-blue-300">
                                故事已完成
                              </p>
                              <p className="text-blue-200 opacity-80 mt-1">
                                感谢你完成这段旅程
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ========== 3. 追踪中状态 ==========
                    else if (currentClue.status === 'tracking' && trackedStory) {
                      // 🔍 调试：打印渲染时的场景路线图数据
                      console.log(`[App] 🎨 Rendering scene roadmap for "${trackedStory.title}":`, {
                        currentSceneIndex: trackedStory.progress?.current_scene_index,
                        completedScenes: trackedStory.progress?.completed_scenes,
                        sceneSequence: trackedStory.scene_sequence.map((s, i) => ({
                          index: i,
                          id: s.scene_id,
                          title: s.title,
                          status: s.status
                        }))
                      });
                      
                      return (
                        <div className="flex flex-col h-full">
                          {/* Header：故事标题 + 来源线索 */}
                          <div className="p-4 pb-3 border-b border-slate-700/50">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div className="flex items-center gap-2 flex-1">
                                <Target className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                <h3 className="text-white enhanced-title break-words">
                                  {trackedStory.title}
                                </h3>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`flex-shrink-0 ${
                                  trackedStory.status === 'completed' 
                                    ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                                }`}
                              >
                                {trackedStory.status === 'completed' ? '已完成' : '追踪中'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 ml-7">
                              <Target className="w-3 h-3" />
                              <span className="break-words">源于线索：{currentClue.title}</span>
                            </div>
                          </div>

                          {/* 中部：故事背景 + 场景路线图 */}
                          <div className="flex-1 overflow-hidden grid grid-cols-[40%_1fr] gap-4 p-4">
                            {/* 左侧：故事背景（沉浸式阅读区） */}
                            <ScrollArea className="h-full">
                              <div className="pr-3">
                                <div className="section-label text-gray-400 mb-2">故事背景</div>
                                <div className="p-3 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
                                  <p className="text-gray-200 break-words leading-relaxed">
                                    {trackedStory.description}
                                  </p>
                                </div>
                              </div>
                            </ScrollArea>

                            {/* 右侧：场景路线图（垂直步骤条） */}
                            <ScrollArea className="h-full">
                              <div className="pr-2">
                                <div className="section-label text-gray-400 mb-3">场景路线图</div>
                                
                                {/* 垂直步骤条 */}
                                <div className="relative space-y-1">
                                  {trackedStory.scene_sequence.map((scene: any, index: number) => {
                                    // ✅ 修复：使用 progress.current_scene_index 判断当前场景
                                    const isCurrent = index === trackedStory.progress?.current_scene_index;
                                    const isCompleted = trackedStory.progress?.completed_scenes?.includes(scene.scene_id) || false;
                                    const isUnlocked = scene.status === 'unlocked' || isCompleted || isCurrent;
                                    
                                    // 🔍 调试：打印每个场景的状态
                                    console.log(`[App] 🎨 Rendering scene [${index}] "${scene.title}":`, {
                                      scene_id: scene.scene_id,
                                      scene_status: scene.status,
                                      current_scene_index: trackedStory.progress?.current_scene_index,
                                      isCurrent,
                                      isCompleted,
                                      isUnlocked,
                                      completed_scenes: trackedStory.progress?.completed_scenes
                                    });
                                    
                                    return (
                                      <div key={scene.scene_id} className="relative">
                                        {/* 连接线（除了最后一个） */}
                                        {index < trackedStory.scene_sequence.length - 1 && (
                                          <div 
                                            className={`absolute left-[0.4375rem] top-8 w-0.5 h-10 ${
                                              isCompleted ? 'bg-green-500/50' : isUnlocked ? 'bg-green-500/30' : 'bg-gray-600/30'
                                            }`}
                                          />
                                        )}
                                        
                                        {/* 步骤卡片 */}
                                        <div 
                                          className={`relative flex items-start gap-3 p-3 rounded-lg border ${
                                            isCurrent
                                              ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
                                              : isCompleted
                                              ? 'bg-green-900/10 border-green-500/30'
                                              : isUnlocked
                                              ? 'bg-gray-800/20 border-gray-500/30'
                                              : 'bg-gray-900/20 border-gray-600/20'
                                          }`}
                                        >
                                          {/* 步骤图标 */}
                                          <div className="flex-shrink-0 mt-0.5">
                                            {isCompleted ? (
                                              <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : isCurrent ? (
                                              <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                              </div>
                                            ) : isUnlocked ? (
                                              <Unlock className="w-4 h-4 text-gray-400" />
                                            ) : (
                                              <Lock className="w-4 h-4 text-gray-500" />
                                            )}
                                          </div>

                                          {/* 场景信息 */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className={`break-words ${
                                                isCompleted 
                                                  ? 'text-green-400 line-through decoration-green-400/50' 
                                                  : isCurrent 
                                                  ? 'text-green-300' 
                                                  : isUnlocked 
                                                  ? 'text-gray-300' 
                                                  : 'text-gray-400'
                                              }`}>
                                                {scene.title}
                                              </div>
                                              {isCurrent && (
                                                <Badge variant="outline" className="flex-shrink-0 bg-green-500/20 text-green-300 border-green-500/50">
                                                  当前
                                                </Badge>
                                              )}
                                              {isCompleted && !isCurrent && (
                                                <Badge variant="outline" className="flex-shrink-0 bg-green-900/20 text-green-400 border-green-500/30">
                                                  ✓
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="id-text text-gray-500 break-all mt-0.5">
                                              {scene.scene_id}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </ScrollArea>
                          </div>

                          {/* Footer：行动入口 */}
                          <div className="p-4 pt-3 border-t border-slate-700/50">
                            <Button
                              onClick={() => handleEnterStory(currentClue.clue_id)}
                              disabled={trackedStory.status === 'completed'}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg h-11"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {trackedStory.status === 'completed' ? '故事已完成' : (trackedStory.entry_point_action?.label || '开启故事')}
                            </Button>
                            <div className="text-center mt-2 id-text text-gray-400">
                              → {trackedStory.entry_point_action?.target_scene_id || trackedStory.scene_sequence[0]?.scene_id}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ========== 4. 追踪中但无数据 ==========
                    else if (currentClue.status === 'tracking' && !trackedStory) {
                      return (
                        <div className="flex items-center justify-center h-full p-4">
                          <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30 max-w-md">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-green-300 mb-2">追踪中</h4>
                                <p className="text-green-200 break-words">
                                  你正在追踪此线索。继续游戏以推进故事进展。
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ========== 默认：无匹配状态 ==========
                    return null;
                  })()}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>选择左侧线索查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>}
      
      {/* Toast通知组件 */}
      <Toaster 
        position="top-right" 
        expand={false}
        richColors
        closeButton
      />
    </div>
  );
}
