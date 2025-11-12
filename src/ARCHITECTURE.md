# Dreamheart 引擎架构文档

## 🎯 **核心架构**

```
┌──────────────────────────────────────────────────────────┐
│                     Cache Layer                          │
│               (数据库替身 - localStorage)                 │
│                                                          │
│  存储内容：                                               │
│  1. 游戏状态：StoryInstance, SceneInstance, NPCInstance │
│  2. 玩家记忆：LLMDialogueRecord, triggered_events       │
│  3. LLM生成内容：LLMSceneNarrativeRecord                │
│  4. 进度追踪：ClueRecord                                 │
│                                                          │
│  实现：InstanceCacheManager (Map + localStorage)        │
│  正式版：替换成 Supabase/PostgreSQL                      │
└──────────────────────┬───────────────────────────────────┘
                       ↕️ CRUD操作
┌──────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│                 (业务逻辑 + mock数据)                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │          Mock Data (Service 内部)                  │ │
│  │                                                    │ │
│  │  • MockSceneProvider                              │ │
│  │    - getSceneTemplate() → 场景描述                │ │
│  │    - generateSceneNarrative() → LLM生成场景叙事   │ │
│  │                                                    │ │
│  │  • MockNPCProvider                                │ │
│  │    - getNPCTemplate() → NPC数据                   │ │
│  │    - generateNPCDialogue() → LLM生成对话          │ │
│  │                                                    │ │
│  │  • MockEventProvider                              │ │
│  │    - getSceneEvents() → 场景事件                  │ │
│  │                                                    │ │
│  │  正式版替换：                                      │ │
│  │  - await LLMService.generate()                    │ │
│  │  - await Database.query()                         │ │
│  └────────────────────────────────────────────────────┘ │
│                        ↕️                                │
│  业务服务：                                              │
│  - ClueService (线索追踪、收件箱)                        │
│  - StoryService (故事流程、进度管理)                     │
│  - SceneService (场景叙事生成、事件触发)                 │
│  - NPCService (NPC对话生成、状态管理)                    │
└──────────────────────┬───────────────────────────────────┘
                       ↕️ 调用方法
┌──────────────────────────────────────────────────────────┐
│                      UI Layer                            │
│                                                          │
│  React Components:                                       │
│  - ClueInboxPanel (线索收件箱UI)                         │
│  - GameScenePanel (场景叙事显示)                         │
│  - NPCDialoguePanel (NPC对话UI)                          │
│                                                          │
│  Hooks:                                                  │
│  - useClueInbox() → ClueService                          │
│  - useGameScene() → SceneService                         │
│  - useNPCDialogue() → NPCService                         │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 **目录结构**

```
/engine
  /cache
    CacheManager.ts              # 静态配置缓存（旧）
    InstanceCacheManager.ts      # 运行时数据存储（数据库替身）
    
  /services
    /business
      ClueService.ts             # 线索业务逻辑
      StoryService.ts            # 故事业务逻辑
      SceneService.ts            # 场景业务逻辑
      NPCService.ts              # NPC业务逻辑
      MockDataProvider.ts        # 🔥 Service 内部 mock 数据
      
  /data-access
    DataAccessFactory.ts         # 数据访问工厂
    StoryDataAccess.ts           # 故事模板访问（JSON文件）
    
/hooks
  useClueInbox.ts                # 线索收件箱Hook
  useGameScene.ts                # 场景Hook（待实现）
  useNPCDialogue.ts              # NPC对话Hook（待实现）
  
/components
  ClueInboxPanel.tsx             # 线索收件箱UI
  GameScenePanel.tsx             # 场景UI（待实现）
  NPCDialoguePanel.tsx           # NPC对话UI（待实现）
```

---

## 🔄 **数据流示例**

### **示例 1：玩家追踪线索**

```typescript
// 1. UI 触发
<Button onClick={() => trackClue(clueId)}>追踪线索</Button>

// 2. Hook 调用 Service
const { trackClue } = useClueInbox();
await trackClue('clue-001');

// 3. ClueService 执行业务逻辑
ClueService.trackClue(playerId, clueId) {
  // 3.1 获取故事模板（从 DataAccess 或 Cache）
  const story = await StoryDataAccess.getStoryById(templateId);
  
  // 3.2 创建故事实例（写入 Cache = 数据库）
  InstanceCacheManager.createStoryInstance(playerId, clueId, story);
  
  // 3.3 更新线索状态（写入 Cache = 数据库）
  InstanceCacheManager.updateClueRecord(clueId, {
    status: 'tracking',
    tracked_at: Date.now()
  });
}

// 4. Cache 持久化到 localStorage
InstanceCacheManager.saveToLocalStorage();

// 5. Hook 重新加载数据，UI 自动更新
loadClues();
```

---

### **示例 2：玩家进入场景**

```typescript
// 1. UI 触发
<Button onClick={() => enterStory(clueId)}>进入故事</Button>

// 2. Hook 调用 Service
StoryService.startStory(storyInstanceId);
StoryService.enterScene(storyInstanceId, 'scene-a');

// 3. StoryService.enterScene() 执行
enterScene(storyInstanceId, sceneTemplateId) {
  // 3.1 获取场景模板（从 MockDataProvider）
  const sceneTemplate = MockSceneProvider.getSceneTemplate('scene-a');
  // 返回：{ title: '赛博酒吧 - 暗影之下', location: '第七区', ... }
  
  // 正式版替换成：
  // const sceneTemplate = await SceneDatabase.getScene('scene-a');
  
  // 3.2 创建场景实例（写入 Cache）
  InstanceCacheManager.createSceneInstance(storyInstanceId, sceneTemplate);
  
  // 3.3 创建 NPC 实例（写入 Cache）
  for (const npcId of sceneTemplate.present_npc_ids) {
    const npcTemplate = MockNPCProvider.getNPCTemplate(npcId);
    InstanceCacheManager.createNPCInstance(storyInstanceId, npcTemplate);
  }
  
  // 3.4 更新故事状态
  InstanceCacheManager.updateStoryInstance(storyInstanceId, {
    current_scene_id: sceneInstanceId,
    status: 'in_progress'
  });
}

// 4. 生成场景叙事（模拟 LLM）
SceneService.generateSceneNarrative(sceneInstanceId);

// 内部调用
generateSceneNarrative(sceneInstanceId) {
  // 4.1 从 MockDataProvider 获取叙事文本
  const narrative = MockSceneProvider.generateSceneNarrative('scene-a');
  // 返回："你推开厚重的金属门，走进这个被霓虹灯照亮的地下世界..."
  
  // 正式版替换成：
  // const narrative = await LLM.generateNarrative({
  //   sceneTemplate: sceneTemplate,
  //   playerHistory: getPlayerHistory(),
  //   storyContext: getStoryContext()
  // });
  
  // 4.2 保存叙事到 Cache（数据库）
  InstanceCacheManager.saveLLMSceneNarrative({
    scene_instance_id: sceneInstanceId,
    narrative_text: narrative,
    generated_at: Date.now()
  });
  
  return narrative;
}
```

---

### **示例 3：玩家与 NPC 对话**

```typescript
// 1. UI 触发
<Input 
  onSubmit={(input) => sendMessage(npcId, input)} 
  placeholder="输入你想说的话..."
/>

// 2. Hook 调用 Service
const response = NPCService.generateNPCDialogue(npcInstanceId, playerInput);

// 3. NPCService.generateNPCDialogue() 执行
generateNPCDialogue(npcInstanceId, playerInput) {
  // 3.1 获取 NPC 状态（从 Cache 读取）
  const npcInstance = InstanceCacheManager.getNPCInstance(npcInstanceId);
  
  // 3.2 生成回复（从 MockDataProvider）
  const response = MockNPCProvider.generateNPCDialogue(
    npcInstance.npc_template_id,  // 'npc-broker-zero'
    playerInput,                   // "你知道失踪案的线索吗？"
    { npcState: npcInstance.current_state }
  );
  // 返回："有趣的问题...数据显示...这比我想象的要复杂..."
  
  // 正式版替换成：
  // const response = await LLM.generateDialogue({
  //   npcProfile: npcInstance.npc_data,
  //   npcMood: npcInstance.current_state.current_mood,
  //   playerInput: playerInput,
  //   conversationHistory: getDialogueHistory(npcInstanceId)
  // });
  
  // 3.3 保存对话到 Cache（数据库）
  InstanceCacheManager.saveLLMDialogue({
    npc_instance_id: npcInstanceId,
    player_input: playerInput,
    npc_response: response,
    turn_number: getNextTurnNumber(),
    created_at: Date.now()
  });
  
  // 3.4 更新 NPC 状态（关系值、情绪）
  InstanceCacheManager.updateNPCInstance(npcInstanceId, {
    relationship: npcInstance.current_state.relationship + 5
  });
  
  return response;
}
```

---

## 🔧 **Cache 作为数据库的设计**

### **数据表结构（Cache 存储）**

#### **1. StoryInstance（故事实例表）**
```typescript
{
  instance_id: string;           // PRIMARY KEY: "story-001__clue-001"
  player_id: string;             // 玩家ID
  clue_id: string;               // 线索ID
  story_template_id: string;     // 故事模板ID
  
  // 游戏状态
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_scene_id: string | null;
  completed_scenes: string[];
  
  // 模板数据快照（可选：可以只存 ID，但为了方便 demo 存了完整数据）
  story_data: {
    story_id: string;
    title: string;
    description: string;
    // ...
  };
  
  // 时间戳
  created_at: number;
  started_at: number | null;
  completed_at: number | null;
  last_played_at: number | null;
}
```

#### **2. SceneInstance（场景实例表）**
```typescript
{
  instance_id: string;           // PRIMARY KEY: "story-001__clue-001__scene-a"
  story_instance_id: string;     // FOREIGN KEY
  scene_template_id: string;
  player_id: string;
  
  // 场景模板数据快照
  scene_data: {
    title: string;
    location: string;
    time_of_day: string;
    weather: string;
    // ...
  };
  
  // 运行时状态
  status: 'not_entered' | 'in_progress' | 'completed';
  entered_at: number | null;
  completed_at: number | null;
  triggered_events: string[];    // 已触发的事件ID列表
  
  npc_instance_ids: string[];    // 场景中的NPC实例
}
```

#### **3. NPCInstance（NPC实例表）**
```typescript
{
  instance_id: string;           // PRIMARY KEY: "story-001__clue-001__npc-broker"
  story_instance_id: string;     // FOREIGN KEY
  npc_template_id: string;
  player_id: string;
  
  // NPC模板数据快照
  npc_data: {
    name: string;
    avatar_url: string;
    personality: { ... };
    background: string;
  };
  
  // 运行时状态（会变化）
  current_state: {
    relationship: number;        // 关系值：0-100
    current_mood: 'hostile' | 'neutral' | 'friendly';
    alertness: number;           // 警觉度
    trust_level: number;         // 信任度
  };
  
  // 交互摘要
  interaction_summary: {
    total_interactions: number;
    last_interaction_at: number | null;
    revealed_secrets: string[];  // 已揭示的秘密
  };
}
```

#### **4. ClueRecord（线索记录表）**
```typescript
{
  clue_id: string;               // PRIMARY KEY
  player_id: string;
  story_template_id: string;
  story_instance_id: string | null; // FOREIGN KEY
  
  title: string;
  description: string;
  source: string;
  
  // 线索状态
  status: 'unread' | 'read' | 'tracking' | 'completed' | 'abandoned';
  
  // 时间戳
  received_at: number;
  read_at: number | null;
  tracked_at: number | null;
  completed_at: number | null;
}
```

#### **5. LLMSceneNarrativeRecord（场景叙事表）**
```typescript
{
  record_id: string;             // PRIMARY KEY
  scene_instance_id: string;     // FOREIGN KEY
  story_instance_id: string;
  player_id: string;
  
  // LLM 生成内容
  narrative_text: string;        // 场景叙事文本
  generated_at: number;
  is_active: boolean;            // 是否是当前激活的叙事
  
  // LLM 元数据
  llm_model: string;             // 'gpt-4', 'claude-3', etc.
  generation_params: {
    temperature: number;
    max_tokens: number;
  };
}
```

#### **6. LLMDialogueRecord（对话历史表）**
```typescript
{
  record_id: string;             // PRIMARY KEY
  npc_instance_id: string;       // FOREIGN KEY
  story_instance_id: string;
  player_id: string;
  
  // 对话内容
  turn_number: number;           // 对话轮次
  player_input: string;          // 玩家输入
  npc_response: string;          // NPC回复
  
  // NPC 状态快照（用于追溯）
  npc_state_snapshot: {
    relationship: number;
    current_mood: string;
  };
  
  // 时间戳
  created_at: number;
  
  // LLM 元数据
  llm_model: string;
  generation_params: { ... };
}
```

---

## 🚀 **正式上线替换方案**

### **替换 1：Mock Data → LLM API**

```typescript
// ❌ Demo 阶段
const narrative = MockSceneProvider.generateSceneNarrative('scene-a');

// ✅ 正式版
const narrative = await LLMService.generateNarrative({
  model: 'gpt-4-turbo',
  systemPrompt: '你是一个赛博朋克故事的叙事者...',
  context: {
    sceneTemplate: sceneTemplate,
    playerHistory: getPlayerHistory(),
    storyState: getStoryState()
  },
  temperature: 0.8,
  maxTokens: 500
});
```

---

### **替换 2：localStorage → Database**

```typescript
// ❌ Demo 阶段
class InstanceCacheManager {
  private static storyInstances = new Map<string, StoryInstance>();
  
  static getStoryInstance(id: string) {
    return this.storyInstances.get(id);
  }
  
  static updateStoryInstance(id: string, updates: Partial<StoryInstance>) {
    Object.assign(this.storyInstances.get(id), updates);
    this.saveToLocalStorage();
  }
}

// ✅ 正式版
class DatabaseService {
  static async getStoryInstance(id: string): Promise<StoryInstance | null> {
    const { data } = await supabase
      .from('story_instances')
      .select('*')
      .eq('instance_id', id)
      .single();
    return data;
  }
  
  static async updateStoryInstance(id: string, updates: Partial<StoryInstance>) {
    await supabase
      .from('story_instances')
      .update(updates)
      .eq('instance_id', id);
  }
}
```

---

## ✅ **架构优势**

1. **清晰的职责分离**
   - Cache = 数据存储（数据库）
   - Service = 业务逻辑 + mock数据
   - UI = 展示层

2. **易于替换**
   - Mock Data → LLM API（只改 Service 内部）
   - localStorage → Database（只改 Cache 实现）
   - UI 层完全不需要改动

3. **完整的数据追溯**
   - 所有LLM生成内容都存储在 Cache
   - 对话历史、场景叙事都可追溯
   - 玩家进度、NPC状态完整记录

4. **Demo 阶段可用**
   - 不需要真实 LLM API
   - 不需要数据库
   - 本地 localStorage 即可运行
