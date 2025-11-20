import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GTA_COLORS, GTA_SHADOWS } from '../../config/gta-theme';

interface InfoCardFrameProps {
  type: 'alert' | 'rumor' | 'social' | 'trade';
  time: string;
  title: string;
  children: React.ReactNode;
  icon: LucideIcon;
  rotation?: number;
  index?: number;
}

/**
 * ✅ Figma原稿：类型样式配置
 * 包含渐变色、浅色背景、阴影等完整配置
 */
const typeStyles = {
  alert: {
    colorFrom: GTA_COLORS.ALERT,
    colorTo: GTA_COLORS.ALERT_TO,
    lightBg: GTA_COLORS.ALERT_LIGHT,
    shadow: GTA_SHADOWS.CARD_ALERT,
    badgeShadow: GTA_SHADOWS.BADGE_ALERT,
    label: 'ALERT',
  },
  rumor: {
    colorFrom: GTA_COLORS.RUMOR,
    colorTo: GTA_COLORS.RUMOR_TO,
    lightBg: GTA_COLORS.RUMOR_LIGHT,
    shadow: GTA_SHADOWS.CARD_RUMOR,
    badgeShadow: GTA_SHADOWS.BADGE_RUMOR,
    label: 'RUMOR',
  },
  social: {
    colorFrom: GTA_COLORS.SOCIAL,
    colorTo: GTA_COLORS.SOCIAL_TO,
    lightBg: GTA_COLORS.SOCIAL_LIGHT,
    shadow: GTA_SHADOWS.CARD_SOCIAL,
    badgeShadow: GTA_SHADOWS.BADGE_SOCIAL,
    label: 'SOCIAL',
  },
  trade: {
    colorFrom: GTA_COLORS.TRADE,
    colorTo: GTA_COLORS.TRADE_TO,
    lightBg: GTA_COLORS.TRADE_LIGHT,
    shadow: GTA_SHADOWS.CARD_TRADE,
    badgeShadow: GTA_SHADOWS.BADGE_TRADE,
    label: 'TRADE',
  },
};

export function InfoCardFrame({
  type,
  time,
  title,
  children,
  icon: Icon,
  rotation,
  index = 0,
}: InfoCardFrameProps) {
  const style = typeStyles[type];
  
  // ✅ Figma原稿：随机倾斜逻辑
  const cardRotation = rotation !== undefined 
    ? rotation 
    : (index % 3 === 0 ? -2 : index % 3 === 1 ? 2 : -1);
  
  return (
    <div 
      className="relative group hover:scale-[1.02] transition-transform"
      style={{
        transform: `rotate(${cardRotation}deg)`,
      }}
    >
      {/* ✅ Figma原稿：喷漆晕染效果 */}
      <div 
        className="absolute -inset-1 opacity-20 blur-lg -z-10"
        aria-hidden="true"
        style={{ 
          background: `linear-gradient(135deg, ${style.colorFrom} 0%, ${style.colorTo} 100%)`
        }}
      />
      
      {/* ✅ Figma原稿：卡片主体（浅色背景） */}
      <div 
        className="p-2.5 border-[3px] border-black relative"
        style={{
          backgroundColor: style.lightBg,
          boxShadow: style.shadow,
        }}
      >
        {/* 顶部状态栏 */}
        <div className="flex items-center mb-1.5 gap-2 flex-wrap">
          {/* ✅ Figma原稿：类型徽章（渐变背景 + 倾斜 + 多层边框） */}
          <span 
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider font-mono font-black border-[2px] border-black"
            style={{ 
              background: `linear-gradient(135deg, ${style.colorFrom} 0%, ${style.colorTo} 100%)`,
              color: '#FFFFFF',
              boxShadow: style.badgeShadow,
              transform: 'rotate(-2deg)',
            }}
          >
            <Icon size={12} strokeWidth={3.5} />
            {style.label}
          </span>
          
          {/* 时间标签 */}
          <span 
            className="text-[10px] px-2 py-1 bg-white text-black font-mono font-black border-[2px] border-black"
            style={{ boxShadow: '2px 2px 0 #000' }}
          >
            {time}
          </span>
        </div>
        
        {/* 标题 */}
        <h3 
          className="text-xs leading-normal text-gray-900 mb-2"
          style={{ 
            fontFamily: 'Rajdhani, sans-serif', 
            fontWeight: 700
          }}
        >
          {title}
        </h3>
        
        {/* 内容 */}
        <div className="relative">
          {children}
        </div>
        
        {/* ✅ Figma原稿：危险警报强化 */}
        {type === 'alert' && (
          <div 
            className="mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 text-[10px] font-mono font-black uppercase text-center border-[2px] border-black"
            style={{ 
              boxShadow: '0 0 0 2px #FFFFFF, 3px 3px 0 #000',
              transform: 'rotate(1deg)',
            }}
          >
            ⚠️ WARNING
          </div>
        )}
      </div>
    </div>
  );
}
