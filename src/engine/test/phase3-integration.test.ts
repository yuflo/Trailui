/**
 * Phase 3 集成测试
 * 
 * 验证Service层和数据层的集成
 */

import { CacheManager } from '../cache/CacheManager';
import { InstanceCacheManager } from '../cache/InstanceCacheManager';
import { ClueService, StoryService, NPCService } from '../services/business';
import { ClueInitializer } from '../utils/ClueInitializer';

// Mock数据
const MOCK_CLUES = [
  {
    clue_id: 'CLUE_004',
    title: '消失的快递员',
    summary: '一名快递员在尖沙咀失踪，最后一次出现在某个酒吧门口。',
    story_id: 'demo-story',
    related_clues: [],
    related_scenes: ['scene-a']
  },
  {
    clue_id: 'CLUE_005',
    title: '酒吧的神秘人',
    summary: '有人在酒吧内看到一个行为可疑的人。',
    story_id: 'demo-story',
    related_clues: [],
    related_scenes: ['scene-b']
  }
];

describe('Phase 3 集成测试', () => {
  beforeAll(() => {
    // 初始化CacheManager
    CacheManager.reset();
    CacheManager.initialize({ clues: MOCK_CLUES });
    
    // 初始化InstanceCacheManager
    InstanceCacheManager.reset();
    InstanceCacheManager.initialize();
  });
  
  beforeEach(() => {
    // 清空实例数据
    InstanceCacheManager.reset();
    InstanceCacheManager.initialize();
  });
  
  // ============================================
  // 测试1: 线索初始化
  // ============================================
  
  test('ClueInitializer应该初始化线索收件箱', () => {
    // 1. 添加线索到CacheManager
    CacheManager.addClueToInbox('demo-player', 'CLUE_004');
    CacheManager.addClueToInbox('demo-player', 'CLUE_005');
    
    // 2. 初始化
    ClueInitializer.initializeClueInbox('demo-player');
    
    // 3. 验证
    const clues = ClueService.getPlayerClues('demo-player');
    expect(clues.length).toBe(2);
    expect(clues[0].clue_id).toBe('CLUE_004');
    expect(clues[1].clue_id).toBe('CLUE_005');
  });
  
  // ============================================
  // 测试2: 追踪线索创建独立实例
  // ============================================
  
  test('追踪不同线索应该创建独立的故事实例', () => {
    // 准备：添加线索
    CacheManager.addClueToInbox('demo-player', 'CLUE_004');
    CacheManager.addClueToInbox('demo-player', 'CLUE_005');
    ClueInitializer.initializeClueInbox('demo-player');
    
    // 1. 追踪CLUE_004
    const instance1Id = ClueService.trackClue('demo-player', 'CLUE_004');
    
    // 2. 追踪CLUE_005（同一故事）
    const instance2Id = ClueService.trackClue('demo-player', 'CLUE_005');
    
    // 3. 验证：不同的实例ID
    expect(instance1Id).toBe('demo-story__CLUE_004');
    expect(instance2Id).toBe('demo-story__CLUE_005');
    
    // 4. 验证：实例独立
    const story1 = StoryService.getStoryInstance(instance1Id);
    const story2 = StoryService.getStoryInstance(instance2Id);
    
    expect(story1?.clue_id).toBe('CLUE_004');
    expect(story2?.clue_id).toBe('CLUE_005');
  });
  
  // ============================================
  // 测试3: 核心场景 - 线索详情不消失
  // ============================================
  
  test('【核心验证】追踪同一故事的不同线索，已完成线索的详情不消失', () => {
    // 准备
    CacheManager.addClueToInbox('demo-player', 'CLUE_004');
    CacheManager.addClueToInbox('demo-player', 'CLUE_005');
    ClueInitializer.initializeClueInbox('demo-player');
    
    // 1. 追踪CLUE_004，设置进度50%
    const instance1Id = ClueService.trackClue('demo-player', 'CLUE_004');
    StoryService.startStory(instance1Id);
    InstanceCacheManager.updateStoryInstance(instance1Id, {
      progress_percentage: 50,
      status: 'in_progress'
    });
    
    // 2. 追踪CLUE_005，保持0%
    const instance2Id = ClueService.trackClue('demo-player', 'CLUE_005');
    StoryService.startStory(instance2Id);
    
    // 3. 获取CLUE_004的数据
    const clue1 = ClueService.getClue('CLUE_004');
    const story1 = StoryService.getStoryInstance(clue1!.story_instance_id!);
    
    // ✅ 核心验证：CLUE_004的进度仍为50%
    expect(story1?.progress_percentage).toBe(50);
    expect(story1?.status).toBe('in_progress');
    
    // 4. 获取CLUE_005的数据
    const clue2 = ClueService.getClue('CLUE_005');
    const story2 = StoryService.getStoryInstance(clue2!.story_instance_id!);
    
    // ✅ 验证：CLUE_005的进度为0%
    expect(story2?.progress_percentage).toBe(0);
    expect(story2?.status).toBe('in_progress');
    
    // 5. 反复切换查看
    for (let i = 0; i < 10; i++) {
      const s1 = StoryService.getStoryInstance(instance1Id);
      const s2 = StoryService.getStoryInstance(instance2Id);
      
      // ✅ 数据始终正确
      expect(s1?.progress_percentage).toBe(50);
      expect(s2?.progress_percentage).toBe(0);
    }
  });
  
  // ============================================
  // 测试4: NPC实例隔离
  // ============================================
  
  test('同一NPC在不同故事实例中独立', () => {
    // 准备
    CacheManager.addClueToInbox('demo-player', 'CLUE_004');
    CacheManager.addClueToInbox('demo-player', 'CLUE_005');
    ClueInitializer.initializeClueInbox('demo-player');
    
    // 创建两个故事实例
    const instance1Id = ClueService.trackClue('demo-player', 'CLUE_004');
    const instance2Id = ClueService.trackClue('demo-player', 'CLUE_005');
    
    // 创建NPC实例
    const npc1Id = InstanceCacheManager.createNPCInstance(instance1Id, {
      npc_id: 'NPC_TEST',
      name: '测试NPC',
      avatar_url: '/test.png',
      personality: {
        traits: ['测试'],
        values: ['测试'],
        speaking_style: '测试'
      },
      background: '测试',
      initial_relationship: 50
    });
    
    const npc2Id = InstanceCacheManager.createNPCInstance(instance2Id, {
      npc_id: 'NPC_TEST',
      name: '测试NPC',
      avatar_url: '/test.png',
      personality: {
        traits: ['测试'],
        values: ['测试'],
        speaking_style: '测试'
      },
      background: '测试',
      initial_relationship: 50
    });
    
    // 修改第一个NPC的关系值
    NPCService.updateRelationship(npc1Id, -30);
    
    // 获取两个NPC
    const npcData1 = NPCService.getNPCInstance(npc1Id);
    const npcData2 = NPCService.getNPCInstance(npc2Id);
    
    // ✅ 验证：完全独立
    expect(npcData1?.current_state.relationship).toBe(20);
    expect(npcData2?.current_state.relationship).toBe(50);
  });
  
  // ============================================
  // 测试5: 统计信息
  // ============================================
  
  test('ClueService统计信息正确', () => {
    // 准备
    CacheManager.addClueToInbox('demo-player', 'CLUE_004');
    CacheManager.addClueToInbox('demo-player', 'CLUE_005');
    ClueInitializer.initializeClueInbox('demo-player');
    
    // 初始状态
    expect(ClueService.getUnreadCount('demo-player')).toBe(2);
    expect(ClueService.getTrackingCount('demo-player')).toBe(0);
    
    // 追踪一个线索
    ClueService.trackClue('demo-player', 'CLUE_004');
    
    // 验证统计
    expect(ClueService.getUnreadCount('demo-player')).toBe(1);
    expect(ClueService.getTrackingCount('demo-player')).toBe(1);
  });
});
