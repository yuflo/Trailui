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
      <Palette className="w-4 h-4 text-[#fbbf24]" />
      <Select value={currentThemeId} onValueChange={onThemeChange}>
        <SelectTrigger className="w-[280px] bg-[#140f0f]/80 border-[3px] border-black hover:border-[#A83C3C] transition-colors">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentTheme?.icon}</span>
              <span>{currentTheme?.title}</span>
              {currentTheme?.scenarioCount !== undefined && (
                <Badge variant="outline" className="ml-auto text-xs border-black bg-white text-black">
                  {currentTheme.scenarioCount} 场景
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#140f0f]/95 border-[3px] border-black backdrop-blur-xl">
          <SelectGroup>
            <SelectLabel className="text-[#fbbf24]">选择故事场景</SelectLabel>
            {themes.map((theme) => (
              <SelectItem 
                key={theme.id} 
                value={theme.id}
                className="cursor-pointer hover:bg-[#A83C3C]/20 focus:bg-[#A83C3C]/30"
              >
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-center gap-2">
                    <span>{theme.icon}</span>
                    <span>{theme.title}</span>
                    {theme.scenarioCount !== undefined && (
                      <Badge variant="outline" className="ml-auto text-xs border-black bg-white text-black">
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
                          className="text-xs px-1.5 py-0 bg-[#A83C3C]/30 text-white border-black"
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