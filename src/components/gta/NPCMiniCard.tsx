/**
 * NPCMiniCard - GTA风格普通NPC小卡片
 * 
 * 设计规范：标准3色配色系统（砖红#dc2626、深红黑#1a0000、纯白#ffffff）
 * 用于显示场景中的非焦点NPC（第2+个NPC）
 * 紧凑的横向布局
 */

import type { EnrichedNPCEntity } from '../../types';
import { GTA_GRADIENTS } from '../../config/gta-theme';

interface NPCMiniCardProps {
  npc: EnrichedNPCEntity;
}

export function NPCMiniCard({ npc }: NPCMiniCardProps) {
  return (
    <div 
      className="border-[3px] border-black bg-[#1a0d0d] hover:bg-[#2a1515] transition-colors"
      style={{
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.2), 0 2px 10px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex gap-3 p-3">
        {/* 头像 */}
        <div className="flex-shrink-0">
          <div 
            className="w-16 h-16 bg-black/40 border border-[#dc2626]/50 overflow-hidden"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
            }}
          >
            <img 
              src={npc.photo || npc.avatar} 
              alt={npc.name}
              className="w-full h-full object-cover opacity-90 grayscale-[0.3] contrast-125"
            />
          </div>
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* 名字和职业 */}
          <div>
            <div className="text-white text-sm tracking-wide truncate">{npc.name}</div>
            {npc.role && (
              <div className="text-[#dc2626]/60 text-xs truncate">{npc.role}</div>
            )}
          </div>

          {/* 态度和心防 */}
          <div className="flex gap-3 text-xs">
            <div className="flex gap-1">
              <span className="text-white/60">态度:</span>
              <span className="text-white">{npc.rapport.sentiment}</span>
            </div>
            <div className="flex gap-1 truncate">
              <span className="text-white/60">心防:</span>
              <span className="text-white truncate">{npc.composure}</span>
            </div>
          </div>

          {/* 信任度条（如果有stats） */}
          {npc.stats && (
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs flex-shrink-0">信任</span>
              <div className="flex-1 h-1 bg-black/60 border border-[#dc2626]/30">
                <div 
                  className="h-full"
                  style={{ 
                    width: `${npc.stats.trust}%`,
                    background: GTA_GRADIENTS.HP_BAR,
                    boxShadow: '0 0 3px rgba(220, 38, 38, 0.5)'
                  }}
                />
              </div>
              <span className="text-white text-xs flex-shrink-0">{npc.stats.trust}%</span>
            </div>
          )}
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="h-1 bg-[#dc2626] border-t border-black" />
    </div>
  );
}