/**
 * useGameEngine Hook
 * 
 * React Hook 封装 GameEngine
 * 提供响应式的游戏状态和操作方法
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from '../engine';
import type { 
  GameState, 
  TurnResult, 
  StoryConfig, 
  ScenarioSnapshot,
  StatDelta,
  RapportDelta,
  MirrorMode,
  PlotUnit,
  ScenePlot,
  NarrativeThread,
  TrackedStoryData,
  GameSessionState,
  ClueStatus,
  PlayerStatusArea,
} from '../types';
import type { ExtendedBehaviorItem, TickerMessageWithIcon } from '../engine/systems';
import { ServiceContainer } from '../engine/services/ServiceContainer';

/**
 * Hook 返回值
 */
export interface UseGameEngineReturn {
  // 状态
  gameState: GameState;
  currentScenario: ScenarioSnapshot | null;
  behaviorHistory: ExtendedBehaviorItem[];
  tickerMessages: TickerMessageWithIcon[];
  isProcessing: boolean;
  
  // 变化指示器
  statDeltas: StatDelta[];
  rapportDeltas: RapportDelta[];
  
  // 剧本系统状态（新增）
  mirrorMode: MirrorMode;
  displayedPlotUnits: PlotUnit[];
  currentHint: string | null;
  
  // 叙事线索状态（新增）
  narrativeClues: NarrativeThread[];
  
  // ========== Phase 5 新增：线索驱动的故事系统状态 ==========
  /**
   * 所有追踪的故事
   */
  trackedStories: TrackedStoryData[];
  
  /**
   * 当前会话状态（IDLE/READY/PLAYING）
   */
  sessionState: GameSessionState;
  
  /**
   * 当前活跃的故事
   */
  activeStory: TrackedStoryData | null;
  
  // ========== Phase X 新增：独立玩家状态 ==========
  /**
   * 玩家状态（独立于场景，在所有会话状态下都存在）
   */
  playerStatus: PlayerStatusArea | null;
  
  // 操作方法
  getAllStories: () => Promise<StoryConfig[]>;
  startGame: (storyId: string) => Promise<void>;
  submitAction: (intentText: string) => Promise<void>;
  switchStory: (storyId: string) => Promise<void>;
  
  // 剧本系统操作（新增）
  handlePass: () => void;
  handleIntervention: (intentText: string) => Promise<void>;
  
  // 叙事线索操作（新增）
  refreshNarrativeClues: () => void;
  
  // 世界信息流操作（新增）
  refreshTicker: () => void;
  
  // ========== Phase 5 新增：线索驱动的故事操作 ==========
  /**
   * 追踪线索（开启故事）
   * @param clueId 线索ID
   */
  trackClue: (clueId: string) => Promise<TrackedStoryData>;
  
  /**
   * 进入故事（从追踪的线索启动游戏）
   * @param clueId 线索ID
   */
  enterStory: (clueId: string) => Promise<void>;
  
  /**
   * 退出故事（返回空闲状态）
   */
  exitStory: () => Promise<void>;
  
  /**
   * 获取所有追踪的故事
   */
  getTrackedStories: () => Promise<TrackedStoryData[]>;
  
  /**
   * 获取当前活跃的故事
   */
  getActiveStory: () => Promise<TrackedStoryData | null>;
  
  // ========== Phase X 新增：玩家状态操作 ==========
  /**
   * 更新玩家体力
   * @param delta 变化量（可为负数）
   */
  updatePlayerVigor: (delta: number) => void;
  
  /**
   * 更新玩家心力
   * @param delta 变化量（可为负数）
   */
  updatePlayerClarity: (delta: number) => void;
  
  // ========== Phase X 新增：近场交互操作 ==========
  /**
   * 进入近场交互模式（进入场景并开始播放剧情）
   * @param sceneId 场景ID
   */
  enterNearField: (sceneId: string) => Promise<void>;
  
  /**
   * 更新玩家位置
   * @param location 新位置
   */
  updatePlayerLocation: (location: string) => void;
  
  /**
   * 更新游戏时间
   * @param time 新时间
   */
  updatePlayerTime: (time: string) => void;
  
  // 引擎实例（供高级使用）
  engine: GameEngine;
}

/**
 * useGameEngine Hook
 */
export function useGameEngine(): UseGameEngineReturn {
  const engineRef = useRef<GameEngine | null>(null);
  
  // ========== Phase 5 新增：线索驱动的故事系统状态 ==========
  const [trackedStories, setTrackedStories] = useState<TrackedStoryData[]>([]);
  const [sessionState, setSessionState] = useState<GameSessionState>('idle');
  const [activeStory, setActiveStory] = useState<TrackedStoryData | null>(null);
  
  // ========== Phase X 新增：独立玩家状态 ==========
  const [playerStatus, setPlayerStatus] = useState<PlayerStatusArea | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    // ========== Phase 5：会话状态字段 ==========
    sessionState: 'idle' as GameSessionState,
    trackedStories: new Map<string, TrackedStoryData>(),
    
    // ========== Phase X：独立玩家状态 ==========
    playerStatus: null,
    
    // ========== 现有字段 ==========
    currentStoryId: null,
    currentStory: null,
    currentTurnIndex: 0,
    currentScenario: null,
    allScenarios: [],
    isStarted: false,
    isEnded: false,
    
    // ========== 近场交互系统（简化版）==========
    nearfield: {
      active: false,
      sceneId: null,
      narrativeSequence: [],
      displayIndex: -1,
      mode: 'PLAYING',
      interventionHint: null,
      interactionEvents: []
    },
    
    // ========== @deprecated 旧近场字段（向后兼容）==========
    nearfield_active: false,
    current_scene_id: null,
    scene_history_context: [],
    awaiting_action_type: null,
    current_narrative_sequence: null,
    current_narrative_index: 0,
    
    // ========== @deprecated 旧剧本系统（向后兼容）==========
    mirrorMode: 'conflict' as MirrorMode,
    scenePlot: null,
    currentPlotIndex: 0,
    displayedPlotUnits: [],
    currentHint: null,
  });
  const [behaviorHistory, setBehaviorHistory] = useState<ExtendedBehaviorItem[]>([]);
  const [tickerMessages, setTickerMessages] = useState<TickerMessageWithIcon[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statDeltas, setStatDeltas] = useState<StatDelta[]>([]);
  const [rapportDeltas, setRapportDeltas] = useState<RapportDelta[]>([]);
  const [narrativeClues, setNarrativeClues] = useState<NarrativeThread[]>([]);
  
  // 初始化引擎
  useEffect(() => {
    const engine = new GameEngine({
      debug: false,
      autoApplyVisual: true,
      tickerUpdateInterval: 8000,
    });
    
    engineRef.current = engine;
    
    // 初始化引擎
    engine.initialize().then(async () => {
      // 初始化完成后，加载初始的20条消息
      await engine.getTickerSystem().refreshAll();
      
      // ========== Phase 5 新增：初始化加载追踪的故事 ==========
      try {
        const stories = await engine.getTrackedStories();
        setTrackedStories(stories);
        
        const newSessionState = engine.getSessionState();
        setSessionState(newSessionState);
        
        const active = await engine.getActiveStory();
        setActiveStory(active);
        
        console.log('[useGameEngine] Initialized with tracked stories:', stories.length);
        console.log('[useGameEngine] Session state:', newSessionState);
      } catch (error) {
        console.error('[useGameEngine] Failed to load tracked stories:', error);
      }
      
      // ========== Phase X 新增：初始化加载玩家状态 ==========
      try {
        const status = engine.getPlayerStatus();
        setPlayerStatus(status);
        console.log('[useGameEngine] Initialized player status:', status);
      } catch (error) {
        console.error('[useGameEngine] Failed to load player status:', error);
      }
    }).catch(error => {
      console.error('[useGameEngine] Failed to initialize engine:', error);
    });
    
    // 监听回合完成事件
    engine.on('turnComplete', (event) => {
      const { result } = event.data as { result: TurnResult };
      
      // 更新状态
      setGameState(engine.getCurrentState());
      
      // 更新行为历史
      setBehaviorHistory(engine.getBehaviorHistory());
      
      // 更新变化指示器
      setStatDeltas(result.statDeltas);
      setRapportDeltas(result.rapportDeltas);
      
      // 3秒后清除指示器
      setTimeout(() => {
        setStatDeltas([]);
        setRapportDeltas([]);
      }, 3000);
      
      setIsProcessing(false);
    });
    
    // 监听游戏开始事件
    engine.on('gameStarted', () => {
      setGameState(engine.getCurrentState());
      setBehaviorHistory(engine.getBehaviorHistory());
    });
    
    // 监听状态变化事件（剧���系统）
    engine.on('stateChange', () => {
      setGameState(engine.getCurrentState());
    });
    
    // ========== Phase 5 新增：线索驱动的故事事件监听 ==========
    
    // 监听故事追踪事件
    engine.on('storyTracked', async () => {
      // 更新追踪的故事列表
      const stories = await engine.getTrackedStories();
      setTrackedStories(stories);
      
      // 更新会话状态
      const newSessionState = engine.getSessionState();
      setSessionState(newSessionState);
      
      console.log('[useGameEngine] Story tracked, session state:', newSessionState);
    });
    
    // 监听故事进入事件
    engine.on('storyEntered', async () => {
      // 更新游戏状态
      setGameState(engine.getCurrentState());
      
      // 更新会话状态
      setSessionState(engine.getSessionState());
      
      // 更新活跃故事
      const active = await engine.getActiveStory();
      setActiveStory(active);
      
      // 更新行为历史
      setBehaviorHistory(engine.getBehaviorHistory());
      
      // ========== Phase X：同步玩家状态 ==========
      const status = engine.getPlayerStatus();
      setPlayerStatus(status);
      
      console.log('[useGameEngine] Story entered, active story:', active?.title);
    });
    
    // 监听故事退出事件
    engine.on('storyExited', async () => {
      // 更新游戏状态
      setGameState(engine.getCurrentState());
      
      // 更新会话状态
      setSessionState(engine.getSessionState());
      
      // 清除活跃故事
      setActiveStory(null);
      
      // 清除行为历史
      setBehaviorHistory([]);
      
      console.log('[useGameEngine] Story exited, session state:', engine.getSessionState());
    });
    
    // 🆕 监听追踪故事更新事件（场景完成、故事完成等）
    engine.on('trackedStoriesUpdated', async () => {
      console.log('\n========================================');
      console.log('[useGameEngine] 📢 trackedStoriesUpdated event received');
      console.log('========================================\n');
      
      // 重新获取追踪的故事列表
      const stories = await engine.getTrackedStories();
      
      console.log(`[useGameEngine] 📊 Retrieved ${stories.length} tracked stories from engine`);
      
      // 🔍 调试：打印场景路线图状态
      stories.forEach((story, idx) => {
        console.log(`\n--- Story #${idx + 1}: "${story.title}" ---`);
        console.log(`  Status: ${story.status}`);
        console.log(`  Clue ID: ${story.clue_id}`);
        
        if (story.status === 'tracking') {
          console.log(`  Current Scene Index: ${story.progress?.current_scene_index}`);
          console.log(`  Completed Scenes: [${story.progress?.completed_scenes?.join(', ')}]`);
          console.log(`  Total Scenes: ${story.scene_sequence.length}`);
          console.log('  Scene Sequence:');
          
          story.scene_sequence.forEach((s, i) => {
            const isCurrent = i === story.progress?.current_scene_index;
            const isCompleted = story.progress?.completed_scenes?.includes(s.scene_id);
            console.log(`    [${i}] ${s.scene_id} (${s.title})`);
            console.log(`        status: ${s.status} | current: ${isCurrent} | completed: ${isCompleted}`);
          });
        }
        console.log('---\n');
      });
      
      // 🔍 在设置状态之前，打印对象引用信息
      console.log('[useGameEngine] 🔍 About to call setTrackedStories...');
      console.log('  - stories array reference:', stories);
      console.log('  - stories[0] reference (if exists):', stories[0]);
      
      setTrackedStories(stories);
      
      console.log('[useGameEngine] ✅ setTrackedStories called with', stories.length, 'stories');
      
      // 如果当前有活跃的故事，也更新它
      const active = await engine.getActiveStory();
      if (active) {
        console.log('[useGameEngine] ✅ Active story found:', active.title, 'status:', active.status);
        setActiveStory(active);
      } else {
        console.log('[useGameEngine] ⚠️ No active story');
      }
      
      console.log('\n========================================');
      console.log('[useGameEngine] Event handler complete');
      console.log('========================================\n');
    });
    
    // ========== Phase X 新增：玩家状态变化事件监听 ==========
    engine.on('playerStatusChanged', () => {
      // 同步玩家状态
      const status = engine.getPlayerStatus();
      setPlayerStatus(status);
      console.log('[useGameEngine] Player status changed:', status);
    });
    
    // ========== 近场交互更新事件监听（简化版）==========
    engine.on('nearfieldUpdated', () => {
      const state = engine.getCurrentState();
      
      console.log('[useGameEngine] nearfieldUpdated event received (simplified)');
      console.log('  - nearfield.active:', state.nearfield.active);
      console.log('  - nearfield.displayIndex:', state.nearfield.displayIndex);
      console.log('  - nearfield.mode:', state.nearfield.mode);
      console.log('  - narrative sequence length:', state.nearfield.narrativeSequence.length);
      console.log('  - interaction events length:', state.nearfield.interactionEvents.length);
      
      // ✅ 创建新对象引用，确保 React 能检测到变化
      setGameState({ ...engine.getCurrentState() });
      console.log('  - ✅ gameState updated with new reference');
    });
    
    // 监听错误事件
    engine.on('error', (event) => {
      console.error('[useGameEngine] Engine error:', event.data);
      setIsProcessing(false);
    });
    
    // 订阅Ticker消息
    const unsubscribe = engine.getTickerSystem().subscribe((messages) => {
      setTickerMessages(messages);
    });
    
    // 清理
    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, []);
  
  /**
   * 获取所有故事
   */
  const getAllStories = useCallback(async (): Promise<StoryConfig[]> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    return engineRef.current.getAllStories();
  }, []);
  
  /**
   * 开始游戏
   */
  const startGame = useCallback(async (storyId: string): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    const state = await engineRef.current.startGame(storyId);
    setGameState(state);
    setBehaviorHistory(engineRef.current.getBehaviorHistory());
    
    // 清除变化指示器
    setStatDeltas([]);
    setRapportDeltas([]);
  }, []);
  
  /**
   * 提交玩家动作
   */
  const submitAction = useCallback(async (intentText: string): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    if (!intentText.trim()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await engineRef.current.submitAction(intentText);
      // 状态更新由事件监听器处理
    } catch (error) {
      console.error('[useGameEngine] Failed to submit action:', error);
      setIsProcessing(false);
    }
  }, []);
  
  /**
   * 切换故事
   */
  const switchStory = useCallback(async (storyId: string): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    const state = await engineRef.current.switchStory(storyId);
    setGameState(state);
    setBehaviorHistory(engineRef.current.getBehaviorHistory());
    
    // 清除变化指示器
    setStatDeltas([]);
    setRapportDeltas([]);
  }, []);
  
  // ==================== 剧本系统操作（新增）====================
  
  /**
   * 加载场景剧本
   */

  /**
   * 处理"路过"
   * 
   * ✅ Phase X 更新：支持异步（近场交互系统）
   */
  const handlePass = useCallback(async (): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    setIsProcessing(true);
    
    try {
      await engineRef.current.handlePass();
      setIsProcessing(false);
    } catch (error) {
      console.error('[useGameEngine] Failed to handle pass:', error);
      setIsProcessing(false);
      throw error;
    }
  }, []);
  
  /**
   * 处理"介入"
   */
  const handleIntervention = useCallback(async (intentText: string): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    if (!intentText.trim()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await engineRef.current.handleIntervention(intentText);
      
      // ✅ 手动更新状态（因为 handleIntervention 不触发 turnComplete）
      setGameState(engineRef.current.getCurrentState());
      setBehaviorHistory(engineRef.current.getBehaviorHistory());
      
      // ✅ 解除处理中状态
      setIsProcessing(false);
    } catch (error) {
      console.error('[useGameEngine] Failed to handle intervention:', error);
      setIsProcessing(false);
    }
  }, []);
  
  // ==================== 叙事线索操作（新增）====================
  
  /**
   * 刷新叙事线索
   * 
   * @note Demo功能：从当前故事的线索池中随机获取新线索
   */
  const refreshNarrativeClues = useCallback((): void => {
    const currentStoryId = gameState.currentStoryId;
    if (!currentStoryId) {
      return;
    }
    
    // 获取叙事线索服务
    const narrativeClueService = ServiceContainer.getInstance().getNarrativeClueService();
    
    // 随机获取3-5条线索
    const count = Math.floor(Math.random() * 3) + 3; // 3-5条
    const clues = narrativeClueService.getRandomClues(currentStoryId, count);
    
    setNarrativeClues(clues);
  }, [gameState.currentStoryId]);
  
  // 初始化时加载叙事线索
  useEffect(() => {
    if (gameState.currentStoryId && gameState.isStarted) {
      refreshNarrativeClues();
    }
  }, [gameState.currentStoryId, gameState.isStarted, refreshNarrativeClues]);
  
  // 定时自动刷新叙事线索（Demo功能）
  useEffect(() => {
    if (!gameState.currentStoryId || !gameState.isStarted) {
      return;
    }
    
    // 每30秒自动刷新一次叙事线索
    const interval = setInterval(() => {
      refreshNarrativeClues();
      console.log('[NarrativeClues] Auto-refreshed');
    }, 30000); // 30秒
    
    return () => clearInterval(interval);
  }, [gameState.currentStoryId, gameState.isStarted, refreshNarrativeClues]);
  
  // ==================== 世界信息流操作（新增）====================
  
  /**
   * 手动刷新世界信息流
   * 
   * @note 手动刷新按钮触发，一次性刷新20条消息
   */
  const refreshTicker = useCallback(async (): Promise<void> => {
    if (!engineRef.current) {
      return;
    }
    
    // 调用TickerSystem的refreshAll方法，一次性替换为20条新消息
    await engineRef.current.getTickerSystem().refreshAll();
  }, []);
  
  // ==================== Phase 5 新增：线索驱动的故事操作 ====================
  
  /**
   * 追踪线索（开启故事）
   * 
   * @param clueId 线索ID
   * @returns 追踪的故事数据
   */
  const trackClue = useCallback(async (clueId: string): Promise<TrackedStoryData> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    try {
      const trackedStory = await engineRef.current.trackClue(clueId);
      
      // 事件监听器会自动更新状态
      // 这里返回结果供调用方使用
      return trackedStory;
    } catch (error) {
      console.error('[useGameEngine] Failed to track clue:', error);
      throw error;
    }
  }, []);
  
  /**
   * 进入故事（从追踪的线索启动游戏）
   * 
   * @param clueId 线索ID
   */
  const enterStory = useCallback(async (clueId: string): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    try {
      setIsProcessing(true);
      
      await engineRef.current.enterStory(clueId);
      
      // 事件监听器会自动更新状态
      // 清除变化指示器
      setStatDeltas([]);
      setRapportDeltas([]);
      
      setIsProcessing(false);
    } catch (error) {
      console.error('[useGameEngine] Failed to enter story:', error);
      setIsProcessing(false);
      throw error;
    }
  }, []);
  
  /**
   * 退出故事（返回空闲状态）
   */
  const exitStory = useCallback(async (): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    try {
      await engineRef.current.exitStory();
      
      // 事件监听器会自动更新状态
      // 清除变化指示器
      setStatDeltas([]);
      setRapportDeltas([]);
    } catch (error) {
      console.error('[useGameEngine] Failed to exit story:', error);
      throw error;
    }
  }, []);
  
  /**
   * 获取所有追踪的故事
   * 
   * @returns 追踪的故事列表
   */
  const getTrackedStories = useCallback(async (): Promise<TrackedStoryData[]> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    return await engineRef.current.getTrackedStories();
  }, []);
  
  /**
   * 获取当前活跃的故事
   * 
   * @returns 活跃的故事数据，如果没有则返回 null
   */
  const getActiveStory = useCallback(async (): Promise<TrackedStoryData | null> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    return await engineRef.current.getActiveStory();
  }, []);
  
  // ==================== Phase X 新增：玩家状态操作 ====================
  
  /**
   * 更新玩家体力
   * 
   * @param delta 变化量（可为负数）
   */
  const updatePlayerVigor = useCallback((delta: number): void => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    engineRef.current.updatePlayerVigor(delta);
    // 事件监听器会自动更新 playerStatus 状态
  }, []);
  
  /**
   * 更新玩家心力
   * 
   * @param delta 变化量（可为负数）
   */
  const updatePlayerClarity = useCallback((delta: number): void => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    engineRef.current.updatePlayerClarity(delta);
    // 事件监听器会自动更新 playerStatus 状态
  }, []);
  
  /**
   * 更新玩家位置
   * 
   * @param location 新位置
   */
  const updatePlayerLocation = useCallback((location: string): void => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    engineRef.current.updatePlayerLocation(location);
    // 事件监听器会自动更新 playerStatus 状态
  }, []);
  
  /**
   * 更新游戏时间
   * 
   * @param time 新时间
   */
  const updatePlayerTime = useCallback((time: string): void => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    engineRef.current.updatePlayerTime(time);
    // 事件监听器会自动更新 playerStatus 状态
  }, []);
  
  // ==================== Phase X 新增：近场交互操作 ====================
  
  /**
   * 进入近场交互模式（进入场景并开始播放剧情）
   * 
   * @param sceneId 场景ID
   */
  const enterNearField = useCallback(async (sceneId: string): Promise<void> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized');
    }
    
    try {
      setIsProcessing(true);
      
      await engineRef.current.enterNearField(sceneId);
      
      // 事件监听器会自动更新状态
      console.log(`[useGameEngine] Entered nearfield: ${sceneId}`);
      
      setIsProcessing(false);
    } catch (error) {
      console.error('[useGameEngine] Failed to enter nearfield:', error);
      setIsProcessing(false);
      throw error;
    }
  }, []);
  
  return {
    gameState,
    currentScenario: gameState.currentScenario,
    behaviorHistory,
    tickerMessages,
    isProcessing,
    statDeltas,
    rapportDeltas,
    // 剧本系统状态
    mirrorMode: gameState.mirrorMode || 'conflict',
    displayedPlotUnits: gameState.displayedPlotUnits || [],
    currentHint: gameState.currentHint || null,
    // 叙事线索状态
    narrativeClues,
    // ========== Phase 5 新增：线索驱动的故事系统状态 ==========
    trackedStories,
    sessionState,
    activeStory,
    // ========== Phase X 新增：独立玩家状态 ==========
    playerStatus,
    // 操作方法
    getAllStories,
    startGame,
    submitAction,
    switchStory,
    // 剧本系统操作
    handlePass,
    handleIntervention,
    // 叙事线索操作
    refreshNarrativeClues,
    // 世界信息流操作
    refreshTicker,
    // ========== Phase 5 新增：线索驱动的故事操作 ==========
    trackClue,
    enterStory,
    exitStory,
    getTrackedStories,
    getActiveStory,
    // ========== Phase X 新增：玩家状态操作 ==========
    updatePlayerVigor,
    updatePlayerClarity,
    updatePlayerLocation,
    updatePlayerTime,
    // ========== Phase X 新增：近场交互操作 ==========
    enterNearField,
    // 引擎实例
    engine: engineRef.current!,
  };
}
