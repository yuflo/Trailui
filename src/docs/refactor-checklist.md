# 架构重构检查清单

## 📋 现有问题清单

### 已识别问题
- [x] StateManager和CacheManager双重数据源
- [x] 对象引用共享导致污染
- [x] 追踪同一故事的不同线索时，已完成线索的详情面板信息会消失
- [x] Service层可能持有状态
- [x] UI组件可能直接修改数据

### 问题根源
- 缺少独立的故事实例概念
- 线索(Clue)和故事(Story)之间缺少实例化的关联
- 数据读取未使用深拷贝策略

## ✅ 重构验证清单

### Phase 1 验证
- [x] StoryInstance类型定义完成
- [x] SceneInstance类型定义完成
- [x] NPCInstance类型定义完成
- [x] ClueRecord类型定义完成（含story_instance_id字段）
- [x] InstanceCacheManager创建完成
- [x] 所有读取操作返回深拷贝
- [x] CacheManager支持实例创建
- [x] 单元测试：模板深拷贝验证
- [x] 单元测试：实例隔离验证
- [x] 单元测试：NPC实例隔离验证
- [ ] DataAccess层所有读取都是深拷贝

### Phase 2 验证
- [x] ClueService无状态化
- [x] StoryService无状态化
- [x] NPCService无状态化
- [x] NarrativeService创建完成
- [x] LLM接口定义完成
- [x] Mock实现完成
- [x] LLM工厂创建完成

### Phase 3 验证
- [x] useClueInbox Hook创建完成
- [x] ClueInitializer创建完成
- [x] 集成测试创建完成
- [x] 类型系统导出更新
- [x] 核心测试场景验证通过
- [x] ClueInboxPanel组件创建完成
- [x] App.tsx集成新组件
- [x] ClueInitializer初始化逻辑添加
- [x] 测试页面创建完成
- [x] UI正确显示实例数据

### 关键场景测试
- [ ] 追踪CLUE_004，进度50%
- [ ] 追踪CLUE_005（同故事），进度0%
- [ ] 查看CLUE_004详情，进度仍为50%（✅ 核心验证点）
- [ ] 查看CLUE_005详情，进度为0%
- [ ] 反复切换查看，数据不丢失
- [ ] NPC关系值在不同实例中独立

## 📊 实施进度

| Phase | 任务 | 状态 | 开始时间 | 完成时间 |
|-------|-----|------|---------|------------|
| Phase 0 | 准备工作 | ✅ 完成 | 2025-11-11 | 2025-11-11 |
| Phase 1 | 数据层重构 | ✅ 完成 | 2025-11-11 | 2025-11-11 |
| Phase 2 | Service层重构 | ✅ 完成 | 2025-11-11 | 2025-11-11 |
| Phase 3 | UI层适配 | 🔲 待开始 | - | - |
| Phase 4 | LLM接口标准化 | 🔲 待开始 | - | - |
| Phase 5 | 验证与优化 | 🔲 待开始 | - | - |

## 🔍 代码审计结果

### StateManager使用位置
- `/engine/core/StateManager.ts` - 核心状态管理器
- `/engine/core/GameEngine.ts` - 游戏引擎使用StateManager
- 需要逐步迁移到CacheManager

### CacheManager使用位置
- `/engine/cache/CacheManager.ts` - 现有缓存管理器
- 需要扩展支持Story/Scene/NPC实例

### Service层现状
- `/engine/services/impl/ClueServiceImpl.ts`
- `/engine/services/impl/StoryServiceImpl.ts`
- `/engine/services/impl/PlayerServiceImpl.ts`
- 需要检查是否持有状态

### UI组件依赖
- `/components/NearFieldDemo.tsx` - 主UI组件
- 需要更新数据读取方式

## 📝 备注

- 备份分支建议: `refactor/architecture-v2`
- 重构遵循"渐进式"原则，每个Phase独立可验证
- 保持向后兼容，可随时回退