/**
 * Demo Story Map - Data File
 * 
 * Demo阶段的统一故事数据映射
 * 所有线索都关联到这个story，简化demo数据管理
 * 
 * 结构设计：
 * - meta: 故事元信息
 * - scenes: 场景集合，每个scene包含narrative + interactive序列
 * 
 * ✅ Phase 4优化：
 * - 删除重复的类型定义（改为从types导入）
 * - 删除helper函数（移到DataAccess层）
 * - 只保留纯数据导出
 */

import type { Story } from '../../types';

/**
 * Demo故事映射表
 * 
 * 所有线索都关联到'demo-story'这个key
 */
export const demoStoryMap: Record<string, Story> = {
  'demo-story': {
    /**
     * 故事元信息
     */
    meta: {
      story_id: 'demo-story',
      title: '失踪的快递员',
      description: '一个快递员失踪了，他的包裹三天未送达。线索指向尖沙咀的"掘金者"酒吧。这是一个关于背叛、欲望和危险的故事。',
      entry_clue_id: 'CLUE_001_UNDELIVERED_PACKAGE',
      scenes: ['scene-a', 'scene-b']
    },
    
    /**
     * 场景数据集合
     */
    scenes: {
      /**
       * 场景A：酒吧入口
       */
      'scene-a': {
        scene_id: 'scene-a',
        title: '掘金者酒吧入口',
        description: '尖沙咀深夜的霓虹灯下，这家酒吧看起来并不起眼，但空气中弥漫着危险的气息。',
        
        /**
         * 叙事序列 - 循环复用
         */
        narrative_sequence: [
          {
            actor: 'System',
            content: '【深夜的尖沙咀】你来到"掘金者"酒吧门口...',
            type: 'Narrative'
          },
          {
            actor: '肥棠',
            content: '哟，又来了个不怕死的？找谁啊？',
            type: 'Narrative'
          },
          {
            actor: 'System',
            content: '【介入时机点】你可以选择如何回应...',
            type: 'InterventionPoint'
          },
          {
            actor: '肥棠',
            content: '嘿嘿，别装了，我知道你来干嘛的。',
            type: 'Narrative'
          },
          {
            actor: 'System',
            content: '【介入时机点】气氛变得紧张...',
            type: 'InterventionPoint'
          },
          {
            actor: 'System',
            content: '【场景结束】你决定离开这个危险的地方...',
            type: 'Narrative',
            is_terminal: true
          }
        ],
        
        /**
         * 交互快照 - 所有介入点都用这个场景
         */
        interactive_sequence: {
          broadcast_area: {
            ambient_channel: [],
            police_scanner: [],
            personal_channel: [],
            thread_hooks: []
          },
          dynamic_view: {
            scene_setting: '深夜的尖沙咀，掘金者酒吧门口。霓虹灯闪烁，空气中弥漫着危险的气息。',
            involved_entities: [
              {
                id: 'npc_fatty_tang',
                name: '肥棠',
                status_summary: '酒吧保镖，看起来很警惕',
                composure: '心防 70/100',
                rapport: {
                  sentiment: '警惕',
                  intensity: 20
                }
              }
            ],
            behavior_stream: [],
            available_player_behaviors: [
              { behavior_type: 'Inquire', description: '询问快递员的事' },
              { behavior_type: 'Deceive', description: '假装来喝酒' },
              { behavior_type: 'Threaten', description: '直接威胁' },
              { behavior_type: 'Bribe', description: '贿赂' }
            ],
            narrative_threads: []
          },
          player_status_area: {
            world_time: '2077-06-15 23:45',
            current_location: '尖沙咀 - 掘金者酒吧入口',
            vigor: { value: 60, max: 100 },
            clarity: { value: 70, max: 100 },
            financial_power: '体面',
            credit: { value: 650 },
            active_effects: []
          }
        },
        
        /**
         * Demo限制：最多5轮交互
         */
        max_turns: 5,
        
        /**
         * 场景流转规则
         */
        transition: {
          next_scene_id: 'scene-b',
          is_story_terminal: false,
          completion_clue_id: 'CLUE_002_COURIER_ID'
        },
        
        unlock_condition: 'entry'
      },
      
      /**
       * 场景B：酒吧内部
       */
      'scene-b': {
        scene_id: 'scene-b',
        title: '酒吧吧台内部',
        description: '昏暗的灯光下，酒保小雪正在擦拭酒杯。她似乎知道一些秘密。',
        
        /**
         * 叙事序列 - 循环复用
         */
        narrative_sequence: [
          {
            actor: 'System',
            content: '【酒吧内部】你走进了酒吧，空气中弥漫着威士忌和烟草的味道...',
            type: 'Narrative'
          },
          {
            actor: '小雪',
            content: '你好，要喝点什么吗？',
            type: 'Narrative'
          },
          {
            actor: 'System',
            content: '【介入时机点】小雪的眼神有些闪躲...',
            type: 'InterventionPoint'
          },
          {
            actor: '小雪',
            content: '阿伟...我确实认识他，但是...',
            type: 'Narrative'
          },
          {
            actor: 'System',
            content: '【介入时机点】她似乎有话要说...',
            type: 'InterventionPoint'
          },
          {
            actor: 'System',
            content: '【故事结束】你从小雪那里得到了关键线索，案件似乎有了新的进展...',
            type: 'Narrative',
            is_terminal: true
          }
        ],
        
        /**
         * 交互快照
         */
        interactive_sequence: {
          broadcast_area: {
            ambient_channel: [],
            police_scanner: [],
            personal_channel: [],
            thread_hooks: []
          },
          dynamic_view: {
            scene_setting: '掘金者酒吧内部，昏暗的灯光下，酒保小雪正在擦拭酒杯。',
            involved_entities: [
              {
                id: 'npc_xiaoxue',
                name: '小雪',
                status_summary: '酒保，看起来很紧张',
                composure: '心防 60/100',
                rapport: {
                  sentiment: '紧张',
                  intensity: 35
                }
              }
            ],
            behavior_stream: [],
            available_player_behaviors: [
              { behavior_type: 'Inquire', description: '询问阿伟' },
              { behavior_type: 'ShowItem', description: '展示包裹' },
              { behavior_type: 'Comfort', description: '安慰她' },
              { behavior_type: 'Threaten', description: '威胁她说出真相' }
            ],
            narrative_threads: []
          },
          player_status_area: {
            world_time: '2077-06-16 00:15',
            current_location: '尖沙咀 - 掘金者酒吧内部',
            vigor: { value: 55, max: 100 },
            clarity: { value: 65, max: 100 },
            financial_power: '体面',
            credit: { value: 650 },
            active_effects: []
          }
        },
        
        /**
         * Demo限制：最多5轮交互
         */
        max_turns: 5,
        
        /**
         * 场景流转规则
         */
        transition: {
          next_scene_id: null,
          is_story_terminal: true,
          completion_clue_id: 'CLUE_003_STORY_END'
        },
        
        unlock_condition: 'complete_scene_a'
      }
    }
  }
};

/**
 * ✅ Phase 4优化完成
 * 
 * 所有helper函数已移除，改为通过DataAccess接口访问：
 * - getDemoStory() → StoryDataAccess.getStoryById()
 * - getDemoScene() → StoryDataAccess.getSceneById()
 * - isSceneUnlocked() → 业务逻辑移到Service层
 * 
 * 此文件现在只导出纯数据
 */
