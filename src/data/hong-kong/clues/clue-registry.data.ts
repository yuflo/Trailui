/**
 * Clue Registry Data - Hong Kong
 * 
 * 香港世界的线索数据注册表
 * 用于"远场探索"模式的线索管理
 * 
 * ✨ Demo阶段：所有线索关联到同一个story_id ('demo-story')
 * 
 * ✅ Phase 4优化：
 * - 删除helper函数（移到DataAccess层）
 * - 只保留纯数据导出
 */

import type { ClueData } from '../../../types';

/**
 * 线索数据注册表
 * 
 * 定义所有可从世界信息流中提取的线索
 * 每条线索关联一个故事，引导玩家发现并开启故事线
 * 
 * @note Mock数据 - Demo阶段使用，上线后从后端API获取
 * @note Demo阶段所有线索都关联到'demo-story'，简化演示流程
 */
export const clueRegistry: ClueData[] = [
  /**
   * 入口线索：未送达的包裹
   * - 玩家从世界信息流中提取这条线索
   * - 需要手动"开始追踪"来开启故事
   */
  {
    clue_id: 'CLUE_001_UNDELIVERED_PACKAGE',
    title: '未送达的包裹',
    summary: '一个快递员失踪了，他负责的包裹三天未送达。最后定位显示在尖沙咀的"掘金者"酒吧附近。收件人：小雪。',
    status: 'untracked',
    story_id: 'demo-story',  // ✨ Demo统一story
    related_clues: ['CLUE_002_COURIER_ID'],
    related_scenes: ['scene-a']
  },
  
  /**
   * 深入线索：快递员的工作证
   */
  {
    clue_id: 'CLUE_002_COURIER_ID',
    title: '快递员工作证',
    summary: '姓名：阿伟。工号：SF-3247。照片显示一个年轻男人。工作证背面有酒保"小雪"的名字和电话号码。',
    status: 'untracked',
    story_id: 'demo-story',  // ✨ Demo统一story
    related_clues: ['CLUE_001_UNDELIVERED_PACKAGE', 'CLUE_003_BAR_SURVEILLANCE'],
    related_scenes: ['scene-a', 'scene-b']
  },
  
  /**
   * 核心线索：酒吧监控记录
   */
  {
    clue_id: 'CLUE_003_BAR_SURVEILLANCE',
    title: '监控录像片段',
    summary: '监控显示：三天前晚上11点，阿伟和小雪在酒吧后门见面。他们交接了一个黑色手提箱。随后肥棠带人出现，阿伟逃跑。',
    status: 'untracked',
    story_id: 'demo-story',  // ✨ Demo统一story
    related_clues: ['CLUE_002_COURIER_ID'],
    related_scenes: ['scene-b']
  },
  
  /**
   * 补充背景线索
   */
  {
    clue_id: 'CLUE_004_GANG_RUMOR',
    title: '黑帮火并传闻',
    summary: '尖沙咀最近不太平，"斧头帮"和"红星社"似乎因为货物争端起了冲突。肥棠是斧头帮的打手。',
    status: 'untracked',
    story_id: 'demo-story',  // ✨ Demo统一story
    related_clues: ['CLUE_001_UNDELIVERED_PACKAGE']
  },
  
  {
    clue_id: 'CLUE_005_MISSING_CARGO',
    title: '价值三十万的货物',
    summary: '黑市传言：有一批价值三十万的"特殊货物"在运输途中失踪了。有人悬赏寻找。',
    status: 'untracked',
    story_id: 'demo-story',  // ✨ Demo统一story
    related_clues: ['CLUE_002_COURIER_ID', 'CLUE_003_BAR_SURVEILLANCE']
  },
];

/**
 * ✅ Phase 4优化完成
 * 
 * 所有helper函数已移除，改为通过DataAccess接口访问：
 * - findClueById() → ClueDataAccess.findById()
 * - getCluesByStoryId() → ClueDataAccess.getByStoryId()
 * 
 * 此文件现在只导出纯数据
 */
