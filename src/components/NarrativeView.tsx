/**
 * Narrative View Component (Simplified)
 * 
 * 近场叙事显示组件（简化版）
 * 直接显示 nearfield.narrativeSequence 的前 N 条（根据 displayIndex）
 */

import { motion, AnimatePresence } from 'motion/react';
import { Eye } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import type { PlotUnit } from '../types';

interface NarrativeViewProps {
  narrativeSequence: PlotUnit[];
  displayIndex: number;  // 当前显示到第几条（0-based）
}

export function NarrativeView({ narrativeSequence, displayIndex }: NarrativeViewProps) {
  // 加载状态（displayIndex = -1 表示未开始播放）
  if (!narrativeSequence || narrativeSequence.length === 0 || displayIndex < 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <motion.div
          className="text-4xl mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          🎬
        </motion.div>
        <h3 className="text-lg text-cyan-400 mb-2">
          加载场景叙事...
        </h3>
        <p className="text-sm text-gray-500">
          正在进入故事世界
        </p>
      </div>
    );
  }

  // 只显示到当前索引为止的内容（displayIndex 是 0-based）
  const displayedUnits = narrativeSequence.slice(0, displayIndex + 1);

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="space-y-2 pr-4">
        <AnimatePresence>
          {displayedUnits.map((unit, idx) => (
            <motion.div
              key={`narrative-${unit.unit_id || idx}`}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25
              }}
            >
              {unit.actor === 'System' ? (
                // System 类型叙事：黄色横幅
                <div className="flex justify-center py-1.5">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 border-2 border-yellow-500/50 rounded-lg comic-sfx">
                    <p className="text-sm text-yellow-300 font-semibold text-center flex items-center gap-2 uppercase">
                      <Eye className="w-4 h-4" />
                      {unit.content}
                    </p>
                  </div>
                </div>
              ) : unit.actor === 'Player' ? (
                // Player 交互：蓝色气泡（左侧）
                <div className="flex justify-start mb-2">
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 text-blue-300 mb-1">
                      <span className="font-semibold">&gt; [你]</span>
                      <span className="text-xs text-gray-500">
                        [{unit.type === 'InteractionTurn' ? '交互' : '介入'}]
                      </span>
                    </div>
                    <div className="speech-bubble bg-gradient-to-br from-blue-900/40 to-cyan-900/40 text-xs text-gray-200 leading-relaxed">
                      {unit.content}
                    </div>
                  </div>
                </div>
              ) : (
                // NPC 对话：红色气泡（右侧）
                <div className="flex justify-end mb-2">
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 text-red-300 mb-1 justify-end">
                      <span className="text-xs text-gray-500">
                        [{unit.type === 'InterventionPoint' ? '介入时机点' : unit.type === 'InteractionTurn' ? '回应' : '剧情'}]
                      </span>
                      <span className="font-semibold">&lt; [{unit.actor}]</span>
                    </div>
                    <div className="speech-bubble-npc bg-gradient-to-br from-red-900/40 to-pink-900/40 text-xs text-gray-200 leading-relaxed">
                      {unit.content}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
