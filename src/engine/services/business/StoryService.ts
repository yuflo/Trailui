/**
 * StoryService - 故事业务服务（无状态）
 * 
 * 重构后的版本：
 * - 完全无状态
 * - 管理故事实例的生命周期
 * - 场景切换和进度管理
 */

import { InstanceCacheManager } from '../../cache/InstanceCacheManager';
import { DataAccessFactory } from '../../data-access/DataAccessFactory';
import { MockSceneProvider, MockNPCProvider } from './MockDataProvider'; // 🔥 导入 mock 数据
import type { StoryInstance, SceneInstance } from '../../../types/instance.types';
import type { StoryConfig, ScenarioSnapshot } from '../../../types';

/**
 * 故事服务
 */
export class StoryService {
  // ============================================
  // 🔥 从 StoryServiceImpl 迁移的静态数据加载方法
  // ============================================
  
  /**
   * 获取所有可用故事的配置
   * 🔥 从 StoryServiceImpl 迁移
   */
  static async getAllStories(): Promise<StoryConfig[]> {
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const stories = await storyDataAccess.getAllStories();
    
    if (stories.length === 0) {
      return [];
    }
    
    // 转换为 StoryConfig 格式
    const configs = stories.map(story => ({
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      visual_archetype: 'tense-urban' as const,
      initial_scenario_id: story.meta.scenes[0]
    }));
    
    console.log(`[StoryService] Loaded ${configs.length} stories via DataAccess`);
    
    return configs;
  }
  
  /**
   * 获取指定故事的完整数据
   * 🔥 从 StoryServiceImpl 迁移
   */
  static async getStoryData(storyId: string): Promise<{
    config: StoryConfig;
    scenarios: ScenarioSnapshot[];
  }> {
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const story = await storyDataAccess.getStoryById(storyId);
    
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }
    
    // 构建 config
    const config: StoryConfig = {
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      visual_archetype: 'tense-urban',
      initial_scenario_id: story.meta.scenes[0]
    };
    
    // 从每个 scene 获取 interactive_sequence 作为 scenario
    const scenarios: ScenarioSnapshot[] = story.meta.scenes.map(sceneId => {
      const scene = story.scenes[sceneId];
      return scene.interactive_sequence;
    });
    
    console.log(`[StoryService] Loaded story via DataAccess: ${config.title} with ${scenarios.length} scenes`);
    
    return {
      config,
      scenarios,
    };
  }
  
  /**
   * 获取指定故事的某个回合场景
   * 🔥 从 StoryServiceImpl 迁移
   */
  static async getScenarioTurn(storyId: string, turnIndex: number): Promise<ScenarioSnapshot | null> {
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const story = await storyDataAccess.getStoryById(storyId);
    
    if (!story) {
      return null;
    }
    
    // Demo 阶段：turnIndex 映射到 scene index
    const sceneId = story.meta.scenes[turnIndex];
    if (!sceneId) {
      return null;
    }
    
    const scene = story.scenes[sceneId];
    if (!scene) {
      return null;
    }
    
    return scene.interactive_sequence;
  }
  
  /**
   * 通过线索开启故事（远场探索）
   * 🔥 从 StoryServiceImpl 迁移
   * Demo阶段：所有线索都指向demo-story
   */
  static async openStoryByClue(clueId: string): Promise<{
    config: StoryConfig;
    entryScene: ScenarioSnapshot;
  }> {
    const storyId = 'demo-story'; // Demo 阶段固定
    
    console.log(`[StoryService] Opening story by clue: ${clueId} -> ${storyId}`);
    
    const { config, scenarios } = await this.getStoryData(storyId);
    
    if (scenarios.length === 0) {
      throw new Error(`Story has no scenarios: ${storyId}`);
    }
    
    // 返回第一个场景作为入口场景
    const entryScene = scenarios[0];
    
    console.log(`[StoryService] Story opened: ${config.title}`);
    
    return {
      config,
      entryScene
    };
  }
  
  /**
   * 获取故事的入口场景
   * 🔥 从 StoryServiceImpl 迁移
   */
  static async getEntryScene(storyId: string): Promise<ScenarioSnapshot> {
    const storyDataAccess = DataAccessFactory.createStoryDataAccess();
    const story = await storyDataAccess.getStoryById(storyId);
    
    if (!story || story.meta.scenes.length === 0) {
      throw new Error(`Story has no scenarios: ${storyId}`);
    }
    
    const firstSceneId = story.meta.scenes[0];
    const firstScene = story.scenes[firstSceneId];
    
    return firstScene.interactive_sequence;
  }
  
  // ============================================
  // 故事实例管理方法（原有方法）
  // ============================================
  
  /**
   * 🔥 启动故事（进入第一个场景）
   */
  static startStory(storyInstanceId: string): void {
    const instance = InstanceCacheManager.getStoryInstance(storyInstanceId);
    if (!instance) {
      throw new Error(`[StoryService] Story instance not found: ${storyInstanceId}`);
    }
    
    if (instance.status !== 'not_started') {
      console.warn(`[StoryService] Story already started: ${storyInstanceId}`);
      return;
    }
    
    // 更新故事状态
    InstanceCacheManager.updateStoryInstance(storyInstanceId, {
      status: 'in_progress',
      started_at: Date.now(),
      last_played_at: Date.now()
    });
    
    // 进入第一个场景
    if (instance.scene_sequence.length > 0) {
      const firstSceneId = instance.scene_sequence[0];
      this.enterScene(storyInstanceId, firstSceneId);
    }
    
    console.log(`[StoryService] ✅ Started story: ${storyInstanceId}`);
  }
  
  /**
   * 进入场景
   * @param storyInstanceId 故事实例ID
   * @param sceneTemplateId 场景模板ID
   * @returns 场景实例ID
   */
  static enterScene(storyInstanceId: string, sceneTemplateId: string): string {
    const storyInstance = InstanceCacheManager.getStoryInstance(storyInstanceId);
    if (!storyInstance) {
      throw new Error(`[StoryService] Story instance not found: ${storyInstanceId}`);
    }
    
    // 获取场景模板
    const sceneTemplate = MockSceneProvider.getSceneTemplate(sceneTemplateId);
    
    // 1. 创建场景实例（如果存在）
    const sceneInstanceId = InstanceCacheManager.createSceneInstance(
      storyInstanceId,
      sceneTemplate
    );
    
    // 2. 创建场景中的NPC实例
    const sceneInstance = InstanceCacheManager.getSceneInstance(sceneInstanceId);
    if (sceneInstance) {
      for (const npcTemplateId of sceneInstance.npc_instance_ids) {
        // 从实例ID提取NPC模板ID
        const npcId = npcTemplateId.split('__').pop();
        if (npcId) {
          // 获取NPC模板
          const npcTemplate = MockNPCProvider.getNPCTemplate(npcId);
          
          // ✅ 修复：检查模板是否存在
          if (npcTemplate) {
            InstanceCacheManager.createNPCInstance(storyInstanceId, npcTemplate);
          } else {
            console.warn(`[StoryService.enterScene] ⚠️ NPC template not found: ${npcId}, skipping...`);
          }
        }
      }
    }
    
    // 3. 更新场景状态
    InstanceCacheManager.updateSceneInstance(sceneInstanceId, {
      status: 'in_progress',
      entered_at: Date.now()
    });
    
    // 4. 计算场景索引（从 scene_sequence 中查找）
    const sceneIndex = storyInstance.scene_sequence.findIndex(id => id === sceneTemplateId);
    
    // 5. 更新故事状态（同时更新 current_scene_id 和 current_scene_index）
    InstanceCacheManager.updateStoryInstance(storyInstanceId, {
      current_scene_id: sceneInstanceId,
      current_scene_index: sceneIndex >= 0 ? sceneIndex : storyInstance.current_scene_index, // 如果找不到索引，保持原值
      last_played_at: Date.now()
    });
    
    console.log(`[StoryService] ✅ Entered scene: ${sceneInstanceId}`, {
      sceneTemplateId,
      sceneIndex,
      current_scene_id: sceneInstanceId
    });
    return sceneInstanceId;
  }
  
  /**
   * 🔥 完成场景
   */
  static completeScene(storyInstanceId: string, sceneTemplateId: string): void {
    const storyInstance = InstanceCacheManager.getStoryInstance(storyInstanceId);
    if (!storyInstance) {
      throw new Error(`[StoryService] Story instance not found: ${storyInstanceId}`);
    }
    
    const sceneInstanceId = `${storyInstanceId}__${sceneTemplateId}`;
    
    // 1. 更新场景状态
    InstanceCacheManager.updateSceneInstance(sceneInstanceId, {
      status: 'completed',
      completed_at: Date.now()
    });
    
    // 2. 更新故事进度
    const completedScenes = [...storyInstance.completed_scenes];
    if (!completedScenes.includes(sceneTemplateId)) {
      completedScenes.push(sceneTemplateId);
    }
    
    const progress = Math.round(
      (completedScenes.length / storyInstance.scene_sequence.length) * 100
    );
    
    InstanceCacheManager.updateStoryInstance(storyInstanceId, {
      completed_scenes: completedScenes,
      progress_percentage: progress
    });
    
    console.log(`[StoryService] ✅ Completed scene: ${sceneInstanceId}, progress: ${progress}%`);
  }
  
  /**
   * 🔥 完成故事
   */
  static completeStory(storyInstanceId: string): void {
    console.log(`[StoryService.completeStory] 🎉 Completing story: ${storyInstanceId}`);
    
    const storyInstance = InstanceCacheManager.getStoryInstance(storyInstanceId);
    if (storyInstance) {
      console.log(`[StoryService.completeStory] 📊 Story state BEFORE completion:`, {
        status: storyInstance.status,
        progress: storyInstance.progress_percentage,
        completed_scenes: storyInstance.completed_scenes,
        current_scene_id: storyInstance.current_scene_id
      });
    }
    
    if (!storyInstance) {
      throw new Error(`[StoryService] Story instance not found: ${storyInstanceId}`);
    }
    
    InstanceCacheManager.updateStoryInstance(storyInstanceId, {
      status: 'completed',
      completed_at: Date.now(),
      progress_percentage: 100,
      // 🔥 FIX: 将所有场景标记为已完成
      completed_scenes: storyInstance.scene_sequence,
      // 🔥 FIX: 清空当前场景（故事已完成，不再有"当前场景"）
      current_scene_id: null
    });
    
    const updatedInstance = InstanceCacheManager.getStoryInstance(storyInstanceId);
    if (updatedInstance) {
      console.log(`[StoryService.completeStory] 📊 Story state AFTER completion:`, {
        status: updatedInstance.status,
        progress: updatedInstance.progress_percentage,
        completed_at: updatedInstance.completed_at,
        completed_scenes: updatedInstance.completed_scenes,
        current_scene_id: updatedInstance.current_scene_id
      });
    }
    
    console.log(`[StoryService.completeStory] ✅ Story completion saved to InstanceCacheManager`);
  }
  
  /**
   * 获取故事实例
   */
  static getStoryInstance(instanceId: string): StoryInstance | null {
    return InstanceCacheManager.getStoryInstance(instanceId);
  }
  
  /**
   * 获取当前场景
   */
  static getCurrentScene(storyInstanceId: string): SceneInstance | null {
    const instance = InstanceCacheManager.getStoryInstance(storyInstanceId);
    if (!instance || !instance.current_scene_id) {
      return null;
    }
    
    return InstanceCacheManager.getSceneInstance(instance.current_scene_id);
  }
  
  /**
   * 获取故事的所有场景
   */
  static getStoryScenes(storyInstanceId: string): SceneInstance[] {
    const instance = InstanceCacheManager.getStoryInstance(storyInstanceId);
    if (!instance) {
      return [];
    }
    
    return instance.scene_sequence
      .map(sceneId => {
        const sceneInstanceId = `${storyInstanceId}__${sceneId}`;
        return InstanceCacheManager.getSceneInstance(sceneInstanceId);
      })
      .filter((scene): scene is SceneInstance => scene !== null);
  }
  
  /**
   * 继续故事（恢复上次进度）
   */
  static resumeStory(storyInstanceId: string): void {
    InstanceCacheManager.updateStoryInstance(storyInstanceId, {
      last_played_at: Date.now()
    });
    
    console.log(`[StoryService] ✅ Resumed story: ${storyInstanceId}`);
  }
}