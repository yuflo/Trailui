/**
 * Freedom Mirror Service Implementation
 * 
 * 自由镜服务实现
 * 负责剧情消息流的播放管理
 * 用于"剧情/冲突"混合模式的自动剧情播放
 * 
 * @note 使用DataAccess接口，Demo阶段用Mock实现，上线后切换为API实现
 */

import type { 
  IFreedomMirrorService, 
  ScenePlot, 
  PlotUnit,
  IStoryDataAccess 
} from '../../../types';

/**
 * 自由镜服务实现类
 * 
 * 通过DataAccess获取场景数据并循环播放
 */
export class FreedomMirrorServiceImpl implements IFreedomMirrorService {
  /**
   * 构造函数 - 依赖注入DataAccess
   * @param storyDataAccess 故事数据访问接口
   */
  constructor(private storyDataAccess: IStoryDataAccess) {}
  /** 当前加载的剧本 */
  private currentPlot: ScenePlot | null = null;
  
  /** 当前播放索引 */
  private currentIndex: number = 0;
  
  /** 是否启用循环模式 */
  private loopMode: boolean = true;
  
  /** 当前scene ID（用于循环加载） */
  private currentSceneId: string | null = null;
  
  /**
   * 注册故事的剧本数据（保留兼容性）
   * Demo阶段不再使用，改为从story-map加载
   */
  registerStoryPlot(storyId: string, plot: ScenePlot): void {
    console.warn('[FreedomMirrorService] registerStoryPlot is deprecated, use story-map instead');
  }
  
  /**
   * 加载指定场景的剧本（异步方法）
   * 
   * @param sceneId 场景ID（格式: scene-a, scene-b）
   * @returns 场景剧本数据
   * @note ✅ 使用DataAccess获取场景数据
   */
  async loadScenePlot(sceneId: string): Promise<ScenePlot> {
    // ✅ 使用DataAccess加载scene
    const scene = await this.storyDataAccess.getSceneById('demo-story', sceneId);
    
    if (!scene) {
      console.warn(`[FreedomMirrorService] Scene not found: ${sceneId}`);
      return {
        id: `${sceneId}_empty`,
        units: [],
      };
    }
    
    // 保存当前sceneId用于循环
    this.currentSceneId = sceneId;
    
    // 从narrative_sequence构建剧本
    const plot: ScenePlot = {
      id: sceneId,
      units: scene.narrative_sequence,
    };
    
    // 加载剧本并重置播放位置
    this.currentPlot = plot;
    this.currentIndex = 0;
    
    console.log(`[FreedomMirrorService] Loaded narrative sequence via DataAccess for ${sceneId}: ${plot.units.length} units (loop enabled)`);
    
    return plot;
  }
  
  /**
   * 获取下一个剧本单元（循环播放）
   * 
   * @returns 下一个剧本单元，如果没有则返回null
   * @note Demo功能：按顺序返回剧本单元，播放完毕后循环重播
   */
  getNextPlotUnit(): PlotUnit | null {
    if (!this.currentPlot || this.currentPlot.units.length === 0) {
      return null;
    }
    
    const units = this.currentPlot.units;
    
    // 检查是否已播放完毕
    if (this.currentIndex >= units.length) {
      if (this.loopMode) {
        // 循环模式：重新开始
        this.currentIndex = 0;
      } else {
        // 非循环模式：返回null
        return null;
      }
    }
    
    // 获取当前单元并递增索引
    const unit = units[this.currentIndex];
    this.currentIndex++;
    
    return unit;
  }
  
  /**
   * 检查是否还有更多剧本单元
   * 
   * @returns 是否还有未播放的单元
   */
  hasMore(): boolean {
    if (!this.currentPlot) {
      return false;
    }
    
    const units = this.currentPlot.units;
    
    // 如果启用循环，总是有更多内容
    if (this.loopMode) {
      return units.length > 0;
    }
    
    // 非循环模式：检查是否还有未播放的单元
    return this.currentIndex < units.length;
  }
  
  /**
   * 重置播放位置到开头
   * 
   * @note Demo功能：将播放位置重置，用于重新播放或切换故事
   */
  resetPlayback(): void {
    this.currentIndex = 0;
  }
  
  /**
   * 设置循环模式
   * 
   * @param loop 是否启用循环播放
   * @note Demo功能：控制播放完毕后是否自动重新开始
   */
  setLoopMode(loop: boolean): void {
    this.loopMode = loop;
  }
  
  /**
   * 获取当前播放进度
   * 
   * @returns 当前索引和总数
   */
  getPlaybackProgress(): { current: number; total: number } {
    if (!this.currentPlot) {
      return { current: 0, total: 0 };
    }
    
    return {
      current: this.currentIndex,
      total: this.currentPlot.units.length,
    };
  }
}
