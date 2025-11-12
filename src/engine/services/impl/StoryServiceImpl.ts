/**
 * Story Service Implementation
 * 
 * 故事服务实现
 * 使用DataAccess接口，Demo阶段用Mock实现，上线后切换为API实现
 */

import type { 
  IStoryService, 
  StoryConfig, 
  ScenarioSnapshot,
  IStoryDataAccess 
} from '../../../types';

/**
 * 故事服务实现类
 */
export class StoryServiceImpl implements IStoryService {
  /**
   * 构造函数 - 依赖注入DataAccess
   * @param storyDataAccess 故事数据访问接口
   */
  constructor(private storyDataAccess: IStoryDataAccess) {}
  /**
   * 获取所有可用故事的配置
   * ✅ 使用DataAccess获取所有故事
   */
  async getAllStories(): Promise<StoryConfig[]> {
    // ✅ 使用DataAccess获取所有故事
    const stories = await this.storyDataAccess.getAllStories();
    
    if (stories.length === 0) {
      return [];
    }
    
    // 转换为StoryConfig格式
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
   * ✅ 使用DataAccess加载故事数据
   */
  async getStoryData(storyId: string): Promise<{
    config: StoryConfig;
    scenarios: ScenarioSnapshot[];
  }> {
    // ✅ 使用DataAccess获取故事
    const story = await this.storyDataAccess.getStoryById(storyId);
    
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }
    
    // 构建config
    const config: StoryConfig = {
      story_id: story.meta.story_id,
      title: story.meta.title,
      description: story.meta.description,
      visual_archetype: 'tense-urban',
      initial_scenario_id: story.meta.scenes[0]
    };
    
    // 从每个scene获取interactive_sequence作为scenario
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
   * ✅ 使用DataAccess获取场景数据
   */
  async getScenarioTurn(storyId: string, turnIndex: number): Promise<ScenarioSnapshot | null> {
    // ✅ 使用DataAccess获取故事
    const story = await this.storyDataAccess.getStoryById(storyId);
    
    if (!story) {
      return null;
    }
    
    // Demo阶段：turnIndex映射到scene index
    const sceneId = story.meta.scenes[0]; // 暂时返回第一个场景
    const scene = story.scenes[sceneId];
    
    if (!scene) {
      return null;
    }
    
    return scene.interactive_sequence;
  }
  
  /**
   * 通过线索开启故事（远场探索）
   * Demo阶段：所有线索都指向demo-story
   */
  async openStoryByClue(clueId: string): Promise<{
    config: StoryConfig;
    entryScene: ScenarioSnapshot;
  }> {
    const storyId = 'demo-story'; // Demo阶段固定
    
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
   * ✅ 使用DataAccess获取故事数据
   */
  async getEntryScene(storyId: string): Promise<ScenarioSnapshot> {
    // ✅ 使用DataAccess获取故事
    const story = await this.storyDataAccess.getStoryById(storyId);
    
    if (!story || story.meta.scenes.length === 0) {
      throw new Error(`Story has no scenarios: ${storyId}`);
    }
    
    const firstSceneId = story.meta.scenes[0];
    const firstScene = story.scenes[firstSceneId];
    
    return firstScene.interactive_sequence;
  }
}
