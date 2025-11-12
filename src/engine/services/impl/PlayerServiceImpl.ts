/**
 * Player Service Implementation
 * 
 * 玩家服务实现
 * 负责玩家状态的管理和更新
 * 
 * @note 使用DataAccess接口，Demo阶段用Mock实现，上线后切换为API实现
 */

import type { 
  IPlayerService, 
  IPlayerDataAccess 
} from '../../../types';
import type { 
  PlayerStatusArea, 
  ScenarioSnapshot, 
  StatusEffect, 
  FinancialPowerLevel 
} from '../../../types';

/**
 * 玩家服务实现类
 * 
 * 通过依赖注入使用DataAccess接口
 * 维护内存中的玩家状态
 */
export class PlayerServiceImpl implements IPlayerService {
  private initialized = false;
  
  /**
   * 当前玩家状态（内存缓存）
   */
  private playerStatus: PlayerStatusArea | null = null;
  
  /**
   * 构造函数 - 依赖注入DataAccess
   * @param playerDataAccess 玩家数据访问接口
   */
  constructor(
    private playerDataAccess: IPlayerDataAccess
  ) {}
  
  /**
   * 初始化玩家状态
   * @param saveId 存档ID（可选）
   */
  async initialize(saveId?: string): Promise<void> {
    if (this.initialized && this.playerStatus) {
      console.log('[PlayerService] Already initialized, skipping');
      return;
    }
    
    try {
      // ✅ 使用DataAccess加载状态
      this.playerStatus = await this.playerDataAccess.loadStatus(saveId);
      this.initialized = true;
      
      console.log('[PlayerService] Initialized player status:', {
        location: this.playerStatus.current_location,
        vigor: `${this.playerStatus.vigor.value}/${this.playerStatus.vigor.max}`,
        clarity: `${this.playerStatus.clarity.value}/${this.playerStatus.clarity.max}`
      });
    } catch (error) {
      console.error('[PlayerService] Failed to initialize:', error);
      // Fallback: 使用默认状态
      this.playerStatus = await this.playerDataAccess.getDefaultStatus();
      this.initialized = true;
    }
  }
  
  /**
   * 获取当前玩家状态（只读）
   * @returns 状态的深拷贝
   */
  getStatus(): Readonly<PlayerStatusArea> {
    if (!this.playerStatus) {
      throw new Error('[PlayerService] Not initialized. Call initialize() first.');
    }
    
    // 返回深拷贝，防止外部修改
    return JSON.parse(JSON.stringify(this.playerStatus));
  }
  
  // ========== 数值更新方法 ==========
  
  /**
   * 更新体力
   */
  updateVigor(delta: number): void {
    this.ensureInitialized();
    
    const newValue = Math.max(
      0,
      Math.min(
        this.playerStatus!.vigor.max,
        this.playerStatus!.vigor.value + delta
      )
    );
    
    this.playerStatus!.vigor.value = newValue;
    console.log(`[PlayerService] Vigor updated: ${delta > 0 ? '+' : ''}${delta} → ${newValue}`);
  }
  
  /**
   * 更新心力
   */
  updateClarity(delta: number): void {
    this.ensureInitialized();
    
    const newValue = Math.max(
      0,
      Math.min(
        this.playerStatus!.clarity.max,
        this.playerStatus!.clarity.value + delta
      )
    );
    
    this.playerStatus!.clarity.value = newValue;
    console.log(`[PlayerService] Clarity updated: ${delta > 0 ? '+' : ''}${delta} → ${newValue}`);
  }
  
  /**
   * 设置体力最大值
   */
  setVigorMax(max: number): void {
    this.ensureInitialized();
    this.playerStatus!.vigor.max = Math.max(1, max);
    // 当前值不超过新最大值
    this.playerStatus!.vigor.value = Math.min(
      this.playerStatus!.vigor.value,
      max
    );
    console.log(`[PlayerService] Vigor max set to: ${max}`);
  }
  
  /**
   * 设置心力最大值
   */
  setClarityMax(max: number): void {
    this.ensureInitialized();
    this.playerStatus!.clarity.max = Math.max(1, max);
    // 当前值不超过新最大值
    this.playerStatus!.clarity.value = Math.min(
      this.playerStatus!.clarity.value,
      max
    );
    console.log(`[PlayerService] Clarity max set to: ${max}`);
  }
  
  // ========== 位置和时间 ==========
  
  /**
   * 更新当前位置
   */
  updateLocation(location: string): void {
    this.ensureInitialized();
    this.playerStatus!.current_location = location;
    console.log(`[PlayerService] Location updated: ${location}`);
  }
  
  /**
   * 更新游戏时间
   */
  updateTime(time: string): void {
    this.ensureInitialized();
    this.playerStatus!.world_time = time;
    console.log(`[PlayerService] Time updated: ${time}`);
  }
  
  // ========== 财力和信用 ==========
  
  /**
   * 更新财力等级
   */
  updateFinancialPower(level: FinancialPowerLevel): void {
    this.ensureInitialized();
    this.playerStatus!.financial_power = level;
    console.log(`[PlayerService] Financial power updated: ${level}`);
  }
  
  /**
   * 更新信用值
   */
  updateCredit(delta: number): void {
    this.ensureInitialized();
    
    const newValue = Math.max(
      0,
      Math.min(
        100,
        this.playerStatus!.credit.value + delta
      )
    );
    
    this.playerStatus!.credit.value = newValue;
    console.log(`[PlayerService] Credit updated: ${delta > 0 ? '+' : ''}${delta} → ${newValue}`);
  }
  
  // ========== 状态效果管理 ==========
  
  /**
   * 添加状态效果
   */
  addEffect(effect: StatusEffect): void {
    this.ensureInitialized();
    
    // 移除同名效果（如果存在）
    this.removeEffect(effect.name);
    
    // 添加新效果
    this.playerStatus!.active_effects.push({ ...effect });
    console.log(`[PlayerService] Effect added: ${effect.name}`);
  }
  
  /**
   * 移除状态效果
   */
  removeEffect(effectName: string): void {
    this.ensureInitialized();
    
    const index = this.playerStatus!.active_effects.findIndex(
      e => e.name === effectName
    );
    
    if (index !== -1) {
      this.playerStatus!.active_effects.splice(index, 1);
      console.log(`[PlayerService] Effect removed: ${effectName}`);
    }
  }
  
  /**
   * 清除所有状态效果
   */
  clearEffects(): void {
    this.ensureInitialized();
    const count = this.playerStatus!.active_effects.length;
    this.playerStatus!.active_effects = [];
    console.log(`[PlayerService] Cleared ${count} effects`);
  }
  
  /**
   * 检查是否有指定效果
   */
  hasEffect(effectName: string): boolean {
    this.ensureInitialized();
    return this.playerStatus!.active_effects.some(e => e.name === effectName);
  }
  
  // ========== 场景同步 ==========
  
  /**
   * 从场景快照同步玩家状态
   * @note 进入故事时调用
   */
  syncFromScenario(scenario: ScenarioSnapshot): void {
    this.ensureInitialized();
    
    // 深拷贝场景中的玩家状态
    this.playerStatus = JSON.parse(
      JSON.stringify(scenario.player_status_area)
    );
    
    console.log('[PlayerService] Synced from scenario:', {
      location: this.playerStatus.current_location,
      time: this.playerStatus.world_time
    });
  }
  
  /**
   * 将当前玩家状态应用到场景快照
   */
  applyToScenario(scenario: ScenarioSnapshot): ScenarioSnapshot {
    this.ensureInitialized();
    
    return {
      ...scenario,
      player_status_area: JSON.parse(JSON.stringify(this.playerStatus))
    };
  }
  
  // ========== 存档管理 ==========
  
  /**
   * 保存当前状态
   */
  async save(saveId?: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.playerDataAccess.saveStatus(this.playerStatus!, saveId);
      console.log(`[PlayerService] Status saved (saveId: ${saveId || 'default'})`);
    } catch (error) {
      console.error('[PlayerService] Failed to save:', error);
      throw error;
    }
  }
  
  /**
   * 加载存档
   */
  async load(saveId: string): Promise<void> {
    try {
      this.playerStatus = await this.playerDataAccess.loadStatus(saveId);
      this.initialized = true;
      console.log(`[PlayerService] Loaded save: ${saveId}`);
    } catch (error) {
      console.error('[PlayerService] Failed to load:', error);
      throw error;
    }
  }
  
  /**
   * 重置为默认状态
   */
  async reset(): Promise<void> {
    try {
      this.playerStatus = await this.playerDataAccess.getDefaultStatus();
      this.initialized = true;
      console.log('[PlayerService] Reset to default status');
    } catch (error) {
      console.error('[PlayerService] Failed to reset:', error);
      throw error;
    }
  }
  
  // ========== 私有辅助方法 ==========
  
  /**
   * 确保已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.playerStatus) {
      throw new Error('[PlayerService] Not initialized. Call initialize() first.');
    }
  }
}
