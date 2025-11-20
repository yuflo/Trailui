# 🔥 数据链路重构方案：第一种Demo（模拟LLM生成）

**创建时间：** 2025-01-19  
**目标：** 将"消息-线索-故事-场景"链路从"第二种（静态DB读取）"改为"第一种（模拟LLM生成）"

---

## 📋 **目录**

1. [重构目标](#重构目标)
2. [架构对比分析](#架构对比分析)
3. [四个接口的重构方案](#四个接口的重构方案)
4. [实施步骤](#实施步骤)
5. [验证清单](#验证清单)
6. [风险控制](#风险控制)

---

## 🎯 **重构目标**

### **当前问题**

| 环节 | 用户定位 | 当前实现 | 问题 |
|------|---------|---------|------|
| 1. 消息生成 | 第一种（LLM生成） | 第二种（静态DB读取） | ❌ 应该有 `MockDataProvider.generateWorldMessage()` |
| 2. 线索抽取 | 第一种（LLM抽取） | 第二种（静态DB读取） | ❌ 应该有 `MockDataProvider.extractClueFromMessage()` |
| 3. 生成故事 | 第一种（LLM生成） | 第二种（静态DB读取） | ❌ 应该有 `MockDataProvider.generateStoryFromClue()` |
| 4. 场景生成 | 第一种（LLM生成） | 第二种（静态DB读取） | ❌ 应该有 `MockDataProvider.generateSceneSequence()` |

### **重构目标**

✅ **在 MockDataProvider 中新增四个"生成"方法**  
✅ **修改 Service 层调用，从 DataAccess 改为 MockDataProvider**  
✅ **保持数据流清晰，不破坏现有功能**  
✅ **严格遵循 KISS 原则和单一数据源原则**

---

## 🔍 **架构对比分析**

### **第一种：模拟LLM生成（目标）**

```typescript
// 特征：动态"生成"内容
MockDataProvider.generateWorldMessage()       // 生成消息
MockDataProvider.extractClueFromMessage()     // 从消息中抽取线索
MockDataProvider.generateStoryFromClue()      // 基于线索生成故事
MockDataProvider.generateSceneSequence()      // 生成场景序列

// Demo阶段：返回硬编码mock数据（模拟LLM行为）
// 正式版：替换为 await LLM.generate(...)
```

### **第二种：模拟静态DB读取（当前）**

```typescript
// 特征：读取静态配置数据
WorldInfoDataAccessMock.getBroadcastMessages() // 从数据文件读取消息
ClueDataAccessMock.findById()                  // 读取线索配置
StoryDataAccessMock.getStoryById()             // 读取故事模板
SceneDataAccessMock.getSceneById()             // 读取场景数据

// Demo阶段：从静态数据文件读取
// 正式版：替换为 await Database.query(...)
```

### **两种链路的职责边界**

| 数据类型 | 正确链路 | 数据来源 | 示例 |
|---------|---------|---------|------|
| 动态内容生成 | 第一种（MockDataProvider） | 算法/规则/模板 | 场景叙事、NPC对话、消息生成 |
| 静态配置数据 | 第二种（DataAccess） | 静态数据文件/DB | NPC属性、场景模板、道具配置 |

---

## 🛠️ **四个接口的重构方案**

### **1️⃣ 消息生成接口**

#### **当前实现（第二种）**

```typescript
// TickerService.ts
static async getBroadcastStream(count: number): Promise<BroadcastMessageData[]> {
  const worldInfoDataAccess = DataAccessFactory.createWorldInfoDataAccess();
  const messages = await worldInfoDataAccess.getBroadcastMessages(count);
  return messages;  // ❌ 从静态数据池随机采样
}
```

#### **重构后（第一种）**

```typescript
// MockDataProvider.ts - 新增
export class MockWorldMessageProvider {
  /**
   * 生成世界消息（模拟LLM）
   * 
   * Demo: 使用预设模板 + 随机参数生成
   * 正式版: await LLM.generateWorldMessage(context)
   */
  static generateWorldMessages(count: number): BroadcastMessageData[] {
    const generatedMessages: BroadcastMessageData[] = [];
    
    // 模板列表（LLM会基于世界状态动态生成）
    const templates = [
      { category: 'ALERT', template: '企业安保部门在{location}展开清扫行动' },
      { category: 'RUMOR', template: '有人在{location}发现了{item}' },
      { category: 'SOCIAL', template: '{npc}发布了关于{event}的消息' },
      // ... 更多模板
    ];
    
    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const message = this.fillTemplate(template);
      generatedMessages.push(message);
    }
    
    return generatedMessages;
  }
  
  private static fillTemplate(template: any): BroadcastMessageData {
    // 填充模板参数（模拟LLM生成）
    // ...
  }
}

// TickerService.ts - 修改调用
static async getBroadcastStream(count: number): Promise<BroadcastMessageData[]> {
  // ✅ 改用 MockDataProvider
  const messages = MockWorldMessageProvider.generateWorldMessages(count);
  console.log(`[TickerService] Generated ${messages.length} messages (LLM mock)`);
  return messages;
}
```

**数据流变化：**
```
旧：TickerService → DataAccess → 静态数据文件 (第二种)
新：TickerService → MockDataProvider → 动态生成 (第一种)
```

---

### **2️⃣ 线索抽取接口**

#### **当前实现（第二种）**

```typescript
// ClueService.ts
static async extractClue(messageId: string, clueId: string): Promise<ClueData> {
  const clueDataAccess = DataAccessFactory.createClueDataAccess();
  const clue = await clueDataAccess.findById(clueId);  // ❌ 读取静态配置
  
  // 创建线索记录...
  return clue;
}
```

**问题：**
- `clueId` 是通过消息的 `extractable_clue_id` 字段获得的（静态映射）
- 不是动态"抽取"，而是读取预设映射

#### **重构后（第一种）**

```typescript
// MockDataProvider.ts - 新增
export class MockClueExtractor {
  /**
   * 从消息中抽取线索（模拟LLM）
   * 
   * Demo: 基于关键词规则匹配
   * 正式版: await LLM.extractClue(messageContent)
   */
  static extractClueFromMessage(message: BroadcastMessageData): ClueData | null {
    // 关键词规则库（模拟LLM的NER能力）
    const extractionRules = [
      {
        keywords: ['企业', '机密', '文件'],
        clueTemplate: {
          clue_id: `clue_${Date.now()}`,
          title: '企业机密泄露事件',
          category: 'investigation',
          summary: '从消息中发现了企业机密相关线索',
          story_id: 'story-corporate-leak'
        }
      },
      // ... 更多规则
    ];
    
    // 匹配规则（模拟LLM分析）
    for (const rule of extractionRules) {
      if (this.matchKeywords(message.text, rule.keywords)) {
        return {
          ...rule.clueTemplate,
          extracted_from_message: message.message_id,
          extracted_at: Date.now()
        };
      }
    }
    
    return null;  // 消息不包含线索
  }
  
  private static matchKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }
}

// ClueService.ts - 修改调用
static async extractClue(messageId: string, message: BroadcastMessageData): Promise<ClueData> {
  // ✅ 改用 MockDataProvider（从消息中动态抽取）
  const extractedClue = MockClueExtractor.extractClueFromMessage(message);
  
  if (!extractedClue) {
    throw new Error(`[ClueService] No clue found in message: ${messageId}`);
  }
  
  // 创建线索记录到 InstanceCacheManager...
  return extractedClue;
}
```

**接口签名变化：**
```typescript
// 旧：需要预先知道 clueId（静态映射）
extractClue(messageId: string, clueId: string)

// 新：只需要消息内容，动态抽取线索
extractClue(messageId: string, message: BroadcastMessageData)
```

**数据流变化：**
```
旧：ClueService → DataAccess → 静态线索配置 (第二种)
新：ClueService → MockDataProvider → 基于消息内容动态抽取 (第一种)
```

---

### **3️⃣ 生成故事接口**

#### **当前实现（第二种）**

```typescript
// ClueService.ts
static async trackClue(clueId: string): Promise<TrackedStoryData> {
  // 1. 获取线索静态数据
  const clueStatic = await clueDataAccess.findById(clueId);
  
  // 2. 通过 clue.story_id 获取故事模板（静态映射）
  const baseStoryData = await this.getStoryPackage(clue.story_id, storyDataAccess);
  
  // ❌ 问题：story_id 是线索配置中预设的，不是"生成"的
  return trackedStory;
}
```

#### **重构后（第一种）**

```typescript
// MockDataProvider.ts - 新增
export class MockStoryGenerator {
  /**
   * 基于线索生成故事（模拟LLM）
   * 
   * Demo: 基于线索类别匹配故事模板
   * 正式版: await LLM.generateStory(clueContext)
   */
  static generateStoryFromClue(clue: ClueData): StoryGenerationResult {
    // 故事生成规则（模拟LLM的故事构建能力）
    const storyGenerationRules = {
      'investigation': {
        title: '企业阴谋调查',
        description: '深入调查企业背后的秘密',
        difficulty: 'hard',
        sceneTemplates: ['scene-office', 'scene-server-room', 'scene-rooftop']
      },
      'personal': {
        title: '失踪人员追踪',
        description: '寻找失踪者的下落',
        difficulty: 'medium',
        sceneTemplates: ['scene-apartment', 'scene-bar', 'scene-warehouse']
      }
      // ... 更多规则
    };
    
    const rule = storyGenerationRules[clue.category];
    
    return {
      story_id: `story_${Date.now()}`,
      title: rule.title,
      description: rule.description,
      difficulty: rule.difficulty,
      scene_sequence: rule.sceneTemplates.map(id => ({ scene_id: id })),
      generated_from_clue: clue.clue_id,
      generated_at: Date.now()
    };
  }
}

// ClueService.ts - 修改调用
static async trackClue(clueId: string): Promise<TrackedStoryData> {
  // 1. 从 InstanceCacheManager 获取线索记录
  const clueRecord = InstanceCacheManager.getClueRecord(clueId);
  
  // 2. ✅ 改用 MockDataProvider（基于线索动态生成故事）
  const generatedStory = MockStoryGenerator.generateStoryFromClue(clueRecord);
  
  // 3. 构建 TrackedStoryData...
  const trackedStory: TrackedStoryData = {
    ...generatedStory,
    entry_clue_id: clueId,
    is_active: false,
    tracked_at: Date.now()
  };
  
  return trackedStory;
}
```

**数据流变化：**
```
旧：ClueService → DataAccess → 静态故事模板 (第二种)
新：ClueService → MockDataProvider → 基于线索动态生成故事 (第一种)
```

---

### **4️⃣ 场景序列生成接口**

#### **当前实现（第二种）**

```typescript
// ClueService.ts (getStoryPackage方法)
scene_sequence: story.meta.scenes.map((sceneId: string) => ({
  scene_id: sceneId,  // ❌ 从静态故事模板读取预定义场景ID列表
  title: sceneId
}))
```

#### **重构后（第一种）**

```typescript
// MockDataProvider.ts - 新增
export class MockSceneSequenceGenerator {
  /**
   * 生成场景序列（模拟LLM）
   * 
   * Demo: 基于故事类型和难度生成场景流
   * 正式版: await LLM.generateSceneSequence(storyContext)
   */
  static generateSceneSequence(story: StoryGenerationResult): SceneNode[] {
    // 场景生成规则（模拟LLM的剧情规划能力）
    const sceneGenerationRules = {
      'easy': 2,    // 简单故事：2个场景
      'medium': 3,  // 中等故事：3个场景
      'hard': 4     // 困难故事：4个场景
    };
    
    const sceneCount = sceneGenerationRules[story.difficulty];
    const sequence: SceneNode[] = [];
    
    // 根据故事上下文生成场景
    for (let i = 0; i < sceneCount; i++) {
      const sceneId = `scene_${story.story_id}_${i}`;
      sequence.push({
        scene_id: sceneId,
        title: this.generateSceneTitle(story, i),
        description: this.generateSceneDescription(story, i),
        generated_at: Date.now()
      });
    }
    
    return sequence;
  }
  
  private static generateSceneTitle(story: StoryGenerationResult, index: number): string {
    const titleTemplates = [
      '初步调查',
      '深入追踪',
      '关键突破',
      '最终对峙'
    ];
    return titleTemplates[index] || `场景 ${index + 1}`;
  }
  
  private static generateSceneDescription(story: StoryGenerationResult, index: number): string {
    // 基于故事上下文生成场景描述（模拟LLM）
    return `${story.title} - 第${index + 1}章`;
  }
}

// ClueService.ts - 修改调用
static async trackClue(clueId: string): Promise<TrackedStoryData> {
  // ... 前面的代码 ...
  
  const generatedStory = MockStoryGenerator.generateStoryFromClue(clueRecord);
  
  // ✅ 改用 MockDataProvider（动态生成场景序列）
  const sceneSequence = MockSceneSequenceGenerator.generateSceneSequence(generatedStory);
  
  const trackedStory: TrackedStoryData = {
    ...generatedStory,
    scene_sequence: sceneSequence,
    entry_clue_id: clueId,
    tracked_at: Date.now()
  };
  
  return trackedStory;
}
```

**数据流变化：**
```
旧：ClueService → 读取 story.meta.scenes 静态数组 (第二种)
新：ClueService → MockDataProvider → 基于故事上下文动态生成场景序列 (第一种)
```

---

## 📝 **实施步骤**

### **Phase 1: 新增 MockDataProvider 方法（不破坏现有代码）**

**步骤 1.1：** 在 `/engine/services/business/MockDataProvider.ts` 中新增四个类

```typescript
// 1. MockWorldMessageProvider
export class MockWorldMessageProvider {
  static generateWorldMessages(count: number): BroadcastMessageData[] { ... }
}

// 2. MockClueExtractor
export class MockClueExtractor {
  static extractClueFromMessage(message: BroadcastMessageData): ClueData | null { ... }
}

// 3. MockStoryGenerator
export class MockStoryGenerator {
  static generateStoryFromClue(clue: ClueData): StoryGenerationResult { ... }
}

// 4. MockSceneSequenceGenerator
export class MockSceneSequenceGenerator {
  static generateSceneSequence(story: StoryGenerationResult): SceneNode[] { ... }
}
```

**验证：** 编译通过，无类型错误

---

### **Phase 2: 重构 TickerService（消息生成）**

**步骤 2.1：** 修改 `TickerService.getBroadcastStream()`

```typescript
// 旧代码
const worldInfoDataAccess = DataAccessFactory.createWorldInfoDataAccess();
const messages = await worldInfoDataAccess.getBroadcastMessages(count);

// 新代码
const messages = MockWorldMessageProvider.generateWorldMessages(count);
```

**验证：**
- [ ] UI 消息流正常显示
- [ ] 消息数量正确
- [ ] 消息类型分布合理

---

### **Phase 3: 重构 ClueService（线索抽取）**

**步骤 3.1：** 修改 `ClueService.extractClue()` 接口签名

```typescript
// 旧接口
static async extractClue(messageId: string, clueId: string): Promise<ClueData>

// 新接口
static async extractClue(messageId: string, message: BroadcastMessageData): Promise<ClueData>
```

**步骤 3.2：** 修改实现，改用 `MockClueExtractor`

**步骤 3.3：** 修改所有调用处（UI层、测试代码）

**验证：**
- [ ] 线索抽取功能正常
- [ ] 线索记录正确保存到 InstanceCacheManager
- [ ] 收件箱显示正常

---

### **Phase 4: 重构 ClueService（故事生成和场景序列）**

**步骤 4.1：** 修改 `ClueService.trackClue()` 方法

**步骤 4.2：** 移除对 `StoryDataAccess` 的依赖

**步骤 4.3：** 改用 `MockStoryGenerator` 和 `MockSceneSequenceGenerator`

**验证：**
- [ ] 追踪线索功能正常
- [ ] 故事数据正确生成
- [ ] 场景序列合理
- [ ] StateManager 状态正确

---

### **Phase 5: 数据类型定义**

**步骤 5.1：** 新增类型定义（如需要）

```typescript
// types/service.types.ts
export interface StoryGenerationResult {
  story_id: string;
  title: string;
  description: string;
  difficulty: string;
  scene_sequence: SceneNode[];
  generated_from_clue: string;
  generated_at: number;
}

export interface SceneNode {
  scene_id: string;
  title: string;
  description?: string;
  generated_at?: number;
}
```

---

## ✅ **验证清单**

### **功能验证**

- [ ] **消息流：** 世界信息流正常显示，消息内容合理
- [ ] **线索抽取：** 能从消息中正确抽取线索
- [ ] **线索收件箱：** 线索正确显示在收件箱
- [ ] **追踪线索：** 追踪线索能正确生成故事
- [ ] **场景序列：** 故事包含合理的场景序列
- [ ] **故事进度：** 场景完成状态正确追踪

### **架构验证**

- [ ] **单一数据源：** InstanceCacheManager 是唯一运行时状态存储
- [ ] **职责清晰：** MockDataProvider（生成）vs DataAccess（读取配置）边界清晰
- [ ] **无冗余对象：** 不存在重复的数据存储
- [ ] **日志完整：** 所有生成操作有明确日志

### **代码质量**

- [ ] **无类型错误：** 编译通过
- [ ] **无控制台错误：** UI 运行无报错
- [ ] **KISS 原则：** 代码简洁，无过度设计
- [ ] **注释清晰：** 每个生成方法有明确注释说明 Demo vs 正式版

---

## ⚠️ **风险控制**

### **风险 1：接口签名变化**

**影响：** `ClueService.extractClue()` 接口签名改变

**缓解：**
1. 先新增新接口 `extractClueV2()`，保留旧接口
2. 逐步迁移调用处
3. 确认无调用后删除旧接口

### **风险 2：数据格式不兼容**

**影响：** 生成的数据可能与现有类型定义不兼容

**缓解：**
1. 严格遵循现有 TypeScript 类型定义
2. 先完成类型定义，再实现逻辑
3. 编译通过后再测试

### **风险 3：破坏现有功能**

**影响：** 重构可能导致线索/故事功能异常

**缓解：**
1. 逐个功能点重构，不一次性修改所有代码
2. 每个 Phase 完成后立即验证
3. 保留旧代码注释，便于回滚

### **风险 4：数据流混乱**

**影响：** 两种链路混用导致数据来源不清晰

**缓解：**
1. 明确标注每个方法属于第一种还是第二种
2. 在注释中说明 Demo 阶段 vs 正式版的实现区别
3. 定期 review 数据流图

---

## 🎯 **重构原则**

1. **KISS 原则：** 简单直接，不过度设计
2. **谨慎细致：** 每次只改一个功能点
3. **单一数据源：** InstanceCacheManager 是唯一运行时状态
4. **渐进式：** 先新增，后替换，最后删除旧代码
5. **可回滚：** 保留旧代码注释，便于恢复

---

## 📊 **重构后的数据流图**

```
┌─────────────────────────────────────────────────────────────┐
│  用户交互                                                      │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  Service 层（业务逻辑）                                        │
│                                                              │
│  TickerService.getBroadcastStream()                          │
│    ↓                                                         │
│  MockWorldMessageProvider.generateWorldMessages() ← 第一种   │
│                                                              │
│  ClueService.extractClue()                                   │
│    ↓                                                         │
│  MockClueExtractor.extractClueFromMessage() ← 第一种         │
│                                                              │
│  ClueService.trackClue()                                     │
│    ↓                                                         │
│  MockStoryGenerator.generateStoryFromClue() ← 第一种         │
│    ↓                                                         │
│  MockSceneSequenceGenerator.generateSceneSequence() ← 第一种 │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│  InstanceCacheManager（运行时状态存储）                        │
│                                                              │
│  - ClueRecord（线索记录）                                     │
│  - StoryInstance（故事实例）                                  │
│  - SceneInstance（场景实例）                                  │
└─────────────────────────────────────────────────────────────┘
```

**第二种链路（静态配置）仍然存在，用于：**
- NPC 静态属性 → `NPCDataAccessMock`
- 场景模板配置 → `SceneDataAccessMock`
- 道具/技能配置 → （未来）

---

## 🔚 **总结**

**本次重构将实现：**

✅ 四个接口全部改为"第一种（模拟LLM生成）"  
✅ 数据链路清晰：动态生成 vs 静态配置分离  
✅ 保持 KISS 原则，代码简洁可维护  
✅ 为正式版替换真实 LLM API 做好准备

**下一步：** 按照实施步骤逐步执行重构 🚀
