/**
 * NPC Service
 * 
 * 业务层服务：NPC 数据管理
 * 负责合并 NPC Registry（静态）和 Scenario（动态）的数据
 */

import type { NPCEntity, EnrichedNPCEntity } from '../../../types';
import { getNPCConfig, hasNPCConfig, getNPCAvatar } from '../../../data/hong-kong/npcs';

/**
 * 丰富 NPC 实体数据
 * 
 * 将 Scenario 中的动态数据与 Registry 中的静态数据合并
 * 
 * @param npcEntity - 来自 Scenario 的 NPC 数据（只有动态属性）
 * @returns 完整的 NPC 数据（包含头像、职业等）
 * 
 * @example
 * ```typescript
 * // Scenario 中的数据（只有动态状态）
 * const scenarioNPC = {
 *   id: 'npc_fatty_tang',
 *   status_summary: '警惕地看着你',
 *   composure: '心防 70/100',
 *   rapport: { sentiment: '警惕', intensity: 20 }
 * };
 * 
 * // 丰富后的数据（动态 + 静态）
 * const enrichedNPC = enrichNPCEntity(scenarioNPC);
 * // {
 * //   ...scenarioNPC,
 * //   name: '肥棠',            // 来自 Registry
 * //   avatar: 'figma:asset/5b647bc6...',  // 来自 Registry
 * //   role: '保镖',            // 来自 Registry
 * //   bio: '掘金者酒吧的保镖...'  // 来自 Registry
 * // }
 * ```
 */
export function enrichNPCEntity(npcEntity: NPCEntity): EnrichedNPCEntity {
  const config = getNPCConfig(npcEntity.id);
  
  if (!config) {
    // 如果没有配置，返回原数据 + 默认头像
    console.warn(`[NPC Service] NPC "${npcEntity.id}" 未在 Registry 中注册`);
    return {
      ...npcEntity,
      name: '未知',
      avatar: getNPCAvatar(npcEntity.id), // 使用默认头像
      role: '未知',
      bio: `详细信息尚未录入。`,
      // UI 增强字段使用默认值
      photo: getNPCAvatar(npcEntity.id),
      nameJP: undefined,
      stats: {
        trust: 50,
        danger: 50
      }
    };
  }
  
  // 计算 UI 增强字段
  const rapportIntensity = npcEntity.rapport?.intensity ?? 50;
  const trust = Math.round(rapportIntensity); // 信任度 = 好感度强度
  const danger = 100 - trust; // 危险度 = 反向信任度
  
  // 合并 Registry 静态数据和 Scenario 动态数据
  return {
    ...npcEntity,           // Scenario 的动态数据（优先级高）
    name: config.name,      // Registry 的静态数据
    avatar: config.avatar,  // Registry 的静态数据
    role: config.role,
    bio: config.bio,
    // UI 增强字段
    photo: config.avatar,   // 使用相同的头像作为照片
    nameJP: undefined,      // 暂未实现（未来可从 Registry 读取）
    stats: {
      trust,
      danger
    }
  };
}

/**
 * 批量丰富 NPC 实体数据
 * 
 * @param npcEntities - NPC 实体数组
 * @returns 丰富后的 NPC 实体数组
 */
export function enrichNPCEntities(npcEntities: NPCEntity[]): EnrichedNPCEntity[] {
  return npcEntities.map(enrichNPCEntity);
}

/**
 * 创建简化的 NPC 实体（用于 Scenario 数据）
 * 
 * 从完整的 NPC 数据中提取动态属性，去除静态属性
 * 用于在 Scenario 中只存储必要的动态数据
 * 
 * @param fullNPC - 完整的 NPC 数据
 * @returns 简化的 NPC 数据（只包含动态属性）
 */
export function createSimplifiedNPCEntity(fullNPC: EnrichedNPCEntity): NPCEntity {
  const { avatar, role, bio, name, ...dynamicProps } = fullNPC;
  return dynamicProps;
}

/**
 * 验证 NPC 是否已注册
 * 
 * @param npcId - NPC ID
 * @returns 是否已注册
 */
export function isNPCRegistered(npcId: string): boolean {
  return hasNPCConfig(npcId);
}

/**
 * 获取 NPC 的默认好感度
 * 
 * @param npcId - NPC ID
 * @returns 默认好感度情绪，如果未配置则返回 '中立'
 */
export function getDefaultSentiment(npcId: string): string {
  const config = getNPCConfig(npcId);
  return config?.default_sentiment || '中立';
}

/**
 * NPC Service 单例
 */
export const NPCService = {
  enrichNPCEntity,
  enrichNPCEntities,
  createSimplifiedNPCEntity,
  isNPCRegistered,
  getDefaultSentiment,
  getNPCConfig,
  getNPCAvatar
};