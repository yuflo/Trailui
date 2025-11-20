/**
 * NarrativeChatBox 组件 - GTA风格叙事对话框
 * 
 * 替换原 NarrativeView 组件
 * 用途：显示近场叙事序列（narrativeSequence）
 */

import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '../ui/scroll-area';
import { DialogueBubble } from './DialogueBubble';
import type { PlotUnit, EnrichedNPCEntity } from '../../types';

interface NarrativeChatBoxProps {
  narrativeSequence: PlotUnit[];
  displayIndex: number;  // 当前显示到第几条（0-based）
  npcs: EnrichedNPCEntity[];  // 🔥 新增：NPC数据（用于查找头像）
}

export function NarrativeChatBox({ narrativeSequence, displayIndex, npcs }: NarrativeChatBoxProps) {
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
        <h3 className="text-lg text-[#fbbf24] mb-2">
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
      <div className="space-y-1 pr-4">
        <AnimatePresence mode="popLayout">
          {displayedUnits.map((unit, idx) => {
            // 确定气泡类型
            let bubbleType: 'System' | 'Player' | 'NPC';
            if (unit.actor === 'System') {
              bubbleType = 'System';
            } else if (unit.actor === 'Player') {
              bubbleType = 'Player';
            } else {
              bubbleType = 'NPC';
            }

            // 🔥 查找NPC头像（只做查找，不创建对象）
            const npc = npcs.find(n => n.name === unit.actor);
            const avatarUrl = npc?.avatar;

            return (
              <DialogueBubble
                key={`narrative-${unit.unit_id || idx}`}
                type={bubbleType}
                actor={unit.actor}
                content={unit.content}
                avatarUrl={avatarUrl}
                index={idx}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}