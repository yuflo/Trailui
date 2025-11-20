/**
 * 背景层组件 - GTA Tokyo Faded Poster 风格
 * 
 * 三层结构：
 * - Layer 1: 砖红渐变背景（顶部→底部：砖红→深红→纯黑）
 * - Layer 2: 扫描线动画（25秒缓慢滚动）
 * - Layer 3: 章鱼水印（Phase 4 添加）
 * 
 * 设计参考：COMPLETE_DESIGN_SYSTEM.md 4.1节
 */

export function BackgroundLayers() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Layer 1: 砖红渐变背景 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            var(--brick-red) 0%,
            var(--dark-red) 50%,
            var(--deep-black) 100%
          )`,
        }}
      />

      {/* Layer 2: 扫描线动画 */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div
          className="absolute inset-0 h-full"
          style={{
            background: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            )`,
            animation: 'scanline-scroll 25s linear infinite',
          }}
        />
      </div>

      {/* Layer 3: 章鱼水印 - Phase 4 实现 */}
      {/* 需要导入章鱼图片资源后添加 */}
    </div>
  );
}
