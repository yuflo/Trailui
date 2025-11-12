/**
 * Story Configuration Template
 * 
 * 复制此文件作为你的故事配置起点
 * 填写所有必需字段，选择合适的视觉原型
 */

import type { StoryConfig } from '../../../../types';

/**
 * 故事配置
 * 
 * 这个配置定义了故事的元数据和视觉风格
 * 引擎会使用这些信息来加载和渲染故事
 */
export const storyConfig: StoryConfig = {
  // ==================== 基础信息 ====================
  
  /** 
   * 故事唯一标识
   * 必须与文件夹名称一致，使用 kebab-case 格式
   * 例如: 'my-cool-story', 'underground-race'
   */
  id: 'template-story',
  
  /** 
   * 故事标题
   * 将显示在故事选择器中
   */
  title: '模板故事',
  
  /** 
   * 故事描述
   * 简短描述故事的主题和氛围
   */
  description: '这是一个故事模板，用于创建新故事。',
  
  /** 
   * 故事标签
   * 用于分类和搜索，建议 2-4 个标签
   */
  tags: ['模板', '示例'],
  
  /** 
   * 故事图标
   * 使用 emoji 表情，将显示在故事卡片上
   */
  icon: '📝',
  
  // ==================== 视觉配置 ====================
  
  /** 
   * 视觉原型
   * 
   * 从以下10个原型中选择最适合你故事的：
   * 
   * 🏙️ 城市动作线:
   *   - 'tense-urban'      紧张城市（后巷、追逐、对峙）
   *   - 'action-intense'   激烈动作（赛车、枪战、爆炸）
   *   - 'neon-carnival'    霓虹狂欢（夜店、派对、混乱）
   * 
   * 💼 社会商业线:
   *   - 'corporate-cold'   冷酷财团（交易、谈判、办公室）
   *   - 'tech-startup'     科技创业（实验室、创业公司、科技展）
   *   - 'daily-cozy'       日常温馨（咖啡馆、家庭、日常对话）
   * 
   * 🎭 文化艺术线:
   *   - 'artistic-flow'    艺术律动（画廊、音乐厅、创作空间）
   *   - 'contemplative'    沉思哲学（图书馆、寺庙、深度对话）
   * 
   * 🌙 情感暗流线:
   *   - 'noir-mystery'     黑色悬疑（调查、推理、阴谋）
   *   - 'sensual-haze'     情欲迷雾（私密空间、欲望、诱惑）
   */
  visualArchetype: 'tense-urban',
  
  /** 
   * 视觉微调参数（可选）
   * 
   * 如果默认原型不够用，可以使用这些参数进行微调：
   * - accentColor: 主题强调色（CSS颜色值，如 '#ff0000'）
   * - scanlineSpeed: 扫描线速度（CSS时间值，如 '2s', '5s'）
   * - comicIntensity: 漫画强度 0-1
   * - glitchEffect: 是否启用故障效果
   * - saturation: 饱和度（如 '80%', '120%'）
   * 
   * 不需要微调时可以删除此字段
   */
  visualOverrides: {
    // accentColor: '#00d4ff',
    // scanlineSpeed: '3s',
  },
  
  // ==================== 场景信息 ====================
  
  /** 
   * 场景数量
   * 必须与 scenario.data.ts 中的实际场景数量一致
   */
  scenarioCount: 1,
  
  // ==================== 可选元数据 ====================
  
  /** 
   * 故事版本号（可选）
   */
  version: '1.0.0',
  
  /** 
   * 故事作者（可选）
   */
  author: 'Your Name',
  
  /** 
   * 创建日期（可选）
   */
  createdAt: '2025-10-29',
};
