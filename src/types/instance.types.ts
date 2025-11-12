/**
 * 实例类型定义
 * 
 * 这些类型用于存储运行时的故事、场景、NPC实例数据
 * 每个线索追踪时会创建独立的实例，确保数据隔离
 */

// ============================================
// 故事实例
// ============================================

export interface StoryInstance {
  // 唯一标识：${story_template_id}__${clue_id}
  instance_id: string;
  
  // 关联信息
  player_id: string;
  clue_id: string;
  story_template_id: string;
  
  // 从模板深拷贝的故事数据
  story_data: {
    title: string;
    description: string;
    genre: string[];
    difficulty: string;
  };
  
  // 场景序列（深拷贝）
  scene_sequence: string[];
  
  // NPC列表（深拷贝）
  npc_ids: string[];
  
  // 运行时状态
  current_scene_id: string | null;
  completed_scenes: string[];
  
  // 进度状态
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  progress_percentage: number;
  
  // 时间戳
  created_at: number;
  started_at: number | null;
  completed_at: number | null;
  last_played_at: number | null;
}

// ============================================
// 场景实例
// ============================================

export interface SceneInstance {
  // 唯一标识：${story_instance_id}__${scene_template_id}
  instance_id: string;
  
  // 关联信息
  story_instance_id: string;
  scene_template_id: string;
  player_id: string;
  
  // 从模板深拷贝的场景数据
  scene_data: {
    title: string;
    location: string;
    time_of_day: string;
    weather: string;
    background_info: string;
    objective: string;
  };
  
  // 该场景的NPC实例ID列表
  npc_instance_ids: string[];
  
  // 运行时状态
  status: 'not_entered' | 'in_progress' | 'completed';
  entered_at: number | null;
  completed_at: number | null;
  
  // 触发的事件历史
  triggered_events: Array<{
    event_id: string;
    timestamp: number;
  }>;
}

// ============================================
// NPC实例
// ============================================

export interface NPCInstance {
  // 唯一标识：${story_instance_id}__${npc_template_id}
  instance_id: string;
  
  // 关联信息
  story_instance_id: string;
  npc_template_id: string;
  player_id: string;
  
  // 从模板深拷贝的NPC数据
  npc_data: {
    name: string;
    avatar_url: string;
    personality: {
      traits: string[];
      values: string[];
      speaking_style: string;
    };
    background: string;
  };
  
  // 运行时状态（动态变化）
  current_state: {
    relationship: number;
    current_mood: string;
    alertness: number;
    trust_level: number;
  };
  
  // 交互摘要
  interaction_summary: {
    total_interactions: number;
    last_interaction_at: number | null;
    revealed_secrets: string[];
  };
}

// ============================================
// 线索记录（扩展）
// ============================================

export interface ClueRecord {
  clue_id: string;
  player_id: string;
  
  // 关联的故事模板
  story_template_id: string;
  
  // 🔥 关键：关联的故事实例ID（追踪后才有值）
  story_instance_id: string | null;
  
  // 线索信息
  title: string;
  description: string;
  source: string;
  
  // 状态
  status: 'unread' | 'read' | 'tracking' | 'completed' | 'abandoned';
  
  // 时间戳
  received_at: number;
  read_at: number | null;
  tracked_at: number | null;
  completed_at: number | null;
}

// ============================================
// LLM生成的叙事内容
// ============================================

export interface NarrativeUnit {
  id: string;
  type: 'Narrative' | 'InterventionPoint' | 'Choice';
  actor?: string;
  content: string;
  interventionType?: 'dialogue' | 'action' | 'observation';
  choices?: Array<{
    id: string;
    text: string;
    requiredState?: Record<string, any>;
  }>;
  mood?: 'tense' | 'calm' | 'exciting';
  stateEffects?: {
    relationshipDelta?: Record<string, number>;
    playerStateDelta?: Record<string, any>;
  };
}

export interface LLMSceneNarrativeRecord {
  record_id: string;
  player_id: string;
  story_instance_id: string;
  scene_instance_id: string;
  scene_template_id: string;
  
  // LLM生成的叙事内容
  narrative_units: NarrativeUnit[];
  
  // 元数据
  llm_model: string;
  token_count: number;
  generated_at: number;
  
  // 版本控制
  version: number;
  is_active: boolean;
}

// ============================================
// LLM生成的对话历史
// ============================================

export interface LLMDialogueRecord {
  record_id: string;
  player_id: string;
  story_instance_id: string;
  scene_instance_id: string;
  npc_instance_id: string;
  
  // 对话内容
  player_input: string;
  npc_response: string;
  
  // 状态变化
  emotional_state: {
    mood: string;
    intensity: number;
  };
  relationship_delta: number;
  
  // 触发的事件
  triggered_events: Array<{
    eventId: string;
    eventType: string;
    payload: any;
  }>;
  
  // 元数据
  llm_model: string;
  token_count: number;
  timestamp: number;
  turn_number: number;
}
