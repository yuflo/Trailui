# 🚀 快速清理指南

> **阅读时间：** 5 分钟  
> **执行时间：** 30-60 分钟  
> **风险等级：** 中等（建议先备份）

---

## ⚡ **一键清理命令（谨慎使用！）**

```bash
# ⚠️ 执行前请先备份！
# git commit -am "Backup before cleanup"

# 清理废弃文件
rm /engine/services/impl/StoryServiceImpl.ts
rm /engine/services/impl/ClueServiceImpl.ts
rm /engine/services/impl/NarrativeClueServiceImpl.ts
rm /engine/services/impl/FreedomMirrorServiceImpl.ts
rm /engine/services/impl/PlayerServiceImpl.ts
rm /engine/cache/CacheManager.ts
rm /engine/cache/types.ts
rm /engine/core/NearFieldManager.ts

# 归档测试文件
mkdir -p docs/archive/tests
mv /engine/test/phase3-integration.test.ts docs/archive/tests/ 2>/dev/null || true
mv /engine/test/phase6-validation.test.ts docs/archive/tests/ 2>/dev/null || true
mv /engine/test/nearfield-simplified.test.ts docs/archive/tests/ 2>/dev/null || true

# 删除 API 骨架（可选）
rm -rf /engine/data-access/api/

echo "✅ 废弃文件已删除，请手动更新导入引用"
```

---

## 🎯 **分步清理（推荐）**

### **Step 1: 检查影响范围（5分钟）**

```bash
# 检查 StoryServiceImpl 的引用
grep -r "StoryServiceImpl" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules

# 检查 ClueServiceImpl 的引用
grep -r "ClueServiceImpl" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules

# 检查 CacheManager 的引用
grep -r "CacheManager" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules | grep -v "InstanceCacheManager"

# 检查 NearFieldManager 的引用
grep -r "NearFieldManager" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules | grep -v "NearFieldManagerSimple"
```

**预期结果：**
- `StoryServiceImpl` 应该只在 `/engine/services/impl/index.ts` 和 `/engine/services/ServiceContainer.ts` 中
- `ClueServiceImpl` 同上
- `CacheManager` 应该没有引用（如有，需先迁移）
- `NearFieldManager` 应该只在 `GameEngine.ts` 中

---

### **Step 2: 更新 ServiceContainer（10分钟）**

**文件：** `/engine/services/ServiceContainer.ts`

**修改 1：删除废弃导入**

```typescript
// ❌ 删除这些行
import { 
  StoryServiceImpl,           // ← 删除
  ClueServiceImpl,            // ← 删除
  NarrativeClueServiceImpl,   // ← 删除
  FreedomMirrorServiceImpl,   // ← 删除
  PlayerServiceImpl           // ← 删除
} from './impl';

// ✅ 只保留这些
import { 
  VisualServiceImpl, 
  TickerServiceImpl, 
  NearFieldServiceImpl 
} from './impl';

// ✅ 确保导入 business 层
import { StoryService, ClueService } from './business';
```

**修改 2：删除旧 Service 的实例声明**

```typescript
export class ServiceContainer {
  // ❌ 删除这些
  // private storyService: IStoryService;
  // private clueService: IClueService;
  // private narrativeClueService: INarrativeClueService;
  // private freedomMirrorService: IFreedomMirrorService;
  // private playerService: IPlayerService;
  
  // ✅ 这些不变（如果还在使用）
  private visualService: IVisualService;
  private tickerService: ITickerService;
  private nearFieldService: INearFieldService;
}
```

**修改 3：删除旧 Service 的初始化**

```typescript
constructor() {
  // ❌ 删除这些
  // this.storyService = new StoryServiceImpl(this.storyDataAccess);
  // this.clueService = new ClueServiceImpl(...);
  // this.narrativeClueService = new NarrativeClueServiceImpl();
  
  // ✅ 保留这些
  this.visualService = new VisualServiceImpl();
  this.tickerService = new TickerServiceImpl(worldInfoDataAccess);
  this.nearFieldService = new NearFieldServiceImpl(...);
}
```

**修改 4：删除旧 Service 的 getter**

```typescript
// ❌ 删除这些方法
// getStoryService(): IStoryService { ... }
// getClueService(): IClueService { ... }
// getNarrativeClueService(): INarrativeClueService { ... }

// ✅ 保留这些
getVisualService(): IVisualService { ... }
getTickerService(): ITickerService { ... }
getNearFieldService(): INearFieldService { ... }
```

---

### **Step 3: 更新 GameEngine（15分钟）**

**文件：** `/engine/core/GameEngine.ts`

**修改 1：删除旧版近场管理器实例**

```typescript
export class GameEngine {
  // ❌ 删除这行
  // private nearFieldManager: NearFieldManager;  // 旧版（保留向后兼容）
  
  // ✅ 只保留这个
  private nearFieldManagerSimple: NearFieldManagerSimple;  // 新简化版
}
```

**修改 2：删除旧版初始化代码**

```typescript
constructor(config: EngineConfig = {}) {
  // ❌ 删除这段
  // this.nearFieldManager = new NearFieldManager(
  //   this.stateManager,
  //   this.serviceContainer.getNearFieldService()
  // );
  
  // ✅ 只保留新版
  this.nearFieldManagerSimple = new NearFieldManagerSimple(
    this.stateManager,
    this.serviceContainer.getNearFieldService()
  );
}
```

**修改 3：删除 handlePass 中的旧版逻辑**

```typescript
async handlePass(): Promise<void> {
  // ... 其他代码 ...
  
  // ❌ 删除这段
  // // ========== 近场交互系统（旧版 NearFieldManager）==========
  // if (state.nearfield_active && state.awaiting_action_type?.type === 'AWAITING_INTERVENTION') {
  //   console.log('[GameEngine] Delegating pass to NearFieldManager (legacy)');
  //   await this.nearFieldManager.handlePass();
  //   return;
  // }
  
  // ✅ 只保留新版的处理逻辑
}
```

**修改 4：删除 handleInteract 中的旧版逻辑**

```typescript
async handleInteract(intentText: string): Promise<TurnResult> {
  // ... 其他代码 ...
  
  // ❌ 删除这段
  // // ========== 近场交互系统（旧版 NearFieldManager）==========
  // if (state.nearfield_active && 
  //     (state.awaiting_action_type?.type === 'AWAITING_INTERVENTION' || 
  //      state.awaiting_action_type?.type === 'AWAITING_INTERACTION')) {
  //   console.log(`[GameEngine] Delegating ${state.awaiting_action_type?.type} to NearFieldManager (legacy)`);
  //   await this.nearFieldManager.handleInteract(intentText);
  //   
  //   // 返回空的TurnResult（近场系统不使用TurnResult）
  //   return { ... };
  // }
  
  // ✅ 只保留新版的处理逻辑
}
```

---

### **Step 4: 更新导出文件（5分钟）**

**文件 1：** `/engine/services/impl/index.ts`

```typescript
/**
 * Service Implementations 导出
 */

// ❌ 删除这些
// export { StoryServiceImpl } from './StoryServiceImpl';
// export { ClueServiceImpl } from './ClueServiceImpl';
// export { NarrativeClueServiceImpl } from './NarrativeClueServiceImpl';
// export { FreedomMirrorServiceImpl } from './FreedomMirrorServiceImpl';
// export { PlayerServiceImpl } from './PlayerServiceImpl';

// ✅ 只保留这些
export { VisualServiceImpl } from './VisualServiceImpl';
export { TickerServiceImpl } from './TickerServiceImpl';
export { NearFieldServiceImpl } from './NearFieldServiceImpl';
```

**文件 2：** `/engine/cache/index.ts`

```typescript
/**
 * Cache 层导出
 */

// ❌ 删除这些
// export { CacheManager } from './CacheManager';
// export * from './types';

// ✅ 只保留这个
export { InstanceCacheManager } from './InstanceCacheManager';
```

**文件 3：** `/engine/index.ts`

```typescript
// ❌ 删除这些（如果有）
// export { StoryServiceImpl, ClueServiceImpl } from './services';

// ✅ 确保导出 business 层
export { StoryService, ClueService, SceneService, NPCService } from './services/business';
```

---

### **Step 5: 删除文件（5分钟）**

```bash
# 现在可以安全删除文件了
rm /engine/services/impl/StoryServiceImpl.ts
rm /engine/services/impl/ClueServiceImpl.ts
rm /engine/services/impl/NarrativeClueServiceImpl.ts
rm /engine/services/impl/FreedomMirrorServiceImpl.ts
rm /engine/services/impl/PlayerServiceImpl.ts
rm /engine/cache/CacheManager.ts
rm /engine/cache/types.ts
rm /engine/core/NearFieldManager.ts

# 可选：删除 API 骨架
rm -rf /engine/data-access/api/
```

---

### **Step 6: 验证编译（5分钟）**

```bash
# TypeScript 编译检查
npx tsc --noEmit

# 预期结果：
# ✅ 没有编译错误
# ❌ 如有错误，说明还有遗漏的引用，需要修复
```

---

### **Step 7: 功能测试（10分钟）**

```bash
# 启动开发服务器
npm run dev

# 测试清单：
# ✅ 线索收件箱正常显示
# ✅ 追踪线索功能正常
# ✅ 进入故事功能正常
# ✅ 场景切换正常
# ✅ NPC 对话正常（如果实现了）
# ✅ 没有 console 报错
```

---

## 🔍 **常见问题排查**

### **问题 1：TypeScript 报错找不到模块**

```
错误：Cannot find module './services/impl/StoryServiceImpl'
```

**解决：**
```typescript
// 检查是否有遗漏的导入
grep -r "StoryServiceImpl" --include="*.ts" --include="*.tsx"

// 替换为新的导入
import { StoryService } from './services/business/StoryService';
```

---

### **问题 2：运行时报错 undefined**

```
错误：Cannot read property 'trackClue' of undefined
```

**解决：**
- 检查 ServiceContainer 是否正确初始化
- 检查是否删除了正在使用的 Service getter

---

### **问题 3：线索功能不工作**

```
症状：追踪线索后没有反应
```

**解决：**
- 检查 `ClueService` (business层) 是否正确导入
- 检查 `InstanceCacheManager` 是否正常工作
- 查看 console 日志确认错误

---

## ✅ **清理完成检查清单**

完成后，确认以下事项：

### **代码检查**

- [ ] 所有 `import` 语句都指向正确的文件
- [ ] `ServiceContainer` 不再引用废弃的 Service
- [ ] `GameEngine` 不再引用 `NearFieldManager`（旧版）
- [ ] 所有导出文件 (`index.ts`) 已更新
- [ ] TypeScript 编译通过（`npx tsc --noEmit`）

### **功能检查**

- [ ] 线索收件箱正常显示
- [ ] 追踪线索功能正常
- [ ] 进入故事功能正常
- [ ] 场景叙事正常生成
- [ ] 没有 console 错误

### **文件检查**

- [ ] 废弃的 Service 文件已删除
- [ ] 废弃的 Cache 文件已删除
- [ ] 旧版近场管理器已删除
- [ ] 测试文件已归档（可选）
- [ ] API 骨架已删除（可选）

---

## 📊 **清理统计**

完成清理后，你应该看到：

```
✅ 删除文件数：8-14 个
✅ 删除代码行数：~2000-3800 行
✅ 更新文件数：4-6 个
✅ 编译通过：是
✅ 功能正常：是
```

---

## 🎉 **下一步**

清理完成后，建议：

1. **提交代码**
   ```bash
   git add .
   git commit -m "refactor: remove deprecated Service implementations and old NearFieldManager"
   ```

2. **更新文档**
   - 更新 `ARCHITECTURE.md`
   - 更新 `README.md`
   - 删除过时的 PHASE 文档

3. **继续开发**
   - 补全 `MockDataProvider` 的数据
   - 实现更多 Scene 和 NPC
   - 添加 UI 组件

---

## 🆘 **需要帮助？**

如果遇到问题，按此顺序排查：

1. **检查 TypeScript 编译错误** → 通常是导入路径错误
2. **检查 console 日志** → 查看运行时错误
3. **回滚代码** → `git reset --hard HEAD` 恢复到清理前
4. **参考详细清单** → 查看 `/CODE_CLEANUP_CHECKLIST.md`

---

**祝清理顺利！🚀**
