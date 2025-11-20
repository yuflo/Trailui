/**
 * Broadcast Messages Data - Hong Kong
 * 
 * 香港世界广播消息数据（远场探索）
 * 用于世界信息流的随机展示，符合远场探索API规范
 * 
 * ✅ GTA标准4种类型：
 * - ALERT (警报) - 红色 #fb2c36→#e7000b - 警方通报、网络安全警告
 * - RUMOR (传闻) - 紫色 #8b5cf6 - 地下传闻、街头消息、新闻报道
 * - SOCIAL (社交) - 青色 #06b6d4 - 私人消息、个人通知、环境氛围、娱乐信息
 * - TRADE (交易) - 黄色 #fbbf24 - 黑市交易、商业信息
 */

import type { BroadcastMessageData } from '../../../types';

/**
 * 生成当前时间的时间戳字符串
 * @returns 格式化的时间戳（如 "23:41"）
 */
function getCurrentTimestamp(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 生成随机时间戳（过去1小时内）
 * @returns 格式化的时间戳
 */
function getRandomRecentTimestamp(): string {
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 60); // 0-59分钟前
  now.setMinutes(now.getMinutes() - minutesAgo);
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 香港世界广播消息池（50条）
 * 
 * 这些消息符合远场探索API规范，包含完整的结构
 * 部分消息关联线索（extractable_clue_id），可引导玩家发现故事
 * 
 * ✅ 颜色系统：组件自动根据category配置GTA标准颜色，无需手动指定
 * @note Mock数据 - Demo阶段使用，上线后从后端API获取
 */
export const broadcastMessages: BroadcastMessageData[] = [
  // ==================== 可提取线索的消息（关键消息）====================
  { 
    message_id: "MSG_001",
    category: "RUMOR", 
    timestamp: "23:41",
    text: "听说有个快递员失踪了，包裹三天没送到，收件人很着急。",
    extractable_clue_id: "CLUE_001_UNDELIVERED_PACKAGE" // ✨ 入口线索（但玩家已有，所以不会重复提取）
  },
  
  { 
    message_id: "MSG_002",
    category: "RUMOR", 
    timestamp: "23:38",
    text: "尖沙咀最近不太平，\"斧头帮\"和\"红星社\"似乎因为货物起了冲突。",
    extractable_clue_id: "CLUE_004_GANG_RUMOR" // ✨ 背景线索
  },
  
  { 
    message_id: "MSG_003",
    category: "TRADE", 
    timestamp: "23:35",
    text: "[暗网] 有人悬赏寻找一批价值三十万的\"特殊货物\"，知道消息的请联系。",
    extractable_clue_id: "CLUE_005_MISSING_CARGO" // ✨ 背景线索
  },
  
  // ==================== 氛围消息（不可提取线索）====================
  
  // === SOCIAL (社交) - 青色 ===
  { 
    message_id: "MSG_004",
    category: "SOCIAL", 
    timestamp: "23:39",
    text: "[气象] 空气中弥漫着霓虹灯的嗡鸣声和食物的香气。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_005",
    category: "SOCIAL", 
    timestamp: "23:33",
    text: "来自 [K]: 你上次要的货到了。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_006",
    category: "SOCIAL", 
    timestamp: "23:30",
    text: "来自 [阿兰]: 明天记得来找我，有事商量。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_007",
    category: "SOCIAL", 
    timestamp: "23:27",
    text: "来自 [老赵]: 上次的事情处理得不错，下次再合作。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_008",
    category: "SOCIAL", 
    timestamp: "23:25",
    text: "来自 [小雪]: 棠哥今晚不在店里，有什么事吗？",
    extractable_clue_id: null
  },
  
  // === RUMOR (传闻) - 紫色 - 新闻报道 ===
  { 
    message_id: "MSG_009",
    category: "RUMOR", 
    timestamp: "23:22",
    text: "[某个财团] 股价今日小幅下跌...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_010",
    category: "RUMOR", 
    timestamp: "23:20",
    text: "[TVB] 今晚有台风警报，市民请做好防护措施。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_011",
    category: "RUMOR", 
    timestamp: "23:18",
    text: "[财经快讯] 恒生指数收盘跌破关键支撑位...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_012",
    category: "RUMOR", 
    timestamp: "23:15",
    text: "[科技新闻] 新型义体植入技术获批临床试验。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_013",
    category: "RUMOR", 
    timestamp: "23:12",
    text: "[娱乐八卦] 某明星深夜现身兰桂坊，疑似醉酒...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_014",
    category: "RUMOR", 
    timestamp: "23:10",
    text: "[社会新闻] 中环写字楼发生跳楼事件，警方介入调查。",
    extractable_clue_id: null
  },
  
  // === ALERT (警报) - 红色 - 警方频道 ===
  { 
    message_id: "MSG_015",
    category: "ALERT", 
    timestamp: "23:08",
    text: "[警方] 代号 187... 目标进入兰桂坊区域...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_016",
    category: "ALERT", 
    timestamp: "23:05",
    text: "[警方] 10-50 收到噪音投诉，巡逻单位前往现场。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_017",
    category: "ALERT", 
    timestamp: "23:02",
    text: "[警方] 10-31 码头区域发现可疑人员，请求支援。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_018",
    category: "ALERT", 
    timestamp: "23:00",
    text: "[警方] 10-16 尖沙咀区域有车辆追逐，请附近单位注意。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_019",
    category: "ALERT", 
    timestamp: "22:58",
    text: "[警方] Code 3 油麻地发生冲突，反黑组已出动。",
    extractable_clue_id: null
  },
  
  // === RUMOR (传闻) - 紫色 - 地下传闻 ===
  { 
    message_id: "MSG_020",
    category: "RUMOR", 
    timestamp: "22:55",
    text: "听说昨晚在码头有人搞事，条子去了。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_021",
    category: "RUMOR", 
    timestamp: "22:52",
    text: "老鼠在找一批新货，价格很不错。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_022",
    category: "RUMOR", 
    timestamp: "22:50",
    text: "九龙城那边最近不太平，最好别去。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_023",
    category: "RUMOR", 
    timestamp: "22:48",
    text: "有人在地下拳场输了大钱，现在到处借。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_024",
    category: "RUMOR", 
    timestamp: "22:45",
    text: "听说商人最近在收购改装零件，有路子的话赚一笔。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_025",
    category: "RUMOR", 
    timestamp: "22:42",
    text: "深水埗有个新黑市开张了，东西齐全但规矩多。",
    extractable_clue_id: null
  },
  
  // === SOCIAL (社交) - 青色 - 个人频道 ===
  { 
    message_id: "MSG_026",
    category: "SOCIAL", 
    timestamp: "22:40",
    text: "[数据包] 你的义体植入预约已确认，明天下午2点。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_027",
    category: "SOCIAL", 
    timestamp: "22:38",
    text: "[银行] 您的账户余额不足，请及时充值��",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_028",
    category: "SOCIAL", 
    timestamp: "22:35",
    text: "[任务提醒] 老地方见面的时间快到了。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_029",
    category: "SOCIAL", 
    timestamp: "22:32",
    text: "[健康警报] 检测到心率异常，建议休息。",
    extractable_clue_id: null
  },
  
  // === TRADE (交易) - 黄色 ===
  { 
    message_id: "MSG_030",
    category: "TRADE", 
    timestamp: "22:30",
    text: "[黑市] 军用级光学迷彩模块热卖中，数量有限。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_031",
    category: "TRADE", 
    timestamp: "22:28",
    text: "[黑市] 收购各类芯片和数据模块，价格公道。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_032",
    category: "TRADE", 
    timestamp: "22:25",
    text: "[暗网] 有人出售机密文件，价格面议。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_033",
    category: "TRADE", 
    timestamp: "22:22",
    text: "[拍卖] 罕见的古董赛博义肢今晚8点开拍。",
    extractable_clue_id: null
  },
  
  // === SOCIAL (社交) - 青色 - 环境氛围 ===
  { 
    message_id: "MSG_034",
    category: "SOCIAL", 
    timestamp: "22:20",
    text: "[气象] 雨势渐大，街道开始积水...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_035",
    category: "SOCIAL", 
    timestamp: "22:18",
    text: "[气象] 霓虹灯在雨中闪烁，反射着五光十色的光芒。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_036",
    category: "SOCIAL", 
    timestamp: "22:15",
    text: "[气象] 夜幕降临，城市的另一面开始苏醒...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_037",
    category: "SOCIAL", 
    timestamp: "22:12",
    text: "[气象] 远处传来飞行器引擎的轰鸣声。",
    extractable_clue_id: null
  },
  
  // === ALERT (警报) - 红色 - 赛博安全 ===
  { 
    message_id: "MSG_038",
    category: "ALERT", 
    timestamp: "22:10",
    text: "[网络] 检测到附近有非法入侵活动，建议加强防护。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_039",
    category: "ALERT", 
    timestamp: "22:08",
    text: "[网络] 某大公司服务器遭黑客攻击，数据泄露中...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_040",
    category: "ALERT", 
    timestamp: "22:05",
    text: "[网络] 暗网论坛发布新型病毒警报，小心钓鱼邮件。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_041",
    category: "ALERT", 
    timestamp: "22:02",
    text: "[网络] AI管家服务更新，请重启你的智能家居系统。",
    extractable_clue_id: null
  },
  
  // === RUMOR (传闻) - 紫色 - 街头文化 ===
  { 
    message_id: "MSG_042",
    category: "RUMOR", 
    timestamp: "22:00",
    text: "[街头] 今晚在旺角有地下音乐会，听说很劲爆。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_043",
    category: "RUMOR", 
    timestamp: "21:58",
    text: "[街头] 改装车赛今晚继续，码头老地方见。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_044",
    category: "RUMOR", 
    timestamp: "21:55",
    text: "[街头] 有人在涂鸦墙留下了神秘符号，引起热议。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_045",
    category: "RUMOR", 
    timestamp: "21:52",
    text: "[街头] 某帮派在庙街划地盘，最近少去那边为妙。",
    extractable_clue_id: null
  },
  
  // === SOCIAL (社交) - 青色 - 娱乐休闲 ===
  { 
    message_id: "MSG_046",
    category: "SOCIAL", 
    timestamp: "21:50",
    text: "[娱乐] VR游乐场新开张，首周五折优惠。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_047",
    category: "SOCIAL", 
    timestamp: "21:48",
    text: "[娱乐] 掘金者酒吧今晚有特价，调酒师小雪在岗。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_048",
    category: "SOCIAL", 
    timestamp: "21:45",
    text: "[娱乐] 地下拳击赛本周六开打，赔率已公布。",
    extractable_clue_id: null
  },
  
  // === SOCIAL (社交) - 青色 - 更多社交消息 ===
  { 
    message_id: "MSG_049",
    category: "SOCIAL", 
    timestamp: "21:42",
    text: "来自 [阿强]: 兄弟，最近手头紧不紧？有个活儿...？",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_050",
    category: "SOCIAL", 
    timestamp: "21:40",
    text: "来自 [莉莉]: 听说你在找人？我这边有个线索。",
    extractable_clue_id: null
  },
];
