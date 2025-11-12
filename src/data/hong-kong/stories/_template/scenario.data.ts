/**
 * Scenario Data Template
 * 
 * 复制此文件作为你的场景数据起点
 * 按照结构填写每个回合的完整内容
 */

import type { ScenarioSequence } from '../../../../types';

/**
 * 场景数据序列
 * 
 * 这是故事的所有场景数据，每个元素代表一个回合
 * 引擎会按顺序加载这些场景
 */
export const scenarioData: ScenarioSequence = [
  // ==================== 场景 1 ====================
  {
    // ---------- 广播区域 ----------
    broadcast_area: {
      /** 
       * 环境频道 - 描述场景的环境音效和视觉
       * 类型: Sound（声音）, Sight（视觉）, Smell（气味）
       */
      ambient_channel: [
        { 
          type: "Sound", 
          content: "远处传来低沉的音乐声。" 
        },
        { 
          type: "Sight", 
          content: "霓虹灯在雨水中闪烁。" 
        }
      ],
      
      /** 
       * 警察扫描器 - 警方无线电消息
       */
      police_scanner: [
        { 
          location: "中环区域", 
          code: "10-50", 
          report: "收到噪音投诉..." 
        }
      ],
      
      /** 
       * 地下世界闲谈 - 街头传闻（可选）
       */
      underworld_chatter: [
        { 
          source: "Encrypted", 
          rumor: "听说有人在找货..." 
        }
      ],
      
      /** 
       * 社交媒体动态（可选）
       */
      social_feed: [
        { 
          user: "某个用户", 
          post: "今天的天气真好..." 
        }
      ],
      
      /** 
       * 私人频道 - 短信、电话等
       */
      personal_channel: [
        { 
          from: "联系人", 
          type: "SMS", 
          content: "你在哪？" 
        }
      ],
      
      /** 
       * 线索钩子 - 可追踪的故事线索
       */
      thread_hooks: [
        { 
          thread_id: "TH-001", 
          title: "神秘委托", 
          hook: "有人委托你调查一件事..." 
        }
      ]
    },
    
    // ---------- 动态视图 ----------
    dynamic_view: {
      /** 
       * 场景描述
       * 详细描述当前场景的环境、氛围
       */
      scene_setting: "你站在一条狭窄的后巷中，雨水顺着墙壁流淌。空气中弥漫着潮湿和油烟的气味。",
      
      /** 
       * 参与的NPC
       * 当前场景中出现的所有NPC
       */
      involved_entities: [
        { 
          id: "NPC-001", 
          name: "神秘人", 
          status_summary: "靠墙站立", 
          composure: "[心防: 稳定]", 
          rapport: { 
            sentiment: "中立", 
            intensity: 0 
          } 
        }
      ],
      
      /** 
       * 行为流
       * NPC的行为和反应
       */
      behavior_stream: [
        { 
          actor: "NPC-001", 
          name: "神秘人", 
          behavior_type: "Observe", 
          target: "player", 
          narrative_snippet: "他打量着你，没有说话。" 
        }
      ],
      
      /** 
       * 可用玩家行为
       * 玩家在这个回合可以选择的行为
       * 
       * 行为类型:
       * - Speak（对话）
       * - Observe（观察）
       * - Move（移动）
       * - Intimidate（威吓）
       * - Empathize（共情）
       * - Persuade（说服）
       */
      available_player_behaviors: [
        { 
          behavior_type: "Speak", 
          description: "[对话] 你是谁？" 
        },
        { 
          behavior_type: "Observe", 
          description: "[观察] 观察他的装束" 
        },
        { 
          behavior_type: "Move", 
          description: "[移动] 后退一步" 
        }
      ],
      
      /** 
       * 叙事线索
       * 当前激活的故事线索及其状态
       */
      narrative_threads: [
        { 
          id: "NT-001", 
          title: "初次相遇", 
          status: "你遇到了一个神秘的陌生人。" 
        }
      ],
      
      /** 
       * 系统叙事（可选）
       * 系统提示或洞见信息
       */
      system_narrative: "【洞见】: 这个人似乎在等待什么。"
    },
    
    // ---------- 玩家状态区域 ----------
    player_status_area: {
      /** 
       * 游戏世界时间
       * 格式: "HH:MM - 星期X, 天气"
       */
      world_time: "23:00 - 周一, 雨",
      
      /** 
       * 当前位置
       * 格式: "区域 / 地点 / 具体位置"
       */
      current_location: "中环 / 后巷",
      
      /** 
       * 体力值
       * value: 当前值, max: 最大值
       */
      vigor: { 
        value: 100, 
        max: 100 
      },
      
      /** 
       * 心力值
       * value: 当前值, max: 最大值
       */
      clarity: { 
        value: 100, 
        max: 100 
      },
      
      /** 
       * 财力等级
       * 可选值: '贫困', '温饱', '体面', '富裕', '豪富'
       */
      financial_power: "体面",
      
      /** 
       * 信用分
       */
      credit: { 
        value: 500 
      },
      
      /** 
       * 生效的状态效果
       * type: 'buff'（增益） 或 'debuff'（减益）
       */
      active_effects: [
        { 
          name: "示例效果", 
          description: "这是一个示例效果", 
          type: "buff" 
        }
      ]
    }
  },
  
  // ==================== 场景 2 ====================
  // 复制上面的结构，填写第二个场景
  // ...
  
  // ==================== 场景 3 ====================
  // ...
];
