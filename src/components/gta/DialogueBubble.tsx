/**
 * DialogueBubble 组件 - GTA风格对话气泡
 * 
 * 设计参考：GtaComicStyleDesign-1527-*.tsx (最新版本)
 * 设计规范：COMPLETE_DESIGN_SYSTEM.md - GTA硬边美学
 * 配色系统：砖红#dc2626、深红黑#1a0000、纯白#ffffff
 * 用途：近场交互中的对话显示
 */

import { motion } from 'motion/react';
import { Eye } from 'lucide-react';

interface DialogueBubbleProps {
  type: 'System' | 'Player' | 'NPC';
  actor: string;  // 发言者名字
  content: string;
  avatarUrl?: string;  // NPC头像URL（可选）
  index?: number;  // 用于动画延迟
}

// 气泡样式配置 - 使用标准3色配色系统
const bubbleStyles = {
  NPC: {
    bg: 'bg-white',
    borderGlow: '4px 4px 0px 0px #000000',
    align: 'justify-start',
    nameTagBg: 'bg-white',
    nameTagShadow: '0px 0px 0px 2px #ffffff, 3px 3px 0px 0px #000000',
    nameColor: 'text-black',
    avatarBorder: '#000000',
  },
  Player: {
    bg: 'bg-white',
    borderGlow: '4px 4px 0px 0px #000000',
    align: 'justify-end',
    nameTagBg: 'bg-[#dc2626]',
    nameTagShadow: '0px 0px 0px 2px #dc2626, 3px 3px 0px 0px #000000',
    nameColor: 'text-white',
    avatarBorder: '#dc2626',
  },
};

export function DialogueBubble({ type, actor, content, avatarUrl, index = 0 }: DialogueBubbleProps) {
  // System叙事：砖红黑风格横幅
  if (type === 'System') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="flex justify-center py-1.5"
      >
        <div className="px-4 py-2 bg-[#1a0000]/80 border-[3px] border-[#dc2626]">
          <p className="text-sm text-white font-semibold text-center flex items-center gap-2 uppercase">
            <Eye className="w-4 h-4" />
            {content}
          </p>
        </div>
      </motion.div>
    );
  }

  const style = bubbleStyles[type];
  const isPlayer = type === 'Player';

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: isPlayer ? 20 : -20,
        scale: 0.9 
      }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        delay: index * 0.05
      }}
      className={`flex ${style.align} mb-3`}
    >
      <div className={`flex items-start gap-2 max-w-[85%] ${isPlayer ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* NPC头像（Player暂时不显示头像）*/}
        {!isPlayer && (
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img 
                src={avatarUrl}
                alt={actor}
                className="size-[40px] object-cover border-[3px] border-black"
                style={{
                  boxShadow: `0px 0px 0px 2px ${style.avatarBorder}, 4px 4px 0px 0px #000000`
                }}
              />
            ) : (
              // 首字母硬边占位符
              <div 
                className="flex items-center justify-center size-[40px] bg-[#1a0000] border-[3px] border-black"
                style={{
                  boxShadow: `0px 0px 0px 2px ${style.avatarBorder}, 4px 4px 0px 0px #000000`
                }}
              >
                <span className="font-black text-white text-lg">
                  {actor.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 对话内容 */}
        <div className="flex-1 min-w-0">
          {/* 姓名标签 */}
          <div className={`inline-flex items-center px-3 py-1 mb-1.5 border-2 border-black ${style.nameTagBg}`}
            style={{ boxShadow: style.nameTagShadow }}
          >
            <span className={`font-black text-[10px] uppercase tracking-[0.5px] ${style.nameColor}`}>
              {isPlayer ? 'あなた' : actor}
            </span>
          </div>

          {/* 气泡容器 */}
          <div className="relative">
            {/* 对话气泡 */}
            <div 
              className={`relative ${style.bg} border-[3px] border-black p-3`}
              style={{
                boxShadow: style.borderGlow
              }}
            >
              {/* 10%透明径向渐变装饰层 */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)"
                }}
              />

              {/* 文本内容 */}
              <p 
                className="relative z-10 font-['Rajdhani','Noto_Sans_JP',sans-serif] text-[12.8px] leading-[19.2px] text-[#101828]"
                style={{ fontVariationSettings: "'wght' 700" }}
              >
                {content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}