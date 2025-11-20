/**
 * InfoCard 组件 - GTA风格信息卡片
 * 
 * 设计参考：Tokyo Faded Poster 框体系统
 * 用途：世界信息流中的单个消息卡片
 */

import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Target, AlertCircle, MessageSquare, TrendingUp, Hash } from 'lucide-react';
import { InfoCardFrame } from './InfoCardFrame';

interface InfoCardProps {
  message: {
    id: string;
    type: string;
    text: string;
    extractable_clue_id?: string;
  };
  onClick: () => void;
  isExtracted?: boolean;
  index?: number;
}

// 类型图标映射
const iconMap: Record<string, any> = {
  ALERT: AlertCircle,
  RUMOR: MessageSquare,
  SOCIAL: Hash,
  TRADE: TrendingUp,
};

// 类型映射（转小写）
const typeMap: Record<string, 'alert' | 'rumor' | 'social' | 'trade'> = {
  ALERT: 'alert',
  RUMOR: 'rumor',
  SOCIAL: 'social',
  TRADE: 'trade',
};

export function InfoCard({ message, onClick, isExtracted = false, index = 0 }: InfoCardProps) {
  const cardType = typeMap[message.type] || 'rumor';
  const IconComponent = iconMap[message.type] || MessageSquare;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: index * 0.05,
      }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <InfoCardFrame
        type={cardType}
        time="LIVE"
        title={message.text}
        icon={IconComponent}
        index={index}
      >
        {/* 线索指示器 */}
        <div className="flex items-center gap-2 mt-1">
          {message.extractable_clue_id && !isExtracted && (
            <Badge
              variant="outline"
              className="bg-[#fbbf24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-[10px] px-1.5 py-0 h-5 flex items-center gap-1 flex-shrink-0"
            >
              <Target className="w-2.5 h-2.5" />
              线索
            </Badge>
          )}

          {/* 已提取状态 */}
          {message.extractable_clue_id && isExtracted && (
            <Badge
              variant="outline"
              className="bg-[#dc2626] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-[10px] px-1.5 py-0 h-5 flex-shrink-0"
            >
              已提取
            </Badge>
          )}
        </div>
      </InfoCardFrame>
    </motion.div>
  );
}