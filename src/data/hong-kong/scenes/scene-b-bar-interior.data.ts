/**
 * Scene B: Bar Interior - Mock Data
 * 场景B：吧台内部 - Mock数据
 * 
 * 演示场景：
 * - 地点：酒吧吧台内部（从场景A衔接而来）
 * - NPC：小雪（惊魂未定的酒保）
 * - 情景：玩家回到酒吧，试图从小雪处了解真相
 * 
 * 演示功能：
 * - 场景衔接（从场景A的next_scene_id加载）
 * - gen #3b: 循环往复（turn_2中触发新叙事）
 * - default分支（超出定义轮数时的fallback）
 * - PASS导致故事结束（is_story_over: true）
 */

import type { AdvanceResponse } from '../../../types';

/**
 * LOAD_SCENE: 加载场景B叙事序列
 * 
 * 从场景A结束后自动加载（或玩家手动选择进入）
 * 返回3个事件单元：
 * - U020: System叙事（场景转换）
 * - U021: Narrative（小雪的状态）
 * - U022: InterventionPoint（介入点 - 尝试对话）
 */
const LOAD_SCENE_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",  // ✨ 统一使用demo-story
  current_scene_id: "scene-b",  // ✨ 统一使用小写短ID
  
  new_events: [
    {
      unit_id: "U020",
      type: "Narrative",
      actor: "System",
      content: "你重新走进酒吧。肥棠已经离开，吧台后的小雪正在颤抖着收拾杯子。"
    },
    {
      unit_id: "U021",
      type: "Narrative",
      actor: "System",
      content: "她看到你回来，眼中闪过一丝惊讶和恐惧。"
    },
    {
      unit_id: "U022",
      type: "InterventionPoint",
      actor: "小雪",
      content: "\"你……你怎么又回来了？他们会杀了我的……\"",
      hint: "[时机点] 她看起来非常害怕，但或许愿意说出真相。你可以试着安抚她，或者离开。",
      policy: {
        max_turns: 5,
        goal: "让小雪说出货物的真相",
        constraints: "小雪非常害怕，需要耐心和信任"
      }
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_XIAO_XUE",
      composure: 30,
      status: "惊恐"
    }
  ],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null,
    interaction_policy: {
      max_turns: 5,
      current_turn: 0
    }
  },
  
  next_action_type: {
    type: "AWAITING_INTERVENTION"
  }
};

/**
 * INTERACT turn_1: 第一轮交互
 * 
 * 玩家选择"介入"，开始与小雪对话
 * 例如：玩家输入 "别怕，我不会伤害你"
 */
const INTERACT_TURN_1_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-b",
  
  new_events: [
    {
      unit_id: "T020_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "T020_N",
      type: "InteractionTurn",
      actor: "小雪",
      content: "（低着头）\"你不明白……他们不是普通的混混……\""
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_XIAO_XUE",
      composure: 35,
      status: "警惕"
    }
  ],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null,
    interaction_policy: {
      max_turns: 5,
      current_turn: 1
    }
  },
  
  next_action_type: {
    type: "AWAITING_INTERACTION"
  }
};

/**
 * INTERACT turn_2: 第二轮交互（演示gen #3b：循环往复）
 * 
 * 在交互过程中，触发新的叙事事件
 * 这演示了"交互中插入叙事"的功能
 * 
 * 返回3个事件：
 * - T021_P: Player的交互
 * - U023: Narrative（系统叙事 - 情绪变化）
 * - T021_N: 小雪的回应
 */
const INTERACT_TURN_2_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-b",
  
  new_events: [
    {
      unit_id: "T021_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "U023",
      type: "Narrative",
      actor: "System",
      content: "（听到你的话，她的肩膀开始颤抖，眼眶泛红）"
    },
    {
      unit_id: "T021_N",
      type: "InteractionTurn",
      actor: "小雪",
      content: "\"我……我没有偷什么货……那是……那是我男朋友留下的……他说会回来取……可他再也没回来过……\""
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_XIAO_XUE",
      composure: 25,
      status: "哭泣"
    }
  ],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null,
    interaction_policy: {
      max_turns: 5,
      current_turn: 2
    }
  },
  
  next_action_type: {
    type: "AWAITING_INTERACTION"
  }
};

/**
 * INTERACT turn_3: 第三轮交互
 * 
 * 玩家继续深入询问
 * 
 * ✨ 演示PLAYING_NARRATIVE：交互后自动播放环境叙事
 */
const INTERACT_TURN_3_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-b",
  
  new_events: [
    {
      unit_id: "T022_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "T022_N",
      type: "InteractionTurn",
      actor: "小雪",
      content: "\"那些东西……藏在地下室……我不敢碰……如果你能帮我……我可以告诉你位置……\""
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_XIAO_XUE",
      composure: 40,
      status: "信任"
    }
  ],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null,
    interaction_policy: {
      max_turns: 5,
      current_turn: 3
    }
  },
  
  next_action_type: {
    type: "PLAYING_NARRATIVE"  // ← 触发环境叙事
  }
};

/**
 * INTERACT turn_4: 第四轮交互
 * 
 * 小雪开始透露关键信息
 */
const INTERACT_TURN_4_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-b",
  
  new_events: [
    {
      unit_id: "T023_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "T023_N",
      type: "InteractionTurn",
      actor: "小雪",
      content: "\"我男朋友叫阿伟……他原本在肥棠手下做事……后来他说要退出……但他们不会放过他的……\""
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_XIAO_XUE",
      composure: 50,
      status: "敞开心扉"
    }
  ],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null,
    interaction_policy: {
      max_turns: 5,
      current_turn: 4
    }
  },
  
  next_action_type: {
    type: "AWAITING_INTERACTION"
  }
};

/**
 * INTERACT turn_5: 第五轮交互（强制收敛）
 * 
 * 达到max_turns = 5，触发强制收敛
 * 小雪给出关键线索，场景结束
 */
const INTERACT_TURN_5_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-b",
  
  new_events: [
    {
      unit_id: "T024_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "T024_N",
      type: "InteractionTurn",
      actor: "小雪",
      content: "\"等等……我这里有张照片……这是阿伟留下的……也许对你有用……\""
    },
    {
      unit_id: "U024",
      type: "Narrative",
      actor: "System",
      content: "（她从吧台下拿出一张照片，上面是一个年轻男人和几个黑帮成员的合影。）"
    },
    {
      unit_id: "U025",
      type: "Narrative",
      actor: "System",
      content: "\"谢谢你……真的……\"（她的眼神中终于有了一丝希望。）"
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_XIAO_XUE",
      composure: 60,
      status: "感激"
    }
  ],
  
  scene_status: {
    is_scene_over: true,
    next_scene_id: null,  // 没有下一个场景
    is_story_over: true,  // 故事结束
    new_clue: {
      clue_id: "CLUE_003_BAR_SURVEILLANCE",  // ✨ 关联到线索链
      title: "监控录像片段",
      summary: "监控显示：三天前晚上11点，阿伟和小雪在酒吧后门见面。他们交接了一个黑色手提箱。随后肥棠带人出现，阿伟逃跑。",
      status: "untracked",
      story_id: "demo-story"  // ✨ 统一使用demo-story
    },
    interaction_policy: {
      max_turns: 5,
      current_turn: 5
    }
  },
  
  next_action_type: {
    type: "SCENE_ENDED"
  }
};

/**
 * INTERACT default: 超出定义轮数的fallback
 * 
 * 如果玩家输入超过turn_5（理论上不会发生，因为turn_5已经is_scene_over）
 * 但作为防御性编程，提供一个default响应
 */
const INTERACT_DEFAULT_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-b",
  
  new_events: [
    {
      unit_id: "T025_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "T025_N",
      type: "InteractionTurn",
      actor: "小雪",
      content: "\"我……我已经告诉你所有我知道的了……请你帮帮我……\""
    },
    {
      unit_id: "U026",
      type: "Narrative",
      actor: "System",
      content: "（她看起来已经筋疲力尽，无法再提供更多信息。）"
    }
  ],
  
  entity_updates: [],
  
  scene_status: {
    is_scene_over: true,
    next_scene_id: null,
    is_story_over: true,
    new_clue: null,
    interaction_policy: {
      max_turns: 5,
      current_turn: 6  // 超出定义
    }
  },
  
  next_action_type: {
    type: "SCENE_ENDED"
  }
};

/**
 * PASS: 玩家选择"路过"（剪枝 + 故事结束）
 * 
 * 玩家在介入点选择了"路过"
 * 直接导致故事结束，错失所有线索
 */
const PASS_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-b",
  
  new_events: [
    {
      unit_id: "U030",
      type: "Narrative",
      actor: "System",
      content: "你摇摇头，转身离开。小雪的眼神中闪过一丝失望。"
    },
    {
      unit_id: "U031",
      type: "Narrative",
      actor: "System",
      content: "（也许你永远不会知道那\"三十万的货\"背后的真相了。）"
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_XIAO_XUE",
      composure: 20,
      status: "绝望"
    }
  ],
  
  scene_status: {
    is_scene_over: true,
    next_scene_id: null,
    is_story_over: true,  // PASS导致故事直接结束
    new_clue: {
      clue_id: "CLUE_003_C",
      title: "错失的机会",
      summary: "你选择了离开，小雪的秘密永远留在了那个昏暗的酒吧里。",
      status: "untracked",
      story_id: "demo-story"  // ✨ 统一使用demo-story
    },
    interaction_policy: undefined
  },
  
  next_action_type: {
    type: "SCENE_ENDED"
  }
};

/**
 * 场景B Mock数据注册表
 * 
 * 三层Key结构：
 * - 第一层：scene_id（由Service根据current_scene_id查找）
 * - 第二层：action_type（LOAD_SCENE, INTERACT, PASS）
 * - 第三层：turn（INTERACT有turn_1至turn_5，以及default）
 * 
 * 注意：
 * - REQUEST_NARRATIVE 已删除，叙事序列直接从 demo-story-map.data.ts 读取
 * - LOAD_SCENE 保留用于向后兼容，但 NearFieldManagerSimple 不使用
 */
export const sceneBBarInterior = {
  LOAD_SCENE: LOAD_SCENE_RESPONSE,
  
  INTERACT: {
    turn_1: INTERACT_TURN_1_RESPONSE,
    turn_2: INTERACT_TURN_2_RESPONSE,  // ← 演示gen #3b：交互中插入叙事
    turn_3: INTERACT_TURN_3_RESPONSE,  // ✨ 返回PLAYING_NARRATIVE
    turn_4: INTERACT_TURN_4_RESPONSE,
    turn_5: INTERACT_TURN_5_RESPONSE,  // ← 强制收敛，is_story_over: true
    default: INTERACT_DEFAULT_RESPONSE  // ← fallback分支
  },
  
  PASS: PASS_RESPONSE  // ← PASS导致is_story_over: true
};
