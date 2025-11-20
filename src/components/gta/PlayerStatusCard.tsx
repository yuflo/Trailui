import React from 'react';
import { motion } from 'motion/react';
import playerAvatar from 'figma:asset/5eae5eaf1e2b04030b84ac8c31febd9883ea4037.png';
import { GTA_COLORS, GTA_SHADOWS, GTA_GRADIENTS, GTA_FONTS } from '../../config/gta-theme';

interface PlayerStatusCardProps {
  avatar?: string;
  name?: string;
  hp: { value: number; max: number };
  mp: { value: number; max: number };
  money: number;
  credit: number;
  activeEffects?: Array<{
    name: string;
    type: 'buff' | 'debuff';
    description?: string;
  }>;
  statDeltas?: {
    hp?: number;
    mp?: number;
  };
}

export function PlayerStatusCard({
  avatar = playerAvatar,
  name = 'AKIRA',
  hp,
  mp,
  money,
  credit,
  activeEffects = [],
  statDeltas = {}
}: PlayerStatusCardProps) {
  return (
    <div className="relative" style={{ width: '281.188px', height: '112.333px' }}>
      {/* 喷漆发光背景 */}
      <div 
        className="absolute blur-2xl filter opacity-40"
        style={{
          left: '-16.82px',
          top: '-16.82px',
          width: '314.818px',
          height: '145.964px',
          background: 'linear-gradient(to right, #ff6467, #fdc700 50%, #ff8904)'
        }}
      />
      
      {/* 主卡片 */}
      <div 
        className="relative bg-white box-border flex items-center"
        style={{
          width: '281.188px',
          height: '112.333px',
          padding: '14.923px 18.708px 14.923px 18.708px'
        }}
      >
        {/* GTA边框和阴影 */}
        <div 
          aria-hidden="true" 
          className="absolute border-[6px] border-black border-solid inset-0 pointer-events-none" 
          style={{ boxShadow: GTA_SHADOWS.PLAYER_STATUS }}
        />
        
        {/* 横向布局：头像 + 状态栏 */}
        <div className="relative flex items-center gap-[6px] w-full">
          {/* 左侧：头像 */}
          <div 
            className="shrink-0 box-border flex items-center justify-center overflow-clip relative"
            style={{
              width: '73.568px',
              height: '73.568px',
              padding: '3px'
            }}
          >
            <img 
              src={avatar}
              alt={name}
              className="absolute inset-0 max-w-none object-cover size-full scale-[2.3]"
            />
            <div 
              aria-hidden="true"
              className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none"
              style={{ boxShadow: GTA_SHADOWS.AVATAR }}
            />
          </div>
          
          {/* 右侧：状态栏 */}
          <div className="flex flex-col gap-[1.5px] flex-1">
            {/* HP行 */}
            <div className="flex items-center gap-[6px]">
              <span 
                className="font-black text-[12px] uppercase leading-[16px] w-[32px]"
                style={{ color: GTA_COLORS.TEXT_DARK }}
              >
                HP
              </span>
              <div className="flex items-center gap-[6px]">
                <div 
                  className="bg-[#d1d5dc] border border-black relative overflow-hidden"
                  style={{ width: '70px', height: '12px' }}
                >
                  <div 
                    className="h-full transition-all duration-300 absolute left-0 top-0"
                    style={{ 
                      width: `${(hp.value / hp.max) * 100}%`,
                      background: GTA_GRADIENTS.HP_BAR
                    }}
                  />
                </div>
                <motion.span 
                  key={hp.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-[14px] leading-[20px]"
                  style={{ 
                    fontFamily: GTA_FONTS.NUMBER,
                    color: GTA_COLORS.TEXT_DARK
                  }}
                >
                  {hp.value}
                </motion.span>
                <span 
                  className="font-medium text-[10px] leading-[15px]"
                  style={{ color: GTA_COLORS.TEXT_MUTED }}
                >
                  /{hp.max}
                </span>
              </div>
            </div>
            
            {/* MP行 */}
            <div className="flex items-center gap-[6px]">
              <span 
                className="font-black text-[12px] uppercase leading-[16px] w-[32px]"
                style={{ color: GTA_COLORS.TEXT_DARK }}
              >
                MP
              </span>
              <div className="flex items-center gap-[6px]">
                <div 
                  className="bg-[#d1d5dc] border border-black relative overflow-hidden"
                  style={{ width: '70px', height: '12px' }}
                >
                  <div 
                    className="h-full transition-all duration-300 absolute left-0 top-0"
                    style={{ 
                      width: `${(mp.value / mp.max) * 100}%`,
                      background: GTA_GRADIENTS.MP_BAR
                    }}
                  />
                </div>
                <motion.span 
                  key={mp.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-[14px] leading-[20px]"
                  style={{ 
                    fontFamily: GTA_FONTS.NUMBER,
                    color: GTA_COLORS.TEXT_DARK
                  }}
                >
                  {mp.value}
                </motion.span>
                <span 
                  className="font-medium text-[10px] leading-[15px]"
                  style={{ color: GTA_COLORS.TEXT_MUTED }}
                >
                  /{mp.max}
                </span>
              </div>
            </div>
            
            {/* 财力和信用行 */}
            <div className="flex items-center gap-[16px] mt-[2px]">
              <div className="flex items-center gap-[5px]">
                <span className="text-[16px] leading-[24px]">💰</span>
                <span 
                  className="font-black text-[12px] uppercase leading-[16px]"
                  style={{ color: GTA_COLORS.TEXT_DARK }}
                >
                  {money}
                </span>
              </div>
              
              <div className="flex items-center gap-[5px]">
                <span className="text-[16px] leading-[24px]">⭐</span>
                <span 
                  className="text-[14px] leading-[20px]"
                  style={{ 
                    fontFamily: GTA_FONTS.NUMBER,
                    color: GTA_COLORS.TEXT_DARK
                  }}
                >
                  {credit}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}