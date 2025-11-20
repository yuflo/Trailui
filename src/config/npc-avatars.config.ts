/**
 * NPC 头像配置系统
 * 
 * 将 Dreamheart 的 NPC ID 映射到 Figma 导入的头像资源
 */

// 导入 Figma 头像资源
import imgImageNpc from "figma:asset/5b647bc6ac6e69e2f60147e64ddd886353c6acb2.png";
import imgImagePlayer from "figma:asset/3021cb036f5d7511d196c3fd63f5bbf61286eee3.png";
import imgImageKiraAvatar from "figma:asset/b52c7a2f09ee5b9170a6ea35c833cb6ed5fb4ffe.png";
import imgImagePlayer1 from "figma:asset/5eae5eaf1e2b04030b84ac8c31febd9883ea4037.png";

/**
 * NPC ID 到头像的映射表
 * 
 * 🔥 新增 NPC 时，请在这里添加映射关系
 */
export const NPC_AVATAR_MAP: Record<string, string> = {
  // ========== Demo 故事 NPC ==========
  'npc_fatty_tang': imgImageNpc,        // 肥棠（保镖）- 男性强壮形象
  'NPC_FAT_TANG': imgImageNpc,          // 大写ID兼容
  
  'npc_xiaoxue': imgImageKiraAvatar,    // 小雪（酒保）- 女性角色
  'NPC_XIAO_XUE': imgImageKiraAvatar,   // 大写ID兼容
  
  // ========== 模板 NPC ==========
  'NPC-001': imgImagePlayer,            // 神秘人
  
  // ========== 预留位置（可扩展）==========
  // 'npc_broker_zero': imgImagePlayer1,     // 零号中介
  // 'npc_detective_chen': imgImagePlayer,   // 陈探长
  // 'npc_gang_boss': imgImageNpc,           // 帮派老大
};

/**
 * 默认头像
 * 当 NPC ID 未配置时使用
 */
export const DEFAULT_AVATAR = imgImageNpc;

/**
 * 获取 NPC 头像
 * 
 * @param npcId - NPC 的唯一标识符
 * @returns 头像图片 URL
 * 
 * @example
 * ```typescript
 * const avatar = getNpcAvatar('npc_fatty_tang');
 * // 返回: imgImageNpc
 * ```
 */
export function getNpcAvatar(npcId: string): string {
  const avatar = NPC_AVATAR_MAP[npcId];
  
  if (!avatar) {
    console.warn(`[NPC Avatar] 未找到 NPC "${npcId}" 的头像配置，使用默认头像`);
    return DEFAULT_AVATAR;
  }
  
  return avatar;
}

/**
 * 检查 NPC 是否有配置头像
 * 
 * @param npcId - NPC 的唯一标识符
 * @returns 是否已配置
 */
export function hasNpcAvatar(npcId: string): boolean {
  return npcId in NPC_AVATAR_MAP;
}

/**
 * 获取所有已配置头像的 NPC ID
 * 
 * @returns NPC ID 数组
 */
export function getConfiguredNpcIds(): string[] {
  return Object.keys(NPC_AVATAR_MAP);
}

/**
 * 批量获取 NPC 头像
 * 
 * @param npcIds - NPC ID 数组
 * @returns ID -> 头像 的映射对象
 */
export function getNpcAvatars(npcIds: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  npcIds.forEach(id => {
    result[id] = getNpcAvatar(id);
  });
  
  return result;
}
