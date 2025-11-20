import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radio,
  Users,
  MessageSquare,
  Target,
  Heart,
  Brain,
  Clock,
  Send,
  X,
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
  TestTube2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { WantedCard } from "./components/gta/WantedCard";
import { NPCMiniCard } from "./components/gta/NPCMiniCard";
import { PlayerStatusCard } from "./components/gta/PlayerStatusCard";
import { WantedStarsCard } from "./components/gta/WantedStarsCard";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Textarea } from "./components/ui/textarea";
import { Separator } from "./components/ui/separator";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";

// 导入类型定义 - 使用新的类型系统
import type { NPCEntity, StoryConfig } from "./types";

// 导入新的 Hook
import { useGameEngine } from "./hooks";
import { getRapportColor } from "./utils";

// 🔥 Phase 3: 导入新的引擎工具
import { ClueInitializer } from "./engine/utils/ClueInitializer";
import {
  ClueService,
  StoryService,
  NPCService,
} from "./engine/services/business"; // 🔥 导入新的 Service（Phase 6 + NPC）

// 导入主题选择器组件
import { ThemeSelector } from "./components/ThemeSelector";

// 导入新的UI组件（方案B重构）
import { EmptyStateView } from "./components/EmptyStateView";
import { ClueInboxPanel } from "./components/ClueInboxPanel"; // 🔥 Phase 3: 新的线索收件箱组件
import { TestPanel } from "./components/test/TestPanel"; // 🔥 Phase 5: 测试面板

// 🔥 Phase 2+3: 导入 GTA 风格组件
import { InfoPanel } from "./components/gta/InfoPanel";
import { NarrativeChatBox } from "./components/gta/NarrativeChatBox";
import { InteractionChatBox } from "./components/gta/InteractionChatBox";
import { MainPanelFrame } from "./components/gta/MainPanelFrame";
import { BackgroundLayers } from "./components/gta/BackgroundLayers";
import { HeaderSection } from "./components/HeaderSection";

// 导入配置
import { ANIMATION } from "./config/constants";
import { logger } from "./utils/logger";

// ==================== 动画变量 ====================
const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * ANIMATION.COLUMN_DELAY_STEP,
      type: "spring",
      stiffness: ANIMATION.SPRING_STIFFNESS,
      damping: ANIMATION.SPRING_DAMPING,
    },
  }),
};

// ==================== 主组件 ====================
export default function App() {
  logger.log("[App] 🏗️ COMPONENT MOUNT/RENDER @ " + Date.now());
  logger.log("[App] 📍 Component: App.tsx");

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
    extractClue, // 🆕 阶段2：从useGameEngine获取
    trackClue,
    enterStory,
    exitStory,
    getTrackedStories,
    getActiveStory,
    extractedClues, // 🆕 阶段3：从useGameEngine获取
    trackedStoriesMap, // 🆕 阶段3：从useGameEngine获取
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
  const [intentText, setIntentText] = useState("");
  const [stories, setStories] = useState<StoryConfig[]>([]);
  const [currentStoryId, setCurrentStoryId] =
    useState<string>("demo-story"); // ✨ 使用统一的demo-story
  const [selectedNpc, setSelectedNpc] =
    useState<NPCEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClueDrawerOpen, setIsClueDrawerOpen] =
    useState(false);
  const behaviorStreamRef = useRef<HTMLDivElement>(null);

  // 线索系统状态（新增）
  const [selectedMessage, setSelectedMessage] =
    useState<any>(null);
  const [isMessageDetailOpen, setIsMessageDetailOpen] =
    useState(false);
  // ❌ 阶段3：删除副本state，从useGameEngine获取
  // const [extractedClues, setExtractedClues] = useState<any[]>([]);
  const [isExtractingClue, setIsExtractingClue] =
    useState(false);
  const [isTrackingClue, setIsTrackingClue] = useState(false);
  const [trackingClueId, setTrackingClueId] = useState<
    string | null
  >(null);
  // ❌ 阶段3：删除副本state，从useGameEngine获取
  // const [trackedStoriesMap, setTrackedStoriesMap] = useState<Map<string, any>>(new Map()); // 追踪的故事数据包缓存（clue_id -> TrackedStoryData）

  // 打字机效果状态
  const [displayedSceneSetting, setDisplayedSceneSetting] =
    useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 交互反馈状态
  const [clickedVerbIndex, setClickedVerbIndex] = useState<
    number | null
  >(null);
  const [isFocused, setIsFocused] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 🔥 Phase 5: 开发者模式
  const [isDevMode, setIsDevMode] = useState(false);

  // ========== 方案B重构：计算自由镜显示模式（简化版 + 交互分离）==========
  const freeMirrorMode = useMemo(() => {
    const { nearfield } = gameState;

    console.log("==========================================");
    console.log("[App] 🎯 Computing freeMirrorMode:");
    console.log("  - nearfield.active:", nearfield.active);
    console.log("  - nearfield.mode:", nearfield.mode);
    console.log(
      "  - nearfield.displayIndex:",
      nearfield.displayIndex,
    );
    console.log(
      "  - nearfield.narrativeSequence.length:",
      nearfield.narrativeSequence.length,
    );
    console.log(
      "  - nearfield.interactionEvents.length:",
      nearfield.interactionEvents?.length || 0,
    );
    console.log("  - sessionState:", sessionState);

    // 1. 未进入故事或近场未激活
    if (!nearfield.active || sessionState !== "playing") {
      console.log("[App] ❌ Condition 1 failed!");
      console.log("  - nearfield.active:", nearfield.active);
      console.log("  - sessionState:", sessionState);
      console.log("  → freeMirrorMode = idle");
      console.log("==========================================");
      return "idle";
    }

    // 2. ✅ 交互模式：玩家正在与NPC对话
    if (nearfield.mode === "INTERACTION") {
      console.log("[App] ✅ Condition 2 matched!");
      console.log("  → freeMirrorMode = INTERACTION");
      console.log(
        "  → Will display InteractionView with",
        nearfield.interactionEvents?.length || 0,
        "events",
      );
      console.log("==========================================");
      return "interaction";
    }

    // 3. ✅ 叙事模式：播放叙事或介入点
    if (
      nearfield.mode === "PLAYING" ||
      nearfield.mode === "INTERVENTION"
    ) {
      console.log("[App] ✅ Condition 3 matched!");
      console.log("  → freeMirrorMode = NARRATIVE");
      console.log("==========================================");
      return "narrative";
    }

    // 4. 默认：idle
    console.log(
      "[App] ⚠️ No condition matched, defaulting to idle",
    );
    console.log("==========================================");
    console.log("[App] freeMirrorMode = idle (fallback)");
    return "idle";
  }, [gameState.nearfield, sessionState]);

  // ========== 计算enriched NPCs（单一数据源）==========
  const enrichedNPCs = useMemo(() => {
    if (!currentScenario?.dynamic_view?.involved_entities) {
      return [];
    }
    return NPCService.enrichNPCEntities(
      currentScenario.dynamic_view.involved_entities
    );
  }, [currentScenario]);

  // ========== Phase 6：仅加载线索收件箱���不自动启动游戏 ==========
  // 🔥 Phase 3: 使用ClueInitializer初始化新架构数据
  // ⚠️ 注意：必须在 GameEngine 初始化完成后执行（等待 trackedStories 不为 null）
  useEffect(() => {
    // 等待 GameEngine 初始化完成（trackedStories 从 undefined 变为数组）
    if (trackedStories === undefined) {
      console.log(
        "[App.initClues] ⏸️ Waiting for GameEngine initialization...",
      );
      return; // GameEngine 还未初始化
    }

    console.log(
      "[App.initClues] 🚀 GameEngine initialized, starting clue initialization...",
    );

    const initClues = async () => {
      try {
        // 1. 添加Demo线索（已禁用 - 用户应从空收件箱开始）
        console.log(
          "[App.initClues] Step 1: Skipping demo clues (user starts with empty inbox)",
        );
        // await ClueInitializer.addDemoClues(); // ← 注释掉，不再默认添加线索

        // 2. 初始化线索收件箱（迁移旧数据）
        console.log(
          "[App.initClues] Step 2: Initializing clue inbox...",
        );
        await ClueInitializer.initializeClueInbox(
          "demo-player",
        );

        console.log(
          "[App] ✅ Clue inbox initialized (new architecture)",
        );
      } catch (error) {
        console.error(
          "[App] Failed to load clue inbox:",
          error,
        );
      }
    };

    initClues();
  }, [trackedStories]); // 依赖 trackedStories，确保在 GameEngine 初始化后执行

  // 打字机效果
  useEffect(() => {
    if (!currentScenario) return;

    const text = currentScenario.dynamic_view.scene_setting;
    setIsTyping(true);
    setDisplayedSceneSetting("");

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
      behaviorStreamRef.current.scrollTop =
        behaviorStreamRef.current.scrollHeight;
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
        setIntentText("");
        setSelectedNpc(null);
        setIsModalOpen(false);
        setDisplayedSceneSetting("");

        setTimeout(() => setIsTransitioning(false), 50);
      } catch (error) {
        console.error("Failed to switch story:", error);
        setIsTransitioning(false);
      }
    }, 300);
  };

  // 发送意图（介入）
  const sendIntent = async () => {
    if (intentText.trim() === "" || isProcessing) return;

    try {
      // ✅ 检查是否在近场交互模式（介入点或交互中 - 简化版）
      if (
        gameState.nearfield.mode === "INTERVENTION" ||
        gameState.nearfield.mode === "INTERACTION"
      ) {
        // 近场交互：介入或继续交互
        await handleIntervention(intentText);
      } else {
        // 正常的冲突模式交互（旧系统）
        await submitAction(intentText);
      }

      setIntentText("");
      setIsFocused(false); // 关闭输入框

      // 发送成功闪光
      setJustSent(true);
      setTimeout(() => setJustSent(false), 500);
    } catch (error) {
      console.error("Failed to submit action:", error);
    }
  };

  // 快��动词点击（Phase 3 - 带涟漪反馈）
  const handleVerbClick = (
    description: string,
    index: number,
  ) => {
    setIntentText((prev) =>
      prev ? `${prev} ${description}` : description,
    );

    // 触发涟漪动画
    setClickedVerbIndex(index);
    setTimeout(() => setClickedVerbIndex(null), 400);

    // 聚焦输入框并添加脉冲
    setIsFocused(true);
  };

  // 辅助函数：为 ticker 消息添��������标
  const getTickerMessageIcon = (type: string) => {
    switch (type) {
      case "社交":
        return <MessageSquare className="w-3.5 h-3.5" />;
      case "媒体":
        return <TrendingUp className="w-3.5 h-3.5" />;
      case "传闻":
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <Radio className="w-3.5 h-3.5" />;
    }
  };

  // 处理点击消息
  const handleMessageClick = (msg: any) => {
    console.log("[UI] Message clicked:", msg);
    setSelectedMessage(msg);
    setIsMessageDetailOpen(true);
  };

  // 检查线索是否已提取
  const isClueExtracted = (clueId: string): boolean => {
    const result = extractedClues.some(
      (clue) => clue.clue_id === clueId,
    );
    console.log("[isClueExtracted] 🔍 Checking clue:", {
      clueId,
      extractedCluesCount: extractedClues.length,
      extractedClueIds: extractedClues.map((c) => c.clue_id),
      isExtracted: result,
    });
    return result;
  };

  // 提取线索
  const handleExtractClue = async () => {
    console.log(
      "[handleExtractClue] 🎯 Starting extraction...",
      {
        selectedMessage,
        hasMessage: !!selectedMessage,
        hasClueId: !!selectedMessage?.extractable_clue_id,
        clueId: selectedMessage?.extractable_clue_id,
      },
    );

    if (
      !selectedMessage ||
      !selectedMessage.extractable_clue_id
    )
      return;

    // 检查是否已提取
    if (isClueExtracted(selectedMessage.extractable_clue_id)) {
      console.log(
        "[handleExtractClue] ⚠️ Clue already extracted, showing toast",
      );
      toast.info("此线索已在收件箱中", {
        description: "请打开线索收件箱查看详情",
      });
      return;
    }

    setIsExtractingClue(true);
    console.log(
      "[handleExtractClue] 📡 Calling ClueService.extractClue()...",
    );

    try {
      // ✅ 阶段2修复：使用 useGameEngine 的 extractClue 方法
      // 该方法会自动通过 GameEngine 发射 'clueExtracted' 事件
      const clue = await extractClue(
        selectedMessage.message_id,
        selectedMessage.extractable_clue_id,
      );

      console.log(
        "[handleExtractClue] ✅ extractClue returned:",
        clue,
      );
      console.log(
        "[handleExtractClue] 📝 Current extractedClues before update:",
        extractedClues.map((c) => c.clue_id),
      );

      // 更��提取的线索列表
      // ✅ 阶段3：已删除setExtractedClues，useGameEngine会自动更新

      // ✅ 阶段3：已删除loadClueInbox()，useGameEngine会自动更新extractedClues

      // 显示成功提示
      toast.success("线索��取成功", {
        description: `「${clue.title}」已加入收件箱`,
      });

      // 不关闭弹窗，让玩家自己操作
      // setIsMessageDetailOpen(false); // ← 移除
    } catch (error) {
      console.error("[UI] Failed to extract clue:", error);
      toast.error("线索提取失败", {
        description: "请稍后重试",
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

      console.log(
        "[UI] Tracking clue, opening story:",
        storyData,
      );

      // ✅ 阶段3：不需要手动更新state，useGameEngine会自动更新extractedClues和trackedStoriesMap

      // 显示成功提示
      toast.success("追踪开启成功", {
        description: `故事「${storyData.title}」已就绪`,
      });
    } catch (error) {
      console.error("[UI] Failed to track clue:", error);
      toast.error("追踪失败", {
        description: "请稍后重试",
      });
    } finally {
      setIsTrackingClue(false);
      setTrackingClueId(null);
    }
  };

  // ========== Phase 6 新增：进入故事 ==========
  const handleEnterStory = async (clueId: string) => {
    console.log(
      "[App] handleEnterStory called with clueId:",
      clueId,
    );

    // ✅ 检查是否有游戏正在进行
    if (sessionState === "playing") {
      const currentActiveStory = await getActiveStory();

      // 如果有活跃故事，且不是当前点击的故事
      if (
        currentActiveStory &&
        currentActiveStory.entry_clue_id !== clueId
      ) {
        console.warn(
          "[App] ❌ Cannot enter story: another story is active",
        );
        console.warn(
          `  - Active story clue: ${currentActiveStory.entry_clue_id}`,
        );
        console.warn(`  - Requested story clue: ${clueId}`);
        console.warn(
          `  - Current session state: ${sessionState}`,
        );

        toast.error("无法进入故事", {
          description:
            "当前有其他故事正在进行中，请先完成或退出",
        });
        return;
      }
    }

    try {
      await enterStory(clueId);

      console.log(
        "[App] enterStory completed, checking state:",
        {
          sessionState,
          nearfield_active,
          current_narrative_sequence:
            gameState.current_narrative_sequence,
        },
      );

      // 关闭收件箱
      setIsClueDrawerOpen(false);

      toast.success("进入故事成功", {
        description: "开始你的冒险",
      });
    } catch (error) {
      console.error("[UI] Failed to enter story:", error);
      toast.error("进入故事失败", {
        description: "请稍后重试",
      });
    }
  };

  // ========== Phase 6：修改加载逻辑，只在处理中显示加载 ==========
  // 不再依赖 currentScenario，因为空状态也是合法状态

  const focusNpc =
    currentScenario?.dynamic_view.involved_entities[0];

  return (
    <div className="min-h-screen bg-[#0d0606] p-4 relative overflow-hidden">
      {/* 🔥 Phase 1 验收：GTA 背景层 */}
      <BackgroundLayers />
      {/* 🔥 Phase 3: Header区域 - 按照Figma原稿 */}
      <div className="relative z-30 max-w-screen-2xl mx-auto pt-4 px-4">
        <HeaderSection
          playerStatus={playerStatus || undefined}
          statDeltas={statDeltas}
          wantedLevel={
            gameState?.player_state?.alert_level || 0
          }
        />
      </div>
      {/* 背景网格效果 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      ��擎演示
      {/* 雨滴效果 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(ANIMATION.RAIN_DROP_COUNT)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-8 bg-gradient-to-b from-transparent via-[#A83C3C]/30 to-transparent"
            initial={{
              top: "-10%",
              left: `${Math.random() * 100}%`,
            }}
            animate={{ top: "110%" }}
            transition={{
              duration:
                ANIMATION.RAIN_DURATION_MIN +
                Math.random() *
                  (ANIMATION.RAIN_DURATION_MAX -
                    ANIMATION.RAIN_DURATION_MIN),
              repeat: Infinity,
              delay: Math.random() * ANIMATION.RAIN_DELAY_MAX,
              ease: "linear",
            }}
          />
        ))}
      </div>
      <motion.div
        className="grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto min-h-[750px] relative z-10 px-6"
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* ========== 左栏：���界感知区 ========== */}
        <motion.div
          className="col-span-12 lg:col-span-3 py-8"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={columnVariants}
        >
          {/* 🎨 旋转包装器 - 修复：移除overflow-hidden和h-full，添加padding留出装饰空间 */}
          <div className="w-full flex items-start justify-center">
            <div className="flex flex-col gap-4 w-full lg:rotate-[358deg]">
              {/* 🔥 Phase 2: GTA风格世界信息流 */}
              <div className="flex-shrink-0">
                <InfoPanel
                  messages={tickerMessages}
                  onMessageClick={handleMessageClick}
                  onRefresh={refreshTicker}
                  isClueExtracted={isClueExtracted}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========== 中栏：交互分镜区 ========== */}
        <motion.div
          className="col-span-12 lg:col-span-6 py-8"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={columnVariants}
        >
          {/* 🎨 旋转包装器 - 修复：移除overflow-hidden和h-full */}
          <div className="w-full flex items-start justify-center">
            <div className="flex flex-col gap-4 w-full lg:rotate-[1deg]">
              {/* 场景与行为流 */}
              <div className="flex-grow flex flex-col min-h-0">
                <MainPanelFrame
                  title="TALK!"
                  subtitle="// 自由鏡チャット"
                  icon={MessageSquare}
                >
                  {/* ========== 方案B重构：基于 freeMirrorMode 的清晰条件渲染 ========== */}

                  {/* 空状态 */}
                  {freeMirrorMode === "idle" && (
                    <EmptyStateView
                      sessionState={sessionState}
                      onOpenClueInbox={() =>
                        setIsClueDrawerOpen(true)
                      }
                    />
                  )}

                  {/* 🔥 Phase 3: GTA风格近场叙事模式 */}
                  {freeMirrorMode === "narrative" && (
                    <NarrativeChatBox
                      narrativeSequence={
                        gameState.nearfield.narrativeSequence
                      }
                      displayIndex={
                        gameState.nearfield.displayIndex
                      }
                      npcs={enrichedNPCs}
                    />
                  )}

                  {/* 🔥 Phase 3: GTA风格交互模式 */}
                  {freeMirrorMode === "interaction" && (
                    <InteractionChatBox
                      interactionEvents={
                        gameState.nearfield.interactionEvents
                      }
                      sceneSetting={displayedSceneSetting}
                      isTyping={isTyping}
                      npcs={enrichedNPCs}
                    />
                  )}
                </MainPanelFrame>
              </div>

              {/* 意图输入栏 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-shrink-0"
              >
                <Card className="border-[3px] border-black" style={{ background: 'rgba(26, 10, 12, 0.92)', boxShadow: '0px 0px 0px 2px rgba(0,0,0,0.5), 8px 8px 0px 0px rgba(0,0,0,0.7), 10px 10px 0px 0px #a83c3c' }}>
                  <CardContent className="p-4 space-y-3">
                    {/* 基于 nearfield.mode 的条件渲染（简化版）*/}
                    {gameState.nearfield.mode ===
                    "INTERVENTION" ? (
                      // 介入时机点：显示"路过"/"介入"选项
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fbbf24]/30 border-[3px] border-black" style={{ boxShadow: '0 0 0 2px #A83C3C, 3px 3px 0 #000' }}>
                            <AlertCircle className="w-5 h-5 text-black" />
                            <span className="text-black font-semibold">
                              遇到介入时机点
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handlePass}
                            disabled={isProcessing}
                            variant="outline"
                            className="flex-1 border-2 border-black hover:border-[#A83C3C] hover:bg-[#A83C3C]/10"
                          >
                            <X className="w-4 h-4 mr-2" />
                            路过
                          </Button>

                          <Button
                            onClick={() => setIsFocused(true)}
                            disabled={isProcessing}
                            className="flex-1 bg-[var(--alert-red)] hover:bg-[#cc0033] border-[3px] border-black"
                            style={{
                              boxShadow: '0 0 0 2px #A83C3C, 3px 3px 0 #000'
                            }}
                          >
                            <Target className="w-4 h-4 mr-2" />
                            介入
                          </Button>
                        </div>

                        <AnimatePresence>
                          {isFocused && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                height: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                              }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2"
                            >
                              <Textarea
                                value={intentText}
                                onChange={(e) =>
                                  setIntentText(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    !isProcessing
                                  ) {
                                    e.preventDefault();
                                    sendIntent();
                                  }
                                }}
                                placeholder="输入你的行动..."
                                className="min-h-[80px] border-2 border-black focus:border-[#A83C3C] focus:ring-2 focus:ring-[#A83C3C]/50 resize-none" style={{ background: 'rgba(26, 10, 12, 0.7)' }}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={sendIntent}
                                  disabled={
                                    isProcessing ||
                                    intentText.trim() === ""
                                  }
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
                                    setIntentText("");
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
                    ) : gameState.nearfield.mode ===
                      "INTERACTION" ? (
                      // 交互模式：显示简洁输入框
                      <div className="space-y-2">
                        <Textarea
                          value={intentText}
                          onChange={(e) =>
                            setIntentText(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !e.shiftKey &&
                              !isProcessing
                            ) {
                              e.preventDefault();
                              sendIntent();
                            }
                          }}
                          placeholder="输入你的行动..."
                          className="min-h-[80px] border-2 border-black focus:border-[#A83C3C] focus:ring-2 focus:ring-[#A83C3C]/50 resize-none" style={{ background: 'rgba(26, 10, 12, 0.7)' }}
                          autoFocus
                        />
                        <Button
                          onClick={sendIntent}
                          disabled={
                            isProcessing ||
                            intentText.trim() === ""
                          }
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
                    ) : freeMirrorMode === "narrative" ? (
                      <div className="text-center py-8 text-white/60">
                        <Play className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                        <p>叙事播放中...</p>
                      </div>
                    ) : freeMirrorMode === "idle" ? (
                      // 剧情���停：显示介入时机点交互
                      <div className="text-center py-8 text-white/60">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>未进入故事</p>
                      </div>
                    ) : (
                      // 冲突交互模式：显示完整交互区
                      <>
                        {/* 上下文动词 */}
                        {currentScenario && (
                          <div className="flex flex-wrap gap-2">
                            {currentScenario.dynamic_view.available_player_behaviors.map(
                              (verb, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                  }}
                                  transition={{
                                    duration: 0.2,
                                    delay: idx * 0.05,
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="relative"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleVerbClick(
                                        verb.description,
                                        idx,
                                      )
                                    }
                                    className="border-2 border-black hover:border-[#A83C3C] hover:text-white transition-all text-[11px] transform hover:skew-x-[-2deg] cursor-pointer" style={{ background: 'rgba(26, 10, 12, 0.7)', boxShadow: '2px 2px 0px 0px #000000' }}
                                  >
                                    {verb.description}
                                  </Button>
                                  {/* 涟漪效果 */}
                                  <AnimatePresence>
                                    {clickedVerbIndex ===
                                      idx && (
                                      <motion.div
                                        className="absolute inset-0 border-[3px] border-[#fbbf24] pointer-events-none"
                                        initial={{
                                          scale: 1,
                                          opacity: 1,
                                        }}
                                        animate={{
                                          scale: 2,
                                          opacity: 0,
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                          duration: 0.4,
                                        }}
                                      />
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              ),
                            )}
                          </div>
                        )}

                        {/* 意图画布 */}
                        <div className="relative">
                          <motion.div
                            initial={false}
                            animate={{
                              boxShadow: isFocused
                                ? "0 0 20px rgba(6, 182, 212, 0.5)"
                                : "0 0 0px rgba(6, 182, 212, 0)",
                            }}
                            transition={{ duration: 0.3 }}
                            className="rounded"
                          >
                            <Textarea
                              value={intentText}
                              onChange={(e) =>
                                setIntentText(e.target.value)
                              }
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  !e.shiftKey
                                ) {
                                  e.preventDefault();
                                  sendIntent();
                                }
                              }}
                              placeholder="输入你的意图 (例如: [愤怒地] 质问他 //他撒���了//)"
                              className="min-h-[80px] pr-24 border-2 border-black focus:border-[#A83C3C] focus:ring-2 focus:ring-[#A83C3C]/50 text-white placeholder:text-white/50 resize-none transition-all" style={{ background: 'rgba(26, 10, 12, 0.7)' }}
                              disabled={isProcessing}
                            />
                          </motion.div>

                          {/* 发送按钮 - 带状态动画 */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {!isProcessing &&
                              intentText.trim() && (
                                <motion.div
                                  animate={{
                                    boxShadow: [
                                      "0 0 10px rgba(6, 182, 212, 0.3)",
                                      "0 0 20px rgba(6, 182, 212, 0.6)",
                                      "0 0 10px rgba(6, 182, 212, 0.3)",
                                    ],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                  }}
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
                                          initial={{
                                            opacity: 1,
                                          }}
                                          animate={{
                                            opacity: 0,
                                          }}
                                          exit={{ opacity: 0 }}
                                          transition={{
                                            duration: 0.5,
                                          }}
                                        />
                                      )}
                                    </AnimatePresence>
                                  </Button>
                                </motion.div>
                              )}
                            {!isProcessing &&
                              !intentText.trim() && (
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
                                className="bg-black/70 text-white font-bold cursor-wait border-2 border-black"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-4 h-4 border-[3px] border-white/30 border-t-white animate-spin"></span>
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
            </div>
          </div>
        </motion.div>

        {/* ========== 右栏：状态与���点 ========== */}
        <motion.div
          className="col-span-12 lg:col-span-3 py-8"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={columnVariants}
        >
          {/* 🎨 旋转包装器 - 修复：移除overflow-hidden和h-full */}
          <div className="w-full flex items-start justify-center">
            <div className="flex flex-col gap-4 w-full lg:rotate-[2deg]">
              {/* 玩家数值 - 已移至顶部Header区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 space-y-3 hidden"
              >
                {/* PlayerStatusCard - 已移至HeaderSection */}
                {/* WantedStarsCard - 已移至HeaderSection */}

                <div
                  className="relative hidden"
                  style={{
                    backgroundColor: "#FEF3C7",
                    border: "3px solid #000000",
                    boxShadow:
                      "0 0 0 4px #FBBF24, 12px 12px 0 #000, 14px 14px 0 #ff0040",
                    padding: "12px",
                    transform: "rotate(-1deg)",
                  }}
                >
                  <div className="space-y-3">
                    {/* ========== Phase X：使用独立的 playerStatus（在所有会话状态下都显示）========== */}
                    {playerStatus ? (
                      <>
                        {/* 玩家头像信息 - GTA风格 */}
                        {playerStatus.avatar && (
                          <div
                            className="flex items-center gap-3 pb-3 mb-3"
                            style={{
                              borderBottom: "3px solid #000000",
                            }}
                          >
                            <img
                              src={playerStatus.avatar}
                              alt={
                                playerStatus.name || "Player"
                              }
                              className="w-12 h-12 rounded object-cover"
                              style={{
                                border: "3px solid #000000",
                                boxShadow: "0 0 0 2px #ff0040",
                              }}
                            />
                            <div className="flex-1">
                              <div
                                className="uppercase font-black tracking-wider"
                                style={{
                                  fontSize: "16px",
                                  color: "#000000",
                                }}
                              >
                                {playerStatus.name || "V"}
                              </div>
                            </div>
                          </div>
                        )}
                        {/* 数值网格 - 2x2紧凑布局 */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* 体力 */}
                          <motion.div
                            className="relative p-2.5 rounded border-[3px] border-black overflow-hidden"
                            style={{ background: 'rgba(26, 10, 12, 0.7)', boxShadow: '0px 0px 0px 2px #fbbf24, 4px 4px 0px 0px #000000', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.3))' }}
                            whileHover={{
                              scale: 1.02,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="w-5 h-5 text-[#39ff14]" />
                              <div className="flex-1">
                                <div className="text-[10px] text-white/60 leading-none">
                                  体力
                                </div>
                                <div className="relative">
                                  <motion.div
                                    key={
                                      playerStatus.vigor.value
                                    }
                                    initial={{
                                      scale: 1.2,
                                      color:
                                        statDeltas.vigor &&
                                        statDeltas.vigor > 0
                                          ? "#10b981"
                                          : statDeltas.vigor &&
                                              statDeltas.vigor <
                                                0
                                            ? "#ff0040"
                                            : "#39ff14",
                                    }}
                                    animate={{
                                      scale: 1,
                                      color: "#39ff14",
                                    }}
                                    className="font-bold text-sm text-[#39ff14]"
                                  >
                                    {playerStatus.vigor.value}
                                    <span className="text-xs text-white/50">
                                      /{playerStatus.vigor.max}
                                    </span>
                                  </motion.div>
                                  <AnimatePresence>
                                    {statDeltas.vigor !==
                                      undefined &&
                                      statDeltas.vigor !==
                                        0 && (
                                        <motion.span
                                          className={`absolute -top-3 right-0 text-xs font-bold ${statDeltas.vigor > 0 ? "text-green-400" : "text-red-400"}`}
                                          initial={{
                                            opacity: 1,
                                            y: 0,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            y: -3,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            y: -6,
                                          }}
                                          transition={{
                                            duration: 0.5,
                                          }}
                                        >
                                          {statDeltas.vigor > 0
                                            ? "+"
                                            : ""}
                                          {statDeltas.vigor}
                                        </motion.span>
                                      )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={
                                (playerStatus.vigor.value /
                                  playerStatus.vigor.max) *
                                100
                              }
                              className="h-1.5 bg-black"
                              indicatorClassName="bg-[#39ff14] shadow-[0_0_8px_#39ff14]"
                              shimmer
                            />
                          </motion.div>

                          {/* 心力 */}
                          <motion.div
                            className="relative p-2.5 rounded border-[3px] border-black overflow-hidden"
                            style={{ background: 'rgba(26, 10, 12, 0.7)', boxShadow: '0px 0px 0px 2px #06b6d4, 4px 4px 0px 0px #000000', filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.3))' }}
                            whileHover={{
                              scale: 1.02,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="w-5 h-5 text-[#00d4ff]" />
                              <div className="flex-1">
                                <div className="text-[10px] text-white/60 leading-none">
                                  心力
                                </div>
                                <div className="relative">
                                  <motion.div
                                    key={
                                      playerStatus.clarity.value
                                    }
                                    initial={{
                                      scale: 1.2,
                                      color:
                                        statDeltas.clarity &&
                                        statDeltas.clarity > 0
                                          ? "#3b82f6"
                                          : statDeltas.clarity &&
                                              statDeltas.clarity <
                                                0
                                            ? "#ff0040"
                                            : "#00d4ff",
                                    }}
                                    animate={{
                                      scale: 1,
                                      color: "#00d4ff",
                                    }}
                                    className="font-bold text-sm text-[#00d4ff]"
                                  >
                                    {playerStatus.clarity.value}
                                    <span className="text-xs text-white/50">
                                      /
                                      {playerStatus.clarity.max}
                                    </span>
                                  </motion.div>
                                  <AnimatePresence>
                                    {statDeltas.clarity !==
                                      undefined &&
                                      statDeltas.clarity !==
                                        0 && (
                                        <motion.span
                                          className={`absolute -top-3 right-0 text-xs font-bold ${statDeltas.clarity > 0 ? "text-green-400" : "text-red-400"}`}
                                          initial={{
                                            opacity: 1,
                                            y: 0,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            y: -3,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            y: -6,
                                          }}
                                          transition={{
                                            duration: 0.5,
                                          }}
                                        >
                                          {statDeltas.clarity >
                                          0
                                            ? "+"
                                            : ""}
                                          {statDeltas.clarity}
                                        </motion.span>
                                      )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={
                                (playerStatus.clarity.value /
                                  playerStatus.clarity.max) *
                                100
                              }
                              className="h-1.5 bg-black"
                              indicatorClassName="bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]"
                              shimmer
                            />
                          </motion.div>

                          {/* 财力 */}
                          <motion.div
                            className="p-2.5 rounded border-[3px] border-black"
                            style={{ background: 'rgba(26, 10, 12, 0.7)', boxShadow: '0px 0px 0px 2px #fbbf24, 4px 4px 0px 0px #000000', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.3))' }}
                            whileHover={{
                              scale: 1.02,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 text-[#ffeb3b] flex items-center justify-center font-bold">
                                ¥
                              </div>
                              <div className="flex-1">
                                <div className="text-[10px] text-white/60 leading-none">
                                  财力
                                </div>
                                <div className="font-bold text-sm text-[#ffeb3b]">
                                  {playerStatus.financial_power}
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* 信用 */}
                          <motion.div
                            className="p-2.5 rounded border-[3px] border-black"
                            style={{ background: 'rgba(26, 10, 12, 0.7)', boxShadow: '0px 0px 0px 2px #8b5cf6, 4px 4px 0px 0px #000000', filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.3))' }}
                            whileHover={{
                              scale: 1.02,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-[#00d4ff]" />
                              <div className="flex-1">
                                <div className="text-[10px] text-white/60 leading-none">
                                  信用
                                </div>
                                <div className="font-bold text-sm text-[#00d4ff]">
                                  {playerStatus.credit.value}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* 状��效果 - 横向Badge布局 */}
                        {playerStatus.active_effects.length >
                          0 && (
                          <div className="pt-1">
                            <div className="text-[10px] text-white/60 mb-1.5">
                              状态
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <AnimatePresence>
                                {playerStatus.active_effects.map(
                                  (effect, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{
                                        opacity: 0,
                                        scale: 0.8,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        scale: 1,
                                      }}
                                      exit={{
                                        opacity: 0,
                                        scale: 0.8,
                                      }}
                                      whileHover={{
                                        scale: 1.05,
                                      }}
                                      title={effect.description}
                                    >
                                      <Badge
                                        variant="outline"
                                        className={`text-xs px-2 py-0.5 ${
                                          effect.type ===
                                          "debuff"
                                            ? "bg-red-900/30 border-red-500/50 text-red-300"
                                            : "bg-green-900/30 border-green-500/50 text-green-300"
                                        }`}
                                      >
                                        {effect.type ===
                                        "debuff"
                                          ? "⚠"
                                          : "✓"}{" "}
                                        {effect.name}
                                      </Badge>
                                    </motion.div>
                                  ),
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // ========== 空状态：玩家数据未初始化 ==========
                      <div className="text-center py-8 text-white/60">
                        <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">数据加载中...</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* 实体焦点 - 使用MainPanelFrame */}
              <div className="flex-grow flex flex-col min-h-0">
                <MainPanelFrame
                  title="CAST!"
                  subtitle="// エンティティ焦点"
                  icon={Users}
                >
                  {/* ========== Phase 6：条件渲染实体列表 ========== */}
                  {currentScenario && focusNpc ? (
                    <div className="space-y-2">
                      {NPCService.enrichNPCEntities(
                        currentScenario.dynamic_view
                          .involved_entities,
                      ).map((npc, idx) => {
                        const isFocus = idx === 0;

                        return isFocus ? (
                          // ========== 焦点NPC - GTA风格WANTED卡片 ==========
                          <motion.div
                            key={npc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: idx * 0.05,
                            }}
                            onClick={() => {
                              setSelectedNpc(npc);
                              setIsModalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <WantedCard npc={npc} />
                          </motion.div>
                        ) : (
                          // ========== 其他NPC - NPCMiniCard组件 ==========
                          <motion.div
                            key={npc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: idx * 0.05,
                            }}
                            whileHover={{ scale: 1.005 }}
                            onClick={() => {
                              setSelectedNpc(npc);
                              setIsModalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <NPCMiniCard npc={npc} />
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    // ========== 空状态：未进入故事 ==========
                    <div className="text-center py-8 text-white/60">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">未进入故事</p>
                    </div>
                  )}
                </MainPanelFrame>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      {/* NPC详情模态�� */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-[3px] border-black max-w-lg" style={{ background: 'rgba(26, 10, 12, 0.95)', boxShadow: '0px 0px 0px 2px #ff0040, 8px 8px 0px 0px #000000', filter: 'drop-shadow(0 0 20px rgba(255, 0, 64, 0.4))' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                >
                  <Hash className="w-6 h-6 text-[var(--highlight-yellow)]" />
                </motion.div>
                {selectedNpc?.name}
              </DialogTitle>
              <DialogDescription className="text-[var(--gray-300)]">
                查看实体的详细信息和已知线索
              </DialogDescription>
            </DialogHeader>

            {selectedNpc && (
              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">
                    已知背景摘要
                  </div>
                  <p className="text-gray-100 leading-relaxed">
                    {selectedNpc.id === "NPC-001"
                      ? "你只知道她是你童年的邻居，几年前嫁给了一个商人，之后就很少联系了。"
                      : "你对他几乎一无所知。"}
                  </p>
                </div>

                <Separator className="bg-black/50" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">
                      当前状态
                    </div>
                    <p className="text-gray-100">
                      {selectedNpc.status_summary}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">
                      心防 (Composure)
                    </div>
                    <p className="text-gray-100">
                      {selectedNpc.composure}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase text-gray-400 mb-1 font-semibold tracking-wider">
                    与你的关系 (Rapport)
                  </div>
                  <p
                    className={getRapportColor(
                      selectedNpc.rapport.sentiment,
                      selectedNpc.rapport.intensity,
                    )}
                  >
                    {selectedNpc.rapport.sentiment} (
                    {selectedNpc.rapport.intensity})
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase text-gray-400 mb-2 font-semibold tracking-wider">
                    已知线索
                  </div>
                  <ul className="space-y-1.5">
                    {selectedNpc.id === "NPC-001" &&
                    behaviorHistory.length > 0 ? (
                      <>
                        <li className="text-xs text-gray-100 flex items-start gap-2">
                          <span className="text-[#fbbf24] mt-1">
                            •
                          </span>
                          <span>她似乎在害怕某个他们。</span>
                        </li>
                        <li className="text-xs text-gray-100 flex items-start gap-2">
                          <span className="text-[#fbbf24] mt-1">
                            •
                          </span>
                          <span>她对商人这个词反应异常。</span>
                        </li>
                      </>
                    ) : (
                      <li className="text-xs text-gray-400 italic">
                        暂无线索
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
      {/* 消息详情弹窗 - 线索提取 */}
      <Dialog
        open={isMessageDetailOpen}
        onOpenChange={setIsMessageDetailOpen}
      >
        <DialogContent className="border-[3px] border-black max-w-lg" style={{ background: 'rgba(26, 10, 12, 0.95)', boxShadow: '0px 0px 0px 2px #8b5cf6, 8px 8px 0px 0px #000000', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <Radio className="w-6 h-6 text-[#8b5cf6]" />
                消息详情
              </DialogTitle>
              <DialogDescription className="text-[var(--gray-300)]">
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
                      className={`${selectedMessage.color} border text-xs px-2 py-1 text-white font-black`}
                      style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {selectedMessage.type ||
                        selectedMessage.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {selectedMessage.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-100 leading-relaxed">
                    {selectedMessage.text}
                  </p>
                </div>

                <Separator className="bg-black/50" />

                {/* 线索提取区 */}
                {selectedMessage.extractable_clue_id ? (
                  isClueExtracted(
                    selectedMessage.extractable_clue_id,
                  ) ? (
                    // 已提取状态
                    <div className="p-4 bg-green-900/20 border-[3px] border-green-500/30">
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
                      <div className="p-4 bg-yellow-900/20 border-[3px] border-yellow-500/30">
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
                        className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] border-[3px] border-black text-white"
                        style={{
                          boxShadow: '0 0 0 2px #A83C3C, 3px 3px 0 #000'
                        }}
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
                  <div className="p-4 bg-slate-800/50 border-[3px] border-slate-700/50">
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
        transition={{
          delay: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <motion.button
          onClick={() => {
            // 🔥 Phase 3: ClueInboxPanel内部已使用useClueInbox自动加载
            // loadClueInbox();
            setIsClueDrawerOpen(true);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-4 bg-[#fbbf24] border-[3px] border-black shadow-2xl transition-shadow"
          style={{
            boxShadow: '0 0 0 2px #A83C3C, 4px 4px 0 #000, 0 8px 20px rgba(251, 191, 36, 0.3)'
          }}
        >
          <Inbox className="w-6 h-6 text-white" />
          {(() => {
            // 只计数在追踪中的线索（正在进行的故事）
            console.log(
              "[ClueInbox Badge] 🔍 Calculating badge count @ " +
                Date.now() +
                ":",
              {
                totalClues: extractedClues.length,
                cluesStatus: extractedClues.map((c) => ({
                  id: c.clue_id,
                  status: c.status,
                })),
                trackingCount: extractedClues.filter(
                  (clue) => clue.status === "tracking",
                ).length,
                untrackedCount: extractedClues.filter(
                  (clue) => clue.status === "untracked",
                ).length,
                unreadCount: extractedClues.filter(
                  (clue) => clue.status === "unread",
                ).length,
                completedCount: extractedClues.filter(
                  (clue) => clue.status === "completed",
                ).length,
              },
            );
            const trackingCount = extractedClues.filter(
              (clue) => clue.status === "tracking",
            ).length;
            return (
              trackingCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 flex items-center justify-center text-xs font-bold text-white border-[3px] border-white"
                >
                  {trackingCount}
                </motion.div>
              )
            );
          })()}
        </motion.button>
      </motion.div>
      {/* 🔥 Phase 5: 开发者模式按钮 */}
      <motion.div
        className="fixed bottom-6 left-24 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.6,
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <motion.button
          onClick={() => setIsDevMode(!isDevMode)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-4 border-[3px] border-black shadow-2xl transition-all"
          style={{
            backgroundColor: isDevMode ? '#06b6d4' : '#64748b',
            boxShadow: isDevMode 
              ? '0 0 0 2px #A83C3C, 4px 4px 0 #000, 0 8px 20px rgba(6, 182, 212, 0.3)'
              : '0 0 0 2px #A83C3C, 4px 4px 0 #000'
          }}
        >
          <TestTube2 className="w-6 h-6 text-white" />
          {isDevMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-[3px] border-white"
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
        trackClue={trackClue} // 🔥 修复双实例：传入App的trackClue方法
        onEnterStory={handleEnterStory} // 🔥 进入故事回调
        activeStory={activeStory} // 🔥 KISS方案1：传入活跃故事，防止多实例不同步
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