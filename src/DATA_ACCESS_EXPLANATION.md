# Data Access Layer 作用说明

## 🎯 **核心作用：读取静态配置/模板数据**

Data Access Layer 的职责是**读取游戏的静态配置数据**（不会变化的模板数据），与 Service 层的 mock data 和 Cache 层的运行时数据完全不同。

---

## 📊 **三层数据的区别**

```
┌─────────────────────────────────────────────────────────────┐
│         1. Data Access Layer (静态模板数据)                 │
│            读取配置文件 - 游戏设计时定义                     │
│                                                             │
│  StoryDataAccess.getStoryById('story-hk-001')               │
│  → 返回：{                                                  │
│      meta: {                                                │
│        story_id: 'story-hk-001',                            │
│        title: '霓虹迷雾',                                    │
│        description: '香港第七区的失踪案件...',               │
│        scenes: ['scene-a', 'scene-b', 'scene-c'],          │
│        visual_archetype: 'neon_noir'                        │
│      },                                                     │
│      scenes: { ... },                                       │
│      npcs: { ... }                                          │
│    }                                                        │
│                                                             │
│  特点：                                                      │
│  ✅ 数据不会变化（除非游戏更新）                             │
│  ✅ 所有玩家看到的模板都一样                                 │
│  ✅ 来源：JSON 文件 / CMS / 游戏编辑器                       │
└─────────────────────────────────────────────────────────────┘
                              ↓ 用于创建实例
┌─────────────────────────────────────────────────────────────┐
│         2. Service Layer Mock Data (LLM模拟数据)            │
│            Demo阶段的临时数据 - 正式版替换成LLM              │
│                                                             │
│  MockSceneProvider.generateSceneNarrative('scene-a')        │
│  → 返回：                                                    │
│    "你推开厚重的金属门，走进这个被霓虹灯照亮的地下世界...   │
│     酒吧里烟雾缭绕，全息投影在空气中扭曲变形..."            │
│                                                             │
│  特点：                                                      │
│  ⚠️ Demo阶段：返回硬编码的预设文本                           │
│  ✅ 正式版：替换成 LLM API 动态生成                          │
│  ✅ 每次生成结果可能不同（基于上下文）                       │
│  ✅ 来源：LLM API / 预生成内容库                             │
└─────────────────────────────────────────────────────────────┘
                              ↓ 保存到 Cache
┌─────────────────────────────────────────────────────────────┐
│         3. Cache Layer (运行时数据 - 数据库替身)            │
│            玩家的游戏进度和状态 - 会不断变化                 │
│                                                             │
│  InstanceCacheManager.getStoryInstance('story-001__clue-1') │
│  → 返回：{                                                  │
│      instance_id: 'story-001__clue-1',                      │
│      player_id: 'demo-player',                              │
│      story_template_id: 'story-hk-001',  ← 引用模板         │
│      status: 'in_progress',              ← 运行时状态       │
│      progress_percentage: 45,            ← 玩家进度         │
│      current_scene_id: 'scene-b',        ← 当前位置         │
│      completed_scenes: ['scene-a'],      ← 完成记录         │
│      started_at: 1699234567890           ← 时间戳           │
│    }                                                        │
│                                                             │
│  特点：                                                      │
│  ✅ 每个玩家的数据都不同                                     │
│  ✅ 数据会随游戏进行不断更新                                 │
│  ✅ 存储：localStorage (Demo) / Supabase (正式版)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 **Data Access Layer 的具体作用**

### **1. 读取故事模板（Story Template）**

**使用场景：** 玩家追踪线索时，需要根据线索关联的故事ID创建故事实例

```typescript
// ClueService.trackClue()
const storyDataAccess = DataAccessFactory.createStoryDataAccess();
const story = await storyDataAccess.getStoryById('story-hk-001');

// 返回的模板数据：
{
  meta: {
    story_id: 'story-hk-001',
    title: '霓虹迷雾',
    description: '一起扑朔迷离的失踪案件...',
    scenes: ['scene-a', 'scene-b', 'scene-c'],  // ← 场景序列
    difficulty: 'medium',
    estimated_duration: 60
  },
  scenes: {
    'scene-a': { title: '赛博酒吧', location: '第七区', ... },
    'scene-b': { title: '废弃工厂', location: '旧城区', ... },
    'scene-c': { title: '数据堡垒', location: '企业大厦', ... }
  },
  npcs: {
    'npc-broker': { name: '零号', personality: {...}, ... },
    'npc-bartender': { name: '凯', ... }
  }
}
```

**然后用模板创建实例：**

```typescript
// 用模板数据创建玩家专属的故事实例
InstanceCacheManager.createStoryInstance(playerId, clueId, story);

// Cache 中存储的运行时数据：
{
  instance_id: 'story-hk-001__clue-001',
  player_id: 'player-001',
  story_template_id: 'story-hk-001',  // ← 引用模板
  status: 'not_started',              // ← 玩家状态（会变化）
  progress_percentage: 0,             // ← 玩家进度（会变化）
  current_scene_id: null,             // ← 当前场景（会变化）
  scene_sequence: ['scene-a', 'scene-b', 'scene-c'] // ← 从模板复制
}
```

---

### **2. 读取场景配置（Scene Template）**

**使用场景：** 玩家进入场景时，需要获取场景的详细配置

```typescript
// StoryService.enterScene()
const storyDataAccess = DataAccessFactory.createStoryDataAccess();
const scene = await storyDataAccess.getSceneById('story-hk-001', 'scene-a');

// 返回的场景模板：
{
  scene_id: 'scene-a',
  title: '赛博酒吧 - 暗影之下',
  location: '第七区地下酒吧',
  time_of_day: '深夜23:47',
  weather: '酸雨停歇',
  background_info: '这里是第七区最隐蔽的情报交易点...',
  objective: '找到神秘的信息掮客',
  present_npc_ids: ['npc-broker', 'npc-bartender'],  // ← NPC列表
  unlocked_by: null,  // ← 解锁条件
  min_stat_requirements: { ... }  // ← 进入要求
}
```

---

### **3. 与其他层的协作**

```typescript
// 完整流程示例：玩家进入场景

// 1️⃣ Data Access: 读取场景模板（静态配置）
const storyDataAccess = DataAccessFactory.createStoryDataAccess();
const sceneTemplate = await storyDataAccess.getSceneById('story-hk-001', 'scene-a');

// 2️⃣ Cache: 创建场景实例（玩家状态）
InstanceCacheManager.createSceneInstance(storyInstanceId, sceneTemplate);
// 存储：{ instance_id, status: 'in_progress', entered_at: timestamp, ... }

// 3️⃣ Service Mock Data: 生成场景叙事（LLM模拟）
const narrative = MockSceneProvider.generateSceneNarrative('scene-a');
// Demo: "你推开厚重的金属门..."
// 正式版: await LLM.generate(sceneTemplate, playerContext)

// 4️⃣ Cache: 保存生成的叙事（LLM结果）
InstanceCacheManager.saveLLMSceneNarrative({
  scene_instance_id: sceneInstanceId,
  narrative_text: narrative,
  generated_at: Date.now()
});
```

---

## 📁 **Data Access 的数据来源**

### **Demo 阶段（当前）**

```
DataAccessFactory.createStoryDataAccess()
  → StoryDataAccessMock
    → 读取 /data/hong-kong/demo-story-map.data.ts
      → 硬编码的 TypeScript 对象
```

**文件示例：**
```typescript
// /data/hong-kong/demo-story-map.data.ts
export const demoStoryMap: Record<string, Story> = {
  'story-hk-001': {
    meta: {
      story_id: 'story-hk-001',
      title: '霓虹迷雾',
      scenes: ['scene-a', 'scene-b', 'scene-c']
    },
    scenes: { ... },
    npcs: { ... }
  }
};
```

---

### **正式版（未来）**

```
DataAccessFactory.createStoryDataAccess()
  → StoryDataAccessApi
    → 调用 CMS API
      → 从内容管理系统/数据库读取
```

**API 示例：**
```typescript
// /engine/data-access/api/StoryDataAccessApi.ts
export class StoryDataAccessApi implements IStoryDataAccess {
  async getStoryById(storyId: string): Promise<Story | null> {
    // 从 CMS / Supabase / 后端 API 读取
    const response = await fetch(`${this.apiBaseUrl}/stories/${storyId}`);
    return response.json();
  }
}
```

---

## 🆚 **Data Access vs Service Mock Data**

| 对比项 | Data Access Layer | Service Mock Data |
|---|---|---|
| **数据类型** | 故事配置、场景结构、NPC属性 | LLM生成的文本（叙事、对话） |
| **数据来源** | JSON文件 / CMS / 游戏编辑器 | 预设文本 / LLM API |
| **是否变化** | 不变（除非游戏更新） | 每次生成可能不同 |
| **示例数据** | `{ scene_id, title, location, npc_ids }` | `"你推开门，走进酒吧..."` |
| **替换方式** | Mock → API（读取方式变化） | Mock → LLM（生成方式变化） |
| **当前实现** | `StoryDataAccessMock` 读 JSON | `MockSceneProvider` 返回字符串 |
| **正式版** | `StoryDataAccessApi` 调 API | `LLMService.generate()` 调 LLM |

---

## 🔄 **完整数据流示例**

### **场景：玩家追踪线索并进入第一个场景**

```typescript
// ============================================
// Step 1: 追踪线索（创建故事实例）
// ============================================

// 1.1 从 Data Access 读取故事模板
const storyDataAccess = DataAccessFactory.createStoryDataAccess();
const storyTemplate = await storyDataAccess.getStoryById('story-hk-001');
// 返回：{ meta: { scenes: [...] }, scenes: {...}, npcs: {...} }

// 1.2 创建故事实例到 Cache（数据库）
InstanceCacheManager.createStoryInstance(playerId, clueId, storyTemplate);
// 存储：{ instance_id, status: 'not_started', ... }

// ============================================
// Step 2: 进入第一个场景
// ============================================

// 2.1 从 Data Access 读取场景模板
const sceneTemplate = await storyDataAccess.getSceneById('story-hk-001', 'scene-a');
// 返回：{ title: '赛博酒吧', location: '第七区', npc_ids: [...] }

// 2.2 创建场景实例到 Cache
InstanceCacheManager.createSceneInstance(storyInstanceId, sceneTemplate);
// 存储：{ instance_id, status: 'in_progress', entered_at: ... }

// 2.3 使用 Service Mock Data 生成叙事
const narrative = MockSceneProvider.generateSceneNarrative('scene-a');
// Demo: 返回预设文本
// 正式版: await LLM.generate(sceneTemplate, playerHistory)

// 2.4 保存叙事到 Cache
InstanceCacheManager.saveLLMSceneNarrative({
  scene_instance_id: sceneInstanceId,
  narrative_text: narrative,
  generated_at: Date.now()
});

// ============================================
// Step 3: UI 显示
// ============================================

// 3.1 从 Cache 读取场景实例
const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);

// 3.2 从 Cache 读取生成的叙事
const savedNarrative = InstanceCacheManager.getLLMSceneNarrative(sceneInstanceId);

// 3.3 渲染 UI
<div>
  <h2>{sceneInstance.scene_data.title}</h2>
  <p>{savedNarrative.narrative_text}</p>
</div>
```

---

## ✅ **总结**

### **Data Access Layer 的作用：**

1. **读取游戏静态配置**（故事模板、场景结构、NPC属性）
2. **提供可替换的数据源**（Demo用JSON，正式版用CMS/API）
3. **与运行时数据分离**（模板 vs 实例）

### **与其他层的关系：**

```
Data Access (静态模板) → 用于创建 → Cache (运行时实例)
Service Mock Data (LLM模拟) → 保存到 → Cache (生成内容)
UI ← 读取 ← Cache (所有数据)
```

### **为什么需要 Data Access？**

- ✅ **分离关注点：** 配置数据 vs 运行时数据
- ✅ **易于替换：** Mock → API 不影响其他层
- ✅ **单一数据源：** 所有玩家使用同一套模板
- ✅ **便于维护：** 游戏配置集中管理

**Data Access 是"游戏设计的配置"，Cache 是"玩家的游戏存档"，两者完全不同！**
