# Dreamheart 引擎 - 代码清理清单

> **生成时间：** 2024年（基于当前架构分析）  
> **目的：** 梳理所有历史遗留逻辑和废弃实现，为开发清理提供指导

---

## 📊 **清理优先级说明**

| 优先级 | 标记 | 说明 | 建议操作 |
|---|---|---|---|
| **🔴 P0 - 立即清理** | 🗑️ | 完全废弃，可直接删除 | 删除文件/代码 |
| **🟡 P1 - 重构清理** | 🔄 | 功能重复，需重构替换 | 迁移后删除 |
| **🟢 P2 - 向后兼容** | ⚠️ | 暂时保留，逐步移除 | 标记为deprecated |
| **🔵 P3 - 待补全** | 📝 | 骨架代码，等待实现 | 补全或删除 |

---

## 🗑️ **P0 - 立即删除（完全废弃）**

### **1. 废弃的 Service 实现层 (impl/)**

**问题：** 这些实现已被 `business/` 层的新 Service 完全替代

| 文件 | 状态 | 替代方案 | 删除影响 |
|---|---|---|---|
| `/engine/services/impl/StoryServiceImpl.ts` | 🗑️ 废弃 | `business/StoryService.ts` | 需更新导入 |
| `/engine/services/impl/ClueServiceImpl.ts` | 🗑️ 废弃 | `business/ClueService.ts` | 需更新导入 |
| `/engine/services/impl/NarrativeClueServiceImpl.ts` | 🗑️ 废弃 | 集成到 `business/ClueService.ts` | 需更新导入 |
| `/engine/services/impl/FreedomMirrorServiceImpl.ts` | 🗑️ 废弃 | 功能已集成到 TurnManager | 可直接删除 |
| `/engine/services/impl/PlayerServiceImpl.ts` | 🗑️ 废弃 | 玩家数据现在在 InstanceCacheManager | 可直接删除 |

**清理步骤：**

```bash
# 1. 检查引用
grep -r "StoryServiceImpl" --include="*.ts" --include="*.tsx"
grep -r "ClueServiceImpl" --include="*.ts" --include="*.tsx"
grep -r "NarrativeClueServiceImpl" --include="*.ts" --include="*.tsx"

# 2. 更新引用（示例）
# 从：import { StoryServiceImpl } from './services/impl'
# 改为：import { StoryService } from './services/business'

# 3. 删除文件
rm /engine/services/impl/StoryServiceImpl.ts
rm /engine/services/impl/ClueServiceImpl.ts
rm /engine/services/impl/NarrativeClueServiceImpl.ts
rm /engine/services/impl/FreedomMirrorServiceImpl.ts
rm /engine/services/impl/PlayerServiceImpl.ts
```

---

### **2. 废弃的 Cache 系统**

**问题：** `CacheManager` 已被 `InstanceCacheManager` 完全替代

| 文件 | 状态 | 替代方案 | 删除影响 |
|---|---|---|---|
| `/engine/cache/CacheManager.ts` | 🗑️ 废弃 | `InstanceCacheManager.ts` | 需更新所有引用 |
| `/engine/cache/types.ts` | 🗑️ 废弃 | 使用 `instance.types.ts` | 需更新类型导入 |

**清理步骤：**

```bash
# 1. 检查引用
grep -r "CacheManager" --include="*.ts" --exclude-dir=node_modules

# 2. 替换引用
# 从：import { CacheManager } from './cache/CacheManager'
# 改为：import { InstanceCacheManager } from './cache/InstanceCacheManager'

# 3. 删除文件
rm /engine/cache/CacheManager.ts
rm /engine/cache/types.ts
```

**类型迁移对照表：**

| 旧类型 (CacheManager) | 新类型 (InstanceCacheManager) |
|---|---|
| `ClueStaticData` | `ClueConfig` (from story.types.ts) |
| `PlayerClueRecord` | `ClueRecord` (from instance.types.ts) |
| `StoryProgressRecord` | `StoryInstance` (from instance.types.ts) |
| `ClueWithStatus` | 废弃（改用 ClueRecord + 派生状态） |

---

### **3. 废弃的近场管理器（旧版）**

**问题：** `NearFieldManager` 被 `NearFieldManagerSimple` 替代

| 文件 | 状态 | 替代方案 | 删除影响 |
|---|---|---|---|
| `/engine/core/NearFieldManager.ts` | 🗑️ 废弃 | `NearFieldManagerSimple.ts` | 需更新 GameEngine |

**清理步骤：**

```bash
# 1. 检查 GameEngine 中的引用
# 文件：/engine/core/GameEngine.ts
# 搜索：nearFieldManager（小写开头的旧实例）

# 2. 删除旧版实例
# Line 46: private nearFieldManager: NearFieldManager;  // ← 删除此行
# Line 439-444: 删除旧版 handlePass() 逻辑
# Line 496-508: 删除旧版 handleInteract() 逻辑

# 3. 删除文件
rm /engine/core/NearFieldManager.ts
```

**GameEngine 需要修改的代码：**

```typescript
// ❌ 删除这些代码
private nearFieldManager: NearFieldManager;  // 旧版（保留向后兼容）

this.nearFieldManager = new NearFieldManager(
  this.stateManager,
  this.serviceContainer.getNearFieldService()
);

// ========== 近场交互系统（旧版 NearFieldManager）==========
if (state.nearfield_active && state.awaiting_action_type?.type === 'AWAITING_INTERVENTION') {
  console.log('[GameEngine] Delegating pass to NearFieldManager (legacy)');
  await this.nearFieldManager.handlePass();
  return;
}
```

---

### **4. 测试文件（已完成验证的）**

**问题：** Phase 测试文件已完成任务，可以归档

| 文件 | 状态 | 建议 |
|---|---|---|
| `/engine/test/phase3-integration.test.ts` | ✅ 已完成 | 移至 `/docs/archive/tests/` |
| `/engine/test/phase6-validation.test.ts` | ✅ 已完成 | 移至 `/docs/archive/tests/` |
| `/engine/test/nearfield-simplified.test.ts` | ✅ 已完成 | 移至 `/docs/archive/tests/` |
| `/engine/cache/__tests__/InstanceCacheManager.test.ts` | ⚠️ 保留 | 单元测试，应保留 |

---

## 🔄 **P1 - 重构清理（功能重复）**

### **1. ServiceContainer 的冗余引用**

**问题：** ServiceContainer 同时引用新旧 Service

**文件：** `/engine/services/ServiceContainer.ts`

```typescript
// ❌ 删除这些旧 Service 的引用
import { 
  StoryServiceImpl,      // ← 删除
  ClueServiceImpl,       // ← 删除
  NarrativeClueServiceImpl, // ← 删除
  FreedomMirrorServiceImpl, // ← 删除
  PlayerServiceImpl      // ← 删除
} from './impl';

// ✅ 只保留这些
import { VisualServiceImpl, TickerServiceImpl, NearFieldServiceImpl } from './impl';
import { StoryService, ClueService, SceneService, NPCService } from './business';
```

**清理步骤：**

1. 更新 `ServiceContainer.ts` 的导入
2. 删除旧 Service 的初始化代码
3. 更新所有 getter 方法

---

### **2. 重复的 DataAccess API 骨架**

**问题：** `/engine/data-access/api/` 下的文件都是空实现，全是 TODO

| 文件 | 状态 | 建议 |
|---|---|---|
| `ClueDataAccessApi.ts` | 📝 骨架 | 正式版前补全，或删除 |
| `StoryDataAccessApi.ts` | 📝 骨架 | 正式版前补全，或删除 |
| `SceneDataAccessApi.ts` | 📝 骨架 | 正式版前补全，或删除 |
| `WorldInfoDataAccessApi.ts` | 📝 骨架 | 正式版前补全，或删除 |
| `PlayerDataAccessApi.ts` | 📝 骨架 | 正式版前补全，或删除 |

**建议方案：**

```
方案 A（推荐）：
- Demo 阶段：删除所有 api/ 文件夹
- 正式版：重新创建时再实现

方案 B：
- 保留骨架，补全接口文档
- 标记为 @todo 待实现
```

---

## ⚠️ **P2 - 向后兼容字段（逐步移除）**

### **1. GameState 中的 @deprecated 字段**

**文件：** `/types/engine.types.ts`

```typescript
export interface GameState {
  // ... 
  
  // ========== @deprecated 近场交互旧字段（向后兼容，逐步移除）==========
  
  /** @deprecated 使用 nearfield.active */
  nearfield_active: boolean;  // ⚠️ 逐步移除
  
  /** @deprecated 使用 nearfield.sceneId */
  current_scene_id: string | null;  // ⚠️ 逐步移除
  
  /** @deprecated 不再使用，改用 nearfield.narrativeSequence.slice(0, displayIndex+1) */
  scene_history_context: NearFieldEvent[];  // ⚠️ 逐步移除
  
  /** @deprecated 使用 nearfield.mode */
  awaiting_action_type: NextActionType | null;  // ⚠️ 逐步移除
  
  /** @deprecated 使用 nearfield.narrativeSequence */
  current_narrative_sequence: PlotUnit[] | null;  // ⚠️ 逐步移除
  
  /** @deprecated 使用 nearfield.displayIndex */
  current_narrative_index: number;  // ⚠️ 逐步移除
  
  // ========== @deprecated 旧剧本系统字段（待清理）==========
  
  /** @deprecated 旧的镜像模式（使用 FreeMirrorMode 计算派生状态） */
  mirrorMode?: MirrorMode;  // ⚠️ 逐步移除
  
  /** @deprecated 场景剧本（已被 nearfield.narrativeSequence 替代） */
  scenePlot?: any;  // ⚠️ 逐步移除
  
  /** @deprecated 当前剧本索引（已被 nearfield.displayIndex 替代） */
  currentPlotIndex?: number;  // ⚠️ 逐步移除
  
  /** @deprecated UI显示的剧本单元（直接使用 nearfield.narrativeSequence.slice() ） */
  displayedPlotUnits?: PlotUnit[];  // ⚠️ 逐步移除
  
  /** @deprecated 当前提示（使用 nearfield.interventionHint 替代） */
  currentHint?: string | null;  // ⚠️ 逐步移除
}
```

**清理计划：**

```
阶段 1（当前）：
✅ 标记为 @deprecated
✅ 新代码只使用 nearfield.* 字段

阶段 2（下个版本）：
□ 搜索所有引用 deprecated 字段的代码
□ 全部迁移到新字段
□ 删除 deprecated 字段

阶段 3（正式版）：
□ 清理所有向后兼容代码
```

---

### **2. StateManager 的向后兼容代码**

**文件：** `/engine/core/StateManager.ts`

```typescript
// ❌ 阶段 2 需要删除这些代码
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
currentHint: null
```

---

## 📝 **P3 - TODO 待补全**

### **1. Service 层的 TODO**

**文件：** `/engine/services/business/StoryService.ts`

```typescript
// Line 60: TODO: 从SceneDataAccess获取完整场景模板
const sceneTemplate = {
  scene_id: sceneTemplateId,
  title: '场景标题',  // ← 硬编码，需改为从 DataAccess 获取
  location: '场景地点',
  // ...
};

// ✅ 已修复：现在使用 MockDataProvider
```

---

### **2. NearFieldManagerSimple 的 TODO**

**文件：** `/engine/core/NearFieldManagerSimple.ts`

```typescript
// Line 234: TODO: 调用 NearFieldService.advance() 获取 INTERACT 响应
// Demo 阶段：使用 mock 数据
const mockInteractResponse = this.getMockInteractResponse(intentText);

// ✅ 建议：
// - Demo 阶段：保持 mock 数据
// - 正式版：替换为真实 LLM 调用
```

---

### **3. NearFieldManager（旧版）的 TODO**

**文件：** `/engine/core/NearFieldManager.ts` （建议删除整个文件）

```typescript
// Line 353: TODO: 集成到线索系统
// Line 361: TODO: 集成到NPC系统  
// Line 409: TODO: 需要在状态中保存is_story_over标志

// ✅ 建议：整个文件已废弃，删除即可
```

---

### **4. DataAccessFactory 的 TODO**

**文件：** `/engine/data-access/DataAccessFactory.ts`

```typescript
static createClueDataAccess(): IClueDataAccess {
  if (this.mode === 'api') {
    // TODO: 上线后启用
    // return new ClueDataAccessApi(this.apiBaseUrl);
    throw new Error('[DataAccessFactory] API mode not implemented yet - use mock mode');
  }
  return new ClueDataAccessMock();
}

// ✅ 建议：
// - Demo 阶段：保持 mock 模式
// - 正式版：实现 API 类
```

---

### **5. Data Registry 的 TODO**

**文件：** `/data/registry.ts`

```typescript
export async function loadWorld(worldId: WorldId) {
  const worldModule = await WORLDS[worldId]();
  return worldModule.hongKongWorld; // TODO: 需要统一接口
}

// ✅ 建议：定义统一的 World 接口
```

---

## 🔍 **详细清理检查表**

### **📁 /engine/services/impl/ 目录**

| 文件 | 状态 | 操作 | 优先级 |
|---|---|---|---|
| `StoryServiceImpl.ts` | 🗑️ 废弃 | 删除 | P0 |
| `ClueServiceImpl.ts` | 🗑️ 废弃 | 删除 | P0 |
| `NarrativeClueServiceImpl.ts` | 🗑️ 废弃 | 删除 | P0 |
| `FreedomMirrorServiceImpl.ts` | 🗑️ 废弃 | 删除 | P0 |
| `PlayerServiceImpl.ts` | 🗑️ 废弃 | 删除 | P0 |
| `VisualServiceImpl.ts` | ✅ 保留 | - | - |
| `TickerServiceImpl.ts` | ✅ 保留 | - | - |
| `NearFieldServiceImpl.ts` | ✅ 保留 | - | - |
| `index.ts` | 🔄 更新 | 移除废弃导出 | P0 |

---

### **📁 /engine/cache/ 目录**

| 文件 | 状态 | 操作 | 优先级 |
|---|---|---|---|
| `CacheManager.ts` | 🗑️ 废弃 | 删除 | P0 |
| `types.ts` | 🗑️ 废弃 | 删除 | P0 |
| `InstanceCacheManager.ts` | ✅ 保留 | - | - |
| `__tests__/InstanceCacheManager.test.ts` | ✅ 保留 | - | - |
| `index.ts` | 🔄 更新 | 移除废弃导出 | P0 |

---

### **📁 /engine/core/ 目录**

| 文件 | 状态 | 操作 | 优先级 |
|---|---|---|---|
| `NearFieldManager.ts` | 🗑️ 废弃 | 删除 | P0 |
| `NearFieldManagerSimple.ts` | ✅ 保留 | - | - |
| `GameEngine.ts` | 🔄 清理 | 删除旧版近场引用 | P1 |
| `StateManager.ts` | ⚠️ 向后兼容 | 标记 deprecated 字段 | P2 |
| `TurnManager.ts` | ✅ 保留 | - | - |

---

### **📁 /engine/data-access/api/ 目录**

| 文件 | 状态 | 操作 | 优先级 |
|---|---|---|---|
| `ClueDataAccessApi.ts` | 📝 骨架 | 删除或补全 | P3 |
| `StoryDataAccessApi.ts` | 📝 骨架 | 删除或补全 | P3 |
| `SceneDataAccessApi.ts` | 📝 骨架 | 删除或补全 | P3 |
| `WorldInfoDataAccessApi.ts` | 📝 骨架 | 删除或补全 | P3 |
| `PlayerDataAccessApi.ts` | 📝 骨架 | 删除或补全 | P3 |
| `index.ts` | 📝 骨架 | 删除或补全 | P3 |

**建议：** Demo 阶段直接删除整个 `/api/` 目录，正式版重新实现

---

### **📁 /engine/test/ 目录**

| 文件 | 状态 | 操作 | 优先级 |
|---|---|---|---|
| `phase3-integration.test.ts` | ✅ 已完成 | 归档 | P1 |
| `phase6-validation.test.ts` | ✅ 已完成 | 归档 | P1 |
| `nearfield-simplified.test.ts` | ✅ 已完成 | 归档 | P1 |
| `nearfield-e2e.test.ts` | ⚠️ 可能过时 | 检查后决定 | P2 |
| `run-all-tests.ts` | 🔄 更新 | 移除已归档测试 | P1 |
| `run-phase6-tests.ts` | ✅ 保留 | - | - |

---

### **📁 /types/ 目录**

| 文件 | 字段 | 状态 | 操作 |
|---|---|---|---|
| `engine.types.ts` | `MirrorMode` enum | 🗑️ 废弃 | 删除 |
| `engine.types.ts` | `GameState.nearfield_active` | ⚠️ deprecated | 标记待删 |
| `engine.types.ts` | `GameState.current_scene_id` | ⚠️ deprecated | 标记待删 |
| `engine.types.ts` | `GameState.mirrorMode` | ⚠️ deprecated | 标记待删 |
| `engine.types.ts` | `GameState.scenePlot` | ⚠️ deprecated | 标记待删 |
| `service.types.ts` | `ITickerService.getRandomMessage()` | ⚠️ deprecated | 标记待删 |

---

## 🎯 **清理执行计划**

### **阶段 1：立即清理（P0）**

```bash
# 1. 删除废弃的 Service 实现
rm -rf /engine/services/impl/StoryServiceImpl.ts
rm -rf /engine/services/impl/ClueServiceImpl.ts
rm -rf /engine/services/impl/NarrativeClueServiceImpl.ts
rm -rf /engine/services/impl/FreedomMirrorServiceImpl.ts
rm -rf /engine/services/impl/PlayerServiceImpl.ts

# 2. 删除废弃的 Cache
rm -rf /engine/cache/CacheManager.ts
rm -rf /engine/cache/types.ts

# 3. 删除旧版近场管理器
rm -rf /engine/core/NearFieldManager.ts

# 4. 删除 API 骨架（可选）
rm -rf /engine/data-access/api/

# 5. 更新导出文件
# - /engine/services/impl/index.ts
# - /engine/cache/index.ts
# - /engine/services/ServiceContainer.ts
```

**预计影响：**
- 需更新约 5-10 处导入语句
- 需重新测试 ClueService 和 StoryService 功能
- 可能需要更新文档

---

### **阶段 2：重构清理（P1）**

```bash
# 1. 归档测试文件
mkdir -p /docs/archive/tests
mv /engine/test/phase3-integration.test.ts /docs/archive/tests/
mv /engine/test/phase6-validation.test.ts /docs/archive/tests/
mv /engine/test/nearfield-simplified.test.ts /docs/archive/tests/

# 2. 清理 GameEngine 中的旧版近场引用
# 手动编辑：/engine/core/GameEngine.ts
# - 删除 nearFieldManager 实例
# - 删除旧版 handlePass/handleInteract 逻辑

# 3. 更新 ServiceContainer
# 手动编辑：/engine/services/ServiceContainer.ts
# - 删除废弃 Service 的导入和初始化
```

---

### **阶段 3：向后兼容清理（P2）**

```
时间：下个版本（v2.0）

操作：
1. 搜索所有使用 deprecated 字段的代码
2. 迁移到新字段
3. 删除 GameState 中的 deprecated 字段
4. 删除 StateManager 中的向后兼容代码
```

---

### **阶段 4：补全 TODO（P3）**

```
时间：正式版前

操作：
1. 实现 DataAccessApi 类（如需要）
2. 补全 MockDataProvider 的数据
3. 统一 World 接口
4. 补全文档注释
```

---

## ✅ **清理验证清单**

完成清理后，检查以下项：

### **功能验证**

- [ ] 线索追踪功能正常
- [ ] 故事进入功能正常
- [ ] 场景切换功能正常
- [ ] NPC 对话功能正常
- [ ] 近场交互功能正常

### **代码验证**

- [ ] 所有 TypeScript 编译通过
- [ ] 没有引用已删除的文件
- [ ] 没有引用已删除的类型
- [ ] 所有测试通过

### **文档验证**

- [ ] README 更新
- [ ] ARCHITECTURE.md 更新
- [ ] 删除过时的文档
- [ ] 更新 API 文档

---

## 📋 **清理影响评估**

### **删除文件数量**

| 类别 | 文件数 | 预计代码行数 |
|---|---|---|
| Service 实现 | 5 | ~1500 行 |
| Cache 系统 | 2 | ~500 行 |
| 近场管理器 | 1 | ~400 行 |
| API 骨架 | 6 | ~600 行 |
| 测试文件 | 3 | ~800 行 |
| **总计** | **17** | **~3800 行** |

### **需要更新的文件**

| 文件 | 更新类型 | 预计工作量 |
|---|---|---|
| `/engine/services/ServiceContainer.ts` | 删除废弃导入 | 10 分钟 |
| `/engine/core/GameEngine.ts` | 删除旧版近场引用 | 20 分钟 |
| `/engine/services/impl/index.ts` | 更新导出 | 5 分钟 |
| `/engine/cache/index.ts` | 更新导出 | 5 分钟 |
| `/App.tsx` 或其他 UI | 更新导入（如有） | 10 分钟 |
| **总计** | | **~50 分钟** |

---

## 🚨 **风险提示**

### **高风险操作**

1. **删除 CacheManager**
   - 风险：如果有代码直接依赖 CacheManager 的类型
   - 缓解：先搜索所有引用，确认全部替换为 InstanceCacheManager

2. **删除 ServiceImpl**
   - 风险：ServiceContainer 或其他模块可能还在引用
   - 缓解：使用 TypeScript 编译器检查，IDE 会报错

3. **删除 deprecated 字段**
   - 风险：可能有代码还在使用旧字段
   - 缓解：分阶段删除，先标记 deprecated，再迁移，最后删除

### **低风险操作**

1. **归档测试文件**
   - 风险：低（测试文件不影响运行时）
   - 建议：直接移动到 archive 目录

2. **删除 API 骨架**
   - 风险：低（Demo 阶段不使用）
   - 建议：保留 DataAccessFactory，删除具体实现

---

## 📝 **总结**

### **立即可删除（P0）**
- ✅ 5 个废弃 Service 实现文件
- ✅ 2 个废弃 Cache 文件
- ✅ 1 个旧版近场管理器
- ✅ 6 个 API 骨架文件（可选）

### **需要重构（P1）**
- 🔄 ServiceContainer 导入清理
- 🔄 GameEngine 旧代码删除
- 🔄 测试文件归档

### **逐步移除（P2）**
- ⚠️ GameState deprecated 字段
- ⚠️ StateManager 向后兼容代码

### **待补全（P3）**
- 📝 各种 TODO 注释
- 📝 DataAccessApi 实现（正式版）

---

**预计清理收益：**
- 🗑️ 删除 ~3800 行废弃代码
- 🚀 简化架构，降低维护成本
- 📚 提高代码可读性
- ✅ 消除技术债务
