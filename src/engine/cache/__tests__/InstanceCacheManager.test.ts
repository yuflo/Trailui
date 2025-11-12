/**
 * InstanceCacheManager 单元测试
 * 
 * 验证：
 * 1. 深拷贝策略
 * 2. 实例隔离
 * 3. NPC实例独立性
 * 4. 数据不丢失
 */

import { InstanceCacheManager } from '../InstanceCacheManager';

describe('InstanceCacheManager - 数据层隔离测试', () => {
  beforeEach(() => {
    // 清空数据
    InstanceCacheManager.reset();
    InstanceCacheManager.initialize();
  });
  
  // ============================================
  // 测试1: 深拷贝验证
  // ============================================
  
  test('修改getStoryInstance返回值不影响缓存', () => {
    // 创建故事实例
    const instanceId = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_001',
      {
        story_id: 'test-story',
        title: '测试故事',
        description: '测试描述',
        genre: ['悬疑'],
        difficulty: 'easy',
        scene_sequence: ['scene-1', 'scene-2'],
        npc_ids: ['NPC_001']
      }
    );
    
    // 获取实例并修改
    const instance1 = InstanceCacheManager.getStoryInstance(instanceId);
    if (instance1) {
      instance1.progress_percentage = 999;
      instance1.story_data.title = 'MODIFIED';
    }
    
    // 再次获取
    const instance2 = InstanceCacheManager.getStoryInstance(instanceId);
    
    // 验证：缓存未被污染
    expect(instance2?.progress_percentage).toBe(0);
    expect(instance2?.story_data.title).toBe('测试故事');
  });
  
  // ============================================
  // 测试2: 实例隔离验证
  // ============================================
  
  test('追踪同一故事的不同线索创建独立实例', () => {
    // 创建第一个实例
    const instance1Id = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_004',
      {
        story_id: 'demo-story',
        title: '消失的快递员',
        description: '悬疑故事',
        genre: ['悬疑'],
        difficulty: 'medium',
        scene_sequence: ['scene-a', 'scene-b'],
        npc_ids: ['NPC_FEITANG']
      }
    );
    
    // 创建第二个实例（同一故事，不同线索）
    const instance2Id = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_005',
      {
        story_id: 'demo-story',
        title: '消失的快递员',
        description: '悬疑故事',
        genre: ['悬疑'],
        difficulty: 'medium',
        scene_sequence: ['scene-a', 'scene-b'],
        npc_ids: ['NPC_FEITANG']
      }
    );
    
    // 验证：不同的实例ID
    expect(instance1Id).toBe('demo-story__CLUE_004');
    expect(instance2Id).toBe('demo-story__CLUE_005');
    
    // 修改第一个实例
    InstanceCacheManager.updateStoryInstance(instance1Id, {
      progress_percentage: 50,
      status: 'in_progress'
    });
    
    // 获取两个实例
    const data1 = InstanceCacheManager.getStoryInstance(instance1Id);
    const data2 = InstanceCacheManager.getStoryInstance(instance2Id);
    
    // 验证：完全独立
    expect(data1?.progress_percentage).toBe(50);
    expect(data1?.status).toBe('in_progress');
    expect(data2?.progress_percentage).toBe(0);
    expect(data2?.status).toBe('not_started');
  });
  
  // ============================================
  // 测试3: NPC实例隔离验证
  // ============================================
  
  test('同一NPC在不同故事实例中独立', () => {
    // 创建两个故事实例
    const story1 = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_004',
      {
        story_id: 'demo-story',
        title: '故事1',
        description: '',
        genre: [],
        difficulty: 'easy',
        scene_sequence: [],
        npc_ids: ['NPC_FEITANG']
      }
    );
    
    const story2 = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_005',
      {
        story_id: 'demo-story',
        title: '故事2',
        description: '',
        genre: [],
        difficulty: 'easy',
        scene_sequence: [],
        npc_ids: ['NPC_FEITANG']
      }
    );
    
    // 创建两个NPC实例（同一NPC，不同故事实例）
    const npc1Id = InstanceCacheManager.createNPCInstance(story1, {
      npc_id: 'NPC_FEITANG',
      name: '肥棠',
      avatar_url: '/test.png',
      personality: {
        traits: ['粗鲁'],
        values: ['金钱'],
        speaking_style: '粗俗'
      },
      background: '测试',
      initial_relationship: 0
    });
    
    const npc2Id = InstanceCacheManager.createNPCInstance(story2, {
      npc_id: 'NPC_FEITANG',
      name: '肥棠',
      avatar_url: '/test.png',
      personality: {
        traits: ['粗鲁'],
        values: ['金钱'],
        speaking_style: '粗俗'
      },
      background: '测试',
      initial_relationship: 0
    });
    
    // 验证：不同的NPC实例ID
    expect(npc1Id).toBe('demo-story__CLUE_004__NPC_FEITANG');
    expect(npc2Id).toBe('demo-story__CLUE_005__NPC_FEITANG');
    
    // 修改第一个NPC的关系值
    InstanceCacheManager.updateNPCInstance(npc1Id, {
      relationship: -20
    });
    
    // 获取两个NPC实例
    const npcData1 = InstanceCacheManager.getNPCInstance(npc1Id);
    const npcData2 = InstanceCacheManager.getNPCInstance(npc2Id);
    
    // 验证：完全独立
    expect(npcData1?.current_state.relationship).toBe(-20);
    expect(npcData2?.current_state.relationship).toBe(0);
  });
  
  // ============================================
  // 测试4: 数据持久性验证
  // ============================================
  
  test('反复切换查看，数据不丢失', () => {
    // 创建两个故事实例
    const story1 = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_004',
      {
        story_id: 'demo-story',
        title: '故事1',
        description: '',
        genre: [],
        difficulty: 'easy',
        scene_sequence: [],
        npc_ids: []
      }
    );
    
    const story2 = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_005',
      {
        story_id: 'demo-story',
        title: '故事2',
        description: '',
        genre: [],
        difficulty: 'easy',
        scene_sequence: [],
        npc_ids: []
      }
    );
    
    // 设置不同的进度
    InstanceCacheManager.updateStoryInstance(story1, { progress_percentage: 50 });
    InstanceCacheManager.updateStoryInstance(story2, { progress_percentage: 30 });
    
    // 模拟反复切换查看
    for (let i = 0; i < 10; i++) {
      const data1 = InstanceCacheManager.getStoryInstance(story1);
      const data2 = InstanceCacheManager.getStoryInstance(story2);
      
      // 验证：数据始终正确
      expect(data1?.progress_percentage).toBe(50);
      expect(data2?.progress_percentage).toBe(30);
    }
  });
  
  // ============================================
  // 测试5: 数组深拷贝验证
  // ============================================
  
  test('修改返回数组不影响原始数据', () => {
    const instanceId = InstanceCacheManager.createStoryInstance(
      'test-player',
      'CLUE_001',
      {
        story_id: 'test-story',
        title: '测试',
        description: '',
        genre: ['悬疑', '动作'],
        difficulty: 'easy',
        scene_sequence: ['scene-1', 'scene-2'],
        npc_ids: ['NPC_001', 'NPC_002']
      }
    );
    
    // 获取实例并修改数组
    const instance1 = InstanceCacheManager.getStoryInstance(instanceId);
    if (instance1) {
      instance1.scene_sequence.push('scene-999');
      instance1.story_data.genre.push('Horror');
    }
    
    // 再次获取
    const instance2 = InstanceCacheManager.getStoryInstance(instanceId);
    
    // 验证：数组未被污染
    expect(instance2?.scene_sequence).toEqual(['scene-1', 'scene-2']);
    expect(instance2?.story_data.genre).toEqual(['悬疑', '动作']);
  });
  
  // ============================================
  // 测试6: 统计信息
  // ============================================
  
  test('统计信息正确', () => {
    // 创建多个实例
    InstanceCacheManager.createStoryInstance('player1', 'CLUE_001', {
      story_id: 's1',
      title: '',
      description: '',
      genre: [],
      difficulty: 'easy',
      scene_sequence: [],
      npc_ids: []
    });
    
    InstanceCacheManager.createStoryInstance('player1', 'CLUE_002', {
      story_id: 's2',
      title: '',
      description: '',
      genre: [],
      difficulty: 'easy',
      scene_sequence: [],
      npc_ids: []
    });
    
    const stats = InstanceCacheManager.getStats();
    
    expect(stats.storyInstances).toBe(2);
  });
});
