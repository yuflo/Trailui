/**
 * Theme Selector Component
 * 
 * 故事选择器 - 允许用户在不同游戏故事间切换
 */

import { Palette } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';

/**
 * 故事选择器数据项
 */
export interface StorySelectorItem {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  icon?: string;
  scenarioCount?: number;
}

interface ThemeSelectorProps {
  themes: StorySelectorItem[];
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ themes, currentThemeId, onThemeChange }: ThemeSelectorProps) {
  const currentTheme = themes.find(t => t.id === currentThemeId);

  return (
    <div className="flex items-center gap-3">
      <Palette className="w-4 h-4 text-cyan-400" />
      <Select value={currentThemeId} onValueChange={onThemeChange}>
        <SelectTrigger className="w-[280px] bg-slate-950/80 border-cyan-900/50 hover:border-cyan-700/50 transition-colors">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentTheme?.icon}</span>
              <span>{currentTheme?.title}</span>
              {currentTheme?.scenarioCount !== undefined && (
                <Badge variant="outline" className="ml-auto text-xs border-cyan-800/50">
                  {currentTheme.scenarioCount} 场景
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-slate-950/95 border-cyan-900/50 backdrop-blur-xl">
          <SelectGroup>
            <SelectLabel className="text-cyan-400">选择故事场景</SelectLabel>
            {themes.map((theme) => (
              <SelectItem 
                key={theme.id} 
                value={theme.id}
                className="cursor-pointer hover:bg-cyan-950/30 focus:bg-cyan-950/40"
              >
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-center gap-2">
                    <span>{theme.icon}</span>
                    <span>{theme.title}</span>
                    {theme.scenarioCount !== undefined && (
                      <Badge variant="outline" className="ml-auto text-xs border-cyan-800/50">
                        {theme.scenarioCount} 场景
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {theme.description}
                  </div>
                  {theme.tags && theme.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {theme.tags.map((tag, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs px-1.5 py-0 bg-cyan-950/30 text-cyan-300 border-cyan-800/30"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
