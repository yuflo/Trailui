/**
 * Story Data Access - Mock Implementation
 * 
 * 故事数据访问 - Mock实现
 * Demo阶段从demo-story-map.data.ts读取
 * 上线后替换为ApiStoryDataAccess
 */

import type { IStoryDataAccess } from '../../../types/data-access.types';
import type { Story, SceneData } from '../../../types';
import { demoStoryMap } from '../../../data/hong-kong/demo-story-map.data';

/**
 * 故事数据访问Mock实现类
 * 
 * @note Demo实现 - 从静态demo-story-map.data.ts读取
 */
export class StoryDataAccessMock implements IStoryDataAccess {
  /**
   * 根据故事ID获取故事数据
   * 
   * @param storyId 故事ID
   * @returns 故事数据或null
   */
  async getStoryById(storyId: string): Promise<Story | null> {
    const story = demoStoryMap[storyId];
    
    if (!story) {
      console.log(`[StoryDataAccessMock] Story not found: ${storyId}`);
      return null;
    }
    
    console.log(`[StoryDataAccessMock] Loaded story: ${story.meta.title}`);
    return story;
  }
  
  /**
   * 获取所有故事
   * 
   * @returns 故事数组
   */
  async getAllStories(): Promise<Story[]> {
    const stories = Object.values(demoStoryMap);
    console.log(`[StoryDataAccessMock] Returning ${stories.length} stories`);
    return stories;
  }
  
  /**
   * 根据场景ID获取场景数据
   * 
   * @param storyId 故事ID
   * @param sceneId 场景ID
   * @returns 场景数据或null
   */
  async getSceneById(storyId: string, sceneId: string): Promise<SceneData | null> {
    const story = demoStoryMap[storyId];
    
    if (!story) {
      console.log(`[StoryDataAccessMock] Story not found: ${storyId}`);
      return null;
    }
    
    const scene = story.scenes[sceneId];
    
    if (!scene) {
      console.log(`[StoryDataAccessMock] Scene not found: ${sceneId} in story: ${storyId}`);
      return null;
    }
    
    console.log(`[StoryDataAccessMock] Loaded scene: ${scene.title}`);
    return scene;
  }
}
