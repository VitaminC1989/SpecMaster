/**
 * IndexedDB 数据库配置
 * 使用 Dexie.js 封装 IndexedDB 操作
 */

import Dexie, { Table } from "dexie";
import type {
  IStyle,
  IColorVariant,
  IBOMItem,
  ICustomer,
  ISize,
  IUnit,
} from "../types/models";
import {
  mockStyles,
  mockVariants,
  mockBomItems,
  mockCustomers,
  mockSizes,
  mockUnits,
} from "../mock/data";

/**
 * SpecMaster 数据库类
 */
export class SpecMasterDB extends Dexie {
  styles!: Table<IStyle, number>;
  variants!: Table<IColorVariant, number>;
  bom_items!: Table<IBOMItem, number>;
  customers!: Table<ICustomer, number>;
  sizes!: Table<ISize, number>;
  units!: Table<IUnit, number>;

  constructor() {
    super("SpecMasterDB");

    // 定义数据库 schema
    // 索引格式: ++id 表示自增主键, &field 表示唯一索引, field 表示普通索引
    this.version(1).stores({
      styles: "++id, style_no, customer_id",
      variants: "++id, style_id, color_name",
      bom_items: "++id, variant_id, material_name",
      customers: "++id, customer_name",
      sizes: "++id, size_code, sort_order",
      units: "++id, unit_code",
    });
  }
}

// 创建数据库单例
export const db = new SpecMasterDB();

/**
 * 初始化数据库
 * 如果数据库为空，则导入初始 mock 数据
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // 检查是否已有数据
    const styleCount = await db.styles.count();

    if (styleCount === 0) {
      console.log("数据库为空，正在导入初始数据...");
      await importInitialData();
      console.log("初始数据导入完成！");
    } else {
      console.log(`数据库已有 ${styleCount} 条款号数据，跳过初始化`);
    }
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

/**
 * 导入初始 mock 数据
 */
async function importInitialData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.styles, db.variants, db.bom_items, db.customers, db.sizes, db.units],
    async () => {
      // 导入基础数据
      await db.customers.bulkAdd(mockCustomers);
      await db.sizes.bulkAdd(mockSizes);
      await db.units.bulkAdd(mockUnits);

      // 导入业务数据
      await db.styles.bulkAdd(mockStyles);
      await db.variants.bulkAdd(mockVariants);
      await db.bom_items.bulkAdd(mockBomItems);
    }
  );
}

/**
 * 导出所有数据为 JSON
 */
export async function exportAllData(): Promise<string> {
  const data = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    styles: await db.styles.toArray(),
    variants: await db.variants.toArray(),
    bom_items: await db.bom_items.toArray(),
    customers: await db.customers.toArray(),
    sizes: await db.sizes.toArray(),
    units: await db.units.toArray(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * 从 JSON 导入数据（会清除现有数据）
 */
export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);

  // 验证数据格式
  if (!data.styles || !data.variants || !data.bom_items) {
    throw new Error("无效的数据格式");
  }

  await db.transaction(
    "rw",
    [db.styles, db.variants, db.bom_items, db.customers, db.sizes, db.units],
    async () => {
      // 清除现有数据
      await db.styles.clear();
      await db.variants.clear();
      await db.bom_items.clear();
      await db.customers.clear();
      await db.sizes.clear();
      await db.units.clear();

      // 导入新数据
      if (data.customers?.length) await db.customers.bulkAdd(data.customers);
      if (data.sizes?.length) await db.sizes.bulkAdd(data.sizes);
      if (data.units?.length) await db.units.bulkAdd(data.units);
      if (data.styles?.length) await db.styles.bulkAdd(data.styles);
      if (data.variants?.length) await db.variants.bulkAdd(data.variants);
      if (data.bom_items?.length) await db.bom_items.bulkAdd(data.bom_items);
    }
  );
}

/**
 * 清除所有数据
 */
export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.styles, db.variants, db.bom_items, db.customers, db.sizes, db.units],
    async () => {
      await db.styles.clear();
      await db.variants.clear();
      await db.bom_items.clear();
      await db.customers.clear();
      await db.sizes.clear();
      await db.units.clear();
    }
  );
}

/**
 * 重置数据库为初始状态
 */
export async function resetDatabase(): Promise<void> {
  await clearAllData();
  await importInitialData();
}
