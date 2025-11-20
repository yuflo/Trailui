/**
 * 动态头像生成器
 * 
 * 使用 DiceBear API 根据 NPC ID 生成独特的头像
 * 作为 Figma 头像的补充方案
 */

/**
 * 头像风格
 * 
 * @see https://www.dicebear.com/styles/
 */
export type AvatarStyle = 
  | 'personas'      // 简约卡通风格（推荐）
  | 'avataaars'     // 类似 Bitmoji
  | 'bottts'        // 机器人风格（赛博朋克）
  | 'identicon'     // 几何图形
  | 'initials';     // 首字母

/**
 * 头像生成配置
 */
export interface AvatarConfig {
  style?: AvatarStyle;
  backgroundColor?: string;
  size?: number;
}

/**
 * 生成 NPC 头像 URL
 * 
 * @param npcId - NPC 唯一标识符
 * @param config - 配置选项
 * @returns 头像 URL
 * 
 * @example
 * ```typescript
 * const avatar = generateNpcAvatar('npc_fatty_tang', {
 *   style: 'personas',
 *   backgroundColor: 'A83C3C'
 * });
 * // 返回: "https://api.dicebear.com/7.x/personas/svg?seed=npc_fatty_tang&backgroundColor=A83C3C"
 * ```
 */
export function generateNpcAvatar(
  npcId: string, 
  config: AvatarConfig = {}
): string {
  const {
    style = 'personas',
    backgroundColor = 'A83C3C', // GTA 砖红色
    size = 200
  } = config;
  
  const params = new URLSearchParams({
    seed: npcId,
    backgroundColor: backgroundColor,
    size: size.toString()
  });
  
  return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
}

/**
 * 根据 NPC 角色类型生成合适的头像风格
 * 
 * @param npcId - NPC ID
 * @param role - NPC 角色类型
 * @returns 头像 URL
 */
export function generateNpcAvatarByRole(
  npcId: string,
  role?: string
): string {
  // 根据角色选择风格
  let style: AvatarStyle = 'personas';
  let backgroundColor = 'A83C3C';
  
  if (role) {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('机器') || roleLower.includes('赛博')) {
      style = 'bottts';
      backgroundColor = '00D4FF'; // 赛博蓝
    } else if (roleLower.includes('帮派') || roleLower.includes('老大')) {
      style = 'avataaars';
      backgroundColor = '8B2F2F'; // 深红
    }
  }
  
  return generateNpcAvatar(npcId, { style, backgroundColor });
}

/**
 * 生成带缓存的头像 URL
 * 
 * @note 同一个 NPC ID 总是生成相同的头像
 */
const avatarCache = new Map<string, string>();

export function getCachedNpcAvatar(
  npcId: string,
  config?: AvatarConfig
): string {
  if (avatarCache.has(npcId)) {
    return avatarCache.get(npcId)!;
  }
  
  const avatar = generateNpcAvatar(npcId, config);
  avatarCache.set(npcId, avatar);
  
  return avatar;
}

/**
 * 清除头像缓存
 */
export function clearAvatarCache(): void {
  avatarCache.clear();
}
