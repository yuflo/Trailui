import React from 'react';
import { GTA_COLORS, GTA_SHADOWS, GTA_GRADIENTS } from '../../config/gta-theme';

interface WantedStarsCardProps {
  stars: number;
  maxStars?: number;
}

export function WantedStarsCard({ stars = 2, maxStars = 5 }: WantedStarsCardProps) {
  return (
    <div className="relative w-full">
      <div 
        className="box-border px-[23px] py-[16px] relative"
        style={{
          background: GTA_GRADIENTS.WANTED_BG
        }}
      >
        {/* 边框和阴影 */}
        <div 
          aria-hidden="true" 
          className="absolute border-[6px] border-black border-solid inset-0 pointer-events-none" 
          style={{ boxShadow: GTA_SHADOWS.WANTED }}
        />
        
        {/* 内容 */}
        <div className="relative flex items-center gap-[18px]">
          <div className="shrink-0">
            <p 
              className="text-[30px] leading-[36px]"
              style={{ 
                fontFamily: "'Rajdhani:Bold','Noto_Sans_Symbols2:Regular',sans-serif",
                color: GTA_COLORS.WHITE
              }}
            >
              {'★'.repeat(stars)}{'☆'.repeat(maxStars - stars)}
            </p>
          </div>
          
          <div>
            <p 
              className="font-black text-[18px] leading-[28px] tracking-[0.9px] uppercase"
              style={{ color: GTA_COLORS.WHITE }}
            >
              WANTED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
