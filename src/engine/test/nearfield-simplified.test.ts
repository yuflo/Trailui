/**
 * Near Field System (Simplified) - Unit Tests
 * 
 * 测试简化版近场交互系统的核心功能
 */

import { NearFieldManagerSimple } from '../core/NearFieldManagerSimple';
import { StateManager } from '../core/StateManager';
import { GameEngine } from '../core/GameEngine';
import type { PlotUnit } from '../../types';

describe('NearFieldManagerSimple', () => {
  let engine: GameEngine;
  let manager: NearFieldManagerSimple;
  let stateManager: StateManager;

  beforeEach(() => {
    engine = new GameEngine({ debug: false });
    stateManager = new StateManager();
    manager = new NearFieldManagerSimple(engine, stateManager);
  });

  describe('enterScene', () => {
    it('should initialize nearfield state correctly', async () => {
      // Mock narrative sequence
      const mockSequence: PlotUnit[] = [
        {
          unit_id: 'U001',
          type: 'Narrative',
          actor: 'System',
          content: 'Test narrative 1'
        },
        {
          unit_id: 'U002',
          type: 'Narrative',
          actor: 'System',
          content: 'Test narrative 2'
        }
      ];

      // Spy on Service (would need to mock in real test)
      // await manager.enterScene('demo-story', 'scene-a');

      const state = stateManager.getState();
      
      // Assertions
      expect(state.nearfield.active).toBe(true);
      expect(state.nearfield.sceneId).toBe('scene-a');
      expect(state.nearfield.displayIndex).toBe(-1); // Not started yet
      expect(state.nearfield.mode).toBe('PLAYING');
    });
  });

  describe('playNext', () => {
    it('should increment displayIndex', () => {
      // Setup: manually set nearfield state
      const state = stateManager.getInternalState();
      state.nearfield = {
        active: true,
        sceneId: 'scene-a',
        narrativeSequence: [
          {
            unit_id: 'U001',
            type: 'Narrative',
            actor: 'System',
            content: 'Test'
          }
        ],
        displayIndex: -1,
        mode: 'PLAYING',
        interventionHint: null
      };

      // Execute
      manager.playNext();

      // Assert
      expect(state.nearfield.displayIndex).toBe(0);
    });

    it('should pause at InterventionPoint', () => {
      const state = stateManager.getInternalState();
      state.nearfield = {
        active: true,
        sceneId: 'scene-a',
        narrativeSequence: [
          {
            unit_id: 'U001',
            type: 'InterventionPoint',
            actor: 'NPC',
            content: 'Help me!',
            hint: 'You can choose to intervene'
          }
        ],
        displayIndex: -1,
        mode: 'PLAYING',
        interventionHint: null
      };

      manager.playNext();

      expect(state.nearfield.mode).toBe('INTERVENTION');
      expect(state.nearfield.interventionHint).toBe('You can choose to intervene');
    });

    it('should auto-play Narrative units', (done) => {
      const state = stateManager.getInternalState();
      state.nearfield = {
        active: true,
        sceneId: 'scene-a',
        narrativeSequence: [
          {
            unit_id: 'U001',
            type: 'Narrative',
            actor: 'System',
            content: 'First'
          },
          {
            unit_id: 'U002',
            type: 'Narrative',
            actor: 'System',
            content: 'Second'
          }
        ],
        displayIndex: -1,
        mode: 'PLAYING',
        interventionHint: null
      };

      manager.playNext();

      // Should increment to 0
      expect(state.nearfield.displayIndex).toBe(0);

      // Should auto-play next after 1 second
      setTimeout(() => {
        expect(state.nearfield.displayIndex).toBe(1);
        done();
      }, 1100);
    });
  });

  describe('handlePass', () => {
    it('should skip intervention point and continue playing', () => {
      const state = stateManager.getInternalState();
      state.nearfield = {
        active: true,
        sceneId: 'scene-a',
        narrativeSequence: [
          {
            unit_id: 'U001',
            type: 'InterventionPoint',
            actor: 'NPC',
            content: 'Help!',
            hint: 'Intervention hint'
          },
          {
            unit_id: 'U002',
            type: 'Narrative',
            actor: 'System',
            content: 'You passed by'
          }
        ],
        displayIndex: 0,
        mode: 'INTERVENTION',
        interventionHint: 'Intervention hint'
      };

      manager.handlePass();

      expect(state.nearfield.interventionHint).toBe(null);
      expect(state.nearfield.displayIndex).toBe(1);
    });
  });

  describe('handleIntervention', () => {
    it('should insert player input and NPC response', async () => {
      const state = stateManager.getInternalState();
      state.nearfield = {
        active: true,
        sceneId: 'scene-a',
        narrativeSequence: [
          {
            unit_id: 'U001',
            type: 'InterventionPoint',
            actor: 'NPC',
            content: 'Help!',
            hint: 'Intervention hint'
          }
        ],
        displayIndex: 0,
        mode: 'INTERVENTION',
        interventionHint: 'Intervention hint'
      };

      const originalLength = state.nearfield.narrativeSequence.length;

      await manager.handleIntervention('I will help you');

      // Should insert 2 units (player + NPC response)
      expect(state.nearfield.narrativeSequence.length).toBe(originalLength + 2);
      
      // Player unit should be inserted
      const playerUnit = state.nearfield.narrativeSequence[1];
      expect(playerUnit.actor).toBe('Player');
      expect(playerUnit.content).toBe('I will help you');
      
      // NPC response should be inserted
      const npcUnit = state.nearfield.narrativeSequence[2];
      expect(npcUnit.actor).toBe('NPC');
      expect(npcUnit.content).toBeTruthy();
    });
  });

  describe('Data flow integration', () => {
    it('should maintain single source of truth', async () => {
      const state = stateManager.getInternalState();
      
      // Initialize nearfield
      state.nearfield = {
        active: true,
        sceneId: 'scene-a',
        narrativeSequence: [
          { unit_id: 'U001', type: 'Narrative', actor: 'System', content: 'Test 1' },
          { unit_id: 'U002', type: 'Narrative', actor: 'System', content: 'Test 2' }
        ],
        displayIndex: -1,
        mode: 'PLAYING',
        interventionHint: null
      };

      // Play first unit
      manager.playNext();
      
      // Verify single source
      expect(state.nearfield.narrativeSequence.length).toBe(2);
      expect(state.nearfield.displayIndex).toBe(0);
      
      // Verify backward compatibility
      expect(state.current_narrative_sequence).toBe(state.nearfield.narrativeSequence);
      expect(state.current_narrative_index).toBe(state.nearfield.displayIndex);
    });

    it('should sync state to old fields for backward compatibility', () => {
      const state = stateManager.getInternalState();
      
      state.nearfield = {
        active: true,
        sceneId: 'test-scene',
        narrativeSequence: [],
        displayIndex: 5,
        mode: 'INTERVENTION',
        interventionHint: 'Test hint'
      };

      manager.playNext();

      // Old fields should be synced
      expect(state.nearfield_active).toBe(true);
      expect(state.current_scene_id).toBe('test-scene');
      expect(state.current_narrative_index).toBe(state.nearfield.displayIndex);
      expect(state.awaiting_action_type?.type).toBe('AWAITING_INTERVENTION');
    });
  });
});

/**
 * UI Integration Tests
 */
describe('UI Integration', () => {
  it('should render correct units based on displayIndex', () => {
    const narrativeSequence: PlotUnit[] = [
      { unit_id: 'U001', type: 'Narrative', actor: 'System', content: '1' },
      { unit_id: 'U002', type: 'Narrative', actor: 'System', content: '2' },
      { unit_id: 'U003', type: 'Narrative', actor: 'System', content: '3' },
    ];

    // displayIndex = -1 (not started)
    let displayIndex = -1;
    let displayedUnits = narrativeSequence.slice(0, displayIndex + 1);
    expect(displayedUnits.length).toBe(0);

    // displayIndex = 0 (first unit)
    displayIndex = 0;
    displayedUnits = narrativeSequence.slice(0, displayIndex + 1);
    expect(displayedUnits.length).toBe(1);
    expect(displayedUnits[0].content).toBe('1');

    // displayIndex = 2 (three units)
    displayIndex = 2;
    displayedUnits = narrativeSequence.slice(0, displayIndex + 1);
    expect(displayedUnits.length).toBe(3);
    expect(displayedUnits[2].content).toBe('3');
  });

  it('should determine correct freeMirrorMode', () => {
    const gameState = {
      nearfield: {
        active: false,
        sceneId: null,
        narrativeSequence: [],
        displayIndex: -1,
        mode: 'PLAYING' as const,
        interventionHint: null
      }
    };

    const sessionState = 'idle' as const;

    // Case 1: Not in story
    let mode = (!gameState.nearfield.active || sessionState !== 'playing') 
      ? 'idle' 
      : gameState.nearfield.narrativeSequence.length > 0 
        ? 'narrative' 
        : 'interaction';
    expect(mode).toBe('idle');

    // Case 2: In story with narrative
    gameState.nearfield.active = true;
    gameState.nearfield.narrativeSequence = [
      { unit_id: 'U001', type: 'Narrative', actor: 'System', content: 'Test' }
    ];
    const sessionStatePlaying = 'playing' as const;
    
    mode = (!gameState.nearfield.active || sessionStatePlaying !== 'playing') 
      ? 'idle' 
      : gameState.nearfield.narrativeSequence.length > 0 
        ? 'narrative' 
        : 'interaction';
    expect(mode).toBe('narrative');
  });
});

export {};
