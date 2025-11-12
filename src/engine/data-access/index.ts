/**
 * Data Access Layer
 * 
 * 统一导出数据访问层的所有组件
 */

// 工厂类
export { DataAccessFactory, type DataAccessMode } from './DataAccessFactory';

// Mock实现
export * from './mock';

// API实现
export * from './api';
