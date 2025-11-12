# Phase 3 测试指南

## 🧪 UI集成测试

### 方法1: 主应用测试

1. **启动应用**
```bash
npm run dev
```

2. **打开浏览器**
访问 `http://localhost:5173`

3. **测试步骤**

#### Step 1: 验证线索收件箱按钮
- 右下角应该有一个黄色的收件箱浮动按钮
- 点击按钮打开线索收件箱面板

#### Step 2: 验证线索列表
- 应该看到3条Demo线索：
  - 消失的快递员（CLUE_004）
  - 酒吧的神秘人（CLUE_005）
  - 帮派火拼（CLUE_006）
- 每条线索显示状态（未读/追踪中/已完成）

#### Step 3: 追踪线索
- 点击一条线索查看详情
- 点击"开始追踪"按钮
- 应该看到：
  - 线索状态变为"追踪中"
  - 右侧显示故事详情
  - 显示进度条（初始0%）
  - 显示场景列表
  - 显示story_instance_id

#### Step 4: 验证实例隔离
- 追踪第一条线索（CLUE_004）
- 追踪第二条线索（CLUE_005）
- 切换查看两条线索的详情
- 确认：
  - 每条线索有独立的story_instance_id
  - 进度数据不混淆
  - 状态相互独立

---

### 方法2: 独立测试页面

1. **访问测试页面**
```
http://localhost:5173/test-clue-inbox.html
```

2. **按顺序运行测试**
- 点击"1. 初始化线索系统"
- 点击"2. 追踪线索"
- 点击"3. 查看实例数据"
- 点击"4. 测试实例隔离"

3. **查看结果**
- 所有测试应该显示 ✅ 绿色成功
- 查看浏览器Console获取详细日志

---

### 方法3: 浏览器Console测试

打开浏览器Console，执行以下代码：

```javascript
// 导入模块
import { ClueInitializer, ClueService, StoryService } from './engine';

// 1. 初始化
ClueInitializer.addDemoClues();
ClueInitializer.initializeClueInbox('demo-player');

// 2. 查看线索列表
const clues = ClueService.getPlayerClues('demo-player');
console.log('线索列表:', clues);

// 3. 追踪线索
const instance = ClueService.trackClue('demo-player', 'CLUE_004');
console.log('创建实例:', instance);

// 4. 查看故事实例
StoryService.startStory(instance);
const story = StoryService.getStoryInstance(instance);
console.log('故事实例:', story);

// 5. 验证深拷贝
const story1 = StoryService.getStoryInstance(instance);
story1.progress_percentage = 999;
const story2 = StoryService.getStoryInstance(instance);
console.log('深拷贝验证:', story2.progress_percentage === 0 ? '✅ 通过' : '❌ 失败');
```

---

## ✅ 预期结果

### 线索收件箱应该显示：

```
📥 线索收件箱
共 3 条线索 · 未读 3 · 追踪中 0 · 已完成 0

左侧列表：
├─ 🟡 消失的快递员（未读）
├─ 🟡 酒吧的神秘人（未读）
└─ 🟡 帮派火拼（未读）

右侧详情：
├─ 线索标题
├─ 线索摘要
└─ [开始追踪] 按钮
```

### 追踪线索后应该显示：

```
📥 线索收件箱
共 3 条线索 · 未读 2 · 追踪中 1 · 已完成 0

左侧列表：
├─ 🟢 消失的快递员（追踪中）  ← 已追踪
├─ 🟡 酒吧的神秘人（未读）
└─ 🟡 帮派火拼（未读）

右侧详情：
├─ 故事标题: "故事标题"
├─ 进度条: 0%
├─ 场景列表:
│   ├─ ⭕ 场景 1: scene-a
│   └─ ⭕ 场景 2: scene-b
├─ 故事实例ID: demo-story__CLUE_004
└─ [继续故事] 按钮
```

---

## 🐛 常见问题

### 问题1: 线索列表为空

**解决方案:**
```javascript
// 手动添加Demo线索
import { ClueInitializer } from './engine';
ClueInitializer.addDemoClues();
ClueInitializer.initializeClueInbox('demo-player');
```

### 问题2: 追踪失败

**检查:**
1. 打开Console查看错误信息
2. 确认CacheManager已初始化
3. 确认线索数据存在

**解决方案:**
```javascript
// 重置并重新初始化
import { InstanceCacheManager } from './engine/cache/InstanceCacheManager';
InstanceCacheManager.reset();
InstanceCacheManager.initialize();
```

### 问题3: 数据不隔离

**验证隔离:**
```javascript
// 追踪两个线索
const i1 = ClueService.trackClue('demo-player', 'CLUE_004');
const i2 = ClueService.trackClue('demo-player', 'CLUE_005');

// 修改第一个
InstanceCacheManager.updateStoryInstance(i1, { progress_percentage: 50 });

// 验证第二个不受影响
const s2 = StoryService.getStoryInstance(i2);
console.log(s2.progress_percentage); // 应该是 0
```

---

## 📊 测试检查清单

### 核心功能
- [ ] 线索收件箱打开正常
- [ ] 显示3条Demo线索
- [ ] 点击线索查看详情
- [ ] 追踪线索成功
- [ ] 显示story_instance_id
- [ ] 显示进度条
- [ ] 显示场景列表

### 实例隔离
- [ ] 追踪两条线索创建不同instance_id
- [ ] 切换查看数据不混淆
- [ ] 修改一个实例不影响另一个
- [ ] 深拷贝保护生效

### 统计信息
- [ ] 未读数量正确
- [ ] 追踪中数量正确
- [ ] 已完成数量正确

### UI交互
- [ ] 追踪按钮显示加载状态
- [ ] 追踪成功后状态更新
- [ ] 详情面板平滑切换
- [ ] 进度条正确显示

---

## 🎯 成功标准

✅ **所有测试通过的标志:**

1. 线索收件箱UI完整显示
2. 追踪线索创建独立实例
3. story_instance_id正确显示
4. 实例数据完全隔离
5. 无Console错误
6. UI响应流畅

---

## 📞 问题反馈

如果测试失败，请：
1. 截图UI状态
2. 复制Console错误
3. 记录操作步骤
4. 检查浏览器兼容性（推荐Chrome/Edge）

---

**测试完成后，Phase 3 UI集成即可视为成功！** 🎉
