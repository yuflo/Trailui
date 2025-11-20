/**
 * InfoPanel 组件 - GTA风格信息面板
 * 
 * 设计参考：Tokyo Faded Poster 框体系统
 * 用途：世界信息流容器，展示所有信息卡片
 */

import { motion, AnimatePresence } from 'motion/react';
import { Radio } from 'lucide-react';
import { MainPanelFrame } from './MainPanelFrame';
import { InfoCard } from './InfoCard';

interface TickerMessage {
  id: string;
  type: string;
  text: string;
  extractable_clue_id?: string;
}

interface InfoPanelProps {
  messages: TickerMessage[];
  onMessageClick: (msg: TickerMessage) => void;
  onRefresh: () => void;
  isClueExtracted: (clueId: string) => boolean;
}

export function InfoPanel({ messages, onMessageClick, onRefresh, isClueExtracted }: InfoPanelProps) {
  return (
    <MainPanelFrame
      title="LIVE!"
      subtitle="// 世界情報ストリーム"
      icon={Radio}
      onRefresh={onRefresh}
    >
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <InfoCard
              key={msg.id}
              message={msg}
              onClick={() => onMessageClick(msg)}
              isExtracted={msg.extractable_clue_id ? isClueExtracted(msg.extractable_clue_id) : false}
              index={idx}
            />
          ))}
        </AnimatePresence>
      </div>
    </MainPanelFrame>
  );
}
