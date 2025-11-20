/**
 * 条件化日志工具
 * 生产环境自动禁用日志输出
 */

const IS_DEV = import.meta.env?.DEV ?? true;

export const logger = {
  log: (...args: any[]) => {
    if (IS_DEV) console.log(...args);
  },
  
  warn: (...args: any[]) => {
    if (IS_DEV) console.warn(...args);
  },
  
  error: (...args: any[]) => {
    // Error始终输出
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (IS_DEV) console.info(...args);
  },
  
  debug: (...args: any[]) => {
    if (IS_DEV) console.debug(...args);
  },
};
