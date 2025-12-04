/**
 * IndexedDB Data Provider - 支持持久化存储
 * 实现 Refine DataProvider 接口，使用 IndexedDB 进行本地数据存储
 * 支持：列表查询、单条查询、创建、更新、删除、自定义操作（如深度克隆）
 */

import { DataProvider } from "@refinedev/core";
import { db } from "./database";
import type { IColorVariant, IBOMItem, ICloneVariantResponse } from "../types/models";

// 用于生成新记录的 ID（从 IndexedDB 中获取最大 ID 后递增）
let nextId = 10000;

/**
 * 初始化 nextId（从数据库获取当前最大 ID）
 */
async function initNextId(): Promise<void> {
  const tables = [db.styles, db.variants, db.bom_items, db.customers, db.sizes, db.units];

  for (const table of tables) {
    const lastRecord = await table.orderBy("id").last();
    if (lastRecord && lastRecord.id >= nextId) {
      nextId = lastRecord.id + 1;
    }
  }
}

// 初始化 nextId
initNextId();

/**
 * 获取表对象
 */
function getTable(resource: string) {
  const tableMap: Record<string, any> = {
    styles: db.styles,
    variants: db.variants,
    bom_items: db.bom_items,
    customers: db.customers,
    sizes: db.sizes,
    units: db.units,
  };
  return tableMap[resource];
}

/**
 * IndexedDB Data Provider 实现
 */
export const indexedDBDataProvider: DataProvider = {
  /**
   * 获取资源列表
   * 支持：分页、筛选（filters）
   */
  getList: async ({ resource, filters, pagination }) => {
    console.log(`[IndexedDB] getList: ${resource}`, { filters, pagination });

    const table = getTable(resource);
    if (!table) {
      return { data: [], total: 0 };
    }

    // 获取所有数据
    let data = await table.toArray();

    // ========== 实现筛选逻辑 ==========
    if (filters && filters.length > 0) {
      filters.forEach((filter: any) => {
        const { field, operator, value } = filter;

        if (operator === "eq" && value !== undefined && value !== null) {
          data = data.filter((item: any) => item[field] == value);
        } else if (operator === "contains" && value) {
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
   */
  getOne: async ({ resource, id }) => {
    console.log(`[IndexedDB] getOne: ${resource}#${id}`);

    const table = getTable(resource);
    const data = await table?.get(Number(id));

    if (!data) {
      throw new Error(`Record not found: ${resource}#${id}`);
    }

    return { data };
  },

  /**
   * 创建新记录
   */
  create: async ({ resource, variables }) => {
    console.log(`[IndexedDB] create: ${resource}`, variables);

    const table = getTable(resource);
    if (!table) {
      throw new Error(`Unknown resource: ${resource}`);
    }

    // 生成新 ID
    const newId = nextId++;
    const newRecord = {
      id: newId,
      ...variables,
    };

    // 添加到 IndexedDB
    await table.add(newRecord);

    return { data: newRecord as any };
  },

  /**
   * 更新记录
   */
  update: async ({ resource, id, variables }) => {
    console.log(`[IndexedDB] update: ${resource}#${id}`, variables);

    const table = getTable(resource);
    const existingRecord = await table?.get(Number(id));

    if (!existingRecord) {
      throw new Error(`Record not found: ${resource}#${id}`);
    }

    // 合并更新
    const updatedRecord = {
      ...existingRecord,
      ...variables,
      id: Number(id),
    };

    await table.put(updatedRecord);

    return { data: updatedRecord };
  },

  /**
   * 删除记录
   */
  deleteOne: async ({ resource, id }) => {
    console.log(`[IndexedDB] deleteOne: ${resource}#${id}`);

    const table = getTable(resource);
    const record = await table?.get(Number(id));

    if (!record) {
      throw new Error(`Record not found: ${resource}#${id}`);
    }

    // 删除记录
    await table.delete(Number(id));

    // ========== 级联删除逻辑 ==========
    if (resource === "styles") {
      // 删除款号时，同时删除其下的颜色版本和配料
      const variants = await db.variants.where("style_id").equals(Number(id)).toArray();
      for (const variant of variants) {
        await db.bom_items.where("variant_id").equals(variant.id).delete();
      }
      await db.variants.where("style_id").equals(Number(id)).delete();
    } else if (resource === "variants") {
      // 删除颜色版本时，同时删除其下的配料
      await db.bom_items.where("variant_id").equals(Number(id)).delete();
    }

    return { data: record };
  },

  /**
   * 自定义操作（RPC 风格 API）
   * 核心用途：实现深度克隆功能
   */
  custom: async ({ url, method, payload }) => {
    console.log(`[IndexedDB] custom: ${method} ${url}`, payload);

    // ========== 深度克隆颜色版本 ==========
    const cloneRegex = /\/api\/styles\/(\d+)\/variants\/(\d+)\/clone/;
    const cloneMatch = url.match(cloneRegex);

    if (cloneMatch && method === "post") {
      const sourceVariantId = Number(cloneMatch[2]);
      const { new_color_name } = (payload as any) || {};

      if (!new_color_name) {
        throw new Error("缺少必填参数：new_color_name");
      }

      // 1. 查找源颜色版本
      const sourceVariant = await db.variants.get(sourceVariantId);
      if (!sourceVariant) {
        throw new Error(`源颜色版本不存在：${sourceVariantId}`);
      }

      // 2. 创建新的颜色版本
      const newVariantId = nextId++;
      const newVariant: IColorVariant = {
        ...sourceVariant,
        id: newVariantId,
        color_name: new_color_name,
      };
      await db.variants.add(newVariant);

      // 3. 查询源颜色版本下的所有配料明细
      const sourceBomItems = await db.bom_items
        .where("variant_id")
        .equals(sourceVariantId)
        .toArray();

      let clonedBomCount = 0;
      let clonedSpecCount = 0;

      // 4. 遍历复制每条配料及其规格明细
      for (const bomItem of sourceBomItems) {
        const newBomId = nextId++;

        // 深度复制 specDetails 数组
        const clonedSpecDetails = bomItem.specDetails.map((spec) => ({
          ...spec,
          id: nextId++,
        }));

        clonedSpecCount += clonedSpecDetails.length;

        // 创建新的配料记录
        const newBomItem: IBOMItem = {
          ...bomItem,
          id: newBomId,
          variant_id: newVariantId,
          specDetails: clonedSpecDetails,
        };

        await db.bom_items.add(newBomItem);
        clonedBomCount++;
      }

      // 5. 返回克隆结果
      const result: ICloneVariantResponse = {
        id: newVariantId,
        color_name: new_color_name,
        cloned_bom_count: clonedBomCount,
        cloned_spec_count: clonedSpecCount,
      };

      console.log(`[IndexedDB] 克隆成功:`, result);

      return { data: result as any };
    }

    throw new Error(`未实现的自定义 API: ${method} ${url}`);
  },

  /**
   * 获取 API 基础 URL
   */
  getApiUrl: () => {
    return "";
  },

  /**
   * 批量获取多条记录
   */
  getMany: async ({ resource, ids }) => {
    console.log(`[IndexedDB] getMany: ${resource}`, ids);

    const table = getTable(resource);
    const numericIds = ids.map((id) => Number(id));
    const data = await table?.bulkGet(numericIds);

    return { data: data?.filter(Boolean) || [] };
  },

  /**
   * 批量更新
   */
  updateMany: async ({ resource, ids, variables }) => {
    console.log(`[IndexedDB] updateMany: ${resource}`, ids, variables);

    const table = getTable(resource);
    const updatedIds: any[] = [];

    for (const id of ids) {
      const existingRecord = await table?.get(Number(id));
      if (existingRecord) {
        const updatedRecord = {
          ...existingRecord,
          ...variables,
        };
        await table.put(updatedRecord);
        updatedIds.push(id);
      }
    }

    return { data: updatedIds };
  },

  /**
   * 批量删除
   */
  deleteMany: async ({ resource, ids }) => {
    console.log(`[IndexedDB] deleteMany: ${resource}`, ids);

    const table = getTable(resource);
    const numericIds = ids.map((id) => Number(id));
    await table?.bulkDelete(numericIds);

    return { data: ids as any };
  },
};

// 为了兼容性，导出别名
export const mockDataProvider = indexedDBDataProvider;
