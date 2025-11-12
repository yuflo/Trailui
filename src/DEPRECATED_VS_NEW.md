# 废弃 vs 新架构对照表

> **用途：** 快速查找废弃代码的替代方案

---

## 📁 **文件级别对照**

### **Service 层**

| 废弃文件 | 新文件 | 迁移说明 |
|---|---|---|
| `/engine/services/impl/StoryServiceImpl.ts` | `/engine/services/business/StoryService.ts` | 完全重写，使用 InstanceCacheManager |
| `/engine/services/impl/ClueServiceImpl.ts` | `/engine/services/business/ClueService.ts` | 完全重写，使用 InstanceCacheManager |
| `/engine/services/impl/NarrativeClueServiceImpl.ts` | 集成到 `ClueService` | 功能合并 |
| `/engine/services/impl/FreedomMirrorServiceImpl.ts` | `TurnManager` | 功能集成到 TurnManager |
| `/engine/services/impl/PlayerServiceImpl.ts` | `InstanceCacheManager` | 玩家数据直接用 Cache |

---

### **Cache 层**

| 废弃文件 | 新文件 | 迁移说明 |
|---|---|---|
| `/engine/cache/CacheManager.ts` | `/engine/cache/InstanceCacheManager.ts` | 完全重写，支持实例系统 |
| `/engine/cache/types.ts` | `/types/instance.types.ts` | 类型定义迁移 |

---

### **近场系统**

| 废弃文件 | 新文件 | 迁移说明 |
|---|---|---|
| `/engine/core/NearFieldManager.ts` | `/engine/core/NearFieldManagerSimple.ts` | 简化版，更易理解 |

---

## 🔧 **API 级别对照**

### **Story Service**

| 废弃 API | 新 API | 示例 |
|---|---|---|
| `StoryServiceImpl.getAllStories()` | `StoryService.getStoryConfig()` | 从 DataAccess 读取 |
| `StoryServiceImpl.loadStory()` | `StoryService.createStoryInstance()` | 创建实例到 Cache |
| - | `StoryService.enterScene()` | 新增：进入场景 |
| - | `StoryService.completeScene()` | 新增：完成场景 |

**迁移示例：**

```typescript
// ❌ 旧版
const stories = await storyServiceImpl.getAllStories();

// ✅ 新版
const story = await StoryDataAccess.getStoryById('story-hk-001');
InstanceCacheManager.createStoryInstance(playerId, clueId, story);
```

---

### **Clue Service**

| 废弃 API | 新 API | 示例 |
|---|---|---|
| `ClueServiceImpl.getCluesForStory()` | `ClueService.getPlayerClues()` | 从 Cache 读取 |
| `ClueServiceImpl.trackClue()` | `ClueService.trackClue()` | 创建故事实例 |
| `ClueServiceImpl.updateClueStatus()` | ❌ 废弃 | 状态自动派生 |
| `ClueServiceImpl.getTrackedStories()` | `InstanceCacheManager.getPlayerStories()` | 直接从 Cache |

**迁移示例：**

```typescript
// ❌ 旧版
await clueServiceImpl.updateClueStatus(clueId, 'tracking');

// ✅ 新版（状态自动派生）
// 追踪线索 → 状态自动变为 tracking
await ClueService.trackClue(playerId, clueId);

// 完成故事 → 状态自动变为 completed
StoryService.completeStory(storyInstanceId);
```

---

### **Cache / 数据存储**

| 废弃 API | 新 API | 说明 |
|---|---|---|
| `CacheManager.registerClue()` | `InstanceCacheManager.createClueRecord()` | 创建线索记录 |
| `CacheManager.addClueToInbox()` | `InstanceCacheManager.createClueRecord()` | 同上 |
| `CacheManager.updateClueStatus()` | ❌ 废弃 | 状态自动派生 |
| `CacheManager.trackStory()` | `InstanceCacheManager.createStoryInstance()` | 创建故事实例 |
| `CacheManager.getPlayerClues()` | `InstanceCacheManager.getPlayerClueRecords()` | 获取线索 |

**类型迁移对照：**

| 旧类型 | 新类型 | 字段对照 |
|---|---|---|
| `ClueStaticData` | `ClueConfig` | 基本一致 |
| `PlayerClueRecord` | `ClueRecord` | 添加了 `story_instance_id` |
| `StoryProgressRecord` | `StoryInstance` | 完全重新设计 |
| `ClueWithStatus` | ❌ 废弃 | 使用 `ClueRecord` + 派生状态 |

---

## 📦 **类型定义对照**

### **游戏状态字段**

| 废弃字段 (GameState) | 新字段 | 说明 |
|---|---|---|
| `nearfield_active` | `nearfield.active` | 迁移到嵌套对象 |
| `current_scene_id` | `nearfield.sceneId` | 迁移到嵌套对象 |
| `scene_history_context` | `nearfield.narrativeSequence.slice(0, displayIndex+1)` | 改为计算属性 |
| `awaiting_action_type` | `nearfield.mode` | 重新设计 |
| `current_narrative_sequence` | `nearfield.narrativeSequence` | 迁移到嵌套对象 |
| `current_narrative_index` | `nearfield.displayIndex` | 迁移到嵌套对象 |
| `mirrorMode` | 计算派生 | 不再存储 |
| `scenePlot` | `nearfield.narrativeSequence` | 重新设计 |
| `currentPlotIndex` | `nearfield.displayIndex` | 重命名 |
| `displayedPlotUnits` | 计算属性 | 不再存储 |
| `currentHint` | `nearfield.interventionHint` | 迁移到嵌套对象 |

**迁移示例：**

```typescript
// ❌ 旧版
const isNearFieldActive = gameState.nearfield_active;
const sceneId = gameState.current_scene_id;
const history = gameState.scene_history_context;

// ✅ 新版
const isNearFieldActive = gameState.nearfield.active;
const sceneId = gameState.nearfield.sceneId;
const history = gameState.nearfield.narrativeSequence.slice(
  0, 
  gameState.nearfield.displayIndex + 1
);
```

---

## 🔄 **导入路径对照**

### **Service 导入**

```typescript
// ❌ 旧版
import { StoryServiceImpl } from './engine/services/impl/StoryServiceImpl';
import { ClueServiceImpl } from './engine/services/impl/ClueServiceImpl';

// ✅ 新版
import { StoryService } from './engine/services/business/StoryService';
import { ClueService } from './engine/services/business/ClueService';

// 或者从统一导出
import { StoryService, ClueService } from './engine/services/business';
```

---

### **Cache 导入**

```typescript
// ❌ 旧版
import { CacheManager } from './engine/cache/CacheManager';
import type { ClueStaticData, PlayerClueRecord } from './engine/cache/types';

// ✅ 新版
import { InstanceCacheManager } from './engine/cache/InstanceCacheManager';
import type { ClueRecord, StoryInstance } from './types/instance.types';
```

---

### **类型导入**

```typescript
// ❌ 旧版
import type { MirrorMode } from './types/engine.types';  // 已废弃

// ✅ 新版
import type { FreeMirrorMode } from './types/engine.types';

// 或者直接使用字符串字面量
type Mode = 'plot' | 'conflict' | 'free-mirror';
```

---

## 📝 **常见使用场景迁移**

### **场景 1：追踪线索**

```typescript
// ❌ 旧版（使用 ClueServiceImpl）
await clueServiceImpl.trackClue(clueId);
await clueServiceImpl.updateClueStatus(clueId, 'tracking');

// ✅ 新版（使用 ClueService）
await ClueService.trackClue(playerId, clueId);
// 状态自动变为 'tracking'，无需手动更新
```

---

### **场景 2：获取线索列表**

```typescript
// ❌ 旧版
const clues = await clueServiceImpl.getCluesForStory(storyId);

// ✅ 新版
const clues = ClueService.getPlayerClues(playerId);
// 或者按状态过滤
const trackingClues = clues.filter(c => c.status === 'tracking');
```

---

### **场景 3：进入场景**

```typescript
// ❌ 旧版（没有统一API）
stateManager.setState({ 
  current_scene_id: sceneId,
  nearfield_active: true 
});

// ✅ 新版
await StoryService.enterScene(storyInstanceId, sceneTemplateId);
// 自动创建场景实例、NPC 实例、生成叙事
```

---

### **场景 4：完成故事**

```typescript
// ❌ 旧版
await clueServiceImpl.updateClueStatus(clueId, 'completed');
CacheManager.updateStoryProgress(storyId, { completed: true });

// ✅ 新版
StoryService.completeStory(storyInstanceId);
// 自动更新：
// - StoryInstance.status = 'completed'
// - ClueRecord.status = 'completed'
// - ClueRecord.completed_at = timestamp
```

---

### **场景 5：获取场景数据**

```typescript
// ❌ 旧版（直接访问 data 文件）
import { demoStoryMap } from './data/hong-kong/demo-story-map.data';
const scene = demoStoryMap['story-hk-001'].scenes['scene-a'];

// ✅ 新版（通过 DataAccess）
const storyDataAccess = DataAccessFactory.createStoryDataAccess();
const scene = await storyDataAccess.getSceneById('story-hk-001', 'scene-a');

// 或者（Demo阶段）从 MockDataProvider
const sceneTemplate = MockSceneProvider.getSceneTemplate('scene-a');
```

---

### **场景 6：生成场景叙事**

```typescript
// ❌ 旧版（没有统一方法）
// 每个地方自己硬编码文本

// ✅ 新版
const narrative = SceneService.generateSceneNarrative(sceneInstanceId);
// Demo: 返回 MockSceneProvider 的预设文本
// 正式版: 调用 LLM API 动态生成
```

---

### **场景 7：NPC 对话**

```typescript
// ❌ 旧版（没有统一方法）
// 手动拼接对话

// ✅ 新版
const response = NPCService.generateNPCDialogue(
  npcInstanceId, 
  playerInput,
  context
);
// Demo: 返回 MockNPCProvider 的预设对话
// 正式版: 调用 LLM API 动态生成

// 自动保存对话历史
const history = NPCService.getDialogueHistory(npcInstanceId);
```

---

## ✅ **完整迁移示例**

### **旧版代码（完整流程）**

```typescript
// 1. 注册线索
CacheManager.registerClue({
  clue_id: 'clue-001',
  title: '神秘线索',
  source: '未知',
  story_id: 'story-hk-001'
});

// 2. 添加到收件箱
CacheManager.addClueToInbox('player-001', 'clue-001');

// 3. 追踪线索
await clueServiceImpl.trackClue('clue-001');
await clueServiceImpl.updateClueStatus('clue-001', 'tracking');

// 4. 追踪故事
CacheManager.trackStory('player-001', 'clue-001', 'story-hk-001');

// 5. 进入场景（手动）
stateManager.setState({ 
  current_scene_id: 'scene-a',
  nearfield_active: true 
});

// 6. 完成场景（手动）
CacheManager.updateStoryProgress('story-hk-001', { 
  completed_scenes: ['scene-a'] 
});

// 7. 完成故事（手动）
await clueServiceImpl.updateClueStatus('clue-001', 'completed');
```

---

### **新版代码（完整流程）**

```typescript
// 1. 初始化线索（从 DataAccess 或手动创建）
InstanceCacheManager.createClueRecord({
  clue_id: 'clue-001',
  player_id: 'player-001',
  story_template_id: 'story-hk-001',
  title: '神秘线索',
  description: '...',
  source: '未知',
  status: 'unread',  // 自动管理
  received_at: Date.now()
});

// 2. 追踪线索（自动创建故事实例）
await ClueService.trackClue('player-001', 'clue-001');
// ✅ 自动完成：
// - ClueRecord.status → 'tracking'
// - 创建 StoryInstance
// - ClueRecord.story_instance_id → 关联

// 3. 进入场景（自动化）
await StoryService.enterScene(storyInstanceId, 'scene-a');
// ✅ 自动完成：
// - 创建 SceneInstance
// - 创建 NPC 实例
// - 生成场景叙事
// - 保存到 Cache

// 4. 完成场景（自动化）
StoryService.completeScene(storyInstanceId, sceneInstanceId);
// ✅ 自动完成：
// - SceneInstance.status → 'completed'
// - StoryInstance.completed_scenes.push(sceneId)
// - StoryInstance.progress_percentage 更新

// 5. 完成故事（自动化）
StoryService.completeStory(storyInstanceId);
// ✅ 自动完成：
// - StoryInstance.status → 'completed'
// - ClueRecord.status → 'completed'
// - ClueRecord.completed_at → timestamp
```

---

## 🎯 **核心差异总结**

| 维度 | 旧版 | 新版 |
|---|---|---|
| **数据存储** | CacheManager (混乱) | InstanceCacheManager (清晰分层) |
| **Service 职责** | 混合业务+数据访问 | 纯业务逻辑 |
| **状态管理** | 手动更新 | 自动派生 |
| **线索状态** | 手动调用 updateStatus | 根据 StoryInstance 自动计算 |
| **场景进入** | 手动设置 state | 调用 enterScene() |
| **叙事生成** | 分散在各处 | 统一 SceneService |
| **NPC 对话** | 手动拼接 | 统一 NPCService |
| **数据访问** | 直接 import data 文件 | DataAccess 接口 |
| **LLM 模拟** | 没有 | MockDataProvider |

---

## 💡 **迁移建议**

1. **不要一次性全部迁移** - 按模块逐步迁移
2. **先更新导入** - 确保能编译通过
3. **保留旧代码注释** - 方便对照
4. **充分测试** - 每迁移一个功能就测试
5. **参考新文档** - 查看 ARCHITECTURE.md

---

**需要更多帮助？查看 `/CODE_CLEANUP_CHECKLIST.md` 和 `/CLEANUP_QUICK_GUIDE.md`**
