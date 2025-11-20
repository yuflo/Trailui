/**
 * NPC 数据迁移工具
 * 
 * 用于将旧的 Scenario 数据迁移到新的分层架构
 * 
 * 迁移步骤：
 * 1. 扫描所有 Scenario 数据中的 NPC
 * 2. 检查哪些 NPC 已在 Registry 中注册
 * 3. 为未注册的 NPC 生成默认配置
 * 4. 输出迁移报告
 */

import type { NPCEntity, GameResponse } from '../../types';
import { getNPCConfig, createDefaultNPCConfig, type NPCConfig } from '../../data/hong-kong/npcs';

/**
 * 迁移报告
 */
export interface MigrationReport {
  /** 扫描的场景数量 */
  scenesScanned: number;
  
  /** 发现的 NPC 总数 */
  totalNPCs: number;
  
  /** 已注册的 NPC */
  registeredNPCs: string[];
  
  /** 未注册的 NPC */
  unregisteredNPCs: string[];
  
  /** 为未注册 NPC 生成的配置 */
  generatedConfigs: NPCConfig[];
}

/**
 * 扫描 Scenario 中的所有 NPC
 * 
 * @param scenarios - 场景数据数组
 * @returns 迁移报告
 */
export function scanNPCsInScenarios(scenarios: GameResponse[]): MigrationReport {
  const allNPCs = new Set<string>();
  const registeredNPCs: string[] = [];
  const unregisteredNPCs: string[] = [];
  const generatedConfigs: NPCConfig[] = [];
  
  // 1. 扫描所有场景，收集 NPC ID
  scenarios.forEach(scenario => {
    scenario.dynamic_view.involved_entities.forEach(npc => {
      allNPCs.add(npc.id);
    });
  });
  
  // 2. 检查每个 NPC 是否已注册
  allNPCs.forEach(npcId => {
    const config = getNPCConfig(npcId);
    
    if (config) {
      registeredNPCs.push(npcId);
    } else {
      unregisteredNPCs.push(npcId);
      
      // 从 Scenario 中找到这个 NPC 的名称
      const npcData = findNPCInScenarios(npcId, scenarios);
      if (npcData) {
        // 生成默认配置
        const defaultConfig = createDefaultNPCConfig(npcId, npcData.name);
        generatedConfigs.push(defaultConfig);
      }
    }
  });
  
  return {
    scenesScanned: scenarios.length,
    totalNPCs: allNPCs.size,
    registeredNPCs,
    unregisteredNPCs,
    generatedConfigs
  };
}

/**
 * 在场景中查找 NPC 数据
 * 
 * @param npcId - NPC ID
 * @param scenarios - 场景数据数组
 * @returns NPC 数据，如果未找到则返回 null
 */
function findNPCInScenarios(npcId: string, scenarios: GameResponse[]): NPCEntity | null {
  for (const scenario of scenarios) {
    const npc = scenario.dynamic_view.involved_entities.find(e => e.id === npcId);
    if (npc) {
      return npc;
    }
  }
  return null;
}

/**
 * 打印迁移报告
 * 
 * @param report - 迁移报告
 */
export function printMigrationReport(report: MigrationReport): void {
  console.log('\n========================================');
  console.log('📊 NPC 数据迁移报告');
  console.log('========================================\n');
  
  console.log(`✅ 扫描场景数量: ${report.scenesScanned}`);
  console.log(`✅ 发现 NPC 总数: ${report.totalNPCs}`);
  console.log(`✅ 已注册 NPC: ${report.registeredNPCs.length}`);
  console.log(`⚠️  未注册 NPC: ${report.unregisteredNPCs.length}\n`);
  
  if (report.registeredNPCs.length > 0) {
    console.log('已注册的 NPC:');
    report.registeredNPCs.forEach(id => {
      const config = getNPCConfig(id);
      console.log(`  ✅ ${id} - ${config?.name} (${config?.role})`);
    });
    console.log('');
  }
  
  if (report.unregisteredNPCs.length > 0) {
    console.log('⚠️  未注册的 NPC:');
    report.unregisteredNPCs.forEach(id => {
      console.log(`  ❌ ${id}`);
    });
    console.log('');
    
    console.log('🔧 建议添加到 npc-registry.data.ts:');
    console.log('----------------------------------------');
    report.generatedConfigs.forEach(config => {
      console.log(`'${config.id}': {`);
      console.log(`  id: '${config.id}',`);
      console.log(`  name: '${config.name}',`);
      console.log(`  avatar: imgImageNpc, // 🔥 请替换为实际头像`);
      console.log(`  role: '${config.role}',`);
      console.log(`  bio: '${config.bio}',`);
      console.log(`  tags: [],`);
      console.log(`  default_sentiment: '${config.default_sentiment}'`);
      console.log(`},\n`);
    });
  }
  
  console.log('========================================\n');
}

/**
 * 生成迁移配置代码
 * 
 * @param report - 迁移报告
 * @returns TypeScript 代码字符串
 */
export function generateMigrationCode(report: MigrationReport): string {
  if (report.generatedConfigs.length === 0) {
    return '// ✅ 所有 NPC 已注册，无需迁移';
  }
  
  let code = '// 🔥 将以下代码添加到 /data/hong-kong/npcs/npc-registry.data.ts 中\n\n';
  
  report.generatedConfigs.forEach(config => {
    code += `'${config.id}': {\n`;
    code += `  id: '${config.id}',\n`;
    code += `  name: '${config.name}',\n`;
    code += `  avatar: imgImageNpc, // 🔥 请替换为实际头像\n`;
    code += `  role: '${config.role}',\n`;
    code += `  bio: '${config.bio}',\n`;
    code += `  tags: [],\n`;
    code += `  default_sentiment: '${config.default_sentiment}'\n`;
    code += `},\n\n`;
  });
  
  return code;
}

/**
 * NPC 数据迁移器单例
 */
export const NPCDataMigrator = {
  scanNPCsInScenarios,
  printMigrationReport,
  generateMigrationCode
};
