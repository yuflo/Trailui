/**
 * Empty State View Component
 * 
 * 空状态显示组件
 * 用于显示未进入故事时的引导界面
 */

import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';
import { Button } from './ui/button';
import type { GameSessionState } from '../types';

interface EmptyStateViewProps {
  sessionState: GameSessionState;
  onOpenClueInbox: () => void;
}

export function EmptyStateView({ sessionState, onOpenClueInbox }: EmptyStateViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <motion.div
        className="text-6xl mb-4 opacity-30"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        👁️
      </motion.div>
      <h3 className="text-xl text-gray-400 mb-2">
        {sessionState === 'idle' ? '当前未追踪任何故事' : '请选择一个故事开始'}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {sessionState === 'idle' 
          ? '从左侧世界信息流中提取线索，然后在线索收件箱中追踪故事'
          : '点击下方按钮打开线索收件箱，选择追踪的故事进入'
        }
      </p>
      <Button
        variant="outline"
        className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
        onClick={onOpenClueInbox}
      >
        <Inbox className="w-4 h-4 mr-2" />
        打开线索收件箱
      </Button>
    </div>
  );
}
