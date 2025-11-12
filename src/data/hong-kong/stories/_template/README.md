# 故事创建指南

欢迎来到 Dreamheart 引擎故事创建指南！本文档将指导你如何创建一个新的故事实例。

## 📁 文件结构

每个故事文件夹包含以下文件：

```
your-story-name/
├── story.config.ts      # 故事配置（元数据 + 视觉风格）
├── scenario.data.ts     # 场景数据（所有回合的内容）
└── index.ts             # 导出文件
```

## 🎯 创建步骤

### 步骤 1: 复制模板文件夹

将 `_template/` 文件夹复制并重命名为你的故事ID（使用 kebab-case）：

```bash
cp -r _template/ my-cool-story/
```

### 步骤 2: 配置故事元数据

编辑 `story.config.ts`，填写故事的基本信息：

```typescript
export const storyConfig: StoryConfig = {
  id: 'my-cool-story',           // 与文件夹名称一致
  title: '我的酷故事',            // 故事标题
  description: '这是一个很酷的故事...', // 简短描述
  tags: ['动作', '悬疑'],         // 标签
  icon: '🎯',                     // 图标 emoji
  
  // 选择视觉原型（见下文）
  visualArchetype: 'action-intense',
  
  // 可选：微调视觉参数
  visualOverrides: {
    accentColor: '#ff0000',     // 自定义强调色
    scanlineSpeed: '2s',         // 扫描线速度
  },
  
  scenarioCount: 3,  // 场景数量
};
```

### 步骤 3: 选择视觉原型

从 10 个预设原型中选择最适合你故事的风格：

#### 🏙️ 城市动作线

- **`tense-urban`** - 紧张城市：后巷、追逐、对峙
  - 快速扫描线、蓝色霓虹、中等强度
  
- **`action-intense`** - 激烈动作：赛车、枪战、爆炸
  - 极快扫描线、橙色霓虹、高强度
  
- **`neon-carnival`** - 霓虹狂欢：夜店、派对、混乱
  - 超快扫描线、粉色霓虹、最高强度

#### 💼 社会商业线

- **`corporate-cold`** - 冷酷财团：交易、谈判、办公室
  - 慢速扫描线、黄色调、低强度
  
- **`tech-startup`** - 科技创业：实验室、创业公司、科技展
  - 中速扫描线、青色霓虹、中低强度
  
- **`daily-cozy`** - 日常温馨：咖啡馆、家庭、日常对话
  - 极慢扫描线、暖橙色、最低强度

#### 🎭 文化艺术线

- **`artistic-flow`** - 艺术律动：画廊、音乐厅、创作空间
  - 中慢扫描线、紫色调、中等强度
  
- **`contemplative`** - 沉思哲学：图书馆、寺庙、深度对话
  - 极慢扫描线、淡蓝色、极低强度

#### 🌙 情感暗流线

- **`noir-mystery`** - 黑色悬疑：调查、推理、阴谋
  - 慢速扫描线、深紫色、低强度
  
- **`sensual-haze`** - 情欲迷雾：私密空间、欲望、诱惑
  - 慢速扫描线、粉红色、中低强度

### 步骤 4: 编写场景数据

编辑 `scenario.data.ts`，按照数据结构填写每个回合的内容：

```typescript
export const scenarioData: ScenarioSequence = [
  // 场景 1
  {
    broadcast_area: {
      ambient_channel: [
        { type: "Sound", content: "描述环境声音..." }
      ],
      police_scanner: [],
      personal_channel: [],
      thread_hooks: [],
    },
    dynamic_view: {
      scene_setting: "描述场景...",
      involved_entities: [
        {
          id: "NPC-001",
          name: "NPC名字",
          status_summary: "状态描述",
          composure: "[心防: 稳定]",
          rapport: { sentiment: "中立", intensity: 0 }
        }
      ],
      behavior_stream: [],
      available_player_behaviors: [
        { behavior_type: "Speak", description: "[对话] 选项..." }
      ],
      narrative_threads: [],
    },
    player_status_area: {
      world_time: "23:00 - 周一, 晴",
      current_location: "地点",
      vigor: { value: 100, max: 100 },
      clarity: { value: 100, max: 100 },
      financial_power: "体面",
      credit: { value: 500 },
      active_effects: [],
    }
  },
  
  // 场景 2, 3, ...
];
```

### 步骤 5: 注册故事

在 `/data/hong-kong/stories/index.ts` 中注册你的故事：

```typescript
import myStory from './my-cool-story';

export const hongKongStories = {
  // ... 其他故事
  'my-cool-story': myStory,
};
```

## ✅ 验证清单

在完成故事创建后，请检查：

- [ ] 故事ID与文件夹名称一致
- [ ] `story.config.ts` 中的 `scenarioCount` 与实际场景数量一致
- [ ] 所有场景数据结构完整（包含必需字段）
- [ ] 已选择合适的视觉原型
- [ ] 已在 `index.ts` 中注册故事
- [ ] TypeScript 编译无错误

## 📚 数据结构参考

### 必需字段说明

#### BroadcastArea（广播区域）
- `ambient_channel`: 环境频道消息（声音、视觉、气味）
- `police_scanner`: 警察扫描器消息
- `personal_channel`: 私人频道消息（短信、电话）
- `thread_hooks`: 线索钩子

#### DynamicView（动态视图）
- `scene_setting`: 场景描述文本
- `involved_entities`: 参与的NPC列表
- `behavior_stream`: 行为流（NPC的行为）
- `available_player_behaviors`: 玩家可选行为
- `narrative_threads`: 叙事线索

#### PlayerStatusArea（玩家状态）
- `world_time`: 游戏时间
- `current_location`: 当前位置
- `vigor`: 体力值
- `clarity`: 心力值
- `financial_power`: 财力等级
- `credit`: 信用分
- `active_effects`: 生效的状态效果

## 🎨 视觉微调参数

如果默认原型不够用，可以使用 `visualOverrides` 进行微调：

```typescript
visualOverrides: {
  accentColor: '#ff0000',      // 强调色（CSS颜色值）
  scanlineSpeed: '2s',          // 扫描线速度（CSS时间值）
  comicIntensity: 0.8,          // 漫画强度 0-1
  glitchEffect: true,           // 启用故障效果
  saturation: '120%',           // 饱和度
}
```

## 🐛 常见问题

**Q: 场景数量可以是任意的吗？**  
A: 是的，可以是1个或更多场景。建议3-5个场景以保持节奏。

**Q: 是否必须使用视觉原型？**  
A: 是的，必须选择一个原型。你可以通过 `visualOverrides` 进行微调。

**Q: NPC的ID格式有要求吗？**  
A: 建议使用 `NPC-001`, `NPC-002` 等格式，保持一致性。

**Q: 如何测试我的故事？**  
A: 在应用中通过故事选择器选择你的故事即可。

## 💡 创作建议

1. **场景节奏**：建议每个场景有明确的冲突或转折
2. **NPC关系**：合理设计关系值变化，增强互动感
3. **数值变化**：体力/心力的变化要与叙事相符
4. **线索设计**：使用 `narrative_threads` 串联故事
5. **视觉匹配**：选择与故事氛围匹配的视觉原型

## 🚀 开始创作

现在你已经了解了如何创建故事，开始创作你的第一个故事吧！

如有疑问，请参考 `tense-alley/` 示例故事。
