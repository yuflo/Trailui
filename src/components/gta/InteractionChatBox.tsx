/**
 * InteractionChatBox 组件 - GTA风格交互对话框
 * 
 * 替换原 InteractionView 组件
 * 用途：显示玩家与NPC的交互对话（interactionEvents）
 */

import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '../ui/scroll-area';
import { DialogueBubble } from './DialogueBubble';
import type { PlotUnit, EnrichedNPCEntity } from '../../types';

interface InteractionChatBoxProps {
  interactionEvents: PlotUnit[];
  sceneSetting?: string;
  isTyping?: boolean;
  npcs: EnrichedNPCEntity[];  // 🔥 新增：NPC数据（用于查找头像）
}

export function InteractionChatBox({ 
  interactionEvents, 
  sceneSetting, 
  isTyping,
  npcs
}: InteractionChatBoxProps) {
  return (
    <>
      {/* 场景描述 */}
      {sceneSetting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 border-l-[3px] border-[#fbbf24] bg-[#1a0d0d]/80 flex-shrink-0"
        >
          <p className="italic text-xs text-gray-300 leading-relaxed">
            {sceneSetting}
            {isTyping && (
              <motion.span
                className="inline-block w-2 h-5 bg-white ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              />
            )}
          </p>
        </motion.div>
      )}

      {/* 交互对话流 */}
      <ScrollArea className="flex-grow min-h-0">
        <div className="space-y-1 pr-4">
          <AnimatePresence mode="popLayout">
            {interactionEvents.map((event, idx) => {
              // 确定气泡类型
              let bubbleType: 'System' | 'Player' | 'NPC';
              if (event.actor === 'System') {
                bubbleType = 'System';
              } else if (event.actor === 'Player') {
                bubbleType = 'Player';
              } else {
                bubbleType = 'NPC';
              }

              // 🔥 查找NPC头像（只做查找，不创建对象）
              const npc = npcs.find(n => n.name === event.actor);
              const avatarUrl = npc?.avatar;

              return (
                <DialogueBubble
                  key={`interaction-${event.unit_id || idx}`}
                  type={bubbleType}
                  actor={event.actor}
                  content={event.content}
                  avatarUrl={avatarUrl}
                  index={idx}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </>
  );
}