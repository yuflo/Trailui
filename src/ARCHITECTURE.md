# Dreamheart 引擎架构文档 v2.0

**设计哲学：KISS 原则 + Cache as Database + 视觉原型三层架构**

---

## 🎯 **核心架构：三层数据架构**

```
┌─────────────────────────────────────────────────────────────┐
│  1️⃣  InstanceCacheManager (中心化 Cache/DB)                  │
│      定位：线上的"持久化动态数据 DB"                           │
│      存储：运行时动态变化的数据                                │
│      例如：NPC当前心防值、玩家位置、对话历史、故事进度          │
│                                                              │
│      - StoryInstance (故事实例)                              │
│      - ScenarioInstance (场景实例)                           │
│      - NPCEntity (NPC运行时状态)                             │
│      - LLMDialogueRecord (对话历史)                          │
│      - ClueRecord (线索追踪状态)                             │
│                                                              │
│      正式版替换：Supabase/PostgreSQL                         │
└─────────────────────────────────────────────────────────────┘
                            ↕️ CRUD操作
┌─────────────────────────────────────────────────────────────┐
│  2️⃣  Service Layer (业务逻辑协调层)                          │
│      功能：协调 Cache 和 Registry，处理业务逻辑               │
│                                                              │
│      核心服务：                                              │
│      • ClueService - 线索追踪、收件箱                        │
│      • StoryService - 故事流程、进度管理                     │
│      • SceneService - 场景叙事生成、事件触发                 │
│      • NPCService - NPC对话生成、状态管理                    │
│      • NearFieldService - 近场交互协调                       │
│      • VisualService - 视觉原型渲染                          │
│                                                              │
│      特殊服务（无状态）：                                     │
│      • MockDataProvider - LLM Mock数据生成                   │
│      • LLMService (未来) - 真实LLM调用                       │
└─────────────────────────────────────────────────────────────┘
                            ↕️ 读取配置
┌─────────────────────────────────────────────────────────────┐
│  3️⃣  Registry (静态配置/静态数据 DB)                         │
│      定位：线上的"静态数据 DB"或"配置中心"                    │
│      存储：剧本设计、策划配置、游戏内容                       │
│                                                              │
│      数据结构：                                              │
│      • /data/hong-kong/                                      │
│        ├─ clues/clue-registry.data.ts                       │
│        ├─ npcs/npc-registry.data.ts                         │
│        ├─ scenes/scene-*.data.ts                            │
│        ├─ stories/story-*.data.ts                           │
│        └─ world-info/                                        │
│                                                              │
│      正式版替换：静态数据表 + CMS管理                         │
└─────────────────────────────────────────────────────────────┘
                            ↕️ 展示数据
┌─────────────────────────────────────────────────────────────┐
│  4️⃣  UI Layer (展示层)                                       │
│      React Components + Hooks                                │
│      原则：不缓存数据，直接调用 Service                       │
│                                                              │
│      - App.tsx (主应用)                                      │
│      - useGameEngine (GameEngine Hook)                       │
│      - 组件直接调用 Service 方法                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 **架构原则**

### **1. 单一数据源（Single Source of Truth）**
```typescript
// ✅ 正确：所有数据从 Cache 读取
const currentScenario = InstanceCacheManager.get('scenario', scenarioId);
const npcState = currentScenario.dynamic_view.involved_entities[0];

// ❌ 错误：不要在 StateManager 中存储副本
// StateManager.trackedStories = [...] // 这是重复存储
```

### **2. UI 层不缓存（No UI Caching）**
```typescript
// ✅ 正确：直接调用 Service
{currentScenario && (
  NPCService.enrichNPCEntities(
    currentScenario.dynamic_view.involved_entities
  ).map(npc => <NPCCard npc={npc} />)
)}

// ❌ 错误：不要在 UI 用 useMemo 缓存
const enrichedNPCs = useMemo(() => {
  return NPCService.enrichNPCEntities(entities);
}, [entities]);
```

### **3. 静态配置 vs 动态状态**
| 问题 | 数据来源 | 类型 |
|------|---------|------|
| **一个故事关联哪几个场景？** | `/data/hong-kong/stories/*.data.ts` | 静态配置 (剧本设计) |
| **某个场景包含哪些NPC？** | `/data/hong-kong/scenes/*.data.ts` | 静态配置 (剧本设计) |
| **NPC 的名字、头像？** | `/data/hong-kong/npcs/npc-registry.data.ts` | 静态配置 |
| **NPC 的当前心防值？** | `InstanceCacheManager.get('scenario', id).involved_entities` | 动态状态 |
| **玩家当前在哪个场景？** | `InstanceCacheManager.get('story', id).current_scenario_id` | 动态状态 |

### **4. Service 层的职责**
```typescript
// Service 层负责：
// 1. 从 Cache 读取动态数据
// 2. 从 Registry 读取静态配置
// 3. 合并数据
// 4. 执行业务逻辑
// 5. 更新 Cache

// 示例：NPCService.enrichNPCEntities
export function enrichNPCEntities(npcEntities: NPCEntity[]): EnrichedNPC[] {
  return npcEntities.map(entity => {
    // 从 Registry 读取静态配置
    const staticConfig = getNPCConfig(entity.id);
    
    // 合并动态数据和静态配置
    return {
      ...entity,        // 动态：当前心防值、情绪
      ...staticConfig   // 静态：名字、头像、背景
    };
  });
}
```

---

## 📁 **目录结构**

```
/
├─ App.tsx                          # 主应用入口
├─ hooks/
│  └─ useGameEngine.ts              # GameEngine Hook
│
├─ engine/
│  ├─ cache/
│  │  └─ InstanceCacheManager.ts    # 中心化 Cache (动态 DB)
│  │
│  ├─ core/
│  │  ├─ GameEngine.ts              # 游戏引擎
│  │  ├─ StateManager.ts            # 运行时状态管理器 (待重构)
│  │  ├─ NearFieldManager.ts        # 近场交互管理器
│  │  └─ TurnManager.ts             # 回合管理器
│  │
│  ├─ services/
│  │  └─ business/
│  │     ├─ ClueService.ts          # 线索业务
│  │     ├─ StoryService.ts         # 故事业务
│  │     ├─ SceneService.ts         # 场景业务
│  │     ├─ NPCService.ts           # NPC业务
│  │     ├─ NearFieldService.ts     # 近场交互业务
│  │     ├─ VisualService.ts        # 视觉原型业务
│  │     └─ MockDataProvider.ts     # Mock 数据服务 (无状态)
│  │
│  └─ data-access/
│     └─ mock/
│        ├─ ClueDataAccessMock.ts   # 线索数据访问
│        ├─ StoryDataAccessMock.ts  # 故事数据访问
│        └─ SceneDataAccessMock.ts  # 场景数据访问
│
├─ data/                            # Registry (静态配置/静态 DB)
│  ├─ registry.ts                   # 世界注册表
│  └─ hong-kong/                    # 香港世界包
│     ├─ clues/
│     │  └─ clue-registry.data.ts   # 线索注册表
│     ├─ npcs/
│     │  └─ npc-registry.data.ts    # NPC注册表
│     ├─ scenes/
│     │  ├─ scene-a-bar-entrance.data.ts
│     │  └─ scene-b-bar-interior.data.ts
│     ├─ stories/
│     │  └─ story-*.data.ts
│     └─ world-info/
│
└─ config/
   └─ visual-archetypes/            # 视觉原型配置
      └─ registry.ts                # 原型注册表
```

---

## 🔄 **数据流示例**

### **示例 1：读取 NPC 头像**

```typescript
// ❌ 错误理解：从 Cache 读取 NPC 头像
const npc = InstanceCacheManager.get('scenario', id).involved_entities[0];
const avatar = npc.avatar; // ❌ Cache 不应该存静态配置

// ✅ 正确：从 Cache 读动态状态 + 从 Registry 读静态配置
// 1. 从 Cache 读取动态数据
const scenario = InstanceCacheManager.get('scenario', scenarioId);
const npcEntities = scenario.dynamic_view.involved_entities;
// npcEntities = [{ id: 'feitang', composure: 60, sentiment: '愤怒' }]

// 2. 从 Registry 读取静态配置
import { getNPCConfig } from '/data/hong-kong/npcs';
const staticConfig = getNPCConfig('feitang');
// staticConfig = { name: '肥汤', avatar: '/path/...', role: '...' }

// 3. Service 层合并
const enrichedNPC = NPCService.enrichNPCEntities(npcEntities);
// enrichedNPC = [{ 
//   id: 'feitang', 
//   composure: 60,        // 动态
//   sentiment: '愤怒',    // 动态
//   name: '肥汤',         // 静态
//   avatar: '/path/...'   // 静态
// }]

// 4. UI 渲染
<img src={enrichedNPC[0].avatar} alt={enrichedNPC[0].name} />
```

---

### **示例 2：场景包含哪些 NPC？**

```typescript
// ❌ 错误理解：从 Cache 读取场景配置
const scenario = InstanceCacheManager.get('scenario', 'scene-a');
const npcList = scenario.involved_entities; // ❌ 这是运行时状态，不是配置

// ✅ 正确：从 Registry 读取场景静态配置
import { SCENE_A_DATA } from '/data/hong-kong/scenes/scene-a-bar-entrance.data';

// 静态配置（剧本设计）
const sceneConfig = {
  scene_id: 'scene-a',
  title: '酒吧入口',
  npc_ids: ['feitang', 'xiaoxue'],  // ← 这是策划配置的
  // ...
};

// Cache 只存运行时状态
const scenarioInstance = {
  instance_id: 'scenario-123',
  scene_template_id: 'scene-a',
  dynamic_view: {
    involved_entities: [
      { id: 'feitang', composure: 60, sentiment: '愤怒' },  // ← 当前状态
      { id: 'xiaoxue', composure: 20, sentiment: '恐惧' }   // ← 当前状态
    ]
  }
};
```

---

### **示例 3：玩家追踪线索（完整流程）**

```typescript
// 1. UI 触发
<Button onClick={() => trackClue('clue-001')}>追踪线索</Button>

// 2. Hook 调用 Service
const { trackClue } = useGameEngine();
await trackClue('clue-001');

// 3. Service 执行业务逻辑
ClueService.trackClue(playerId, clueId) {
  // 3.1 从 Registry 读取线索静态配置
  const clueConfig = clueRegistry.find(c => c.id === clueId);
  // clueConfig = { id: 'clue-001', title: '失踪案线索', story_id: 'demo-story' }
  
  // 3.2 从 Registry 读取故事静态配置
  const storyConfig = getStoryById(clueConfig.story_id);
  // storyConfig = { id: 'demo-story', scenes: ['scene-a', 'scene-b'] }
  
  // 3.3 创建故事实例（写入 Cache）
  const storyInstance = {
    instance_id: `story-${Date.now()}`,
    player_id: playerId,
    story_template_id: clueConfig.story_id,
    current_scenario_id: null,  // 还没进入场景
    status: 'not_started',
    progress: 0
  };
  InstanceCacheManager.set('story', storyInstance.instance_id, storyInstance);
  
  // 3.4 更新线索状态（写入 Cache）
  InstanceCacheManager.update('clue', clueId, {
    status: 'tracking',
    tracked_at: Date.now(),
    story_instance_id: storyInstance.instance_id
  });
  
  // 3.5 持久化到 localStorage
  InstanceCacheManager.saveToLocalStorage();
}

// 4. GameEngine 重新读取 Cache，UI 自动更新
useEffect(() => {
  const trackedStories = InstanceCacheManager.getAll('story')
    .filter(s => s.status === 'tracking');
  setState({ trackedStories });
}, []);
```

---

### **示例 4：玩家进入场景（LLM 生成叙事）**

```typescript
// 1. UI 触发
<Button onClick={() => enterScene('scene-a')}>进入场景</Button>

// 2. Service 执行
SceneService.enterScene(storyInstanceId, sceneTemplateId) {
  // 2.1 从 Registry 读取场景静态配置
  const sceneConfig = getSceneConfig('scene-a');
  // sceneConfig = { 
  //   scene_id: 'scene-a', 
  //   title: '酒吧入口', 
  //   npc_ids: ['feitang', 'xiaoxue']
  // }
  
  // 2.2 创建场景实例（写入 Cache）
  const scenarioInstance = {
    instance_id: `scenario-${Date.now()}`,
    story_instance_id: storyInstanceId,
    scene_template_id: 'scene-a',
    dynamic_view: {
      involved_entities: [
        { id: 'feitang', composure: 60, sentiment: '愤怒' },
        { id: 'xiaoxue', composure: 20, sentiment: '恐惧' }
      ]
    },
    status: 'in_progress'
  };
  InstanceCacheManager.set('scenario', scenarioInstance.instance_id, scenarioInstance);
  
  // 2.3 生成场景叙事（调用 Mock LLM）
  const narrative = MockDataProvider.generateSceneNarrative('scene-a');
  // 返回：\"你推开厚重的木门，昏暗的灯光下...\"
  
  // 正式版替换：
  // const narrative = await LLMService.generate({
  //   model: 'gpt-4',
  //   context: { scene: sceneConfig, playerHistory: ... }
  // });
  
  // 2.4 保存叙事到 Cache
  InstanceCacheManager.set('llm_narrative', `narrative-${Date.now()}`, {
    scenario_instance_id: scenarioInstance.instance_id,
    narrative_text: narrative,
    generated_at: Date.now()
  });
  
  // 2.5 更新故事实例
  InstanceCacheManager.update('story', storyInstanceId, {
    current_scenario_id: scenarioInstance.instance_id,
    status: 'in_progress'
  });
}
```

---

## 🔧 **Cache 数据表设计**

### **StoryInstance（故事实例）**
```typescript
{
  instance_id: string;              // PK: "story-1731955200000"
  player_id: string;                // "player-001"
  story_template_id: string;        // "demo-story" (来自 Registry)
  
  // 运行时状态
  current_scenario_id: string | null;  // "scenario-123" (当前场景)
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;                 // 0-100
  
  // 时间戳
  created_at: number;
  started_at: number | null;
  completed_at: number | null;
}
```

### **ScenarioInstance（场景实例）**
```typescript
{
  instance_id: string;              // PK: "scenario-1731955200000"
  story_instance_id: string;        // FK: "story-123"
  scene_template_id: string;        // "scene-a" (来自 Registry)
  
  // 运行时状态
  dynamic_view: {
    involved_entities: NPCEntity[];  // NPC 当前状态
  };
  status: 'not_entered' | 'in_progress' | 'completed';
  triggered_events: string[];       // 已触发的事件
  
  // 时间戳
  entered_at: number | null;
  completed_at: number | null;
}
```

### **NPCEntity（NPC 运行时状态）**
```typescript
// ⚠️ 注意：这是嵌入在 Scenario.dynamic_view.involved_entities 中的
{
  id: string;                       // "feitang" (NPC ID)
  
  // 动态状态（会变化）
  composure: number;                // 60 (当前心防值)
  sentiment: string;                // "愤怒" (当前情绪)
  rapport: string;                  // "敌对" (与玩家关系)
  
  // ❌ 不存静态配置（name, avatar, role）
  // 这些从 Registry 读取
}
```

### **ClueRecord（线索追踪状态）**
```typescript
{
  clue_id: string;                  // PK: "clue-001"
  player_id: string;                // "player-001"
  story_template_id: string;        // "demo-story" (来自 Registry)
  story_instance_id: string | null; // FK: "story-123" (追踪后创建)
  
  // 状态
  status: 'unread' | 'read' | 'tracking' | 'completed';
  
  // 时间戳
  received_at: number;
  read_at: number | null;
  tracked_at: number | null;
  completed_at: number | null;
}
```

---

## 🚀 **正式上线替换方案**

### **替换 1：Mock LLM → 真实 LLM**
```typescript
// ❌ Demo 阶段
const narrative = MockDataProvider.generateSceneNarrative('scene-a');

// ✅ 正式版
const narrative = await LLMService.generate({
  model: 'gpt-4-turbo',
  systemPrompt: '你是赛博朋克故事叙事者...',
  context: {
    scene: sceneConfig,
    playerHistory: getPlayerHistory(),
    npcStates: getCurrentNPCStates()
  },
  temperature: 0.8,
  maxTokens: 500
});
```

### **替换 2：localStorage → Supabase**
```typescript
// ❌ Demo 阶段
class InstanceCacheManager {
  private static cache = new Map();
  
  static set(type, id, data) {
    this.cache.set(`${type}:${id}`, data);
    this.saveToLocalStorage();
  }
}

// ✅ 正式版
class DatabaseService {
  static async set(type, id, data) {
    await supabase
      .from(`${type}_instances`)
      .upsert({ instance_id: id, ...data });
  }
  
  static async get(type, id) {
    const { data } = await supabase
      .from(`${type}_instances`)
      .select('*')
      .eq('instance_id', id)
      .single();
    return data;
  }
}
```

### **替换 3：静态文件 → CMS 管理**
```typescript
// ❌ Demo 阶段
import { NPC_REGISTRY } from '/data/hong-kong/npcs/npc-registry.data';
const npcConfig = NPC_REGISTRY['feitang'];

// ✅ 正式版（可选）
const npcConfig = await CMSService.getNPCConfig('feitang');
// 或者保持静态文件 + 版本控制
```

---

## ⚠️ **当前待重构问题**

### **问题 1：StateManager 存储了重复数据**
```typescript
// ❌ 当前：StateManager 存储副本
class StateManager {
  private state = {
    trackedStories: [...],      // ❌ 重复：来自 Cache
    sessionState: {...},         // ❌ 重复：来自 Cache
    playerStatus: {...},         // ❌ 重复：来自 Cache
  };
}

// ✅ 目标：StateManager 只管理纯运行时临时状态
class StateManager {
  private state = {
    uiState: { ... },           // ✅ UI 临时状态
    pendingActions: [...],      // ✅ 待处理动作
    // 不存储任何 Cache 副本
  };
}

// 所有持久化数据直接从 Cache 读取
const trackedStories = InstanceCacheManager.getAll('story')
  .filter(s => s.status === 'tracking');
```

### **问题 2：useGameEngine Hook 使用了 useMemo**
```typescript
// ❌ 当前：Hook 中缓存派生数据
const trackedStories = useMemo(() => {
  return gameState.stories.filter(s => s.status === 'tracking');
}, [gameState.stories]);

// ✅ 目标：直接从 Cache 读取
const trackedStories = InstanceCacheManager.getAll('story')
  .filter(s => s.status === 'tracking');
```

---

## ✅ **架构优势**

1. **单一数据源**
   - Cache 是唯一的动态数据存储
   - Registry 是唯一的静态配置来源
   - 不会出现数据不一致

2. **清晰的职责分离**
   - Cache = 动态 DB
   - Registry = 静态 DB/配置
   - Service = 业务逻辑
   - UI = 展示层

3. **易于替换**
   - Mock → LLM：只改 Service 内部
   - localStorage → Database：只改 Cache 实现
   - 静态文件 → CMS：只改 Registry 实现
   - UI 完全不需要改动

4. **KISS 原则**
   - 不在多处缓存数据
   - 不在 UI 层做复杂逻辑
   - 数据流向清晰可追溯

---

## 📝 **总结**

**核心理念：**
- **Cache 是 DB**：存储运行时动态数据
- **Registry 是配置**：存储剧本静态数据
- **Service 是协调层**：合并数据 + 业务逻辑
- **UI 不缓存**：直接调用 Service，保持数据新鲜

**数据读取原则：**
- 问自己："这个数据会在运行时变化吗？"
  - 会变 → 从 Cache 读（NPC当前心防值）
  - 不变 → 从 Registry 读（NPC名字、头像）
- Service 层负责合并两者

**禁止事项：**
- ❌ 不要在 StateManager 存储 Cache 副本
- ❌ 不要在 UI 用 useMemo 缓存数据
- ❌ 不要在 Cache 存储静态配置
- ❌ 不要通过叠加规则解决问题，删除和简化优先

---

**版本历史：**
- v1.0 (2024-11-18)：初版架构
- v2.0 (2024-11-18)：明确三层数据架构，纠正静态配置 vs 动态状态混淆
