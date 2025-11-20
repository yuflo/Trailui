import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { GTA_COLORS, GTA_SHADOWS, GTA_GRADIENTS, GTA_TEXT_SHADOWS, GTA_FONTS } from '../../config/gta-theme';

interface MainPanelFrameProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  panelHeight?: string;
  onRefresh?: () => void;
}

export function MainPanelFrame({
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  panelHeight = '700px',
  onRefresh,
}: MainPanelFrameProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="relative">
      <div
        className="flex flex-col"
        style={{
          height: panelHeight,
          backgroundColor: GTA_COLORS.BG_DARK,
          position: 'relative',
        }}
      >
        {/* GTA边框层 */}
        <div 
          aria-hidden="true" 
          className="absolute border-4 border-solid inset-0 pointer-events-none" 
          style={{
            borderColor: GTA_COLORS.PRIMARY,
            boxShadow: GTA_SHADOWS.PANEL
          }}
        />

        {/* 标题区 */}
        <div
          className="p-3 relative flex-shrink-0"
          style={{
            borderBottom: `3px solid ${GTA_COLORS.PRIMARY}`,
            boxShadow: `inset 0 -1px 0 rgba(168, 60, 60, 0.3)`,
          }}
        >
          {/* 喷漆装饰条 */}
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{
              background: GTA_GRADIENTS.SPRAY_PAINT,
            }}
          />

          {/* ✅ 标题栏：flex布局，左右对齐 */}
          <div className="flex items-center justify-between mb-2">
            {/* 左侧：图标 + 标题 */}
            <div className="flex items-center gap-2">
              {/* 图标徽章 */}
              <div
                className="p-1.5 border-[3px] border-black transform rotate-6"
                style={{
                  background: GTA_GRADIENTS.ICON_BADGE,
                  boxShadow: `0 0 0 2px ${GTA_COLORS.PRIMARY}, 4px 4px 0 rgba(0,0,0,0.5)`,
                }}
              >
                <Icon className="text-white" strokeWidth={3} size={18} />
              </div>

              {/* GTA标题 */}
              <h2
                className="uppercase tracking-wider"
                style={{
                  fontFamily: GTA_FONTS.TITLE,
                  fontSize: '24px',
                  lineHeight: '0.9',
                  color: GTA_COLORS.WHITE,
                  textShadow: GTA_TEXT_SHADOWS.TITLE,
                }}
              >
                {title}
              </h2>
            </div>

            {/* ✅ 右侧：刷新按钮（GTA方形按钮风格） */}
            {onRefresh && (
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400,
                  damping: 20,
                  rotate: { 
                    duration: 0.6, 
                    repeat: isRefreshing ? Infinity : 0,
                    ease: "linear" 
                  }
                }}
                className="p-2 border-[3px] border-solid hover:bg-[#C85454] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="刷新频道"
                style={{
                  borderColor: GTA_COLORS.PRIMARY,
                  backgroundColor: 'rgba(20, 15, 15, 0.8)',
                  boxShadow: `0 0 0 2px ${GTA_COLORS.PRIMARY}, 3px 3px 0 #000`,
                }}
              >
                <RefreshCw className="w-5 h-5 text-white" strokeWidth={3} />
              </motion.button>
            )}
          </div>

          {/* 副标题 */}
          <p
            className="uppercase font-mono font-black tracking-[0.25em]"
            style={{
              fontSize: '10px',
              color: GTA_COLORS.TEXT_LIGHT,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* 内容区 */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3"
             style={{
               scrollbarWidth: 'thin',
               scrollbarColor: '#A855F7 #E5E7EB'
             }}>
          {children}
        </div>

        {/* 底部区 */}
        {footer && (
          <div
            className="flex-shrink-0 p-3"
            style={{
              borderTop: `3px solid ${GTA_COLORS.PRIMARY}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
