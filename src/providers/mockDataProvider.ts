/**
 * Mock Data Provider - 用于 Demo 演示
 * 实现 Refine DataProvider 接口，拦截数据请求并返回本地 Mock 数据
 * 支持：列表查询、单条查询、创建、更新、删除、自定义操作（如深度克隆）
 */

import { DataProvider } from "@refinedev/core";
import { mockStyles, mockVariants, mockBomItems, mockCustomers, mockSizes, mockUnits } from "../mock/data";
import type { IColorVariant, IBOMItem, ICloneVariantResponse } from "../types/models";

// ==========================================
// Mock 数据库（内存存储）
// ==========================================
// 注意：这是一个简单的内存数据库，页面刷新后会重置
// 实际应用中应该使用真实的后端 API
const mockDatabase: Record<string, any[]> = {
  styles: [...mockStyles],      // 使用扩展运算符创建副本，避免直接修改原数组
  variants: [...mockVariants],
  bom_items: [...mockBomItems],
  customers: [...mockCustomers],
  sizes: [...mockSizes],
  units: [...mockUnits],
};

// 用于生成新记录的 ID
let nextId = 10000;

/**
 * Mock Data Provider 实现
 */
export const mockDataProvider: DataProvider = {
  /**
   * 获取资源列表
   * 支持：分页、筛选（filters）
   * 关键用途：加载 L2 颜色列表（按 style_id 筛选）、加载 L3 配料列表（按 variant_id 筛选）
   */
  getList: async ({ resource, filters, pagination }) => {
    console.log(`[Mock API] getList: ${resource}`, { filters, pagination });

    // 模拟网络延迟（300ms），增加真实感
    await new Promise(resolve => setTimeout(resolve, 300));

    // 获取原始数据
    let data = mockDatabase[resource] || [];

    // ========== 实现筛选逻辑（核心：用于父子级联查询）==========
    if (filters && filters.length > 0) {
      filters.forEach((filter: any) => {
        const { field, operator, value } = filter;
        
        if (operator === 'eq' && value !== undefined && value !== null) {
          // 相等筛选（如：variant_id = 101）
          data = data.filter((item: any) => item[field] == value);
        } else if (operator === 'contains' && value) {
          // 包含筛选（用于搜索）
          data = data.filter((item: any) => 
            String(item[field]).toLowerCase().includes(String(value).toLowerCase())
          );
        }
      });
    }

    // ========== 实现分页逻辑 ==========
    const { current = 1, pageSize = 10 } = pagination || {};
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);

    return {
      data: pageData,
      total: data.length,
    };
  },

  /**
   * 获取单条记录
   * 用途：加载 L1 款号详情
   */
  getOne: async ({ resource, id }) => {
    console.log(`[Mock API] getOne: ${resource}#${id}`);

    await new Promise(resolve => setTimeout(resolve, 200));

    const data = mockDatabase[resource]?.find((item: any) => item.id == id);

    if (!data) {
      throw new Error(`Record not found: ${resource}#${id}`);
    }

    return { data };
  },

  /**
   * 创建新记录
   * 用途：新建款号、新建颜色版本、新建配料
   */
  create: async ({ resource, variables }) => {
    console.log(`[Mock API] create: ${resource}`, variables);

    await new Promise(resolve => setTimeout(resolve, 300));

    // 生成新 ID
    const newId = nextId++;
    const newRecord = {
      id: newId,
      ...variables,
    };

    // 添加到内存数据库
    if (!mockDatabase[resource]) {
      mockDatabase[resource] = [];
    }
    mockDatabase[resource].push(newRecord);

    return { data: newRecord };
  },

  /**
   * 更新记录
   * 用途：更新 L3 配料信息（包括更新其 specDetails 子列表）
   */
  update: async ({ resource, id, variables }) => {
    console.log(`[Mock API] update: ${resource}#${id}`, variables);

    await new Promise(resolve => setTimeout(resolve, 300));

    const dataArray = mockDatabase[resource];
    const index = dataArray?.findIndex((item: any) => item.id == id);

    if (index === undefined || index === -1) {
      throw new Error(`Record not found: ${resource}#${id}`);
    }

    // 合并更新（保留未修改的字段）
    const updatedRecord = {
      ...dataArray[index],
      ...variables,
      id: Number(id), // 确保 ID 不被覆盖
    };

    dataArray[index] = updatedRecord;

    return { data: updatedRecord };
  },

  /**
   * 删除记录
   * 用途：删除款号、删除颜色版本、删除配料
   */
  deleteOne: async ({ resource, id }) => {
    console.log(`[Mock API] deleteOne: ${resource}#${id}`);

    await new Promise(resolve => setTimeout(resolve, 300));

    const dataArray = mockDatabase[resource];
    const index = dataArray?.findIndex((item: any) => item.id == id);

    if (index === undefined || index === -1) {
      throw new Error(`Record not found: ${resource}#${id}`);
    }

    // 从数组中移除
    const deletedRecord = dataArray.splice(index, 1)[0];

    // ========== 级联删除逻辑（可选） ==========
    // 删除款号时，同时删除其下的颜色版本
    if (resource === 'styles') {
      mockDatabase.variants = mockDatabase.variants.filter(
        (v: IColorVariant) => v.style_id !== Number(id)
      );
    }
    // 删除颜色版本时，同时删除其下的配料
    else if (resource === 'variants') {
      mockDatabase.bom_items = mockDatabase.bom_items.filter(
        (b: IBOMItem) => b.variant_id !== Number(id)
      );
    }

    return { data: deletedRecord };
  },

  /**
   * 自定义操作（RPC 风格 API）
   * 核心用途：实现深度克隆功能（L2 → L3 → L4 三层级联复制）
   */
  custom: async ({ url, method, payload }) => {
    console.log(`[Mock API] custom: ${method} ${url}`, payload);

    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟较长的处理时间

    // ========== 深度克隆颜色版本 ==========
    // URL 格式：/api/styles/{styleId}/variants/{variantId}/clone
    const cloneRegex = /\/api\/styles\/(\d+)\/variants\/(\d+)\/clone/;
    const cloneMatch = url.match(cloneRegex);

    if (cloneMatch && method === 'post') {
      const styleId = Number(cloneMatch[1]);
      const sourceVariantId = Number(cloneMatch[2]);
      const { new_color_name } = payload || {};

      if (!new_color_name) {
        throw new Error('缺少必填参数：new_color_name');
      }

      // 1. 查找源颜色版本
      const sourceVariant = mockDatabase.variants.find(
        (v: IColorVariant) => v.id === sourceVariantId
      );
      if (!sourceVariant) {
        throw new Error(`源颜色版本不存在：${sourceVariantId}`);
      }

      // 2. 创建新的颜色版本（L2）
      const newVariantId = nextId++;
      const newVariant: IColorVariant = {
        ...sourceVariant,
        id: newVariantId,
        color_name: new_color_name,
        // 可选：保持样衣图或清空，这里选择保持
      };
      mockDatabase.variants.push(newVariant);

      // 3. 查询源颜色版本下的所有配料明细（L3）
      const sourceBomItems = mockDatabase.bom_items.filter(
        (b: IBOMItem) => b.variant_id === sourceVariantId
      );

      let clonedBomCount = 0;
      let clonedSpecCount = 0;

      // 4. 遍历复制每条配料及其规格明细
      sourceBomItems.forEach((bomItem: IBOMItem) => {
        const newBomId = nextId++;
        
        // 深度复制 specDetails 数组（L4）
        const clonedSpecDetails = bomItem.specDetails.map(spec => ({
          ...spec,
          id: nextId++, // 为每条规格生成新 ID
        }));
        
        clonedSpecCount += clonedSpecDetails.length;

        // 创建新的配料记录
        const newBomItem: IBOMItem = {
          ...bomItem,
          id: newBomId,
          variant_id: newVariantId, // 关联到新的颜色版本
          specDetails: clonedSpecDetails, // 使用克隆的规格数组
        };

        mockDatabase.bom_items.push(newBomItem);
        clonedBomCount++;
      });

      // 5. 返回克隆结果
      const result: ICloneVariantResponse = {
        id: newVariantId,
        color_name: new_color_name,
        cloned_bom_count: clonedBomCount,
        cloned_spec_count: clonedSpecCount,
      };

      console.log(`[Mock API] 克隆成功:`, result);

      return { data: result };
    }

    // 其他自定义 API（预留扩展）
    throw new Error(`未实现的自定义 API: ${method} ${url}`);
  },

  /**
   * 获取 API 基础 URL（Mock 模式下返回空字符串）
   */
  getApiUrl: () => {
    return "";
  },

  // ========== 可选方法（Refine 可能需要） ==========
  
  /**
   * 批量获取多条记录（可选）
   */
  getMany: async ({ resource, ids }) => {
    console.log(`[Mock API] getMany: ${resource}`, ids);

    await new Promise(resolve => setTimeout(resolve, 200));

    const data = mockDatabase[resource]?.filter((item: any) => 
      ids.includes(String(item.id))
    ) || [];

    return { data };
  },

  /**
   * 批量更新（可选）
   */
  updateMany: async ({ resource, ids, variables }) => {
    console.log(`[Mock API] updateMany: ${resource}`, ids, variables);

    await new Promise(resolve => setTimeout(resolve, 300));

    const dataArray = mockDatabase[resource];
    const updatedIds: any[] = [];

    ids.forEach(id => {
      const index = dataArray?.findIndex((item: any) => item.id == id);
      if (index !== undefined && index !== -1) {
        dataArray[index] = {
          ...dataArray[index],
          ...variables,
        };
        updatedIds.push(id);
      }
    });

    return { data: updatedIds };
  },

  /**
   * 批量删除（可选）
   */
  deleteMany: async ({ resource, ids }) => {
    console.log(`[Mock API] deleteMany: ${resource}`, ids);

    await new Promise(resolve => setTimeout(resolve, 300));

    const dataArray = mockDatabase[resource];
    const deletedIds: any[] = [];

    ids.forEach(id => {
      const index = dataArray?.findIndex((item: any) => item.id == id);
      if (index !== undefined && index !== -1) {
        dataArray.splice(index, 1);
        deletedIds.push(id);
      }
    });

    return { data: deletedIds };
  },
};

