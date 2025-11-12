# Dreamheart引擎 架构重构方案

## 📋 文档信息

- **文档版本**: v1.0
- **创建日期**: 2025-11-11
- **重构目标**: 解决引用共享污染问题，建立三层数据隔离架构
- **预计工期**: 5个阶段，约2-3周

---

## 🎯 重构目标

### 核心问题
当前系统存在**严重的对象引用共享污染问题**：
- 追踪同一故事的不同线索时，已完成线索的详情面板信息会消失
- Service层存在双重数据源（CacheManager + StateManager）
- 对象共享引用导致状态污染

### 重构目标
1. ✅ **数据完全隔离**: 每个线索创建独立的故事实例，互不影响
2. ✅ **防止引用污染**: 所有数据读写采用深拷贝策略
3. ✅ **Service无状态化**: Service层改为无状态业务逻辑
4. ✅ **唯一数据源**: CacheManager作为唯一真相源
5. ✅ **LLM接口标准化**: 为未来LLM集成预留清晰接口

---

## 🏗️ 目标架构

### 三层数据架构

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 静态模板层（只读，所有玩家共享）                      │
├─────────────────────────────────────────────────────────────┤
│ - StoryTemplate（故事骨架）                                  │
│ - SceneTemplate（场景骨架）                                  │
│ - NPCTemplate（NPC定义）                                     │
│ - EventTemplate（事件定义）                                  │
│                                                              │
│ 职责：提供静态配置，通过DataAccess层访问                      │
│ 规则：所有读取必须深拷贝                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ 深拷贝创建
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: 运行时实例层（每个线索独立）                          │
├─────────────────────────────────────────────────────────────┤
│ - StoryInstance（demo-story__CLUE_004）                     │
│ - SceneInstance（demo-story__CLUE_004__scene-a）            │
│ - NPCInstance（demo-story__CLUE_004__NPC_001）              │
│                                                              │
│ 职责：存储运行时状态（进度、关系值、当前场景等）               │
│ 规则：所有读取必须深拷贝，通过CacheManager管理                │
└─────────────────────────────────────────────────────────────┘
                            ↓ LLM生成
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: LLM生成层（动态内容）                                │
├─────────────────────────────────────────────────────────────┤
│ - LLMSceneNarrative（场景叙事）                              │
│ - LLMDialogueHistory（对话历史）                             │
│ - LLMFreeformInput（自由输入处理）                           │
│                                                              │
│ 职责：存储所有LLM生成的动态内容                               │
│ 规则：支持版本控制，幂等性查询                                │
└─────────────────────────────────────────────────────────────┘
```

### 数据流架构

```
┌──────┐    读取    ┌─────────┐    读写    ┌───────────┐
│  UI  │ ◄────────► │ Service │ ◄────────► │   Cache   │
└──────┘   展示数据  └─────────┘   深拷贝    └───────────┘
                         ▲                       ▲
                         │                       │
                         │                       │
                         ▼                       │
                    ┌──────────┐                 │
                    │ Mock Data│ ────────────────┘
                    └──────────┘   Demo阶段读取
                         │
                         ▼ 上线后替换
                    ┌──────────┐
                    │LLM Service│
                    └──────────┘
```

### 关键原则

| 原则 | 说明 | 实施方式 |
|-----|------|---------|
| **唯一数据源** | CacheManager是唯一真相源 | 移除StateManager，所有状态存Cache |
| **深拷贝策略** | 所有对象读写必须深拷贝 | `JSON.parse(JSON.stringify())` |
| **实例隔离** | 每个线索创建独立实例 | 实例ID: `${storyId}__${clueId}` |
| **Service无状态** | Service层不持有任何状态 | 所有方法都是静态方法 |
| **接口抽象** | LLM服务完全接口化 | `ILLMService` + Mock/Real实现 |

---

## 📅 分阶段实施计划

### 总览

| 阶段 | 名称 | 预计工期 | 依赖 | 关键产出 |
|-----|------|---------|------|---------|
| **Phase 0** | 代码冻结与备份 | 0.5天 | - | 备份分支、重构清单 |
| **Phase 1** | 数据层重构 | 2-3天 | Phase 0 | 三层数据架构 |
| **Phase 2** | Service层重构 | 2-3天 | Phase 1 | 无状态Service |
| **Phase 3** | UI层适配 | 2-3天 | Phase 2 | UI组件更新 |
| **Phase 4** | ~~LLM接口标准化~~ | ~~1-2天~~ | ~~Phase 3~~ | ⏭️ **已跳过（在Phase 2完成）** |
| **Phase 5** | 验证与优化 | 1-2天 | Phase 3 | 完整测试 |

---

## 🔧 Phase 0: 代码冻结与备份

### 目标
- 创建重构前的安全备份
- 梳理现有代码结构
- 制定详细任务清单

### 任务清单

#### Task 0.1: 创建备份分支
```bash
git checkout -b refactor/architecture-v2
git push origin refactor/architecture-v2
```

#### Task 0.2: 代码审计
- [ ] 列出所有使用StateManager的地方
- [ ] 列出所有直接修改对象的地方
- [ ] 列出所有UI组件依赖的数据结构

#### Task 0.3: 创建重构检查清单
```markdown
## 现有问题清单
- [ ] StateManager和CacheManager双重数据源
- [ ] ClueService.getClueById()返回引用
- [ ] StoryService直接修改返回对象
- [ ] UI组件直接修改props
- [ ] 线索详情面板数据丢失

## 重构验证清单
- [ ] 追踪CLUE_004，进度50%
- [ ] 追踪CLUE_005（同故事），进度0%
- [ ] 查看CLUE_004详情，进度仍为50%
- [ ] 同时显示两个线索，互不影响
```

### 产出物
- ✅ 备份分支: `refactor/architecture-v2`
- ✅ 代码审计报告: `/docs/code-audit.md`
- ✅ 重构清单: `/docs/refactor-checklist.md`

---

## 🏗️ Phase 1: 数据层重构

### 目标
建立三层数据架构，实现数据完全隔离

### 架构图

```
/services/data/
├── templates/              # Layer 1: 静态模板
│   ├── StoryDataAccess.ts
│   ├── SceneDataAccess.ts
│   ├── NPCDataAccess.ts
│   └── types/
│       ├── StoryTemplate.ts
│       ├── SceneTemplate.ts
│       └── NPCTemplate.ts
│
└── cache/                  # Layer 2 + 3: 实例 + LLM生成
    ├── CacheManager.ts
    └── types/
        ├── StoryInstance.ts
        ├── SceneInstance.ts
        ├── NPCInstance.ts
        ├── LLMSceneNarrative.ts
        └── LLMDialogueHistory.ts
```

### 任务清单

#### Task 1.1: 创建类型定义

**文件: `/services/data/cache/types/ClueRecord.ts`**
```typescript
export interface ClueRecord {
  clue_id: string;              // "CLUE_004"
  player_id: string;            // "demo-player"
  
  // 关联的故事模板
  story_template_id: string;    // "demo-story"
  
  // 🔥 关键：关联的故事实例ID
  story_instance_id: string | null;  // "demo-story__CLUE_004"（追踪后才有值）
  
  // 线索信息
  title: string;                // "快递站的线索"
  description: string;          // "小雪给你的纸条..."
  source: string;               // "小雪"
  
  // 状态
  status: 'unread' | 'read' | 'tracking' | 'completed' | 'abandoned';
  
  // 时间戳
  received_at: number;
  read_at: number | null;
  tracked_at: number | null;
  completed_at: number | null;
}
```

**文件: `/services/data/templates/types/StoryTemplate.ts`**
```typescript
export interface StoryTemplate {
  story_id: string;
  title: string;
  description: string;
  genre: string[];
  npc_ids: string[];
  scene_sequence: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_duration: number;
}
```

**文件: `/services/data/templates/types/SceneTemplate.ts`**
```typescript
export interface SceneTemplate {
  scene_id: string;
  story_id: string;
  title: string;
  location: string;
  time_of_day: string;
  weather: string;
  background_info: string;
  present_npc_ids: string[];
  objective: string;
  triggerable_events: string[];
}
```

**文件: `/services/data/templates/types/NPCTemplate.ts`**
```typescript
export interface NPCTemplate {
  npc_id: string;
  name: string;
  avatar_url: string;
  personality: {
    traits: string[];
    values: string[];
    speaking_style: string;
  };
  background: string;
  initial_relationship: number;
  relationship_thresholds: {
    hostile: number;
    neutral: number;
    friendly: number;
  };
  known_secrets: string[];
  forbidden_topics: string[];
}
```

**文件: `/services/data/cache/types/StoryInstance.ts`**
```typescript
export interface StoryInstance {
  instance_id: string;              // "${story_template_id}__${clue_id}"
  player_id: string;
  clue_id: string;
  story_template_id: string;
  
  story_data: {
    title: string;
    description: string;
    genre: string[];
    difficulty: string;
  };
  
  scene_sequence: string[];
  npc_ids: string[];
  
  current_scene_id: string | null;
  completed_scenes: string[];
  
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  progress_percentage: number;
  
  created_at: number;
  started_at: number | null;
  completed_at: number | null;
  last_played_at: number | null;
}
```

**文件: `/services/data/cache/types/SceneInstance.ts`**
```typescript
export interface SceneInstance {
  instance_id: string;              // "${story_instance_id}__${scene_template_id}"
  story_instance_id: string;
  scene_template_id: string;
  player_id: string;
  
  scene_data: {
    title: string;
    location: string;
    time_of_day: string;
    weather: string;
    background_info: string;
    objective: string;
  };
  
  npc_instance_ids: string[];
  
  status: 'not_entered' | 'in_progress' | 'completed';
  entered_at: number | null;
  completed_at: number | null;
  
  triggered_events: Array<{
    event_id: string;
    timestamp: number;
  }>;
}
```

**文件: `/services/data/cache/types/NPCInstance.ts`**
```typescript
export interface NPCInstance {
  instance_id: string;              // "${story_instance_id}__${npc_template_id}"
  story_instance_id: string;
  npc_template_id: string;
  player_id: string;
  
  npc_data: {
    name: string;
    avatar_url: string;
    personality: {
      traits: string[];
      values: string[];
      speaking_style: string;
    };
    background: string;
  };
  
  current_state: {
    relationship: number;
    current_mood: string;
    alertness: number;
    trust_level: number;
  };
  
  interaction_summary: {
    total_interactions: number;
    last_interaction_at: number | null;
    revealed_secrets: string[];
  };
}
```

**文件: `/services/data/cache/types/LLMSceneNarrative.ts`**
```typescript
export interface NarrativeUnit {
  id: string;
  type: 'Narrative' | 'InterventionPoint' | 'Choice';
  actor?: string;
  content: string;
  interventionType?: 'dialogue' | 'action' | 'observation';
  choices?: Array<{
    id: string;
    text: string;
    requiredState?: Record<string, any>;
  }>;
  mood?: 'tense' | 'calm' | 'exciting';
  stateEffects?: {
    relationshipDelta?: Record<string, number>;
    playerStateDelta?: Record<string, any>;
  };
}

export interface LLMSceneNarrativeRecord {
  record_id: string;
  player_id: string;
  story_instance_id: string;
  scene_instance_id: string;
  scene_template_id: string;
  
  narrative_units: NarrativeUnit[];
  
  llm_model: string;
  token_count: number;
  generated_at: number;
  
  version: number;
  is_active: boolean;
}
```

**文件: `/services/data/cache/types/LLMDialogueHistory.ts`**
```typescript
export interface LLMDialogueRecord {
  record_id: string;
  player_id: string;
  story_instance_id: string;
  scene_instance_id: string;
  npc_instance_id: string;
  
  player_input: string;
  npc_response: string;
  
  emotional_state: {
    mood: string;
    intensity: number;
  };
  relationship_delta: number;
  
  triggered_events: Array<{
    eventId: string;
    eventType: string;
    payload: any;
  }>;
  
  llm_model: string;
  token_count: number;
  timestamp: number;
  turn_number: number;
}
```

#### Task 1.2: 创建DataAccess层

**文件: `/services/data/templates/StoryDataAccess.ts`**
```typescript
import { StoryTemplate } from './types/StoryTemplate';

export class StoryDataAccess {
  private static storyTemplates: Map<string, StoryTemplate> = new Map([
    ["demo-story", {
      story_id: "demo-story",
      title: "消失的快递员",
      description: "在赛博朋克的香港，一个普通快递员突然失踪，背后隐藏着帮派火并的秘密...",
      genre: ["悬疑", "赛博朋克"],
      npc_ids: ["NPC_001_XIAOXUE", "NPC_002_FEITANG"],
      scene_sequence: ["scene-a", "scene-b", "scene-c"],
      difficulty: "medium",
      estimated_duration: 30
    }]
  ]);
  
  /**
   * 🔥 获取故事模板（深拷贝）
   */
  static getStoryTemplate(storyId: string): StoryTemplate {
    const template = this.storyTemplates.get(storyId);
    if (!template) {
      throw new Error(`Story template not found: ${storyId}`);
    }
    
    // ✅ 必须深拷贝
    return JSON.parse(JSON.stringify(template));
  }
  
  /**
   * 获取所有故事模板
   */
  static getAllStoryTemplates(): StoryTemplate[] {
    return JSON.parse(JSON.stringify(Array.from(this.storyTemplates.values())));
  }
}
```

**文件: `/services/data/templates/SceneDataAccess.ts`**
```typescript
import { SceneTemplate } from './types/SceneTemplate';

export class SceneDataAccess {
  private static sceneTemplates: Map<string, SceneTemplate> = new Map([
    ["scene-a", {
      scene_id: "scene-a",
      story_id: "demo-story",
      title: "掘金者酒吧入口",
      location: "尖沙咀 - 掘金者酒吧",
      time_of_day: "深夜",
      weather: "雨后",
      background_info: "掘金者酒吧是帮派\"红龙会\"的据点，门口有守卫肥棠。这里信息流通，但需要付出代价。",
      present_npc_ids: ["NPC_002_FEITANG"],
      objective: "从肥棠处打探快递员下落",
      triggerable_events: ["EVENT_BRIBE_SUCCESS", "EVENT_FIGHT_START"]
    }]
  ]);
  
  /**
   * 🔥 获取场景模板（深拷贝）
   */
  static getSceneTemplate(sceneId: string): SceneTemplate {
    const template = this.sceneTemplates.get(sceneId);
    if (!template) {
      throw new Error(`Scene template not found: ${sceneId}`);
    }
    
    return JSON.parse(JSON.stringify(template));
  }
  
  /**
   * 获取故事的所有场景模板
   */
  static getStoryScenes(storyId: string): SceneTemplate[] {
    const scenes = Array.from(this.sceneTemplates.values())
      .filter(s => s.story_id === storyId);
    
    return JSON.parse(JSON.stringify(scenes));
  }
}
```

**文件: `/services/data/templates/NPCDataAccess.ts`**
```typescript
import { NPCTemplate } from './types/NPCTemplate';

export class NPCDataAccess {
  private static npcTemplates: Map<string, NPCTemplate> = new Map([
    ["NPC_001_XIAOXUE", {
      npc_id: "NPC_001_XIAOXUE",
      name: "小雪",
      avatar_url: "/assets/npcs/xiaoxue.png",
      personality: {
        traits: ["警惕", "善良", "胆小"],
        values: ["忠诚", "安全感"],
        speaking_style: "简短、警惕、用词谨慎"
      },
      background: "小雪在快递站工作，目睹了快递员的失踪。她知道内幕但不敢说，害怕帮派报复。",
      initial_relationship: 50,
      relationship_thresholds: {
        hostile: 30,
        neutral: 70,
        friendly: 100
      },
      known_secrets: ["快递员因目睹帮派交易被追杀", "快递员藏在城寨"],
      forbidden_topics: ["具体藏身地点"]
    }],
    ["NPC_002_FEITANG", {
      npc_id: "NPC_002_FEITANG",
      name: "肥棠",
      avatar_url: "/assets/npcs/feitang.png",
      personality: {
        traits: ["粗鲁", "贪婪", "警觉"],
        values: ["金钱", "面子"],
        speaking_style: "粗俗、直接、威胁性"
      },
      background: "肥棠是红龙会的小头目，负责看守酒吧。什么都知道，但只认钱。",
      initial_relationship: 0,
      relationship_thresholds: {
        hostile: 30,
        neutral: 70,
        friendly: 100
      },
      known_secrets: ["快递员得罪了帮派", "帮派在找快递员"],
      forbidden_topics: []
    }]
  ]);
  
  /**
   * 🔥 获取NPC模板（深拷贝）
   */
  static getNPCTemplate(npcId: string): NPCTemplate {
    const template = this.npcTemplates.get(npcId);
    if (!template) {
      throw new Error(`NPC template not found: ${npcId}`);
    }
    
    return JSON.parse(JSON.stringify(template));
  }
  
  /**
   * 批量获取NPC模板
   */
  static getNPCTemplates(npcIds: string[]): NPCTemplate[] {
    return npcIds.map(id => this.getNPCTemplate(id));
  }
}
```

#### Task 1.3: 重构CacheManager

**文件: `/services/data/cache/CacheManager.ts`**
```typescript
import { StoryInstance } from './types/StoryInstance';
import { SceneInstance } from './types/SceneInstance';
import { NPCInstance } from './types/NPCInstance';
import { LLMSceneNarrativeRecord } from './types/LLMSceneNarrative';
import { LLMDialogueRecord } from './types/LLMDialogueHistory';
import { StoryDataAccess } from '../templates/StoryDataAccess';
import { SceneDataAccess } from '../templates/SceneDataAccess';
import { NPCDataAccess } from '../templates/NPCDataAccess';

export class CacheManager {
  // ============================================
  // Layer 2: 运行时实例存储
  // ============================================
  private static storyInstances: Map<string, StoryInstance> = new Map();
  private static sceneInstances: Map<string, SceneInstance> = new Map();
  private static npcInstances: Map<string, NPCInstance> = new Map();
  
  // ============================================
  // Layer 3: LLM生成内容存储
  // ============================================
  private static llmSceneNarratives: Map<string, LLMSceneNarrativeRecord> = new Map();
  private static llmDialogueHistory: Map<string, LLMDialogueRecord> = new Map();
  
  // ============================================
  // 故事实例管理
  // ============================================
  
  /**
   * 🔥 创建故事实例（从线索追踪时调用）
   */
  static createStoryInstance(
    playerId: string,
    clueId: string,
    storyTemplateId: string
  ): string {
    const instanceId = `${storyTemplateId}__${clueId}`;
    
    // 检查是否已存在
    if (this.storyInstances.has(instanceId)) {
      console.warn(`[CacheManager] Story instance already exists: ${instanceId}`);
      return instanceId;
    }
    
    // 从模板深拷贝创建实例
    const template = StoryDataAccess.getStoryTemplate(storyTemplateId);
    
    const instance: StoryInstance = {
      instance_id: instanceId,
      player_id: playerId,
      clue_id: clueId,
      story_template_id: storyTemplateId,
      
      story_data: {
        title: template.title,
        description: template.description,
        genre: [...template.genre],
        difficulty: template.difficulty
      },
      
      scene_sequence: [...template.scene_sequence],
      npc_ids: [...template.npc_ids],
      
      current_scene_id: null,
      completed_scenes: [],
      status: 'not_started',
      progress_percentage: 0,
      
      created_at: Date.now(),
      started_at: null,
      completed_at: null,
      last_played_at: null
    };
    
    this.storyInstances.set(instanceId, instance);
    this.saveToLocalStorage();
    
    console.log(`[CacheManager] ✅ Created story instance: ${instanceId}`);
    return instanceId;
  }
  
  /**
   * 🔥 获取故事实例（深拷贝）
   */
  static getStoryInstance(instanceId: string): StoryInstance | null {
    const instance = this.storyInstances.get(instanceId);
    if (!instance) {
      return null;
    }
    
    // ✅ 深拷贝
    return JSON.parse(JSON.stringify(instance));
  }
  
  /**
   * 🔥 更新故事实例
   */
  static updateStoryInstance(
    instanceId: string,
    updates: Partial<StoryInstance>
  ): void {
    const instance = this.storyInstances.get(instanceId);
    if (!instance) {
      throw new Error(`Story instance not found: ${instanceId}`);
    }
    
    Object.assign(instance, updates);
    this.saveToLocalStorage();
    
    console.log(`[CacheManager] ✅ Updated story instance: ${instanceId}`);
  }
  
  // ============================================
  // 场景实例管理
  // ============================================
  
  /**
   * 🔥 创建场景实例
   */
  static createSceneInstance(
    storyInstanceId: string,
    sceneTemplateId: string
  ): string {
    const sceneInstanceId = `${storyInstanceId}__${sceneTemplateId}`;
    
    if (this.sceneInstances.has(sceneInstanceId)) {
      return sceneInstanceId;
    }
    
    const sceneTemplate = SceneDataAccess.getSceneTemplate(sceneTemplateId);
    const storyInstance = this.getStoryInstance(storyInstanceId);
    
    if (!storyInstance) {
      throw new Error(`Story instance not found: ${storyInstanceId}`);
    }
    
    const instance: SceneInstance = {
      instance_id: sceneInstanceId,
      story_instance_id: storyInstanceId,
      scene_template_id: sceneTemplateId,
      player_id: storyInstance.player_id,
      
      scene_data: {
        title: sceneTemplate.title,
        location: sceneTemplate.location,
        time_of_day: sceneTemplate.time_of_day,
        weather: sceneTemplate.weather,
        background_info: sceneTemplate.background_info,
        objective: sceneTemplate.objective
      },
      
      npc_instance_ids: sceneTemplate.present_npc_ids.map(npcTemplateId =>
        `${storyInstanceId}__${npcTemplateId}`
      ),
      
      status: 'not_entered',
      entered_at: null,
      completed_at: null,
      triggered_events: []
    };
    
    this.sceneInstances.set(sceneInstanceId, instance);
    this.saveToLocalStorage();
    
    console.log(`[CacheManager] ✅ Created scene instance: ${sceneInstanceId}`);
    return sceneInstanceId;
  }
  
  /**
   * 🔥 获取场景实例（深拷贝）
   */
  static getSceneInstance(instanceId: string): SceneInstance | null {
    const instance = this.sceneInstances.get(instanceId);
    if (!instance) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(instance));
  }
  
  /**
   * 🔥 更新场景实例
   */
  static updateSceneInstance(
    instanceId: string,
    updates: Partial<SceneInstance>
  ): void {
    const instance = this.sceneInstances.get(instanceId);
    if (!instance) {
      throw new Error(`Scene instance not found: ${instanceId}`);
    }
    
    Object.assign(instance, updates);
    this.saveToLocalStorage();
  }
  
  // ============================================
  // NPC实例管理
  // ============================================
  
  /**
   * 🔥 创建NPC实例
   */
  static createNPCInstance(
    storyInstanceId: string,
    npcTemplateId: string
  ): string {
    const npcInstanceId = `${storyInstanceId}__${npcTemplateId}`;
    
    if (this.npcInstances.has(npcInstanceId)) {
      return npcInstanceId;
    }
    
    const npcTemplate = NPCDataAccess.getNPCTemplate(npcTemplateId);
    const storyInstance = this.getStoryInstance(storyInstanceId);
    
    if (!storyInstance) {
      throw new Error(`Story instance not found: ${storyInstanceId}`);
    }
    
    const instance: NPCInstance = {
      instance_id: npcInstanceId,
      story_instance_id: storyInstanceId,
      npc_template_id: npcTemplateId,
      player_id: storyInstance.player_id,
      
      npc_data: {
        name: npcTemplate.name,
        avatar_url: npcTemplate.avatar_url,
        personality: {
          traits: [...npcTemplate.personality.traits],
          values: [...npcTemplate.personality.values],
          speaking_style: npcTemplate.personality.speaking_style
        },
        background: npcTemplate.background
      },
      
      current_state: {
        relationship: npcTemplate.initial_relationship,
        current_mood: 'neutral',
        alertness: 0.5,
        trust_level: npcTemplate.initial_relationship
      },
      
      interaction_summary: {
        total_interactions: 0,
        last_interaction_at: null,
        revealed_secrets: []
      }
    };
    
    this.npcInstances.set(npcInstanceId, instance);
    this.saveToLocalStorage();
    
    console.log(`[CacheManager] ✅ Created NPC instance: ${npcInstanceId}`);
    return npcInstanceId;
  }
  
  /**
   * 🔥 获取NPC实例（深拷贝）
   */
  static getNPCInstance(instanceId: string): NPCInstance | null {
    const instance = this.npcInstances.get(instanceId);
    if (!instance) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(instance));
  }
  
  /**
   * 🔥 更新NPC实例
   */
  static updateNPCInstance(
    instanceId: string,
    stateUpdates: Partial<NPCInstance['current_state']>
  ): void {
    const instance = this.npcInstances.get(instanceId);
    if (!instance) {
      throw new Error(`NPC instance not found: ${instanceId}`);
    }
    
    Object.assign(instance.current_state, stateUpdates);
    this.saveToLocalStorage();
    
    console.log(`[CacheManager] ✅ Updated NPC instance: ${instanceId}`);
  }
  
  // ============================================
  // LLM生成内容管理
  // ============================================
  
  /**
   * 保存LLM生成的场景叙事
   */
  static saveLLMSceneNarrative(record: LLMSceneNarrativeRecord): void {
    this.llmSceneNarratives.set(record.record_id, record);
    this.saveToLocalStorage();
  }
  
  /**
   * 获取场景叙事（深拷贝）
   */
  static getLLMSceneNarrative(sceneInstanceId: string): LLMSceneNarrativeRecord | null {
    const record = Array.from(this.llmSceneNarratives.values()).find(r =>
      r.scene_instance_id === sceneInstanceId && r.is_active === true
    );
    
    if (!record) return null;
    
    return JSON.parse(JSON.stringify(record));
  }
  
  /**
   * 保存对话记录
   */
  static saveLLMDialogue(record: LLMDialogueRecord): void {
    this.llmDialogueHistory.set(record.record_id, record);
    this.saveToLocalStorage();
  }
  
  /**
   * 获取对话历史（深拷贝）
   */
  static getLLMDialogueHistory(
    npcInstanceId: string,
    limit: number = 10
  ): LLMDialogueRecord[] {
    const records = Array.from(this.llmDialogueHistory.values())
      .filter(r => r.npc_instance_id === npcInstanceId)
      .sort((a, b) => a.turn_number - b.turn_number)
      .slice(-limit);
    
    return JSON.parse(JSON.stringify(records));
  }
  
  // ============================================
  // 持久化
  // ============================================
  
  private static saveToLocalStorage(): void {
    try {
      localStorage.setItem('dreamheart_story_instances', JSON.stringify(Array.from(this.storyInstances.entries())));
      localStorage.setItem('dreamheart_scene_instances', JSON.stringify(Array.from(this.sceneInstances.entries())));
      localStorage.setItem('dreamheart_npc_instances', JSON.stringify(Array.from(this.npcInstances.entries())));
      localStorage.setItem('dreamheart_llm_narratives', JSON.stringify(Array.from(this.llmSceneNarratives.entries())));
      localStorage.setItem('dreamheart_llm_dialogues', JSON.stringify(Array.from(this.llmDialogueHistory.entries())));
    } catch (error) {
      console.error('[CacheManager] Failed to save to localStorage:', error);
    }
  }
  
  static loadFromLocalStorage(): void {
    try {
      const storyData = localStorage.getItem('dreamheart_story_instances');
      if (storyData) {
        this.storyInstances = new Map(JSON.parse(storyData));
      }
      
      const sceneData = localStorage.getItem('dreamheart_scene_instances');
      if (sceneData) {
        this.sceneInstances = new Map(JSON.parse(sceneData));
      }
      
      const npcData = localStorage.getItem('dreamheart_npc_instances');
      if (npcData) {
        this.npcInstances = new Map(JSON.parse(npcData));
      }
      
      const narrativeData = localStorage.getItem('dreamheart_llm_narratives');
      if (narrativeData) {
        this.llmSceneNarratives = new Map(JSON.parse(narrativeData));
      }
      
      const dialogueData = localStorage.getItem('dreamheart_llm_dialogues');
      if (dialogueData) {
        this.llmDialogueHistory = new Map(JSON.parse(dialogueData));
      }
      
      console.log('[CacheManager] ✅ Loaded from localStorage');
    } catch (error) {
      console.error('[CacheManager] Failed to load from localStorage:', error);
    }
  }
}

// 初始化时加载
CacheManager.loadFromLocalStorage();
```

#### Task 1.4: 验证数据层

**创建测试文件: `/services/data/__tests__/DataLayer.test.ts`**
```typescript
import { CacheManager } from '../cache/CacheManager';
import { StoryDataAccess } from '../templates/StoryDataAccess';

describe('Data Layer Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  test('模板深拷贝：修改返回值不影响原始模板', () => {
    const template1 = StoryDataAccess.getStoryTemplate('demo-story');
    const template2 = StoryDataAccess.getStoryTemplate('demo-story');
    
    template1.title = 'MODIFIED';
    
    expect(template2.title).toBe('消失的快递员');
  });
  
  test('实例隔离：追踪同一故事的不同线索创建独立实例', () => {
    const instance1 = CacheManager.createStoryInstance('player1', 'CLUE_004', 'demo-story');
    const instance2 = CacheManager.createStoryInstance('player1', 'CLUE_005', 'demo-story');
    
    expect(instance1).toBe('demo-story__CLUE_004');
    expect(instance2).toBe('demo-story__CLUE_005');
    
    // 验证独立性
    CacheManager.updateStoryInstance(instance1, { progress_percentage: 50 });
    
    const data1 = CacheManager.getStoryInstance(instance1);
    const data2 = CacheManager.getStoryInstance(instance2);
    
    expect(data1?.progress_percentage).toBe(50);
    expect(data2?.progress_percentage).toBe(0);
  });
  
  test('NPC实例隔离：同一NPC在不同故事实例中独立', () => {
    const story1 = CacheManager.createStoryInstance('player1', 'CLUE_004', 'demo-story');
    const story2 = CacheManager.createStoryInstance('player1', 'CLUE_005', 'demo-story');
    
    const npc1 = CacheManager.createNPCInstance(story1, 'NPC_002_FEITANG');
    const npc2 = CacheManager.createNPCInstance(story2, 'NPC_002_FEITANG');
    
    // 修改story1中的NPC关系值
    CacheManager.updateNPCInstance(npc1, { relationship: -20 });
    
    const npcData1 = CacheManager.getNPCInstance(npc1);
    const npcData2 = CacheManager.getNPCInstance(npc2);
    
    expect(npcData1?.current_state.relationship).toBe(-20);
    expect(npcData2?.current_state.relationship).toBe(0);  // 初始值
  });
  
  test('深拷贝：修改getStoryInstance返回值不影响缓存', () => {
    const instanceId = CacheManager.createStoryInstance('player1', 'CLUE_004', 'demo-story');
    
    const data1 = CacheManager.getStoryInstance(instanceId);
    if (data1) {
      data1.progress_percentage = 999;
    }
    
    const data2 = CacheManager.getStoryInstance(instanceId);
    expect(data2?.progress_percentage).toBe(0);  // 未被污染
  });
});
```

### 验收标准

- [ ] 所有类型定义创建完成
- [ ] DataAccess层实现完成，所有读取都是深拷贝
- [ ] CacheManager重构完成，支持实例创建和管理
- [ ] 单元测试全部通过
- [ ] 代码审查通过

---

## 🔌 Phase 2: Service层重构

### 目标
将Service层改为无状态，所有状态读写通过CacheManager

### 任务清单

#### Task 2.1: 重构ClueService

**文件: `/services/business/ClueService.ts`**
```typescript
import { CacheManager } from '../data/cache/CacheManager';
import { ClueRecord } from '../data/cache/types/ClueRecord';

export class ClueService {
  /**
   * 🔥 追踪线索（创建故事实例）
   */
  static trackClue(playerId: string, clueId: string): string {
    // 1. 获取线索信息
    const clue = CacheManager.getClue(clueId);
    if (!clue) {
      throw new Error(`Clue not found: ${clueId}`);
    }
    
    if (clue.status === 'tracking') {
      // 已追踪，返回现有故事实例ID
      return clue.story_instance_id!;
    }
    
    // 2. 创建故事实例
    const storyInstanceId = CacheManager.createStoryInstance(
      playerId,
      clueId,
      clue.story_template_id
    );
    
    // 3. 更新线索状态
    CacheManager.updateClue(clueId, {
      status: 'tracking',
      story_instance_id: storyInstanceId,
      tracked_at: Date.now()
    });
    
    console.log(`[ClueService] ✅ Tracked clue ${clueId} → ${storyInstanceId}`);
    return storyInstanceId;
  }
  
  /**
   * 🔥 获取线索（深拷贝）
   */
  static getClue(clueId: string): ClueRecord | null {
    return CacheManager.getClue(clueId);
  }
  
  /**
   * 标记线索为已读
   */
  static markClueAsRead(clueId: string): void {
    CacheManager.updateClue(clueId, {
      status: 'read',
      read_at: Date.now()
    });
  }
  
  /**
   * 获取玩家的所有线索
   */
  static getPlayerClues(playerId: string): ClueRecord[] {
    return CacheManager.getPlayerClues(playerId);
  }
  
  /**
   * 获取未读线索数量
   */
  static getUnreadCount(playerId: string): number {
    const clues = this.getPlayerClues(playerId);
    return clues.filter(c => c.status === 'unread').length;
  }
}
```

#### Task 2.2: 重构StoryService

**文件: `/services/business/StoryService.ts`**
```typescript
import { CacheManager } from '../data/cache/CacheManager';
import { StoryInstance } from '../data/cache/types/StoryInstance';

export class StoryService {
  /**
   * 🔥 启动故事（进入第一个场景）
   */
  static startStory(storyInstanceId: string): void {
    const instance = CacheManager.getStoryInstance(storyInstanceId);
    if (!instance) {
      throw new Error(`Story instance not found: ${storyInstanceId}`);
    }
    
    if (instance.status !== 'not_started') {
      console.warn(`Story already started: ${storyInstanceId}`);
      return;
    }
    
    // 更新状态
    CacheManager.updateStoryInstance(storyInstanceId, {
      status: 'in_progress',
      started_at: Date.now(),
      last_played_at: Date.now()
    });
    
    // 进入第一个场景
    const firstSceneId = instance.scene_sequence[0];
    if (firstSceneId) {
      this.enterScene(storyInstanceId, firstSceneId);
    }
  }
  
  /**
   * 🔥 进入场景
   */
  static enterScene(storyInstanceId: string, sceneTemplateId: string): void {
    // 1. 创建场景实例（如果不存在）
    const sceneInstanceId = CacheManager.createSceneInstance(
      storyInstanceId,
      sceneTemplateId
    );
    
    // 2. 创建场景中的NPC实例
    const sceneInstance = CacheManager.getSceneInstance(sceneInstanceId);
    if (sceneInstance) {
      const sceneTemplate = SceneDataAccess.getSceneTemplate(sceneTemplateId);
      for (const npcTemplateId of sceneTemplate.present_npc_ids) {
        CacheManager.createNPCInstance(storyInstanceId, npcTemplateId);
      }
    }
    
    // 3. 更新场景状态
    CacheManager.updateSceneInstance(sceneInstanceId, {
      status: 'in_progress',
      entered_at: Date.now()
    });
    
    // 4. 更新故事状态
    CacheManager.updateStoryInstance(storyInstanceId, {
      current_scene_id: sceneInstanceId,
      last_played_at: Date.now()
    });
    
    console.log(`[StoryService] ✅ Entered scene: ${sceneInstanceId}`);
  }
  
  /**
   * 获取故事实例
   */
  static getStoryInstance(instanceId: string): StoryInstance | null {
    return CacheManager.getStoryInstance(instanceId);
  }
  
  /**
   * 获取当前场景
   */
  static getCurrentScene(storyInstanceId: string): any {
    const instance = CacheManager.getStoryInstance(storyInstanceId);
    if (!instance || !instance.current_scene_id) {
      return null;
    }
    
    return CacheManager.getSceneInstance(instance.current_scene_id);
  }
}
```

#### Task 2.3: 重构NPCService

**文件: `/services/business/NPCService.ts`**
```typescript
import { CacheManager } from '../data/cache/CacheManager';
import { NPCInstance } from '../data/cache/types/NPCInstance';

export class NPCService {
  /**
   * 获取NPC实例
   */
  static getNPCInstance(npcInstanceId: string): NPCInstance | null {
    return CacheManager.getNPCInstance(npcInstanceId);
  }
  
  /**
   * 更新NPC关系值
   */
  static updateRelationship(
    npcInstanceId: string,
    delta: number
  ): void {
    const npc = CacheManager.getNPCInstance(npcInstanceId);
    if (!npc) {
      throw new Error(`NPC instance not found: ${npcInstanceId}`);
    }
    
    const newRelationship = Math.max(0, Math.min(100, 
      npc.current_state.relationship + delta
    ));
    
    CacheManager.updateNPCInstance(npcInstanceId, {
      relationship: newRelationship
    });
    
    console.log(`[NPCService] ✅ Updated relationship: ${npcInstanceId} → ${newRelationship}`);
  }
  
  /**
   * 更新NPC情绪
   */
  static updateMood(
    npcInstanceId: string,
    mood: string
  ): void {
    CacheManager.updateNPCInstance(npcInstanceId, {
      current_mood: mood
    });
  }
  
  /**
   * 获取场景中的所有NPC
   */
  static getSceneNPCs(sceneInstanceId: string): NPCInstance[] {
    const scene = CacheManager.getSceneInstance(sceneInstanceId);
    if (!scene) {
      return [];
    }
    
    return scene.npc_instance_ids
      .map(id => CacheManager.getNPCInstance(id))
      .filter((npc): npc is NPCInstance => npc !== null);
  }
}
```

#### Task 2.4: 创建LLM Service接口

**文件: `/services/llm/interfaces/ILLMService.ts`**
```typescript
import { NarrativeUnit } from '../../data/cache/types/LLMSceneNarrative';

export interface ISceneNarrativeGenerationService {
  generateSceneNarrative(request: {
    storyInstanceId: string;
    sceneId: string;
    sceneTemplate: any;
    playerContext: any;
  }): Promise<{
    narrativeUnits: NarrativeUnit[];
    metadata: {
      llmModel: string;
      tokenCount: number;
      generatedAt: number;
    };
  }>;
}

export interface INPCDialogueService {
  generateNPCResponse(request: {
    sceneId: string;
    npcId: string;
    playerInput: string;
    npcState: any;
    conversationHistory: any[];
    sceneConstraints: any;
  }): Promise<{
    npcResponse: string;
    emotionalState: {
      mood: string;
      intensity: number;
    };
    relationshipDelta: number;
    triggeredEvents: any[];
    metadata: {
      llmModel: string;
      tokenCount: number;
      generatedAt: number;
    };
  }>;
}
```

**文件: `/services/llm/mock/MockLLMService.ts`**
```typescript
import { ISceneNarrativeGenerationService, INPCDialogueService } from '../interfaces/ILLMService';
import { NarrativeUnit } from '../../data/cache/types/LLMSceneNarrative';

export class MockSceneNarrativeService implements ISceneNarrativeGenerationService {
  async generateSceneNarrative(request: any): Promise<any> {
    // Demo阶段：返回预定义数据
    const mockNarrative: NarrativeUnit[] = [
      {
        id: 'unit-1',
        type: 'Narrative',
        actor: 'System',
        content: '【深夜的尖沙咀】霓虹灯在雨后的路面投下斑斓的倒影。你来到"掘金者"酒吧门口，透过斑驳的玻璃窗，能看到里面烟雾缭绕。'
      },
      {
        id: 'unit-2',
        type: 'Narrative',
        actor: '肥棠',
        content: '一个膀大腰圆的男人靠在门边，叼着烟，眼神锐利地打量着每一个路过的人。',
        mood: 'tense'
      },
      {
        id: 'unit-3',
        type: 'InterventionPoint',
        interventionType: 'dialogue',
        content: '【介入时机点】你可以选择如何回应...',
        choices: [
          { id: 'choice-1', text: '直接询问快递员的事' },
          { id: 'choice-2', text: '先套近乎，打听酒吧情况' },
          { id: 'choice-3', text: '保持沉默，观察周围' }
        ]
      }
    ];
    
    return {
      narrativeUnits: mockNarrative,
      metadata: {
        llmModel: 'mock',
        tokenCount: 0,
        generatedAt: Date.now()
      }
    };
  }
}

export class MockNPCDialogueService implements INPCDialogueService {
  async generateNPCResponse(request: any): Promise<any> {
    // Demo阶段：简单规则匹配
    const mockResponses: Record<string, string> = {
      '快递员': '（肥棠眯起眼睛）快递员？这里每天来来往往的人多了去了。你为啥找他？',
      '酒吧': '这里是红龙会的地盘，不是你该问的地方。',
      'default': '我不知道你在说什么。'
    };
    
    const matchedKey = Object.keys(mockResponses).find(key =>
      request.playerInput.includes(key)
    );
    
    const response = mockResponses[matchedKey || 'default'];
    
    return {
      npcResponse: response,
      emotionalState: {
        mood: 'suspicious',
        intensity: 0.7
      },
      relationshipDelta: -5,
      triggeredEvents: [],
      metadata: {
        llmModel: 'mock',
        tokenCount: 0,
        generatedAt: Date.now()
      }
    };
  }
}
```

**文件: `/services/llm/LLMServiceFactory.ts`**
```typescript
import { ISceneNarrativeGenerationService, INPCDialogueService } from './interfaces/ILLMService';
import { MockSceneNarrativeService, MockNPCDialogueService } from './mock/MockLLMService';

export class LLMServiceFactory {
  private static narrativeService: ISceneNarrativeGenerationService = new MockSceneNarrativeService();
  private static dialogueService: INPCDialogueService = new MockNPCDialogueService();
  
  static getNarrativeService(): ISceneNarrativeGenerationService {
    return this.narrativeService;
  }
  
  static getDialogueService(): INPCDialogueService {
    return this.dialogueService;
  }
  
  // 🚀 上线时调用，切换到真实LLM实现
  static switchToRealLLM(): void {
    // this.narrativeService = new RealLLMNarrativeService();
    // this.dialogueService = new RealLLMDialogueService();
  }
}
```

#### Task 2.5: 创建NarrativeService

**文件: `/services/business/NarrativeService.ts`**
```typescript
import { CacheManager } from '../data/cache/CacheManager';
import { LLMServiceFactory } from '../llm/LLMServiceFactory';
import { NarrativeUnit } from '../data/cache/types/LLMSceneNarrative';

export class NarrativeService {
  /**
   * 🔥 加载场景叙事（带缓存）
   */
  static async loadSceneNarrative(sceneInstanceId: string): Promise<NarrativeUnit[]> {
    // 1. 检查缓存
    const cached = CacheManager.getLLMSceneNarrative(sceneInstanceId);
    if (cached) {
      console.log(`[NarrativeService] ✅ Cache hit: ${sceneInstanceId}`);
      return cached.narrative_units;
    }
    
    // 2. 获取场景实例
    const sceneInstance = CacheManager.getSceneInstance(sceneInstanceId);
    if (!sceneInstance) {
      throw new Error(`Scene instance not found: ${sceneInstanceId}`);
    }
    
    // 3. 调用LLM生成
    const llmService = LLMServiceFactory.getNarrativeService();
    const result = await llmService.generateSceneNarrative({
      storyInstanceId: sceneInstance.story_instance_id,
      sceneId: sceneInstance.scene_template_id,
      sceneTemplate: sceneInstance.scene_data,
      playerContext: {}  // TODO: 构建玩家上下文
    });
    
    // 4. 保存到缓存
    CacheManager.saveLLMSceneNarrative({
      record_id: this.generateUUID(),
      player_id: sceneInstance.player_id,
      story_instance_id: sceneInstance.story_instance_id,
      scene_instance_id: sceneInstanceId,
      scene_template_id: sceneInstance.scene_template_id,
      narrative_units: result.narrativeUnits,
      llm_model: result.metadata.llmModel,
      token_count: result.metadata.tokenCount,
      generated_at: result.metadata.generatedAt,
      version: 1,
      is_active: true
    });
    
    console.log(`[NarrativeService] ✅ Generated narrative: ${sceneInstanceId}`);
    return result.narrativeUnits;
  }
  
  /**
   * 🔥 处理玩家选择
   */
  static async handlePlayerChoice(
    sceneInstanceId: string,
    npcInstanceId: string,
    playerInput: string
  ): Promise<any> {
    // 1. 获取NPC实例
    const npc = CacheManager.getNPCInstance(npcInstanceId);
    if (!npc) {
      throw new Error(`NPC instance not found: ${npcInstanceId}`);
    }
    
    // 2. 获取对话历史
    const history = CacheManager.getLLMDialogueHistory(npcInstanceId, 10);
    
    // 3. 调用LLM生成响应
    const llmService = LLMServiceFactory.getDialogueService();
    const result = await llmService.generateNPCResponse({
      sceneId: sceneInstanceId,
      npcId: npc.npc_template_id,
      playerInput: playerInput,
      npcState: {
        personality: npc.npc_data.personality.traits.join(', '),
        currentMood: npc.current_state.current_mood,
        relationship: npc.current_state.relationship,
        knownSecrets: []
      },
      conversationHistory: history,
      sceneConstraints: {}
    });
    
    // 4. 保存对话记录
    const turnNumber = history.length + 1;
    CacheManager.saveLLMDialogue({
      record_id: this.generateUUID(),
      player_id: npc.player_id,
      story_instance_id: npc.story_instance_id,
      scene_instance_id: sceneInstanceId,
      npc_instance_id: npcInstanceId,
      player_input: playerInput,
      npc_response: result.npcResponse,
      emotional_state: result.emotionalState,
      relationship_delta: result.relationshipDelta,
      triggered_events: result.triggeredEvents,
      llm_model: result.metadata.llmModel,
      token_count: result.metadata.tokenCount,
      timestamp: result.metadata.generatedAt,
      turn_number: turnNumber
    });
    
    // 5. 更新NPC状态
    CacheManager.updateNPCInstance(npcInstanceId, {
      relationship: npc.current_state.relationship + result.relationshipDelta,
      current_mood: result.emotionalState.mood
    });
    
    return result;
  }
  
  private static generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 验收标准

- [ ] 所有Service改为无状态
- [ ] Service层不持有任何状态变量
- [ ] 所有状态读写通过CacheManager
- [ ] LLM接口抽象完成
- [ ] Mock实现可用

---

## 🎨 Phase 3: UI层适配

### 目标
更新UI组件，使用新的Service API

### 任务清单

#### Task 3.1: 更新ClueInboxPanel

**文件修改: `/components/panels/ClueInboxPanel.tsx`**

修改点：
1. 使用 `ClueService.getPlayerClues()` 获取线索列表
2. 追踪线索时调用 `ClueService.trackClue()`
3. 显示线索详情时使用故事实例ID获取数据

```typescript
// 修改前
const clue = clueInbox.find(c => c.id === selectedClueId);

// 修改后
const clue = ClueService.getClue(selectedClueId);
if (clue?.story_instance_id) {
  const storyInstance = StoryService.getStoryInstance(clue.story_instance_id);
  // 显示故事进度等信息
}
```

#### Task 3.2: 更新NearFieldPanel

**文件修改: `/components/panels/NearFieldPanel.tsx`**

修改点：
1. 使用 `NarrativeService.loadSceneNarrative()` 加载叙事
2. 处理玩家选择时调用 `NarrativeService.handlePlayerChoice()`

```typescript
// 加载场景叙事
useEffect(() => {
  if (currentSceneInstanceId) {
    NarrativeService.loadSceneNarrative(currentSceneInstanceId)
      .then(narrative => setNarrativeUnits(narrative));
  }
}, [currentSceneInstanceId]);

// 处理选择
const handleChoice = async (choiceId: string) => {
  const result = await NarrativeService.handlePlayerChoice(
    currentSceneInstanceId,
    targetNPCInstanceId,
    choiceText
  );
  
  // 显示NPC响应
  appendNarrative(result.npcResponse);
};
```

#### Task 3.3: 更新EntityFocusPanel

**文件修改: `/components/panels/EntityFocusPanel.tsx`**

修改点：
1. 使用 `NPCService.getSceneNPCs()` 获取场景NPC列表
2. 显示NPC详情时使用实例ID

```typescript
// 获取场景NPC
const npcs = NPCService.getSceneNPCs(currentSceneInstanceId);

// 显示NPC关系值
{npcs.map(npc => (
  <div key={npc.instance_id}>
    <span>{npc.npc_data.name}</span>
    <span>关系: {npc.current_state.relationship}</span>
  </div>
))}
```

#### Task 3.4: 更新StoryHeader

**文件修改: `/components/layout/StoryHeader.tsx`**

修改点：
1. 显示当前故事时使用故事实例数据

```typescript
const storyInstance = StoryService.getStoryInstance(currentStoryInstanceId);

return (
  <div>
    <h1>{storyInstance?.story_data.title}</h1>
    <span>进度: {storyInstance?.progress_percentage}%</span>
  </div>
);
```

### 验收标准

- [ ] 所有UI组件更新完成
- [ ] UI正确显示实例数据
- [ ] 用户交互流程正常
- [ ] 无控制台错误

---

## 🤖 Phase 4: LLM接口标准化

### 目标
完善LLM服务接口，为未来真实LLM集成做准备

### 任务清单

#### Task 4.1: 完善接口定义

**文件: `/services/llm/interfaces/ILLMService.ts`**

补充所有LLM服务接口：
- ✅ ISceneNarrativeGenerationService
- ✅ INPCDialogueService
- ➕ IFreeformInputProcessingService
- ➕ IRelationshipInferenceService

#### Task 4.2: 添加LLM调用监控

**文件: `/services/llm/monitoring/LLMMonitor.ts`**

```typescript
export class LLMMonitor {
  private static callHistory: Array<{
    service: string;
    method: string;
    tokenCount: number;
    timestamp: number;
  }> = [];
  
  static logCall(service: string, method: string, tokenCount: number): void {
    this.callHistory.push({
      service,
      method,
      tokenCount,
      timestamp: Date.now()
    });
  }
  
  static getUsageStats(timeRange?: { start: number; end: number }): any {
    // 统计token使用量
  }
}
```

#### Task 4.3: 创建LLM配置

**文件: `/services/llm/config/LLMConfig.ts`**

```typescript
export const LLMConfig = {
  // Demo模式
  mode: 'mock' as 'mock' | 'real',
  
  // 真实LLM配置（上线时填写）
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4',
  
  // 限额配置
  dailyTokenLimit: 100000,
  
  // 重试配置
  maxRetries: 3,
  retryDelay: 1000
};
```

### 验收标准

- [ ] 所有LLM接口定义完整
- [ ] Mock实现可用
- [ ] 监控系统就绪
- [ ] 配置系统完善

---

## ✅ Phase 5: 验证与优化

### 目标
全面测试新架构，验证问题修复

### 测试用例清单

#### 测试场景1: 基础隔离验证

```typescript
测试步骤:
1. 追踪CLUE_004，进入scene-a
2. 与肥棠对话，关系值变为-20
3. 完成部分场景，进度50%
4. 追踪CLUE_005（同样是demo-story）
5. 进入scene-a
6. 检查肥棠关系值（应为0）
7. 查看CLUE_004详情
8. 检查进度（应为50%）
9. 检查肥棠关系值（应为-20）

预期结果:
✅ CLUE_004和CLUE_005的数据完全独立
✅ 切换查看时数据不丢失
✅ 无引用污染
```

#### 测试场景2: 深拷贝验证

```typescript
测试步骤:
1. 获取故事实例: const story = StoryService.getStoryInstance(id)
2. 修改返回对象: story.progress_percentage = 999
3. 再次获取: const story2 = StoryService.getStoryInstance(id)
4. 检查: story2.progress_percentage

预期结果:
✅ story2.progress_percentage !== 999
✅ 缓存未被污染
```

#### 测试场景3: 叙事缓存验证

```typescript
测试步骤:
1. 进入scene-a（首次）
2. 记录叙事内容
3. 离开场景
4. 重新进入scene-a
5. 对比叙事内容

预期结果:
✅ 两次叙事内容完全一致
✅ 第二次进入时直接从缓存读取（console显示Cache hit）
```

#### 测试场景4: NPC状态独立验证

```typescript
测试步骤:
1. CLUE_004中，与小雪对话，关系值+20
2. CLUE_005中，与小雪对话，关系值-10
3. 分别查看两个线索的小雪关系值

预期结果:
✅ CLUE_004中小雪关系值: 70
✅ CLUE_005中小雪关系值: 40
✅ 完全独立
```

### 性能测试

#### 测试点1: 深拷贝性能

```typescript
// 测试大对象深拷贝耗时
const start = performance.now();
const copy = CacheManager.getStoryInstance(id);
const end = performance.now();

console.log(`Deep copy time: ${end - start}ms`);

// 预期: < 5ms
```

#### 测试点2: 缓存命中率

```typescript
// 统计叙事加载的缓存命中率
const stats = {
  cacheHits: 0,
  cacheMisses: 0,
  hitRate: 0
};

// 预期: > 80% (重复进入场景时)
```

### 验收标准

- [ ] 所有测试场景通过
- [ ] 无引用污染问题
- [ ] 性能指标达标
- [ ] 代码审查通过
- [ ] 文档更新完成

---

## 🚨 风险控制

### 风险1: 深拷贝性能影响

**风险描述**: 频繁深拷贝可能影响性能

**缓解措施**:
- 只在必要时深拷贝（读取时）
- 对于大对象考虑使用结构化克隆
- 监控性能指标

**回退方案**:
- 如果性能问题严重，考虑使用Immer.js

### 风险2: LocalStorage容量限制

**风险描述**: LocalStorage有5MB限制

**缓解措施**:
- 监控存储使用量
- 定期清理旧数据
- 考虑压缩存储

**回退方案**:
- 切换到IndexedDB

### 风险3: 重构期间功能中断

**风险描述**: 重构过程中可能导致功能不可用

**缓解措施**:
- 分阶段实施
- 保持备份分支
- 每个阶段都可独立验证

**回退方案**:
- 随时可以回退到备份分支

---

## 📊 进度跟踪

### 里程碑

| 里程碑 | 目标日期 | 状态 | 负责人 |
|--------|---------|------|--------|
| Phase 0 完成 | Day 1 | 🔲 待开始 | - |
| Phase 1 完成 | Day 3 | 🔲 待开始 | - |
| Phase 2 完成 | Day 6 | 🔲 待开始 | - |
| Phase 3 完成 | Day 9 | 🔲 待开始 | - |
| Phase 4 完成 | Day 11 | 🔲 待开始 | - |
| Phase 5 完成 | Day 13 | 🔲 待开始 | - |
| 上线发布 | Day 14 | 🔲 待开始 | - |

### 每日检查清单

```markdown
## Day 1 (Phase 0)
- [ ] 创建备份分支
- [ ] 代码审计完成
- [ ] 重构清单确认

## Day 2-3 (Phase 1)
- [ ] 类型定义创建
- [ ] DataAccess层实现
- [ ] CacheManager重构
- [ ] 单元测试通过

## Day 4-6 (Phase 2)
- [ ] ClueService重构
- [ ] StoryService重构
- [ ] NPCService重构
- [ ] LLM接口创建
- [ ] Mock实现完成

## Day 7-9 (Phase 3)
- [ ] ClueInboxPanel更新
- [ ] NearFieldPanel更新
- [ ] EntityFocusPanel更新
- [ ] StoryHeader更新
- [ ] UI测试通过

## Day 10-11 (Phase 4)
- [ ] LLM接口完善
- [ ] 监控系统实现
- [ ] 配置系统完成

## Day 12-13 (Phase 5)
- [ ] 基础隔离测试
- [ ] 深拷贝测试
- [ ] 叙事缓存测试
- [ ] NPC状态测试
- [ ] 性能测试
- [ ] 所有问题修复

## Day 14
- [ ] 最终审查
- [ ] 文档更新
- [ ] 部署上线
```

---

## 📚 参考文档

### 架构图

```
旧架构（有问题）:
UI → Service → StateManager ⚠️ 共享引用
              → CacheManager

新架构（修复后）:
UI → Service → CacheManager（唯一数据源）
       ↓           ↓
   无状态      深拷贝读写
```

### 数据流示例

```typescript
// 追踪线索 → 创建故事实例
ClueService.trackClue('CLUE_004')
  → CacheManager.createStoryInstance('demo-story__CLUE_004')
    → 从StoryDataAccess获取模板（深拷贝）
    → 创建独立实例
    → 存储到Map

// 进入场景 → 创建场景实例
StoryService.enterScene('demo-story__CLUE_004', 'scene-a')
  → CacheManager.createSceneInstance('demo-story__CLUE_004__scene-a')
    → 从SceneDataAccess获取模板（深拷贝）
    → 创建NPC实例
    → 生成/加载叙事

// 对话交互 → 更新NPC状态
NarrativeService.handlePlayerChoice(...)
  → LLM生成响应
  → 保存对话历史
  → 更新NPC关系值（通过CacheManager）
```

### 关键规则

1. **所有读取必须深拷贝**
   ```typescript
   // ❌ 错误
   return this.instances.get(id);
   
   // ✅ 正确
   return JSON.parse(JSON.stringify(this.instances.get(id)));
   ```

2. **实例ID命名规范**
   ```typescript
   story_instance_id = `${story_template_id}__${clue_id}`
   scene_instance_id = `${story_instance_id}__${scene_template_id}`
   npc_instance_id = `${story_instance_id}__${npc_template_id}`
   ```

3. **Service层无状态**
   ```typescript
   // ❌ 错误
   class Service {
     private currentStory: Story;  // 禁止！
   }
   
   // ✅ 正确
   class Service {
     static getStory(id: string): Story {
       return CacheManager.getStoryInstance(id);
     }
   }
   ```

---

## 🎉 完成标准

### 功能完整性

- [x] 追踪线索创建独立故事实例
- [x] 同一故事的不同线索完全隔离
- [x] 查看线索详情数据不丢失
- [x] NPC状态在不同实例中独立
- [x] 叙事内容正确缓存和读取

### 代码质量

- [x] 所有Service无状态
- [x] 所有读取都深拷贝
- [x] 命名规范统一
- [x] 类型定义完整
- [x] 注释清晰

### 测试覆盖

- [x] 单元测试通过
- [x] 集成测试通过
- [x] UI测试通过
- [x] 性能测试达标

### 文档完善

- [x] 架构文档更新
- [x] API文档更新
- [x] 使用指南更新
- [x] 重构总结文档

---

## 📞 支持与反馈

如有问题，请联系:
- 技术负责人: [待填写]
- 项目经理: [待填写]
- 紧急联系: [待填写]

---

**文档结束**

*Last Updated: 2025-11-11*
*Version: 1.0*