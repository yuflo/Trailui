/**
 * NPC Registry - NPC 注册表
 * 
 * 集中管理所有 NPC 的静态属性（基础信息）
 * 
 * 架构设计：
 * - Registry 存储静态属性（头像、职业、背景故事）
 * - Scenario 存储动态属性（状态、好感度、位置）
 */

// 导入 Figma 头像资源
// 🔥 注意：使用 figma:asset 导入路径
import imgImageNpc from "figma:asset/5b647bc6ac6e69e2f60147e64ddd886353c6acb2.png";
import imgImageKiraAvatar from "figma:asset/b52c7a2f09ee5b9170a6ea35c833cb6ed5fb4ffe.png";
import imgImagePlayer from "figma:asset/3021cb036f5d7511d196c3fd63f5bbf61286eee3.png";
import imgImagePlayer1 from "figma:asset/5eae5eaf1e2b04030b84ac8c31febd9883ea4037.png";

/**
 * NPC 静态配置
 */
export interface NPCConfig {
  /** NPC 唯一标识符 */
  id: string;
  
  /** NPC 姓名 */
  name: string;
  
  /** 头像 URL 或资源路径 */
  avatar: string;
  
  /** 职业/角色 */
  role: string;
  
  /** 简短描述 */
  bio: string;
  
  /** 标签（可选，用于筛选和分类） */
  tags?: string[];
  
  /** 默认好感度情绪（可选） */
  default_sentiment?: string;
}

/**
 * NPC 注册表
 * 
 * 🔥 新增 NPC 时，在这里添加配置
 */
export const NPC_REGISTRY: Record<string, NPCConfig> = {
  // ==================== Demo 故事 NPC ====================
  
  /**
   * 肥棠 - 掘金者酒吧保镖
   */
  'npc_fatty_tang': {
    id: 'npc_fatty_tang',
    name: '肥棠',
    avatar: imgImageNpc,
    role: '保镖',
    bio: '掘金者酒吧的保镖，身材魁梧，看起来不好惹。据说以前是地下拳击手。',
    tags: ['保镖', '肌肉', '危险'],
    default_sentiment: '警惕'
  },
  
  /**
   * 小雪 - 掘金者酒吧酒保
   */
  'npc_xiaoxue': {
    id: 'npc_xiaoxue',
    name: '小雪',
    avatar: imgImageKiraAvatar,
    role: '酒保',
    bio: '掘金者酒吧的酒保，年轻女性，看起来有心事。似乎知道一些秘密。',
    tags: ['酒保', '知情者', '紧张'],
    default_sentiment: '紧张'
  },
  
  // ==================== 大写兼容（向后兼容旧数据）====================
  
  'NPC_FAT_TANG': {
    id: 'NPC_FAT_TANG',
    name: '肥棠',
    avatar: imgImageNpc,
    role: '保镖',
    bio: '掘金者酒吧的保镖，身材魁梧，看起来不好惹。',
    tags: ['保镖'],
    default_sentiment: '警惕'
  },
  
  'NPC_XIAO_XUE': {
    id: 'NPC_XIAO_XUE',
    name: '小雪',
    avatar: imgImageKiraAvatar,
    role: '酒保',
    bio: '掘金者酒吧的酒保。',
    tags: ['酒保'],
    default_sentiment: '紧张'
  },
  
  // ==================== 模板 NPC ====================
  
  'NPC-001': {
    id: 'NPC-001',
    name: '神秘人',
    avatar: imgImagePlayer,
    role: '未知',
    bio: '身份不明的神秘人物。',
    tags: ['神秘'],
    default_sentiment: '中立'
  },
  
  // ==================== 预留位置（可扩展）====================
  
  // 示例：零号中介
  // 'npc_broker_zero': {
  //   id: 'npc_broker_zero',
  //   name: '零号中介',
  //   avatar: imgImagePlayer1,
  //   role: '信息中介',
  //   bio: '地下世界的信息贩子，总能找到你需要的东西。',
  //   tags: ['中介', '信息', '可靠'],
  //   default_sentiment: '中立'
  // },
};

/**
 * 获取 NPC 配置
 * 
 * @param npcId - NPC ID
 * @returns NPC 配置对象，如果不存在则返回 null
 */
export function getNPCConfig(npcId: string): NPCConfig | null {
  return NPC_REGISTRY[npcId] || null;
}

/**
 * 检查 NPC 是否已注册
 * 
 * @param npcId - NPC ID
 * @returns 是否已注册
 */
export function hasNPCConfig(npcId: string): boolean {
  return npcId in NPC_REGISTRY;
}

/**
 * 获取所有已注册的 NPC ID
 * 
 * @returns NPC ID 数组
 */
export function getAllNPCIds(): string[] {
  return Object.keys(NPC_REGISTRY);
}

/**
 * 按标签筛选 NPC
 * 
 * @param tag - 标签
 * @returns 符合条件的 NPC 配置数组
 */
export function getNPCsByTag(tag: string): NPCConfig[] {
  return Object.values(NPC_REGISTRY).filter(npc => 
    npc.tags?.includes(tag)
  );
}

/**
 * 按角色筛选 NPC
 * 
 * @param role - 角色
 * @returns 符合条件的 NPC 配置数组
 */
export function getNPCsByRole(role: string): NPCConfig[] {
  return Object.values(NPC_REGISTRY).filter(npc => 
    npc.role === role
  );
}

/**
 * 获取 NPC 头像
 * 
 * @param npcId - NPC ID
 * @returns 头像 URL，如果存在则返回默认头像
 */
export function getNPCAvatar(npcId: string): string {
  const config = getNPCConfig(npcId);
  
  if (config?.avatar) {
    return config.avatar;
  }
  
  // 降级：使用动态生成（如果有 avatar-generator）
  console.warn(`[NPC Registry] NPC "${npcId}" 未注册，使用默认头像`);
  return imgImageNpc; // 默认头像
}

/**
 * 创建默认的 NPC 配置（用于快速原型）
 * 
 * @param npcId - NPC ID
 * @param name - NPC 名称
 * @returns 默认配置
 */
export function createDefaultNPCConfig(
  npcId: string, 
  name: string
): NPCConfig {
  return {
    id: npcId,
    name: name,
    avatar: imgImageNpc,
    role: '未知',
    bio: `${name}的详细信息尚未录入。`,
    tags: [],
    default_sentiment: '中立'
  };
}