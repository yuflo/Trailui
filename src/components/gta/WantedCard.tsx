/**
 * WantedCard - GTA风格焦点NPC卡片
 * 
 * 用于显示当前场景中的焦点NPC（第一个NPC）
 * GTA V/VI美式讽刺漫画风格，WANTED海报美学
 */

import type { EnrichedNPCEntity } from '../../types';
import { GTA_GRADIENTS } from '../../config/gta-theme';

interface WantedCardProps {
  npc: EnrichedNPCEntity;
}

export function WantedCard({ npc }: WantedCardProps) {
  return (
    <div className="relative">
      {/* 外层容器：3px黑色边框 */}
      <div 
        className="border-[3px] border-black bg-[#1a0d0d]"
        style={{
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.4), 0 4px 20px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* WANTED 标题 */}
        <div className="bg-red-900 px-4 py-2 border-b-[3px] border-black"
          style={{ background: GTA_GRADIENTS.WANTED_BG }}
        >
          <div className="text-center">
            <div className="text-red-200 tracking-[0.3em] opacity-80">FOCUS</div>
            <div className="text-white tracking-[0.2em]">焦点目标</div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="p-4 space-y-3">
          {/* 头像照片 */}
          <div className="relative">
            <div 
              className="aspect-square w-full bg-black/40 border-2 border-red-900/50 overflow-hidden"
              style={{
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
              }}
            >
              <img 
                src={npc.photo || npc.avatar} 
                alt={npc.name}
                className="w-full h-full object-cover opacity-90 grayscale-[0.3] contrast-125"
              />
            </div>
            
            {/* 照片角落装饰 */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500/60" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500/60" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500/60" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500/60" />
          </div>

          {/* NPC 信息 */}
          <div className="space-y-2">
            {/* 名字 */}
            <div className="text-center">
              <div className="text-white tracking-wider">{npc.name}</div>
              {npc.nameJP && (
                <div className="text-red-300/60 text-xs tracking-widest">{npc.nameJP}</div>
              )}
            </div>

            {/* 职业 */}
            {npc.role && (
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-red-950/50 border border-red-800/30">
                  <span className="text-red-200/80 text-xs tracking-wide">{npc.role}</span>
                </div>
              </div>
            )}

            {/* 状态栏 */}
            <div className="space-y-1.5 pt-2 border-t border-red-900/30">
              {/* 信任度 */}
              {npc.stats && (
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-200/70">信任</span>
                    <span className="text-red-200">{npc.stats.trust}%</span>
                  </div>
                  <div className="h-1.5 bg-black/60 border border-red-900/30">
                    <div 
                      className="h-full"
                      style={{ 
                        width: `${npc.stats.trust}%`,
                        background: GTA_GRADIENTS.HP_BAR,
                        boxShadow: '0 0 4px rgba(220, 38, 38, 0.6)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 好感度情绪 */}
              <div className="flex justify-between text-xs pt-1">
                <span className="text-red-200/70">态度</span>
                <span className="text-red-200">{npc.rapport.sentiment}</span>
              </div>

              {/* 心防值 */}
              <div className="flex justify-between text-xs">
                <span className="text-red-200/70">心防</span>
                <span className="text-red-200">{npc.composure}</span>
              </div>
            </div>

            {/* 当前状态 */}
            <div className="pt-2 border-t border-red-900/30">
              <div className="text-xs text-red-200/60 mb-1">状态</div>
              <div className="text-xs text-red-100/90 leading-relaxed">
                {npc.status_summary}
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰条 */}
        <div className="h-2 bg-red-900 border-t-[3px] border-black" />
      </div>

      {/* 外发光效果 */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}