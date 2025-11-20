import React from 'react';
import { PlayerStatusCard } from './gta/PlayerStatusCard';
import { WantedStarsCard } from './gta/WantedStarsCard';

interface HeaderSectionProps {
  playerStatus?: {
    avatar?: string;
    name?: string;
    vigor: { value: number; max: number };
    clarity: { value: number; max: number };
    financial_power: number;
    credit: { value: number };
    active_effects: Array<{
      name: string;
      type: 'buff' | 'debuff';
      description?: string;
    }>;
  };
  statDeltas?: {
    vigor?: number;
    clarity?: number;
  };
  wantedLevel?: number;
}

/**
 * 头部区域组件 - 完全按照Figma原稿结构
 * 
 * 布局：
 * - 左上角：PlayerStatusCard (rotate-[357deg], position: left-[-2.38px] top-[-21.88px])
 * - 右上角：WantedStarsCard (rotate-[6deg], position: left-[1170.05px] top-[-9.57px])
 */
export function HeaderSection({ playerStatus, statDeltas = {}, wantedLevel = 2 }: HeaderSectionProps) {
  return (
    <div className="relative h-[98px] w-full max-w-[1368px] mx-auto" data-name="Header">
      {/* PlayerStatusCard - 左上角，稍微逆时针旋转 */}
      <div 
        className="absolute flex items-center justify-center" 
        style={{
          left: '-2.38px',
          top: '-21.88px',
          height: `calc(1px * ((281.1875 * 0.0523359552025795) + (112.328125 * 0.9986295104026794)))`,
          width: `calc(1px * ((112.328125 * 0.0523359552025795) + (281.1875 * 0.9986295104026794)))`,
        }}
      >
        <div className="shrink-0" style={{ transform: 'rotate(357deg)' }}>
          {playerStatus ? (
            <PlayerStatusCard
              avatar={playerStatus.avatar}
              name={playerStatus.name || 'AKIRA'}
              hp={{
                value: playerStatus.vigor.value,
                max: playerStatus.vigor.max
              }}
              mp={{
                value: playerStatus.clarity.value,
                max: playerStatus.clarity.max
              }}
              money={playerStatus.financial_power}
              credit={playerStatus.credit.value}
              activeEffects={playerStatus.active_effects}
              statDeltas={{
                hp: statDeltas.vigor,
                mp: statDeltas.clarity
              }}
            />
          ) : (
            <div className="bg-white border-[6px] border-black w-[281px] h-[112px] flex items-center justify-center">
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          )}
        </div>
      </div>

      {/* WantedStarsCard - 右上角，稍微顺时针旋转 */}
      <div 
        className="absolute flex items-center justify-center" 
        style={{
          left: '1170.05px',
          top: '-9.57px',
          height: `calc(1px * ((192.078125 * 0.10452846437692642) + (83.125 * 0.9945219159126282)))`,
          width: `calc(1px * ((83.125 * 0.10452846437692642) + (192.078125 * 0.9945219159126282)))`,
        }}
      >
        <div className="shrink-0" style={{ transform: 'rotate(6deg)' }}>
          <WantedStarsCard stars={wantedLevel} maxStars={5} />
        </div>
      </div>

      {/* POW! 装饰文字 - 右上角（可选） */}
      <div 
        className="absolute" 
        style={{
          left: '1232.23px',
          top: '-19.41px',
          transform: 'rotate(12deg)',
        }}
      >
        <div className="h-[77px] w-[124px] opacity-15">
          <p className="font-['Bangers:Regular',sans-serif] text-[60px] text-red-500 uppercase tracking-[3px] leading-[54px]">
            POW!
          </p>
        </div>
      </div>
    </div>
  );
}
