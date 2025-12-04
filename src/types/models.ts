/**
 * SpecMaster 数据模型定义
 * 四级嵌套结构：L1(款号) → L2(颜色版本) → L3(配料明细) → L4(规格明细)
 */

// ==========================================
// L4: 规格明细层 (Spec Detail) - 最底层子记录
// ==========================================
/**
 * L4 规格明细接口
 * 描述：依附于L3配料明细，用于精确描述该配料在不同尺码下的具体规格参数
 * 关系：一条L3记录对应多条L4记录（一对多）
 */
export interface ISpecDetail {
  id?: number;              // 规格明细ID，新增时可能暂时无ID
  size?: string;            // 尺码（如: S, M, L, XL, 通码）
  spec_value: string | number;  // 规格值（如: 58.5, 2）
  spec_unit: string;        // 规格单位（如: cm, mm, 寸）
}

// ==========================================
// L3: 配料明细层 (BOM Item) - 主记录
// ==========================================
/**
 * L3 配料明细接口（物料清单项）
 * 描述：依附于特定"颜色版本"的具体物料清单
 * 这是用户主要录入数据的层级
 */
export interface IBOMItem {
  id: number;               // 配料明细ID
  variant_id: number;       // 归属的L2颜色版本ID（外键）
  material_name: string;    // 辅料名称（如：5号树脂拉链）
  material_image_url: string;  // 辅料图片URL
  material_color_text?: string;     // 辅料颜色（文字描述，如：银灰色）
  material_color_image_url?: string; // 辅料颜色（图片色卡URL）
  usage: number;            // 单耗（生产一件衣服的消耗量）
  unit: string;             // 单耗单位（如：米, 条, 粒, 套）
  supplier?: string;        // 供应商名称
  
  /**
   * 核心字段：关联的L4规格明细列表
   * 这是一个一对多的嵌套数组
   * 用于存储不同尺码对应的规格参数
   */
  specDetails: ISpecDetail[];
}

// ==========================================
// L2: 颜色版本层 (Color Variant) - 规格分类
// ==========================================
/**
 * L2 颜色版本接口
 * 描述：同一款号下的不同颜色变体
 * 这是配料表(BOM)的挂载点
 */
export interface IColorVariant {
  id: number;               // 颜色版本ID
  style_id: number;         // 归属的L1款号ID（外键）
  color_name: string;       // 款式颜色（如：灰色, 粉色）
  sample_image_url: string; // 核心展示：样衣图片URL
  size_range?: string;      // 尺码范围说明（如：S/M/L/XL）
}

// ==========================================
// L1: 款号层 (Style) - 顶层容器
// ==========================================
/**
 * L1 款号接口
 * 描述：定义一个具体的服装款式，承载所有颜色共用的信息
 * 这是所有数据的根容器
 */
export interface IStyle {
  id: number;               // 款号ID
  style_no: string;         // 款号（唯一索引，如：9128）
  style_name?: string;      // 款式名称（如：儿童拼色马甲）
  customer_id?: number;     // 关联的客户ID（外键）
  customer_name?: string;   // 客户名称（冗余字段，方便显示）
  create_date: string;      // 创建日期（ISO 8601格式）
  public_note?: string;     // 公共备注（所有颜色共用的备注信息）
}

// ==========================================
// 辅助类型：深度克隆请求参数
// ==========================================
/**
 * 深度克隆颜色版本的请求参数
 * 用于触发后端的三层级联复制（L2 → L3 → L4）
 */
export interface ICloneVariantRequest {
  new_color_name: string;   // 新颜色的名称
  copy_sample_image?: boolean;  // 是否复制样衣图（可选）
}

/**
 * 深度克隆的响应数据
 */
export interface ICloneVariantResponse {
  id: number;               // 新创建的颜色版本ID
  color_name: string;       // 新颜色名称
  cloned_bom_count: number; // 复制的配料数量
  cloned_spec_count: number;// 复制的规格数量
}

// ==========================================
// 基础数据模块：客户管理
// ==========================================
/**
 * 客户信息接口
 */
export interface ICustomer {
  id: number;               // 客户ID
  customer_name: string;    // 客户名称（公司名）
  contact_person?: string;  // 联系人
  contact_phone?: string;   // 联系电话
  contact_email?: string;   // 联系邮箱
  address?: string;         // 地址
  note?: string;            // 备注
  create_date: string;      // 创建日期
}

// ==========================================
// 基础数据模块：尺码管理
// ==========================================
/**
 * 尺码信息接口
 */
export interface ISize {
  id: number;               // 尺码ID
  size_code: string;        // 尺码代码（如：S, M, L, XL）
  size_name: string;        // 尺码名称（如：小号、中号）
  sort_order?: number;      // 排序序号（用于显示顺序）
  note?: string;            // 备注
  is_active: boolean;       // 是否启用
}

// ==========================================
// 基础数据模块：单位管理
// ==========================================
/**
 * 单位信息接口
 */
export interface IUnit {
  id: number;               // 单位ID
  unit_code: string;        // 单位代码（如：m, pcs）
  unit_name: string;        // 单位名称（如：米、条、粒）
  unit_type?: string;       // 单位类型（长度、数量、重量等）
  note?: string;            // 备注
  is_active: boolean;       // 是否启用
}

// ==========================================
// 下单模块：订单计算相关
// ==========================================
/**
 * 下单尺码配置
 * 每个尺码的下单数量
 */
export interface ISizeOrderQty {
  size: string;             // 尺码（如：S, M, L, XL）
  quantity: number;         // 下单数量
}

/**
 * 下单配置接口
 */
export interface IOrderConfig {
  styleId: number;          // 款号ID
  variantId: number;        // 颜色版本ID
  baseSpecField: 'size' | 'spec_value';  // 基准字段（以尺码或规格值为基准）
  sizeOrders: ISizeOrderQty[];  // 各尺码下单数量
}

/**
 * 配料计算结果行
 */
export interface IOrderMaterialRow {
  materialName: string;           // 辅料名称
  materialImageUrl: string;       // 辅料图片
  materialColor: string;          // 辅料颜色
  materialColorImageUrl?: string; // 辅料颜色图片
  unit: string;                   // 单位
  usage: number;                  // 单耗
  supplier?: string;              // 供应商
  specDetails: ISpecDetail[];     // 规格明细
  sizeCalculations: {             // 各尺码计算结果
    size: string;
    specValue: string | number;   // 规格值
    specUnit: string;             // 规格单位
    orderQty: number;             // 下单数量（件数）
    materialQty: number;          // 配料需求量 = 单耗 × 下单数量
  }[];
  totalMaterialQty: number;       // 配料总需求量
}

