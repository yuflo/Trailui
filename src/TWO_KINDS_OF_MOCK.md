# 两种 Mock Data 的区别

## ⚠️ **重要：当前架构有两种不同的 Mock！**

```
┌──────────────────────────────────────────────────────────────┐
│              Mock 1: Data Access Mock                        │
│           (模拟从数据库读取静态配置)                          │
│                                                              │
│  当前实现：                                                   │
│  StoryDataAccessMock.getStoryById()                          │
│    → 读取 /data/hong-kong/demo-story-map.data.ts            │
│    → 返回 JSON 对象                                          │
│                                                              │
│  正式版替换：                                                 │
│  StoryDataAccessApi.getStoryById()                           │
│    → 调用数据库/CMS API                                       │
│    → 返回同样结构的 JSON 对象                                 │
│                                                              │
│  数据示例：                                                   │
│  {                                                           │
│    story_id: 'story-hk-001',                                 │
│    title: '霓虹迷雾',                                         │
│    scenes: ['scene-a', 'scene-b'],  ← 静态配置               │
│    scenes: {                                                 │
│      'scene-a': {                                            │
│        title: '赛博酒吧',            ← 静态配置               │
│        location: '第七区',           ← 静态配置               │
│        npc_ids: ['npc-broker']      ← 静态配置               │
│      }                                                       │
│    }                                                         │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Mock 2: Service Mock Data                       │
│           (模拟 LLM 动态生成内容)                             │
│                                                              │
│  当前实现：                                                   │
│  MockSceneProvider.generateSceneNarrative()                  │
│    → 返回硬编码的文字描述                                     │
│                                                              │
│  正式版替换：                                                 │
│  LLMService.generateNarrative()                              │
│    → 调用 GPT-4 / Claude API                                 │
│    → 动态生成文字描述                                         │
│                                                              │
│  数据示例：                                                   │
│  "你推开厚重的金属门，走进这个被霓虹灯照亮的地下世界。        │
│   酒吧里烟雾缭绕，全息投影在空气中扭曲变形..."               │
│                                                              │
│  ← 这是 AI 生成的文字，不是静态配置！                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 **两种 Mock 的对比**

| 对比项 | Mock 1: Data Access Mock | Mock 2: Service Mock Data |
|---|---|---|
| **位置** | `/engine/data-access/mock/` | `/engine/services/business/MockDataProvider.ts` |
| **作用** | 读取游戏静态配置 | 模拟 LLM 生成文本 |
| **数据类型** | JSON 对象（结构化数据） | 字符串（文字描述） |
| **Demo实现** | 读取 TS 文件中的对象 | 返回硬编码字符串 |
| **正式版替换** | 从数据库/CMS读取 | 调用 LLM API 动态生成 |
| **是否是静态内容** | ✅ 是（游戏配置） | ❌ 否（动态生成） |

---

## 🔄 **完整数据流**

```typescript
// ============================================
// 场景：玩家进入场景
// ============================================

// 1️⃣ 使用 Mock 1: Data Access Mock
//    读取场景的静态配置
const storyDataAccess = DataAccessFactory.createStoryDataAccess();
//                      ↓
//               StoryDataAccessMock（Demo阶段）
//                      ↓
const scene = await storyDataAccess.getSceneById('story-hk-001', 'scene-a');

// 返回（来自 /data/hong-kong/demo-story-map.data.ts）：
{
  scene_id: 'scene-a',
  title: '赛博酒吧 - 暗影之下',  ← 静态配置
  location: '第七区',            ← 静态配置
  npc_ids: ['npc-broker']       ← 静态配置
}

// ✅ 这是游戏的静态内容数据！
// ✅ 正式版会从数据库读取同样的结构！

// ============================================
// 2️⃣ 使用 Mock 2: Service Mock Data
//    生成场景的文字描述
const narrative = MockSceneProvider.generateSceneNarrative('scene-a');

// 返回（来自 MockDataProvider.ts 硬编码）：
"你推开厚重的金属门，走进这个被霓虹灯照亮的地下世界。
酒吧里烟雾缭绕，全息投影在空气中扭曲变形..."

// ✅ 这是模拟 LLM 生成的文字！
// ✅ 正式版会调用 GPT-4 动态生成！

// ============================================
// 3️⃣ 保存到 Cache（数据库替身）
InstanceCacheManager.createSceneInstance(storyInstanceId, scene);
//                                                          ↑
//                                                   来自 Mock 1

InstanceCacheManager.saveLLMSceneNarrative({
  scene_instance_id: sceneInstanceId,
  narrative_text: narrative  ← 来自 Mock 2
});
```

---

## ✅ **正式上线的替换方案**

### **替换 Mock 1: Data Access**

```typescript
// ❌ Demo 阶段
class StoryDataAccessMock {
  async getStoryById(storyId: string) {
    // 从 TS 文件读取
    return demoStoryMap[storyId];
  }
}

// ✅ 正式版
class StoryDataAccessApi {
  async getStoryById(storyId: string) {
    // 从数据库读取
    const { data } = await supabase
      .from('story_templates')
      .select('*')
      .eq('story_id', storyId)
      .single();
    
    return data;
  }
}

// 切换方式：
DataAccessFactory.setMode('api');
```

---

### **替换 Mock 2: Service Mock Data**

```typescript
// ❌ Demo 阶段
class MockSceneProvider {
  static generateSceneNarrative(sceneId: string) {
    // 返回硬编码文本
    return mockNarratives[sceneId];
  }
}

// ✅ 正式版
class LLMService {
  static async generateNarrative(sceneTemplate: any, context: any) {
    // 调用 LLM API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: '你是赛博朋克世界的叙事者...'
        },
        {
          role: 'user',
          content: `场景：${sceneTemplate.title}，地点：${sceneTemplate.location}...`
        }
      ]
    });
    
    return response.choices[0].message.content;
  }
}

// 修改 SceneService：
// ❌ const narrative = MockSceneProvider.generateSceneNarrative(sceneId);
// ✅ const narrative = await LLMService.generateNarrative(sceneTemplate, context);
```

---

## 🎯 **总结你的理解**

### **你说的"静态内容数据" = Mock 1（Data Access）**

✅ **完全正确！**

```
Mock 1: Data Access Mock
  ↓
游戏的静态配置数据
  ↓
Demo: 读取 JSON/TS 文件
正式版: 从数据库读取
```

---

### **但还有 Mock 2（Service Mock Data）**

⚠️ **这不是静态内容！**

```
Mock 2: Service Mock Data
  ↓
模拟 LLM 生成的动态文本
  ↓
Demo: 返回硬编码字符串
正式版: 调用 LLM API
```

---

## 📐 **完整架构图**

```
┌─────────────────────────────────────────────────┐
│          Data Access Layer                      │
│                                                 │
│  Mock 1: StoryDataAccessMock                    │
│    → 读取 demo-story-map.data.ts                │
│    → 返回：{ scene_id, title, npc_ids }        │
│                                                 │
│  正式版: StoryDataAccessApi                     │
│    → 从 Supabase 读取                            │
│    → 返回：{ scene_id, title, npc_ids }        │
│                                                 │
│  ✅ 这是静态游戏配置数据！                       │
└─────────────────────┬───────────────────────────┘
                      ↓ 提供配置
┌─────────────────────────────────────────────────┐
│          Service Layer                          │
│                                                 │
│  Mock 2: MockSceneProvider                      │
│    → 返回硬编码文本                              │
│    → 返回："你推开门..."                         │
│                                                 │
│  正式版: LLMService                              │
│    → 调用 GPT-4 API                              │
│    → 返回："你推开门..."                         │
│                                                 │
│  ⚠️ 这是动态生成的文本！                         │
└─────────────────────┬───────────────────────────┘
                      ↓ 保存数据
┌─────────────────────────────────────────────────┐
│          Cache Layer                            │
│                                                 │
│  Demo: localStorage                             │
│  正式版: Supabase                                │
│                                                 │
│  存储：                                          │
│  • 玩家进度（来自业务逻辑）                      │
│  • 场景配置快照（来自 Mock 1）                   │
│  • AI生成文本（来自 Mock 2）                     │
└─────────────────────────────────────────────────┘
```

---

## ✅ **最终总结**

你的理解：

> "这部分内容基本属于游戏的静态内容数据，正式线上从数据库里拉取"

✅ **对于 Data Access Layer 来说，完全正确！**

但要注意：

- **Data Access Mock** = 静态配置数据（场景有哪些NPC）
- **Service Mock Data** = 动态生成文本（"你推开门..."）

两者都叫"mock"，但作用完全不同：

| | Data Access Mock | Service Mock Data |
|---|---|---|
| **是静态内容吗？** | ✅ 是 | ❌ 否 |
| **正式版从数据库拉取吗？** | ✅ 是 | ❌ 否（调用LLM） |
| **数据格式** | JSON对象 | 文本字符串 |

现在清楚了吗？😊
