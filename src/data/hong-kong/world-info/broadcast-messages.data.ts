/**
 * Broadcast Messages Data - Hong Kong
 * 
 * 香港世界广播消息数据（远场探索）
 * 用于世界信息流的随机展示，符合远场探索API规范
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
 * @note Mock数据 - Demo阶段使用，上线后从后端API获取
 */
export const broadcastMessages: BroadcastMessageData[] = [
  // === 可提取线索的消息（关键消息） ===
  { 
    message_id: "MSG_001",
    category: "传闻", 
    timestamp: "23:41",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "听说有个快递员失踪了，包裹三天没送到，收件人很着急。",
    extractable_clue_id: "CLUE_001_UNDELIVERED_PACKAGE" // ✨ 入口线索（但玩家已有，所以不会重复提取）
  },
  
  { 
    message_id: "MSG_002",
    category: "传闻", 
    timestamp: "23:38",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "尖沙咀最近不太平，\"斧头帮\"和\"红星社\"似乎因为货物起了冲突。",
    extractable_clue_id: "CLUE_004_GANG_RUMOR" // ✨ 背景线索
  },
  
  { 
    message_id: "MSG_003",
    category: "交易", 
    timestamp: "23:35",
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[暗网] 有人悬赏寻找一批价值三十万的\"特殊货物\"，知道消息的请联系。",
    extractable_clue_id: "CLUE_005_MISSING_CARGO" // ✨ 背景线索
  },
  
  // === 氛围消息（不可提取线索） ===
  { 
    message_id: "MSG_004",
    category: "环境", 
    timestamp: "23:39",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 空气中弥漫着霓虹灯的嗡鸣声和食物的香气。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_005",
    category: "社交", 
    timestamp: "23:33",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [K]: 你上次要的货到了。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_006",
    category: "社交", 
    timestamp: "23:30",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [阿兰]: 明天记得来找我，有事商量。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_007",
    category: "社交", 
    timestamp: "23:27",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [老赵]: 上次的事情处理得不错，下次再合作。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_008",
    category: "社交", 
    timestamp: "23:25",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [小雪]: 棠哥今晚不在店里，有什么事吗？",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_009",
    category: "媒体", 
    timestamp: "23:22",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[某个财团] 股价今日小幅下跌...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_010",
    category: "媒体", 
    timestamp: "23:20",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[TVB] 今晚有台风警报，市民请做好防护措施。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_011",
    category: "媒体", 
    timestamp: "23:18",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[财经快讯] 恒生指数收盘跌破关键支撑位...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_012",
    category: "媒体", 
    timestamp: "23:15",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[科技新闻] 新型义体植入技术获批临床试验。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_013",
    category: "媒体", 
    timestamp: "23:12",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[娱乐八卦] 某明星深夜现身兰桂坊，疑似醉酒...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_014",
    category: "媒体", 
    timestamp: "23:10",
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[社会新闻] 中环写字楼发生跳楼事件，警方介入调查。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_015",
    category: "警讯", 
    timestamp: "23:08",
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 代号 187... 目标进入兰桂坊区域...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_016",
    category: "警讯", 
    timestamp: "23:05",
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 10-50 收到噪音投诉，巡逻单位前往现场。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_017",
    category: "警讯", 
    timestamp: "23:02",
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 10-31 码头区域发现可疑人员，请求支援。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_018",
    category: "警讯", 
    timestamp: "23:00",
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 10-16 尖沙咀区域有车辆追逐，请附近单位注意。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_019",
    category: "警讯", 
    timestamp: "22:58",
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] Code 3 油麻地发生冲突，反黑组已出动。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_020",
    category: "传闻", 
    timestamp: "22:55",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "听说昨晚在码头有人搞事，条子去了。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_021",
    category: "传闻", 
    timestamp: "22:52",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "老鼠在找一批新货，价格很不错。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_022",
    category: "传闻", 
    timestamp: "22:50",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "九龙城那边最近不太平，最好别去。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_023",
    category: "传闻", 
    timestamp: "22:48",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "有人在地下拳场输了大钱，现在到处借。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_024",
    category: "传闻", 
    timestamp: "22:45",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "听说商人最近在收购改装零件，有路子的话赚一笔。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_025",
    category: "传闻", 
    timestamp: "22:42",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "深水埗有个新黑市开张了，东西齐全但规矩多。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_026",
    category: "个人", 
    timestamp: "22:40",
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[数据包] 你的义体植入预约已确认，明天下午2点。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_027",
    category: "个人", 
    timestamp: "22:38",
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[银行] 您的账户余额不足，请及时充值。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_028",
    category: "个人", 
    timestamp: "22:35",
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[任务提醒] 老地方见面的时间快到了。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_029",
    category: "个人", 
    timestamp: "22:32",
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[健康警报] 检测到心率异常，建议休息。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_030",
    category: "交易", 
    timestamp: "22:30",
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[黑市] 军用级光学迷彩模块热卖中，数量有限。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_031",
    category: "交易", 
    timestamp: "22:28",
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[黑市] 收购各类芯片和数据模块，价格公道。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_032",
    category: "交易", 
    timestamp: "22:25",
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[暗网] 有人出售机密文件，价格面议。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_033",
    category: "交易", 
    timestamp: "22:22",
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[拍卖] 罕见的古董赛博义肢今晚8点开拍。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_034",
    category: "环境", 
    timestamp: "22:20",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 雨势渐大，街道开始积水...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_035",
    category: "环境", 
    timestamp: "22:18",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 霓虹灯在雨中闪烁，反射着五光十色的光芒。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_036",
    category: "环境", 
    timestamp: "22:15",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 夜幕降临，城市的另一面开始苏醒...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_037",
    category: "环境", 
    timestamp: "22:12",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 远处传来飞行器引擎的轰鸣声。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_038",
    category: "赛博", 
    timestamp: "22:10",
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 检测到附近有非法入侵活动，建议加强防护。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_039",
    category: "赛博", 
    timestamp: "22:08",
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 某大公司服务器遭黑客攻击，数据泄露中...",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_040",
    category: "赛博", 
    timestamp: "22:05",
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 暗网论坛发布新型病毒警报，小心钓鱼邮件。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_041",
    category: "赛博", 
    timestamp: "22:02",
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] AI管家服务更新，请重启你的智能家居系统。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_042",
    category: "街头", 
    timestamp: "22:00",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 今晚在旺角有地下音乐会，听说很劲爆。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_043",
    category: "街头", 
    timestamp: "21:58",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 改装车赛今晚继续，码头老地方见。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_044",
    category: "街头", 
    timestamp: "21:55",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 有人在涂鸦墙留下了神秘符号，引起热议。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_045",
    category: "街头", 
    timestamp: "21:52",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 某帮派在庙街划地盘，最近少去那边为妙。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_046",
    category: "娱乐", 
    timestamp: "21:50",
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30", 
    text: "[娱乐] VR游乐场新开张，首周五折优惠。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_047",
    category: "娱乐", 
    timestamp: "21:48",
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30", 
    text: "[娱乐] 掘金者酒吧今晚有特价，调酒师小雪在岗。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_048",
    category: "娱乐", 
    timestamp: "21:45",
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30", 
    text: "[娱乐] 地下拳击赛本周六开打，赔率已公布。",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_049",
    category: "社交", 
    timestamp: "21:42",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [阿强]: 兄弟，最近手头紧不紧？有个活儿...？",
    extractable_clue_id: null
  },
  
  { 
    message_id: "MSG_050",
    category: "社交", 
    timestamp: "21:40",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [莉莉]: 听说你在找人？我这边有个线索。",
    extractable_clue_id: null
  },
];
