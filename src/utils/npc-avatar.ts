/**
 * NPC 头像统一获取接口
 * 
 * 混合方案：
 * 1. 优先使用手动配置的 Figma 头像（高质量）
 * 2. 降级使用动态生成的头像（灵活性）
 */

import { getNpcAvatar, hasNpcAvatar, DEFAULT_AVATAR } from '../config/npc-avatars.config';
import { generateNpcAvatar } from './avatar-generator';

/**
 * 头像获取策略
 */
export type AvatarStrategy = 
  | 'figma-only'     // 只使用 Figma 头像（未配置则使用默认）
  | 'generate-only'  // 只使用动态生成
  | 'hybrid';        // 混合策略（推荐）

/**
 * 头像配置
 */
export interface AvatarOptions {
  strategy?: AvatarStrategy;
  fallbackToGenerate?: boolean;  // 未配置时是否降级到生成
  npcName?: string;               // NPC 名称（用于生成首字母头像）
  npcRole?: string;               // NPC 角色（用于选择风格）
}

/**
 * 获取 NPC 头像（统一接口）
 * 
 * @param npcId - NPC ID
 * @param options - 配置选项
 * @returns 头像 URL
 * 
 * @example
 * ```typescript
 * // 使用混合策略（推荐）
 * const avatar1 = getAvatar('npc_fatty_tang');
 * // → 返回 Figma 配置的头像
 * 
 * const avatar2 = getAvatar('npc_unknown');
 * // → 自动生成头像
 * 
 * // 只使用 Figma 头像
 * const avatar3 = getAvatar('npc_unknown', { strategy: 'figma-only' });
 * // → 返回默认头像
 * ```
 */
export function getAvatar(
  npcId: string, 
  options: AvatarOptions = {}
): string {
  const {
    strategy = 'hybrid',
    fallbackToGenerate = true,
    npcRole
  } = options;
  
  // 策略1: 只使用 Figma 头像
  if (strategy === 'figma-only') {
    return getNpcAvatar(npcId);
  }
  
  // 策略2: 只使用动态生成
  if (strategy === 'generate-only') {
    return generateNpcAvatar(npcId);
  }
  
  // 策略3: 混合策略（默认）
  if (hasNpcAvatar(npcId)) {
    console.log(`[Avatar] 使用 Figma 配置的头像: ${npcId}`);
    return getNpcAvatar(npcId);
  }
  
  // 降级到动态生成
  if (fallbackToGenerate) {
    console.log(`[Avatar] NPC "${npcId}" 未配置头像，动态生成`);
    return generateNpcAvatar(npcId, {
      backgroundColor: 'A83C3C'
    });
  }
  
  // 最终降级到默认头像
  console.warn(`[Avatar] NPC "${npcId}" 未配置头像，使用默认头像`);
  return DEFAULT_AVATAR;
}

/**
 * 批量获取 NPC 头像
 * 
 * @param npcIds - NPC ID 数组
 * @param options - 配置选项
 * @returns ID -> 头像 URL 的映射
 */
export function getAvatars(
  npcIds: string[],
  options: AvatarOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  
  npcIds.forEach(id => {
    result[id] = getAvatar(id, options);
  });
  
  return result;
}

/**
 * 预加载 NPC 头像
 * 
 * @param npcIds - NPC ID 数组
 * @returns Promise（所有头像加载完成）
 */
export async function preloadAvatars(npcIds: string[]): Promise<void> {
  const avatarUrls = npcIds.map(id => getAvatar(id));
  
  const loadPromises = avatarUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`[Avatar] 预加载失败: ${url}`);
        resolve(); // 不阻塞其他头像
      };
      img.src = url;
    });
  });
  
  await Promise.all(loadPromises);
  console.log(`[Avatar] 预加载完成: ${npcIds.length} 个头像`);
}

/**
 * 检查头像是否可用
 * 
 * @param npcId - NPC ID
 * @returns 是否有可用头像
 */
export function hasAvatar(npcId: string): boolean {
  return hasNpcAvatar(npcId) || true; // 动态生成总是可用
}
