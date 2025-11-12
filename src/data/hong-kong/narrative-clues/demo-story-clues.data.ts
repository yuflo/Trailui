/**
 * Demo Story - Narrative Clues Mock Data
 * 
 * 叙事线索数据 - 失踪的快递员
 * 
 * 用途：装饰性UI卡片，显示在自由镜右侧面板（可选）
 * 功能：提供玩家探索时的线索提示和氛围营造
 * 
 * @note Demo实现 - 静态Mock数据
 * @note 上线后可从LLM/API动态生成
 * @version 1.0
 */

import type { NarrativeThread } from '../../../types';

/**
 * Demo Story 叙事线索池
 * 
 * 设计思路：
 * - 每条线索对应故事的不同调查方向
 * - status字段表示线索的处理状态（装饰性）
 * - UI会随机抽取3-5条显示，每30秒自动刷新
 * - 不影响核心叙事序列播放
 */
export const demoStoryNarrativeClues: NarrativeThread[] = [
  {
    id: 'narrative-clue-001',
    title: '📹 监控录像片段',
    status: '待分析'
  },
  {
    id: 'narrative-clue-002',
    title: '🎤 目击者证词',
    status: '已收集'
  },
  {
    id: 'narrative-clue-003',
    title: '📱 快递员手机记录',
    status: '加密中'
  },
  {
    id: 'narrative-clue-004',
    title: '🚬 酒吧门口烟头',
    status: '待检验'
  },
  {
    id: 'narrative-clue-005',
    title: '💰 可疑资金流向',
    status: '追踪中'
  },
  {
    id: 'narrative-clue-006',
    title: '🔑 神秘钥匙',
    status: '未知用途'
  },
  {
    id: 'narrative-clue-007',
    title: '📄 撕碎的收据',
    status: '拼接中'
  },
  {
    id: 'narrative-clue-008',
    title: '🎭 假身份证明',
    status: '已确认'
  },
  {
    id: 'narrative-clue-009',
    title: '🗺️ 手绘地图',
    status: '解密中'
  },
  {
    id: 'narrative-clue-010',
    title: '💊 不明药物残留',
    status: '送检中'
  }
];
