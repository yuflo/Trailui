# 自由镜UI系统性优化方案

## 🔍 问题诊断

### 当前症状
用户点击"进入故事"后：
- ✅ `switchStory()` 成功加载故事
- ✅ `enterNearField()` 成功进入场景
- ✅ `nearfield_active` 变为 `true`
- ✅ `current_narrative_sequence` 被填充数据
- ❌ **自由镜保持空白，不显示剧情**

### 根本原因

#### 1. UI条件判断错误
**当前代码**（App.tsx:671-720）：
```tsx
nearfield_active && (mirrorMode === 'plot_playing' || mirrorMode === 'plot_paused')
```

**问题**：
- `mirrorMode` 的类型定义（types/engine.types.ts:40）：
  ```typescript
  export enum MirrorMode {
    PLOT_PLAYING = 'plot_playing',
    PLOT_PAUSED = 'plot_paused',
    CONFLICT = 'conflict'
  }
  ```
- `mirrorMode` 初始值是 `'conflict'`（StateManager.ts:54）
- **近场交互系统从不修改 `mirrorMode`**
- 所以 `mirrorMode === 'plot_playing'` 永远为 `false`

#### 2. 数据源混乱
UI代码中存在三个不同的数据源：

| 数据源 | 用途 | 来源 | 状态 |
|--------|------|------|------|
| `displayedPlotUnits` | 旧剧本系统 | 剧本播放器 | ⚠️ 废弃 |
| `behaviorHistory` | 冲突交互 | 行为流系统 | ✅ 正常 |
| `current_narrative_sequence` | 近场叙事 | 近场交互系统 | ✅ 正常 |

**问题**：
- UI试图用 `displayedPlotUnits` 显示近场叙事
- 但近场交互系统填充的是 `current_narrative_sequence`
- 两者完全不同步

#### 3. 架构不一致

**后端数据流**：
```
NearFieldServiceImpl.handleLoadScene()
  → 返回 new_events (NarrativeUnit[])
  → NearFieldManager 接收
  → 存储到 state.current_narrative_sequence
```

**UI期望的数据流**：
```
??? 
  → displayedPlotUnits
  → 渲染到自由镜
```

**断层**：中间缺少了从 `current_narrative_sequence` 到 UI 的映射！

---

## 🎯 优化目标

### 1. 明确状态机
近场交互系统应该有明确的状态指示：
- `nearfield_active` - 是否激活近场模式
- `current_narrative_sequence` - 当前场景的叙事序列
- `current_narrative_index` - 当前播放到第几条

### 2. 简化UI逻辑
自由镜应该只有三种显示模式：
1. **空状态** - 未进入故事
2. **近场叙事模式** - 播放 narrative_sequence
3. **冲突交互模式** - 显示 behaviorHistory

### 3. 统一数据流
- 近场叙事：`current_narrative_sequence` → UI
- 冲突交互：`behaviorHistory` → UI
- 不混用，不交叉

---

## 📋 优化方案

### Phase 1: 类型系统清理

#### 1.1 废弃旧的 MirrorMode 枚举
**文件**: `/types/engine.types.ts`

**当前定义**（行40-44）：
```typescript
export enum MirrorMode {
  PLOT_PLAYING = 'plot_playing',
  PLOT_PAUSED = 'plot_paused',
  CONFLICT = 'conflict'
}
```

**问题**：
- `PLOT_PLAYING` 和 `PLOT_PAUSED` 从未被使用
- 只有 `CONFLICT` 在使用

**优化方案**：
```typescript
/**
 * 自由镜显示模式
 * - IDLE: 空状态（未进入故事）
 * - NARRATIVE: 近场叙事模式（播放narrative_sequence）
 * - INTERACTION: 冲突交互模式（显示behaviorHistory）
 */
export enum FreeMirrorMode {
  IDLE = 'idle',
  NARRATIVE = 'narrative',
  INTERACTION = 'interaction'
}
```

#### 1.2 更新 GameState 类型
**文件**: `/types/engine.types.ts`

**当前字段**（行97）：
```typescript
mirrorMode: MirrorMode;
```

**优化方案**：
```typescript
/** 自由镜当前显示模式（由UI根据状态计算，不存储） */
// mirrorMode: FreeMirrorMode;  // ← 删除，改为计算属性
```

**原因**：
- `mirrorMode` 应该是**派生状态**，不应该存储
- 可以根据 `nearfield_active` 和 `current_narrative_sequence` 计算得出

---

### Phase 2: StateManager 清理

#### 2.1 移除 mirrorMode 字段
**文件**: `/engine/core/StateManager.ts`

**当前代码**（行54）：
```typescript
mirrorMode: 'conflict' as MirrorMode,
```

**优化方案**：
```typescript
// 删除 mirrorMode 字段
// 删除所有 setMirrorMode() 相关代码
```

#### 2.2 添加计算属性方法
**文件**: `/engine/core/StateManager.ts`

**新增方法**：
```typescript
/**
 * 计算自由镜当前显示模式
 */
getFreeMirrorMode(): FreeMirrorMode {
  const state = this.state;
  
  // 1. 未进入故事
  if (!state.nearfield_active || state.sessionState !== 'playing') {
    return FreeMirrorMode.IDLE;
  }
  
  // 2. 近场叙事模式
  if (state.current_narrative_sequence && state.current_narrative_sequence.length > 0) {
    return FreeMirrorMode.NARRATIVE;
  }
  
  // 3. 冲突交互模式
  return FreeMirrorMode.INTERACTION;
}
```

---

### Phase 3: 废弃代码清理

#### 3.1 删除 displayedPlotUnits 相关代码

**文件**: `/types/engine.types.ts`

**删除字段**（行103-107）：
```typescript
// 删除这些字段：
scenePlot: ScenePlot | null;
currentPlotIndex: number;
displayedPlotUnits: Array<{
  actor: string;
  content: string;
  type?: string;
}>;
currentHint: string | null;
```

**文件**: `/engine/core/StateManager.ts`

**删除初始化代码**（行55-58）：
```typescript
// 删除这些字段的初始化：
scenePlot: null,
currentPlotIndex: 0,
displayedPlotUnits: [],
currentHint: null,
```

#### 3.2 删除 useGameEngine 中的相关逻辑

**文件**: `/hooks/useGameEngine.ts`

**删除以下computed状态**：
```typescript
// 删除：
const displayedPlotUnits = useMemo(() => { ... }, [gameState]);
const currentHint = useMemo(() => { ... }, [gameState]);
```

---

### Phase 4: UI条件渲染优化

#### 4.1 添加 FreeMirror 模式计算
**文件**: `/App.tsx`

**在组件顶部添加**：
```typescript
// 计算自由镜显示模式
const freeMirrorMode = useMemo(() => {
  // 1. 未进入故事
  if (!nearfield_active || sessionState !== 'playing') {
    return 'idle';
  }
  
  // 2. 近场叙事模式
  if (gameState.current_narrative_sequence && gameState.current_narrative_sequence.length > 0) {
    return 'narrative';
  }
  
  // 3. 冲突交互模式
  return 'interaction';
}, [nearfield_active, sessionState, gameState.current_narrative_sequence]);
```

#### 4.2 重写自由镜条件渲染
**文件**: `/App.tsx`（行666-850）

**当前复杂的嵌套条件**：
```tsx
{sessionState !== 'playing' ? (
  // 空状态
) : nearfield_active && (mirrorMode === 'plot_playing' || mirrorMode === 'plot_paused') ? (
  // 近场叙事（错误的条件）
) : (
  // 冲突模式
)}
```

**优化后的清晰结构**：
```tsx
{freeMirrorMode === 'idle' && (
  // ========== 空状态 ==========
  <EmptyStateView />
)}

{freeMirrorMode === 'narrative' && (
  // ========== 近场叙事模式 ==========
  <NarrativeView narrativeSequence={gameState.current_narrative_sequence} />
)}

{freeMirrorMode === 'interaction' && (
  // ========== 冲突交互模式 ==========
  <InteractionView behaviorHistory={behaviorHistory} />
)}
```

---

### Phase 5: 数据流统一映射

#### 5.1 创建 NarrativeView 组件

**新文件**: `/components/NarrativeView.tsx`

```tsx
import { motion, AnimatePresence } from 'motion/react';
import { Eye } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import type { NarrativeUnit } from '../types';

interface NarrativeViewProps {
  narrativeSequence: NarrativeUnit[] | null;
}

export function NarrativeView({ narrativeSequence }: NarrativeViewProps) {
  if (!narrativeSequence || narrativeSequence.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">加载叙事中...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="space-y-2 pr-4">
        <AnimatePresence>
          {narrativeSequence.map((unit, idx) => (
            <motion.div
              key={`narrative-${idx}`}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25
              }}
            >
              {unit.actor === 'System' ? (
                <div className="flex justify-center py-1.5">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 border-2 border-yellow-500/50 rounded-lg comic-sfx">
                    <p className="text-sm text-yellow-300 font-semibold text-center flex items-center gap-2 uppercase">
                      <Eye className="w-4 h-4" />
                      {unit.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end mb-2">
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 text-red-300 mb-1 justify-end">
                      <span className="text-xs text-gray-500">
                        [{unit.unit_type === 'InterventionPoint' ? '介入时机点' : '剧情'}]
                      </span>
                      <span className="font-semibold">< [{unit.actor}]</span>
                    </div>
                    <div className="speech-bubble-npc bg-gradient-to-br from-red-900/40 to-pink-900/40 text-xs text-gray-200 leading-relaxed">
                      {unit.content}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
```

#### 5.2 创建 InteractionView 组件

**新文件**: `/components/InteractionView.tsx`

```tsx
import { motion, AnimatePresence } from 'motion/react';
import { Eye } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import type { BehaviorStreamItem } from '../types';

interface InteractionViewProps {
  behaviorHistory: BehaviorStreamItem[];
  sceneSetting?: string;
  isTyping?: boolean;
}

export function InteractionView({ 
  behaviorHistory, 
  sceneSetting, 
  isTyping 
}: InteractionViewProps) {
  return (
    <>
      {/* 场景描述 */}
      {sceneSetting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 border-l-4 border-cyan-500/50 bg-slate-800/50 rounded-r-lg flex-shrink-0"
        >
          <p className="italic text-xs text-gray-300 leading-relaxed">
            {sceneSetting}
            {isTyping && (
              <motion.span
                className="inline-block w-2 h-5 bg-cyan-400 ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              />
            )}
          </p>
        </motion.div>
      )}

      {/* 行为流 */}
      <ScrollArea className="flex-grow min-h-0">
        <div className="space-y-2 pr-4">
          <AnimatePresence>
            {behaviorHistory.map((item, idx) => (
              <motion.div
                key={`behavior-${idx}`}
                layout
                initial={{ 
                  opacity: 0, 
                  x: item.isPlayer ? -20 : item.isSystem ? 0 : 20,
                  scale: 0.9 
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 25
                }}
              >
                {item.isPlayer ? (
                  <div className="flex justify-start mb-2">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 text-blue-300 mb-1">
                        <span className="font-semibold">> [你]</span>
                      </div>
                      <div className="speech-bubble bg-gradient-to-br from-blue-900/40 to-cyan-900/40 text-xs text-gray-200 leading-relaxed">
                        {item.narrative_snippet}
                      </div>
                    </div>
                  </div>
                ) : item.isSystem ? (
                  <div className="flex justify-center py-1.5">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 border-2 border-yellow-500/50 rounded-lg comic-sfx">
                      <p className="text-sm text-yellow-300 font-semibold text-center flex items-center gap-2 uppercase">
                        <Eye className="w-4 h-4" />
                        {item.narrative_snippet}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mb-2">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 text-red-300 mb-1 justify-end">
                        <span className="text-xs text-gray-500">[{item.behavior_type}]</span>
                        <span className="font-semibold">< [{item.name || item.actor}]</span>
                      </div>
                      <div className="speech-bubble-npc bg-gradient-to-br from-red-900/40 to-pink-900/40 text-xs text-gray-200 leading-relaxed">
                        {item.narrative_snippet}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </>
  );
}
```

#### 5.3 创建 EmptyStateView 组件

**新文件**: `/components/EmptyStateView.tsx`

```tsx
import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateViewProps {
  sessionState: 'idle' | 'loaded' | 'playing';
  onOpenClueInbox: () => void;
}

export function EmptyStateView({ sessionState, onOpenClueInbox }: EmptyStateViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <motion.div
        className="text-6xl mb-4 opacity-30"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        👁️
      </motion.div>
      <h3 className="text-xl text-gray-400 mb-2">
        {sessionState === 'idle' ? '当前未追踪任何故事' : '请选择一个故事开始'}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {sessionState === 'idle' 
          ? '从左侧世界信息流中提取线索，然后在线索收件箱中追踪故事'
          : '点击下方按钮打开线索收件箱，选择追踪的故事进入'
        }
      </p>
      <Button
        variant="outline"
        className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
        onClick={onOpenClueInbox}
      >
        <Inbox className="w-4 h-4 mr-2" />
        打开线索收件箱
      </Button>
    </div>
  );
}
```

---

### Phase 6: App.tsx 重构

#### 6.1 简化导入
```tsx
// 新增组件导入
import { NarrativeView } from './components/NarrativeView';
import { InteractionView } from './components/InteractionView';
import { EmptyStateView } from './components/EmptyStateView';
```

#### 6.2 简化状态计算
```tsx
// 删除复杂的 displayedPlotUnits 计算
// 添加简单的 freeMirrorMode 计算
const freeMirrorMode = useMemo(() => {
  if (!nearfield_active || sessionState !== 'playing') {
    return 'idle';
  }
  
  if (gameState.current_narrative_sequence && gameState.current_narrative_sequence.length > 0) {
    return 'narrative';
  }
  
  return 'interaction';
}, [nearfield_active, sessionState, gameState.current_narrative_sequence]);
```

#### 6.3 重写自由镜渲染
```tsx
<CardContent className="p-4 flex flex-col h-full min-h-0 flex-grow">
  {/* ========== 空状态 ========== */}
  {freeMirrorMode === 'idle' && (
    <EmptyStateView 
      sessionState={sessionState}
      onOpenClueInbox={() => setIsClueDrawerOpen(true)}
    />
  )}

  {/* ========== 近场叙事模式 ========== */}
  {freeMirrorMode === 'narrative' && (
    <NarrativeView 
      narrativeSequence={gameState.current_narrative_sequence}
    />
  )}

  {/* ========== 冲突交互模式 ========== */}
  {freeMirrorMode === 'interaction' && (
    <InteractionView 
      behaviorHistory={behaviorHistory}
      sceneSetting={displayedSceneSetting}
      isTyping={isTyping}
    />
  )}
</CardContent>
```

---

## 🔄 数据流对比

### 优化前（错误）
```
NearFieldServiceImpl
  ↓ 返回 new_events
NearFieldManager
  ↓ 存储到 current_narrative_sequence
StateManager
  ↓ ??? （断层）
UI
  ↓ 检查 mirrorMode === 'plot_playing' (永远false)
  ↓ 尝试读取 displayedPlotUnits (空)
  ↓ ❌ 不显示任何内容
```

### 优化后（正确）
```
NearFieldServiceImpl
  ↓ 返回 new_events (NarrativeUnit[])
NearFieldManager
  ↓ 存储到 state.current_narrative_sequence
StateManager
  ↓ ✅ 直接暴露 current_narrative_sequence
UI
  ↓ 计算 freeMirrorMode = 'narrative'
  ↓ 渲染 <NarrativeView narrativeSequence={...} />
  ↓ ✅ 显示叙事内容
```

---

## 📝 执行步骤

### Step 1: 类型系统清理
1. 修改 `/types/engine.types.ts`
   - 添加 `FreeMirrorMode` 枚举
   - 删除 `MirrorMode` 枚举（或标记为 @deprecated）
   - 从 `GameState` 删除 `mirrorMode`, `scenePlot`, `displayedPlotUnits` 等字段

### Step 2: StateManager 清理
1. 修改 `/engine/core/StateManager.ts`
   - 删除 `mirrorMode` 相关字段
   - 删除 `scenePlot`, `displayedPlotUnits` 相关字段
   - 添加 `getFreeMirrorMode()` 计算方法

### Step 3: 创建UI组件
1. 创建 `/components/NarrativeView.tsx`
2. 创建 `/components/InteractionView.tsx`
3. 创建 `/components/EmptyStateView.tsx`

### Step 4: Hook层清理
1. 修改 `/hooks/useGameEngine.ts`
   - 删除 `displayedPlotUnits` 计算
   - 删除 `currentHint` 计算
   - 简化返回值

### Step 5: App.tsx 重构
1. 导入新组件
2. 添加 `freeMirrorMode` 计算
3. 重写自由镜条件渲染
4. 删除废弃代码

### Step 6: 验证测试
1. 测试空状态显示
2. 测试近场叙事显示
3. 测试冲突交互显示
4. 测试模式切换

---

## ✅ 验证清单

### 数据流验证
- [ ] `current_narrative_sequence` 正确填充
- [ ] `freeMirrorMode` 正确计算为 `'narrative'`
- [ ] `NarrativeView` 接收到正确数据
- [ ] UI 正确渲染叙事内容

### 功能验证
- [ ] 点击"进入故事"后自由镜立即显示剧情
- [ ] 叙事内容按照 narrative_sequence 顺序显示
- [ ] System 类型的叙事显示为黄色横幅
- [ ] NPC 对话显示为红色气泡
- [ ] 介入时机点正确标记

### 架构验证
- [ ] 删除了所有 `displayedPlotUnits` 引用
- [ ] 删除了错误的 `mirrorMode` 条件判断
- [ ] 数据流清晰，没有断层
- [ ] UI 组件职责单一

---

## 🎯 预期效果

### 优化前
- 用户点击"进入故事"
- 自由镜保持空白 ❌
- 需要手动刷新或其他操作

### 优化后
- 用户点击"进入故事"
- 自由镜立即显示第一条剧情 ✅
- 流畅的沉浸式体验

---

## 📊 影响范围

### 修改的文件
1. `/types/engine.types.ts` - 类型定义清理
2. `/engine/core/StateManager.ts` - 状态管理清理
3. `/hooks/useGameEngine.ts` - Hook 层清理
4. `/App.tsx` - UI 重构

### 新增的文件
1. `/components/NarrativeView.tsx`
2. `/components/InteractionView.tsx`
3. `/components/EmptyStateView.tsx`

### 删除的代码
- `MirrorMode` 枚举（或标记废弃）
- `mirrorMode` 状态字段
- `scenePlot` 相关字段
- `displayedPlotUnits` 相关逻辑
- 错误的条件判断逻辑

---

## 🚀 执行优先级

### P0 - 立即修复（核心问题）
1. 修改自由镜条件判断（App.tsx）
2. 添加 `freeMirrorMode` 计算
3. 直接使用 `current_narrative_sequence` 渲染

### P1 - 架构优化（重构）
1. 创建专用UI组件
2. 清理类型定义
3. 删除废弃代码

### P2 - 后续改进（可选）
1. 添加动画优化
2. 添加错误边界处理
3. 性能优化

---

## 💡 关键洞察

1. **状态应该是数据驱动的**：
   - 不要手动设置 `mirrorMode`
   - 应该根据数据状态计算显示模式

2. **避免数据冗余**：
   - `current_narrative_sequence` 是唯一真相源
   - 不需要 `displayedPlotUnits` 的镜像副本

3. **组件职责单一**：
   - `NarrativeView` 只负责显示叙事
   - `InteractionView` 只负责显示交互
   - `EmptyStateView` 只负责显示空状态

4. **计算属性优于存储**：
   - `freeMirrorMode` 应该是计算属性
   - 不应该作为状态存储

---

**文档版本**: v1.0  
**创建日期**: 2025-11-09  
**状态**: ✅ 方案制定完成，待执行
