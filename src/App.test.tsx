/**
 * App 测试入口
 * 
 * 用于快速切换测试页面
 */

import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { TestTube2, Play, ArrowLeft } from 'lucide-react';

// 导入测试组件
import { NPCDataModelTest } from './components/test/NPCDataModelTest';
import { NPCAvatarTest } from './components/test/NPCAvatarTest';

// 导入主应用
import App from './App';

type TestPage = 'main' | 'npc-data-model' | 'npc-avatar';

export default function AppTest() {
  const [currentPage, setCurrentPage] = useState<TestPage>('npc-data-model');
  
  // 如果是主应用，直接渲染
  if (currentPage === 'main') {
    return (
      <div>
        {/* 返回测试菜单按钮 */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setCurrentPage('npc-data-model')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回测试
          </Button>
        </div>
        <App />
      </div>
    );
  }
  
  // 测试页面路由
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-6">
      {/* 测试菜单 */}
      {currentPage === 'npc-data-model' && (
        <div>
          {/* 顶部导航 */}
          <Card className="max-w-7xl mx-auto mb-6 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TestTube2 className="w-6 h-6 text-blue-500" />
                Dreamheart 引擎测试中心
                <Badge variant="secondary">v2.0</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentPage('npc-data-model')}
                  variant={currentPage === 'npc-data-model' ? 'default' : 'outline'}
                  className="gap-2"
                >
                  <TestTube2 className="w-4 h-4" />
                  NPC 数据模型测试
                </Button>
                
                <Button
                  onClick={() => setCurrentPage('npc-avatar')}
                  variant={currentPage === 'npc-avatar' ? 'default' : 'outline'}
                  className="gap-2"
                >
                  <TestTube2 className="w-4 h-4" />
                  NPC 头像测试（旧）
                </Button>
                
                <Button
                  onClick={() => setCurrentPage('main')}
                  variant="outline"
                  className="gap-2 ml-auto"
                >
                  <Play className="w-4 h-4" />
                  启动主应用
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* 测试页面内容 */}
          <NPCDataModelTest />
        </div>
      )}
      
      {currentPage === 'npc-avatar' && (
        <div>
          {/* 顶部导航 */}
          <Card className="max-w-7xl mx-auto mb-6 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TestTube2 className="w-6 h-6 text-blue-500" />
                Dreamheart 引擎测试中心
                <Badge variant="secondary">v2.0</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentPage('npc-data-model')}
                  variant={currentPage === 'npc-data-model' ? 'default' : 'outline'}
                  className="gap-2"
                >
                  <TestTube2 className="w-4 h-4" />
                  NPC 数据模型测试
                </Button>
                
                <Button
                  onClick={() => setCurrentPage('npc-avatar')}
                  variant={currentPage === 'npc-avatar' ? 'default' : 'outline'}
                  className="gap-2"
                >
                  <TestTube2 className="w-4 h-4" />
                  NPC 头像测试（旧）
                </Button>
                
                <Button
                  onClick={() => setCurrentPage('main')}
                  variant="outline"
                  className="gap-2 ml-auto"
                >
                  <Play className="w-4 h-4" />
                  启动主应用
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* 测试页面内容 */}
          <NPCAvatarTest />
        </div>
      )}
    </div>
  );
}
