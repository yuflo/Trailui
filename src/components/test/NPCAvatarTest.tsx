/**
 * NPC 头像系统测试组件 - GTA风格重构版
 * 
 * 用于验证三种头像方案的效果
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getAvatar } from '../../utils/npc-avatar';
import { getNpcAvatar, hasNpcAvatar, getConfiguredNpcIds } from '../../config/npc-avatars.config';
import { generateNpcAvatar } from '../../utils/avatar-generator';

// 测试数据
const TEST_NPCS = [
  { id: 'npc_fatty_tang', name: '肥棠', role: '保镖', hasConfig: true },
  { id: 'npc_xiaoxue', name: '小雪', role: '酒保', hasConfig: true },
  { id: 'npc_unknown_1', name: '神秘人', role: '未知', hasConfig: false },
  { id: 'npc_gang_boss', name: '帮派老大', role: '黑帮', hasConfig: false },
  { id: 'npc_cyber_hacker', name: '黑客', role: '赛博', hasConfig: false },
];

export function NPCAvatarTest() {
  const [strategy, setStrategy] = useState<'figma-only' | 'generate-only' | 'hybrid'>('hybrid');
  const configuredIds = getConfiguredNpcIds();
  
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* 标题 */}
      <div className="p-6 border-[3px] border-black bg-[#1a0a0c]/95" style={{
        boxShadow: '0px 0px 0px 2px #fbbf24, 4px 4px 0px 0px #000000',
        filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.3))'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🎭</span>
          <h1 className="text-[#fbbf24]">NPC 头像系统测试</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">已配置头像：</span>
          <Badge 
            variant="outline" 
            className="border-[3px] border-black bg-[#fbbf24]/20 text-[#fbbf24]"
          >
            {configuredIds.length} 个
          </Badge>
          <div className="flex gap-2">
            {configuredIds.slice(0, 4).map(id => (
              <Badge 
                key={id} 
                variant="outline" 
                className="text-xs border-[2px] border-black bg-white/10 text-white"
              >
                {id}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* 策略选择 */}
      <div className="p-6 border-[3px] border-black bg-[#1a0a0c]/95" style={{
        boxShadow: '0px 0px 0px 2px #00d4ff, 4px 4px 0px 0px #000000'
      }}>
        <h2 className="text-[#00d4ff] mb-4">选择头像策略</h2>
        <div className="flex gap-3">
          <Button 
            onClick={() => setStrategy('figma-only')}
            className={strategy === 'figma-only' 
              ? 'bg-[#A83C3C] hover:bg-[#C85454] text-white border-[3px] border-black' 
              : 'bg-white/10 hover:bg-white/20 text-white border-[3px] border-black'
            }
            style={{ boxShadow: '3px 3px 0 #000' }}
          >
            方案A: 只用 Figma 头像
          </Button>
          <Button 
            onClick={() => setStrategy('generate-only')}
            className={strategy === 'generate-only' 
              ? 'bg-[#A83C3C] hover:bg-[#C85454] text-white border-[3px] border-black' 
              : 'bg-white/10 hover:bg-white/20 text-white border-[3px] border-black'
            }
            style={{ boxShadow: '3px 3px 0 #000' }}
          >
            方案B: 只用动态生成
          </Button>
          <Button 
            onClick={() => setStrategy('hybrid')}
            className={strategy === 'hybrid' 
              ? 'bg-[#A83C3C] hover:bg-[#C85454] text-white border-[3px] border-black' 
              : 'bg-white/10 hover:bg-white/20 text-white border-[3px] border-black'
            }
            style={{ boxShadow: '3px 3px 0 #000' }}
          >
            方案C: 混合策略 ⭐
          </Button>
        </div>
      </div>
      
      {/* NPC 展示 - GTA硬边卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEST_NPCS.map(npc => {
          const avatar = getAvatar(npc.id, { strategy });
          const isConfigured = hasNpcAvatar(npc.id);
          
          return (
            <div 
              key={npc.id} 
              className="p-4 border-[3px] border-black bg-[#1a0a0c]"
              style={{
                boxShadow: '0px 0px 0px 2px #a855f7, 3px 3px 0px 0px #000000'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white">{npc.name}</h3>
                {isConfigured ? (
                  <Badge 
                    className="text-xs border-[2px] border-black bg-[#39ff14] text-black"
                  >
                    已配置
                  </Badge>
                ) : (
                  <Badge 
                    className="text-xs border-[2px] border-black bg-[#fbbf24] text-black"
                  >
                    自动生成
                  </Badge>
                )}
              </div>
              <p className="text-xs text-white/60 mb-3">{npc.role}</p>
              
              {/* 头像 - 保持方形硬边 */}
              <div className="flex items-center justify-center bg-black/50 border-[3px] border-black p-4 mb-3">
                <img 
                  src={avatar} 
                  alt={npc.name}
                  className="w-32 h-32 object-cover border-[3px] border-white"
                />
              </div>
              
              {/* ID */}
              <div className="text-xs text-white/50 font-mono text-center">
                {npc.id}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 详细对比 */}
      <div className="p-6 border-[3px] border-black bg-[#1a0a0c]/95" style={{
        boxShadow: '0px 0px 0px 2px #ef4444, 4px 4px 0px 0px #000000'
      }}>
        <h2 className="text-[#ef4444] mb-4">三种方案对比</h2>
        <Tabs defaultValue="figma">
          <TabsList className="border-[3px] border-black bg-black/50">
            <TabsTrigger value="figma" className="data-[state=active]:bg-[#A83C3C] data-[state=active]:text-white">
              Figma 头像
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-[#A83C3C] data-[state=active]:text-white">
              动态生成
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-[#A83C3C] data-[state=active]:text-white">
              对比
            </TabsTrigger>
          </TabsList>
          
          {/* Figma 头像 */}
          <TabsContent value="figma" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEST_NPCS.filter(npc => hasNpcAvatar(npc.id)).map(npc => (
                <div key={npc.id} className="text-center">
                  <img 
                    src={getNpcAvatar(npc.id)}
                    alt={npc.name}
                    className="w-24 h-24 object-cover border-[3px] border-black mx-auto mb-2"
                  />
                  <p className="text-sm text-white">{npc.name}</p>
                  <p className="text-xs text-white/60">Figma 导入</p>
                </div>
              ))}
            </div>
            
            <div className="bg-[#00d4ff]/10 border-[3px] border-[#00d4ff] p-4">
              <p className="text-sm text-[#00d4ff]">
                ✅ <strong>优势</strong>: 高质量、风格统一、符合 GTA 设计<br/>
                ⚠️ <strong>劣势</strong>: 新增 NPC 需要手动配置
              </p>
            </div>
          </TabsContent>
          
          {/* 动态生成 */}
          <TabsContent value="generate" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEST_NPCS.map(npc => (
                <div key={npc.id} className="text-center">
                  <img 
                    src={generateNpcAvatar(npc.id)}
                    alt={npc.name}
                    className="w-24 h-24 object-cover border-[3px] border-black mx-auto mb-2"
                  />
                  <p className="text-sm text-white">{npc.name}</p>
                  <p className="text-xs text-white/60">自动生成</p>
                </div>
              ))}
            </div>
            
            <div className="bg-[#39ff14]/10 border-[3px] border-[#39ff14] p-4">
              <p className="text-sm text-[#39ff14]">
                ✅ <strong>优势</strong>: 无需配置、无限扩展、每个 NPC 独特<br/>
                ⚠️ <strong>劣势</strong>: 依赖外部 API、风格可能不统一
              </p>
            </div>
          </TabsContent>
          
          {/* 对比 */}
          <TabsContent value="comparison">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-[3px] border-black">
                <thead className="bg-black/50">
                  <tr className="border-b-[3px] border-black">
                    <th className="text-left p-2 text-white">NPC</th>
                    <th className="text-center p-2 text-white">Figma 头像</th>
                    <th className="text-center p-2 text-white">动态生成</th>
                    <th className="text-center p-2 text-white">混合策略</th>
                  </tr>
                </thead>
                <tbody>
                  {TEST_NPCS.map(npc => (
                    <tr key={npc.id} className="border-b-[3px] border-black bg-[#1a0a0c]/50">
                      <td className="p-2">
                        <div>
                          <p className="text-white">{npc.name}</p>
                          <p className="text-xs text-white/60">{npc.id}</p>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <img 
                          src={getAvatar(npc.id, { strategy: 'figma-only' })}
                          alt=""
                          className="w-16 h-16 object-cover border-[3px] border-black mx-auto"
                        />
                      </td>
                      <td className="text-center p-2">
                        <img 
                          src={getAvatar(npc.id, { strategy: 'generate-only' })}
                          alt=""
                          className="w-16 h-16 object-cover border-[3px] border-black mx-auto"
                        />
                      </td>
                      <td className="text-center p-2">
                        <img 
                          src={getAvatar(npc.id, { strategy: 'hybrid' })}
                          alt=""
                          className="w-16 h-16 object-cover border-[3px] border-black mx-auto"
                        />
                        {hasNpcAvatar(npc.id) ? (
                          <Badge className="text-xs mt-1 border-[2px] border-black bg-[#00d4ff] text-black">
                            Figma
                          </Badge>
                        ) : (
                          <Badge className="text-xs mt-1 border-[2px] border-black bg-[#fbbf24] text-black">
                            生成
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-[#a855f7]/10 border-[3px] border-[#a855f7] p-4 mt-4">
              <p className="text-sm text-[#a855f7]">
                ⭐ <strong>推荐使用混合策略</strong>：优先使用高质量 Figma 头像，未配置的 NPC 自动生成
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
