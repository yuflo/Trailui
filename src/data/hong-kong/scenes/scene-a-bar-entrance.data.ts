/**
 * Scene A: Bar Entrance - Mock Data
 * 场景A：酒吧入口 - Mock数据
 * 
 * 演示场景：
 * - 地点："掘金者"酒吧入口
 * - NPC：肥棠（暴躁的黑帮成员）、小雪（害怕的酒保）
 * - 冲突：肥棠在威胁小雪交出"货物"
 * 
 * 演示功能：
 * - gen #3: LOAD_SCENE 加载场景叙事序列（3个事件单元）
 * - gen #4a: INTERACT turn_1, turn_2 玩家交互（多轮对话）
 * - gen #4b: INTERACT turn_3 强制收敛（达到max_turns）
 * - PASS: 剪枝分支（玩家选择路过）
 */

import type { AdvanceResponse } from '../../../types';

/**
 * LOAD_SCENE: 加载场景叙事序列（第一部分）
 * 
 * 玩家从"故事线"点击进来，首次进入场景
 * 返回2个事件单元（环境描述），然后触发自动播放
 * 
 * ✨ 演示PLAYING_NARRATIVE：分段叙事
 */
const LOAD_SCENE_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",  // ✨ 统一使用demo-story
  current_scene_id: "scene-a",  // ✨ 统一使用小写短ID
  
  new_events: [
    {
      unit_id: "U001",
      type: "Narrative",
      actor: "System",
      content: "你推开'掘金者'酒吧沉重的木门。腐坏的啤酒味和烟草味扑面而来。"
    },
    {
      unit_id: "U002",
      type: "Narrative",
      actor: "System",
      content: "昏暗的灯光下，一个壮硕的身影正压迫着吧台后的女孩。"
    }
  ],
  
  entity_updates: [],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null
  },
  
  next_action_type: {
    type: "PLAYING_NARRATIVE"  // ← 触发自动播放
  }
};

/**
 * INTERACT turn_1: 第一轮交互
 * 
 * 玩家选择"介入"，输入第一句话
 * 例如：玩家输入 "让我来处理"
 * 
 * 返回2个事件：
 * - T001_P: Player的交互（content由前端填充）
 * - T001_N: 肥棠的回应
 */
const INTERACT_TURN_1_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-a",
  
  new_events: [
    {
      unit_id: "T001_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充玩家输入
    },
    {
      unit_id: "T001_N",
      type: "InteractionTurn",
      actor: "肥棠",
      content: "（斜眼看你）\"哪来的多管闲事的？这是我们的私事，你最好别掺和。\""
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_FAT_TANG",
      composure: 90,
      status: "警觉"
    }
  ],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null,
    interaction_policy: {
      max_turns: 3,
      current_turn: 1
    }
  },
  
  next_action_type: {
    type: "AWAITING_INTERACTION"
  }
};

/**
 * INTERACT turn_2: 第二轮交互
 * 
 * 玩家继续对话
 * 例如：玩家输入 "别对女孩动粗"
 * 
 * 返回2个事件：
 * - T002_P: Player的交互
 * - T002_N: 肥棠的回应（开始发怒）
 */
const INTERACT_TURN_2_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-a",
  
  new_events: [
    {
      unit_id: "T002_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "T002_N",
      type: "InteractionTurn",
      actor: "肥棠",
      content: "（拍桌）\"动粗？我看你是想找死！这娘们偷了我三十万的货，我还没动粗呢！\""
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_FAT_TANG",
      composure: 70,
      status: "被激怒"
    }
  ],
  
  scene_status: {
    is_scene_over: false,
    next_scene_id: null,
    is_story_over: false,
    new_clue: null,
    interaction_policy: {
      max_turns: 3,
      current_turn: 2
    }
  },
  
  next_action_type: {
    type: "AWAITING_INTERACTION"
  }
};

/**
 * INTERACT turn_3: 第三轮交互（强制收敛）
 * 
 * 达到max_turns = 3，触发强制收敛
 * 
 * 返回4个事件：
 * - T003_P: Player的交互
 * - T003_N: 肥棠的回应（爆发）
 * - U004: Narrative（强制结束叙事）
 * - U005: Narrative（场景结束）
 */
const INTERACT_TURN_3_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-a",
  
  new_events: [
    {
      unit_id: "T003_P",
      type: "InteractionTurn",
      actor: "Player",
      content: ""  // 由前端填充
    },
    {
      unit_id: "T003_N",
      type: "InteractionTurn",
      actor: "肥棠",
      content: "\"够了！老子没时间跟你废话！\""
    },
    {
      unit_id: "U004",
      type: "Narrative",
      actor: "System",
      content: "（肥棠一挥手，两个壮汉从阴影中走出，架住了你的胳膊）"
    },
    {
      unit_id: "U005",
      type: "Narrative",
      actor: "System",
      content: "\"滚！下次再多管闲事，就不是把你扔出去这么简单了！\"（你被粗暴地推出酒吧，摔在湿滑的石板路上。）"
    }
  ],
  
  entity_updates: [
    {
      entity_id: "NPC_FAT_TANG",
      composure: 40,
      status: "暴怒"
    }
  ],
  
  scene_status: {
    is_scene_over: true,
    next_scene_id: "scene-b",  // ✨ 统一使用小写短ID
    is_story_over: false,
    new_clue: {
      clue_id: "CLUE_002_COURIER_ID",  // ✨ 关联到线索链
      title: "快递员工作证",
      summary: "姓名：阿伟。工号：SF-3247。照片显示一个年轻男人。工作证背面有酒保\"小雪\"的名字和电话号码。",
      status: "untracked",
      story_id: "demo-story"  // ✨ 统一使用demo-story
    },
    interaction_policy: {
      max_turns: 3,
      current_turn: 3
    }
  },
  
  next_action_type: {
    type: "SCENE_ENDED"
  }
};

/**
 * PASS: 玩家选择"路过"（剪枝）
 * 
 * 玩家在介入点选择了"路过"
 * 剪枝所有后续预定叙事，直接跳到场景结束
 * 
 * 返回2个事件：
 * - U010: Narrative（玩家离开）
 * - U011: Narrative（错失机会）
 */
const PASS_RESPONSE: AdvanceResponse = {
  story_id: "demo-story",
  current_scene_id: "scene-a",
  
  new_events: [
    {
      unit_id: "U010",
      type: "Narrative",
      actor: "System",
      content: "你默默地转身，假装没看到这一幕。酒吧的吵闹声逐渐远去。"
    },
    {
      unit_id: "U011",
      type: "Narrative",
      actor: "System",
      content: "（也许你错过了什么重要的线索，但至少你避开了麻烦。）"
    }
  ],
  
  entity_updates: [],
  
  scene_status: {
    is_scene_over: true,
    next_scene_id: "scene-b",  // ✨ 统一使用小写短ID
    is_story_over: false,
    new_clue: null,  // 路过不获得线索
    interaction_policy: undefined
  },
  
  next_action_type: {
    type: "SCENE_ENDED"
  }
};

/**
 * 场景A Mock数据注册表
 * 
 * 三层Key结构：
 * - 第一层：scene_id（由Service根据current_scene_id查找）
 * - 第二层：action_type（LOAD_SCENE, INTERACT, PASS）
 * - 第三层：turn（仅INTERACT有，turn_1, turn_2, turn_3）
 * 
 * 注意：
 * - REQUEST_NARRATIVE 已删除，叙事序列直接从 demo-story-map.data.ts 读取
 * - LOAD_SCENE 保留用于向后兼容，但 NearFieldManagerSimple 不使用
 */
export const sceneABarEntrance = {
  LOAD_SCENE: LOAD_SCENE_RESPONSE,
  
  INTERACT: {
    turn_1: INTERACT_TURN_1_RESPONSE,
    turn_2: INTERACT_TURN_2_RESPONSE,
    turn_3: INTERACT_TURN_3_RESPONSE,
    // 注意：没有default，因为max_turns=3，超出就强制结束
  },
  
  PASS: PASS_RESPONSE
};
