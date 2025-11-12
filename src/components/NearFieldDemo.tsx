/**
 * Near-Field Interaction Demo Component
 * 近场交互演示组件
 * 
 * 功能：
 * - 演示如何集成近场交互到前端UI
 * - 监听引擎事件
 * - 渲染事件流
 * - 响应用户交互
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../engine/core/GameEngine';
import type { NearFieldEvent, NextActionType } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

/**
 * 近场交互演示组件
 */
export function NearFieldDemo() {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [events, setEvents] = useState<NearFieldEvent[]>([]);
  const [awaitingAction, setAwaitingAction] = useState<NextActionType | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [intentText, setIntentText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 初始化引擎
  useEffect(() => {
    const initEngine = async () => {
      const newEngine = new GameEngine({ debug: true });
      await newEngine.initialize();
      await newEngine.startGame('demo-story'); // ✨ 使用demo-story
      
      // 监听事件
      newEngine.on('nearfield_scene_loaded', (event) => {
        console.log('[Demo] Scene loaded:', event.data);
        const response = event.data.response;
        setEvents(response.new_events);
        setAwaitingAction(response.next_action_type);
        setCurrentSceneId(event.data.sceneId);
      });
      
      newEngine.on('nearfield_events_received', (event) => {
        console.log('[Demo] Events received:', event.data);
        const response = event.data.response;
        setEvents(prev => [...prev, ...response.new_events]);
        setAwaitingAction(response.next_action_type);
      });
      
      newEngine.on('nearfield_scene_ended', (event) => {
        console.log('[Demo] Scene ended:', event.data);
      });
      
      newEngine.on('nearfield_error', (event) => {
        console.error('[Demo] Error:', event.data);
        alert(`错误: ${event.data.message}`);
        setIsProcessing(false);
      });
      
      setEngine(newEngine);
      setIsReady(true);
    };
    
    initEngine();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  // 进入场景A
  const handleEnterSceneA = async () => {
    if (!engine) return;
    
    setIsProcessing(true);
    try {
      await engine.enterNearField('scene-a'); // ✨ 使用新scene_id
    } catch (error) {
      console.error(error);
    }
    setIsProcessing(false);
  };

  // 进入场景B
  const handleEnterSceneB = async () => {
    if (!engine) return;
    
    setIsProcessing(true);
    try {
      await engine.enterNearField('scene-b'); // ✨ 使用新scene_id
    } catch (error) {
      console.error(error);
    }
    setIsProcessing(false);
  };

  // 玩家交互
  const handleInteract = async () => {
    if (!engine || !intentText.trim()) return;
    
    setIsProcessing(true);
    try {
      await engine.nearFieldInteract(intentText);
      setIntentText('');
    } catch (error) {
      console.error(error);
    }
    setIsProcessing(false);
  };

  // 玩家路过
  const handlePass = async () => {
    if (!engine) return;
    
    setIsProcessing(true);
    try {
      await engine.nearFieldPass();
    } catch (error) {
      console.error(error);
    }
    setIsProcessing(false);
  };

  // 退出近场交互
  const handleExit = () => {
    if (!engine) return;
    
    engine.exitNearField();
    setEvents([]);
    setAwaitingAction(null);
    setCurrentSceneId(null);
    setIntentText('');
  };

  // 渲染事件
  const renderEvent = (event: NearFieldEvent, index: number) => {
    const bgColor = 
      event.actor === 'Player' ? 'bg-blue-50 dark:bg-blue-950' :
      event.actor === 'System' ? 'bg-gray-50 dark:bg-gray-900' :
      'bg-amber-50 dark:bg-amber-950';

    return (
      <div key={event.unit_id || index} className={`p-3 rounded-lg ${bgColor} mb-2`}>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            {event.type}
          </Badge>
          <span className="text-sm font-medium">{event.actor}</span>
        </div>
        <div className="text-sm whitespace-pre-wrap">
          {event.content}
        </div>
        {event.type === 'InterventionPoint' && event.hint && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
            💡 提示: {event.hint}
          </div>
        )}
      </div>
    );
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p>初始化引擎中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl mb-4">近场交互演示</h1>
          
          {/* 控制面板 */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {!currentSceneId && (
              <>
                <Button onClick={handleEnterSceneA} disabled={isProcessing}>
                  进入场景A（酒吧门口）
                </Button>
                <Button onClick={handleEnterSceneB} disabled={isProcessing}>
                  进入场景B（酒吧内部）
                </Button>
              </>
            )}
            
            {currentSceneId && (
              <Button onClick={handleExit} variant="outline">
                退出近场交互
              </Button>
            )}
          </div>

          {/* 当前状态 */}
          {currentSceneId && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">场景:</span>
                  <span className="ml-2 font-medium">{currentSceneId}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">状态:</span>
                  <span className="ml-2 font-medium">{awaitingAction?.type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">事件数:</span>
                  <span className="ml-2 font-medium">{events.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* 事件流 */}
          <ScrollArea className="h-96 border rounded-lg p-4 mb-4" ref={scrollRef}>
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                选择一个场景开始...
              </div>
            ) : (
              events.map((event, index) => renderEvent(event, index))
            )}
          </ScrollArea>

          {/* 交互面板 */}
          {currentSceneId && awaitingAction && (
            <div className="space-y-2">
              {awaitingAction.type === 'AWAITING_INTERVENTION' && (
                <div className="flex gap-2">
                  <Button onClick={handleInteract} disabled={isProcessing || !intentText.trim()} className="flex-1">
                    介入
                  </Button>
                  <Button onClick={handlePass} disabled={isProcessing} variant="outline" className="flex-1">
                    路过
                  </Button>
                </div>
              )}

              {awaitingAction.type === 'AWAITING_INTERACTION' && (
                <Button onClick={handleInteract} disabled={isProcessing || !intentText.trim()} className="w-full">
                  继续交互
                </Button>
              )}

              {awaitingAction.type === 'SCENE_ENDED' && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="font-medium mb-2">场景已结束</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    你可以退出近场交互，或进入其他场景
                  </p>
                </div>
              )}

              {/* 意图输入框 */}
              {(awaitingAction.type === 'AWAITING_INTERVENTION' || awaitingAction.type === 'AWAITING_INTERACTION') && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="输入你的意图..."
                    value={intentText}
                    onChange={(e) => setIntentText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && intentText.trim()) {
                        handleInteract();
                      }
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* 快捷输入建议 */}
          {currentSceneId && awaitingAction?.type === 'AWAITING_INTERVENTION' && (
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIntentText('让我来处理')}
              >
                让我来处理
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIntentText('别对女孩动粗')}
              >
                别对女孩动粗
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIntentText('冷静一下')}
              >
                冷静一下
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default NearFieldDemo;
