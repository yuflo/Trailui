/**
 * Ticker Messages Data - Hong Kong
 * 
 * 香港世界信息流消息数据
 * 用于世界信息流的随机展示
 */

/**
 * Ticker消息数据
 * （不包含React图标，由服务层添加）
 */
export interface TickerMessageRaw {
  type: string;
  color: string;
  text: string;
}

/**
 * 香港世界信息流消息池
 * 
 * 这些消息会定时随机出现在"世界信息流"区域
 * 用于增强游戏世界的活力和沉浸感
 * 
 * @note Mock数据 - Demo阶段使用，上线后从后端API获取
 */
export const tickerMessages: TickerMessageRaw[] = [
  // === 社交消息 ===
  { 
    type: "社交", 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [K]: 你上次要的货到了。",
  },
  { 
    type: "社交", 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [阿兰]: 明天记得来找我，有事商量。",
  },
  { 
    type: "社交", 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [老赵]: 上次的事情处理得不错，下次再合作。",
  },
  { 
    type: "社交", 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [小雪]: 棠哥今晚不在店里，有什么事吗？",
  },
  { 
    type: "社交", 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [未知号码]: 我们需要谈谈...单独的。",
  },
  
  // === 媒体新闻 ===
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[某个财团] 股价今日小幅下跌...",
  },
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[TVB] 今晚有台风警报，市民请做好防护措施。",
  },
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[财经快讯] 恒生指数收盘跌破关键支撑位...",
  },
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[科技新闻] 新型义体植入技术获批临床试验。",
  },
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[娱乐八卦] 某明星深夜现身兰桂坊，疑似醉酒...",
  },
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[社会新闻] 中环写字楼发生跳楼事件，警方介入调查。",
  },
  
  // === 警方频道 ===
  { 
    type: "警讯", 
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 代号 187... 目标进入兰桂坊区域...",
  },
  { 
    type: "警讯", 
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 10-50 收到噪音投诉，巡逻单位前往现场。",
  },
  { 
    type: "警讯", 
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 10-31 码头区域发现可疑人员，请求支援。",
  },
  { 
    type: "警讯", 
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 10-16 尖沙咀区域有车辆追逐，请附近单位注意。",
  },
  { 
    type: "警讯", 
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] Code 3 油麻地发生冲突，反黑组已出动。",
  },
  
  // === 地下传闻 ===
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "听说昨晚在码头有人搞事，条子去了。",
  },
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "老鼠在找一批新货，价格很不错。",
  },
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "九龙城那边最近不太平，最好别去。",
  },
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "有人在地下拳场输了大钱，现在到处借。",
  },
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "听说商人最近在收购改装零件，有路子的话赚一笔。",
  },
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "深水埗有个新黑市开张了，东西齐全但规矩多。",
  },
  
  // === 个人频道 ===
  { 
    type: "个人", 
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[数据包] 你的义体植入预约已确认，明天下午2点。",
  },
  { 
    type: "个人", 
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[银行] 您的账户余额不足，请及时充值。",
  },
  { 
    type: "个人", 
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[任务提醒] 老地方见面的时间快到了。",
  },
  { 
    type: "个人", 
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[健康警报] 检测到心率异常，建议休息。",
  },
  
  // === 交易信息 ===
  { 
    type: "交易", 
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[黑市] 军用级光学迷彩模块热卖中，数量有限。",
  },
  { 
    type: "交易", 
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[黑市] 收购各类芯片和数据模块，价格公道。",
  },
  { 
    type: "交易", 
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[暗网] 有人出售机密文件，价格面议。",
  },
  { 
    type: "交易", 
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[拍卖] 罕见的古董赛博义肢今晚8点开拍。",
  },
  
  // === 环境氛围 ===
  { 
    type: "环境", 
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 雨势渐大，街道开始积水...",
  },
  { 
    type: "环境", 
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 霓虹灯在雨中闪烁，反射着五光十色的光芒。",
  },
  { 
    type: "环境", 
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 夜幕降临，城市的另一面开始苏醒...",
  },
  { 
    type: "环境", 
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 远处传来飞行器引擎的轰鸣声。",
  },
  
  // === 赛博事件 ===
  { 
    type: "赛博", 
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 检测到附近有非法入侵活动，建议加强防护。",
  },
  { 
    type: "赛博", 
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 某大公司服务器遭黑客攻击，数据泄露中...",
  },
  { 
    type: "赛博", 
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 暗网论坛发布新型病毒警报，小心钓鱼邮件。",
  },
  { 
    type: "赛博", 
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] AI管家服务更新，请重启你的智能家居系统。",
  },
  
  // === 街头文化 ===
  { 
    type: "街头", 
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 今晚在旺角有地下音乐会，听说很劲爆。",
  },
  { 
    type: "街头", 
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 改装车赛今晚继续，码头老地方见。",
  },
  { 
    type: "街头", 
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 有人在涂鸦墙留下了神秘符号，引起热议。",
  },
  { 
    type: "街头", 
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 某帮派在庙街划地盘，最近少去那边为妙。",
  },
  
  // === 娱乐休闲 ===
  { 
    type: "娱乐", 
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30", 
    text: "[娱乐] VR游乐场新开张，首周五折优惠。",
  },
  { 
    type: "娱乐", 
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30", 
    text: "[娱乐] 掘金者酒吧今晚有特价，调酒师小雪在岗。",
  },
  { 
    type: "娱乐", 
    color: "bg-pink-500/20 text-pink-300 border-pink-500/30", 
    text: "[娱乐] 地下拳击赛本周六开打，赔率已公布。",
  },
  
  // === 更多社交消息 ===
  { 
    type: "社交", 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [阿强]: 兄弟，最近手头紧不紧？有个活儿...？",
  },
  { 
    type: "社交", 
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
    text: "来自 [莉莉]: 听说你在找人？我这边有个线索。",
  },
  
  // === 更多媒体新闻 ===
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[新闻快报] 尖沙咀商业区发生大规模停电事故。",
  },
  { 
    type: "媒体", 
    color: "bg-gray-500/20 text-gray-300 border-gray-500/30", 
    text: "[科技] 新型神经同步技术引发伦理争议。",
  },
  
  // === 更多传闻 ===
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "听说有人在寻找失踪的黑客，赏金很高。",
  },
  { 
    type: "传闻", 
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30", 
    text: "据说某个公司的实验室出事了，现场一片狼藉。",
  },
  
  // === 更多赛博事件 ===
  { 
    type: "赛博", 
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 未知病毒在暗网传播，已有数个节点失联。",
  },
  { 
    type: "赛博", 
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", 
    text: "[网络] 加密货币交易所遭受DDoS攻击，服务暂停。",
  },
  
  // === 更多交易信息 ===
  { 
    type: "交易", 
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[黑市] 求购高级神经接口芯片，价格好商量。",
  },
  { 
    type: "交易", 
    color: "bg-green-500/20 text-green-300 border-green-500/30", 
    text: "[黑市] 出售原装进口义体零件，保真保修。",
  },
  
  // === 更多警讯 ===
  { 
    type: "警讯", 
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] 10-99 旺角区域发生枪击事件，特种部队已部署。",
  },
  { 
    type: "警讯", 
    color: "bg-red-500/20 text-red-300 border-red-500/30", 
    text: "[警方] Code 5 检测到非法义体改装，锁定嫌疑人位置。",
  },
  
  // === 更多街头文化 ===
  { 
    type: "街头", 
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 新涂鸦艺术家在中环引起轰动，作品售价惊人。",
  },
  { 
    type: "街头", 
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
    text: "[街头] 地下格斗场今晚有新人挑战冠军，值得一看。",
  },
  
  // === 更多环境氛围 ===
  { 
    type: "环境", 
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 浓雾笼罩维多利亚港，能见度极低。",
  },
  { 
    type: "环境", 
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30", 
    text: "[气象] 空气中弥漫着霓虹灯的嗡鸣声和食物的香气。",
  },
  
  // === 更多个人频道 ===
  { 
    type: "个人", 
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[系统] 您的义体保修期即将到期，请及时续约。",
  },
  { 
    type: "个人", 
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", 
    text: "[提醒] 本月租金将于三天后到期，请按时缴纳。",
  },
];
