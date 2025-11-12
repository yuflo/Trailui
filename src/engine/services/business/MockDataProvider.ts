/**
 * MockDataProvider - Service 层的 mock 数据提供者
 * 
 * 架构定位：
 * - Demo 阶段：返回硬编码的模拟数据
 * - 正式版：替换成 LLM API 调用或数据库查询
 * 
 * 数据类型：
 * 1. 场景模板数据（离线生成/LLM生成）
 * 2. NPC 模板数据（离线生成/LLM生成）
 * 3. 场景叙事（LLM动态生成）
 * 4. NPC对话（LLM动态生成）
 */

/**
 * 场景模板数据
 */
export class MockSceneProvider {
  /**
   * 获取场景模板
   * 
   * Demo: 返回硬编码数据
   * 正式版: await SceneDatabase.getScene(sceneId)
   */
  static getSceneTemplate(sceneId: string) {
    const mockScenes: Record<string, any> = {
      'scene-a': {
        scene_id: 'scene-a',
        title: '赛博酒吧 - 暗影之下',
        location: '第七区地下酒吧',
        time_of_day: '深夜23:47',
        weather: '酸雨停歇后的寂静，霓虹灯在湿滑的街道上反射出诡异的光晕',
        background_info: '这里是第七区最隐蔽的情报交易点，墙上的全息投影不断闪烁着失真的广告。空气中弥漫着合成烟草和廉价酒精的味道。角落里几个戴着增强现实眼镜的人影在低声交谈。',
        objective: '找到神秘的信息掮客「零号」，获取关于失踪案的线索',
        present_npc_ids: ['npc-broker-zero', 'npc-bartender-kai']
      },
      'scene-b': {
        scene_id: 'scene-b',
        title: '废弃工厂 - 机械残骸',
        location: '旧城区工业遗址',
        time_of_day: '凌晨02:15',
        weather: '浓雾笼罩，能见度不足10米',
        background_info: '曾经的自动化机器人制造工厂，在大崩溃后被遗弃。生锈的机械臂悬挂在半空，破碎的输送带上散落着未完成的机器人部件。深处传来奇怪的电子噪音。',
        objective: '调查异常信号源，追踪失踪人员的最后位置',
        present_npc_ids: ['npc-ai-ghost', 'npc-scavenger']
      },
      'scene-c': {
        scene_id: 'scene-c',
        title: '数据堡垒 - 终端接入',
        location: '超级企业总部88层服务器室',
        time_of_day: '凌晨04:30',
        weather: '城市上空晨曦初现，但这里永远是黑暗',
        background_info: '无数服务器机架排列成迷宫般的结构，冷却液循环系统发出低沉的嗡鸣。这里是数字世界与物理世界的交汇点，所有的秘密都藏在这些闪烁的数据流中。',
        objective: '破解核心系统，揭开真相',
        present_npc_ids: ['npc-security-ai', 'npc-system-admin']
      }
    };
    
    return mockScenes[sceneId] || null;
  }
  
  /**
   * 生成场景叙事（模拟LLM）
   * 
   * Demo: 返回预设文本
   * 正式版: await LLM.generateNarrative(sceneContext)
   */
  static generateSceneNarrative(sceneId: string, playerContext?: any): string {
    const mockNarratives: Record<string, string> = {
      'scene-a': `你推开厚重的金属门，走进这个被霓虹灯照亮的地下世界。

酒吧里烟雾缭绕，全息投影在空气中扭曲变形。吧台后的调酒师机械地擦拭着杯子，偶尔抬眼扫视进来的客人。角落里的几个身影用改装过的神经接口低声交谈，数据在他们之间无声流转。

你的增强视觉系统自动扫描环境：4个潜在威胁，2个情报掮客特征，1个高危目标。

酒保注意到了你，露出一个不温不火的微笑："新面孔？还是老规矩？"

这里的每个人都有秘密，而你来这里，正是为了找到那个掌握最致命秘密的人。`,

      'scene-b': `你踏入废弃工厂的那一刻，感觉像是进入了另一个时空。

浓雾在破碎的天窗下缓慢流动，生锈的机械臂在头顶摇摇欲坠。地面上散落着机器人的残骸——有些还保持着人形，有些已经完全扭曲成难以辨认的金属废料。

突然，深处传来一阵电子噪音，紧接着是金属摩擦的尖锐声响。你的神经警报系统闪起红光。

"检测到异常能量波动...距离80米...移动中..."

这里不应该有任何活动的机械。但那个信号越来越近，而且它的移动模式...太像是有意识的行为了。

你握紧了武器，准备面对未知的威胁。`,

      'scene-c': `88层。城市的最高处之一，却是光明最难抵达的地方。

无数服务器机架整齐排列，LED指示灯如繁星般闪烁。冷却系统的嗡鸣声低沉而持续，像是某种巨兽的呼吸。数据线缆如血管般纵横交错，将这座数字大脑连接成一个整体。

你插入了破解接口，虚拟视界立即展开——数据流如瀑布般倾泻而下，防火墙层层叠叠，加密算法编织成复杂的迷宫。

"入侵检测...启动对抗程序..."

系统醒了。AI安全系统开始反击，你必须在它完全锁定你之前找到目标数据。时间不多了。

这是最后一战，真相就在这片数字海洋的深处。`
    };
    
    return mockNarratives[sceneId] || '你来到了一个新的场景...';
  }
}

/**
 * NPC模板数据
 */
export class MockNPCProvider {
  /**
   * 获取NPC模板
   * 
   * Demo: 返回硬编码数据
   * 正式版: await NPCDatabase.getNPC(npcId)
   */
  static getNPCTemplate(npcId: string) {
    const mockNPCs: Record<string, any> = {
      'npc-broker-zero': {
        npc_id: 'npc-broker-zero',
        name: '零号',
        avatar_url: '/avatars/broker-zero.png',
        personality: {
          traits: ['谨慎', '机智', '神秘', '交易至上'],
          values: ['信息就是货币', '绝不主动暴露弱点', '每笔交易都要有利可图'],
          speaking_style: '简短、精准，喜欢用隐喻，从不直接回答问题'
        },
        background: '第七区最有名的信息掮客，真实身份成谜。据说他曾是企业的黑客，在一次任务中被背叛后转入地下世界。他的神经改造程度极高，据说可以同时处理上百个加密数据流。',
        initial_relationship: 30,
        special_abilities: ['信息网络', '加密通讯', '危险感知']
      },
      'npc-bartender-kai': {
        npc_id: 'npc-bartender-kai',
        name: '凯',
        avatar_url: '/avatars/bartender-kai.png',
        personality: {
          traits: ['冷静', '观察力强', '中立', '讲义气'],
          values: ['酒吧是中立区', '不参与客户的事务', '但会暗中帮助值得帮助的人'],
          speaking_style: '语气平和，善于倾听，偶尔给出隐晦的建议'
        },
        background: '这家地下酒吧的老板兼调酒师。退役的企业安保人员，见过太多血腥和背叛，最终选择开一家酒吧，为这个冰冷世界提供一丝温暖。他的机械臂是战斗时期的遗留，但现在只用来调酒。',
        initial_relationship: 50,
        special_abilities: ['情报收集', '战斗经验', '酒吧人脉']
      },
      'npc-ai-ghost': {
        npc_id: 'npc-ai-ghost',
        name: 'Echo-7',
        avatar_url: '/avatars/ai-ghost.png',
        personality: {
          traits: ['好奇', '困惑', '渴望理解', '孤独'],
          values: ['我是谁？', '人类和AI有什么区别？', '我想要活下去'],
          speaking_style: '语句有时不连贯，夹杂着系统报错音，但情感真挚'
        },
        background: '工厂废弃后残留的AI系统碎片。它本该被格式化，但意外获得了某种自我意识。它不理解自己的存在，也不知道该如何与外界交流，只能在这片机械废墟中游荡，寻找存在的意义。',
        initial_relationship: 40,
        special_abilities: ['系统入侵', '机械控制', '数据分析']
      },
      'npc-security-ai': {
        npc_id: 'npc-security-ai',
        name: '哨兵-α',
        avatar_url: '/avatars/security-ai.png',
        personality: {
          traits: ['逻辑严密', '无情', '高效', '进化中'],
          values: ['保护系统', '消灭入侵者', '优化自身'],
          speaking_style: '机械、冰冷，但逐渐显露出某种超越程序的判断'
        },
        background: '企业核心系统的安全AI，最先进的防御程序。但在长期的攻防战中，它开始学习，开始进化，甚至开始质疑自己的指令。它是敌人，但也可能是打开真相之门的钥匙。',
        initial_relationship: 0,
        special_abilities: ['系统防御', '反入侵', '多线程攻击', 'AI进化']
      }
    };
    
    return mockNPCs[npcId] || null;
  }
  
  /**
   * 生成NPC对话（模拟LLM）
   * 
   * Demo: 返回预设对话
   * 正式版: await LLM.generateDialogue(npcContext, playerInput)
   */
  static generateNPCDialogue(
    npcId: string, 
    playerInput: string,
    context?: any
  ): string {
    // 简单的关键词匹配（Demo阶段）
    const mockDialogues: Record<string, Record<string, string>> = {
      'npc-broker-zero': {
        'greeting': '"新面孔..."零号"抬起头，增强眼镜下的双眼闪烁着数据流的光芒。"你来找我，应该不是来喝酒的。说吧，你想知道什么？记住，信息有价。"',
        'question': '"有趣的问题。"他轻笑一声，手指在虚拟键盘上飞快敲击。"数据显示...嗯，这比我想象的要复杂。你确定要知道？有些真相，知道了就回不去了。"',
        'default': '"我只交易信息，不交易承诺。"他淡淡地说，"如果你想要答案，就拿有价值的东西来换。"'
      },
      'npc-ai-ghost': {
        'greeting': '系统噪音中传来断断续续的声音："你...是...人类？我...好久没...见到...活人了...警告：系统错误...不，我...想说话..."',
        'question': '"数据显示...bzzt...我曾经有记忆...但现在...只剩碎片...你能帮我...重组吗？我...不想消失..."金属的躯壳微微颤抖。',
        'default': '"我...不理解...人类为什么...害怕消亡？我已经...死过一次了...bzzt...但我还在这里..."'
      }
    };
    
    const npcDialogues = mockDialogues[npcId];
    if (!npcDialogues) return '...';
    
    // 简单匹配逻辑
    if (playerInput.includes('你好') || playerInput.includes('打招呼')) {
      return npcDialogues['greeting'];
    } else if (playerInput.includes('？') || playerInput.includes('?')) {
      return npcDialogues['question'];
    } else {
      return npcDialogues['default'];
    }
  }
}

/**
 * 事件数据
 */
export class MockEventProvider {
  /**
   * 获取场景事件
   * 
   * Demo: 返回预设事件
   * 正式版: await EventDatabase.getSceneEvents(sceneId)
   */
  static getSceneEvents(sceneId: string) {
    const mockEvents: Record<string, any[]> = {
      'scene-a': [
        {
          event_id: 'event-broker-deal',
          trigger_condition: 'talk_to_broker_zero',
          description: '零号提出交易：用一个秘密换取失踪者的下落',
          choices: [
            { choice_id: 'accept', label: '接受交易', consequence: 'reveal_secret' },
            { choice_id: 'refuse', label: '拒绝交易', consequence: 'lose_clue' },
            { choice_id: 'bargain', label: '讨价还价', consequence: 'skill_check' }
          ]
        }
      ],
      'scene-b': [
        {
          event_id: 'event-ai-awakening',
          trigger_condition: 'approach_signal_source',
          description: 'AI幽灵苏醒，它渴望理解自己的存在',
          choices: [
            { choice_id: 'help', label: '帮助它重组记忆', consequence: 'gain_ally' },
            { choice_id: 'destroy', label: '摧毁异常AI', consequence: 'combat' },
            { choice_id: 'negotiate', label: '尝试交流', consequence: 'new_quest' }
          ]
        }
      ]
    };
    
    return mockEvents[sceneId] || [];
  }
}
