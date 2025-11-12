/**
 * Interaction View Component
 * 
 * ✅ 重构：显示交互对话（来自 interactionEvents）
 * 用于显示玩家与NPC的交互对话
 */

import { motion, AnimatePresence } from 'motion/react';
import { Eye } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import type { PlotUnit } from '../types';

interface InteractionViewProps {
  interactionEvents: PlotUnit[];  // ✅ 改为 PlotUnit 数组
  sceneSetting?: string;
  isTyping?: boolean;
}

export function InteractionView({ 
  interactionEvents, 
  sceneSetting, 
  isTyping 
}: InteractionViewProps) {
  return (
    <>
      {/* 场景描述 */}
      {sceneSetting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 border-l-4 border-cyan-500/50 bg-slate-800/50 rounded-r-lg flex-shrink-0"
        >
          <p className="italic text-xs text-gray-300 leading-relaxed">
            {sceneSetting}
            {isTyping && (
              <motion.span
                className="inline-block w-2 h-5 bg-cyan-400 ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              />
            )}
          </p>
        </motion.div>
      )}

      {/* 交互对话流 */}
      <ScrollArea className="flex-grow min-h-0">
        <div className="space-y-2 pr-4">
          <AnimatePresence>
            {interactionEvents.map((event, idx) => (
              <motion.div
                key={`interaction-${event.unit_id || idx}`}
                layout
                initial={{ 
                  opacity: 0, 
                  x: event.actor === 'Player' ? -20 : 20,
                  scale: 0.9 
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 25
                }}
              >
                {event.actor === 'Player' ? (
                  // 玩家发言：蓝色气泡（左侧）
                  <div className="flex justify-start mb-2">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 text-blue-300 mb-1">
                        <span className="font-semibold">&gt; [你]</span>
                      </div>
                      <div className="speech-bubble bg-gradient-to-br from-blue-900/40 to-cyan-900/40 text-xs text-gray-200 leading-relaxed">
                        {event.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  // NPC回应：红色气泡（右侧）
                  <div className="flex justify-end mb-2">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 text-red-300 mb-1 justify-end">
                        <span className="text-xs text-gray-500">[回应]</span>
                        <span className="font-semibold">&lt; [{event.actor}]</span>
                      </div>
                      <div className="speech-bubble-npc bg-gradient-to-br from-red-900/40 to-pink-900/40 text-xs text-gray-200 leading-relaxed">
                        {event.content}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </>
  );
}
