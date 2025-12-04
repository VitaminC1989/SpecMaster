/**
 * Mock 数据文件
 * 提供完整的四级嵌套演示数据（L1 → L2 → L3 → L4）
 * 用于 Demo 演示和前端开发
 */

import { IStyle, IColorVariant, IBOMItem, ICustomer, ISize, IUnit } from '../types/models';

// ==========================================
// L1: 款号数据（Style Level）
// ==========================================
export const mockStyles: IStyle[] = [
  {
    id: 1,
    style_no: '9128',
    style_name: '儿童拼色马甲',
    customer_id: 1,
    customer_name: '优衣库（中国）有限公司',
    create_date: '2023-11-25',
    public_note: '注意面料色差，拉链需采用YKK品牌，四合扣需使用铜质材料'
  },
  {
    id: 2,
    style_no: '9129',
    style_name: '成人休闲夹克',
    customer_id: 2,
    customer_name: 'ZARA 贸易（上海）有限公司',
    create_date: '2023-11-26',
    public_note: '防水面料，所有拉链必须带防水涂层'
  },
  {
    id: 3,
    style_no: '9130',
    style_name: '女士连帽卫衣',
    customer_id: 1,
    customer_name: '优衣库（中国）有限公司',
    create_date: '2023-11-27',
    public_note: '抽绳需双层加固'
  },
  {
    id: 4,
    style_no: '9131',
    style_name: '男士商务衬衫',
    customer_id: 3,
    customer_name: 'H&M 服饰（中国）有限公司',
    create_date: '2023-11-28',
    public_note: '纽扣需统一使用贝壳扣'
  },
  {
    id: 5,
    style_no: '9132',
    style_name: '儿童运动裤',
    customer_id: 4,
    customer_name: '海澜之家股份有限公司',
    create_date: '2023-11-29',
    public_note: '松紧带需测试拉伸300次以上'
  }
];

// ==========================================
// L2: 颜色版本数据（Color Variant Level）
// ==========================================
export const mockVariants: IColorVariant[] = [
  // 款号 9128（儿童拼色马甲）的颜色版本
  {
    id: 101,
    style_id: 1,
    color_name: '灰色',
    sample_image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=600&fit=crop',
    size_range: 'S/M/L/XL'
  },
  {
    id: 102,
    style_id: 1,
    color_name: '粉色',
    sample_image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=600&fit=crop',
    size_range: 'S/M/L/XL'
  },
  {
    id: 103,
    style_id: 1,
    color_name: '天蓝色',
    sample_image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    size_range: 'S/M/L/XL'
  },
  
  // 款号 9129（成人休闲夹克）的颜色版本
  {
    id: 104,
    style_id: 2,
    color_name: '黑色',
    sample_image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    size_range: 'M/L/XL/XXL'
  },
  {
    id: 105,
    style_id: 2,
    color_name: '军绿色',
    sample_image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=600&fit=crop',
    size_range: 'M/L/XL/XXL'
  },
  {
    id: 106,
    style_id: 2,
    color_name: '深蓝色',
    sample_image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=600&fit=crop',
    size_range: 'M/L/XL/XXL'
  },
  
  // 款号 9130（女士连帽卫衣）的颜色版本
  {
    id: 107,
    style_id: 3,
    color_name: '白色',
    sample_image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop',
    size_range: 'S/M/L'
  },
  {
    id: 108,
    style_id: 3,
    color_name: '灰色',
    sample_image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop',
    size_range: 'S/M/L'
  }
];

// ==========================================
// L3: 配料明细数据（BOM Item Level，包含 L4 嵌套）
// ==========================================
export const mockBomItems: IBOMItem[] = [
  // ========== 款号 9128 - 灰色马甲（variant_id: 101）的配料 ==========
  {
    id: 1001,
    variant_id: 101,
    material_name: '5号树脂拉链',
    material_image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=150&h=150&fit=crop',
    material_color_text: '银灰色',
    usage: 1,
    unit: '条',
    supplier: 'YKK拉链有限公司',
    specDetails: [  // L4 规格明细数组
      { id: 1, size: 'S', spec_value: 58.5, spec_unit: 'cm' },
      { id: 2, size: 'M', spec_value: 59.5, spec_unit: 'cm' },
      { id: 3, size: 'L', spec_value: 60.5, spec_unit: 'cm' },
      { id: 4, size: 'XL', spec_value: 61.5, spec_unit: 'cm' }
    ]
  },
  {
    id: 1002,
    variant_id: 101,
    material_name: '四合扣',
    material_image_url: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=150&h=150&fit=crop',
    material_color_text: '亮银',
    usage: 4,
    unit: '粒',
    supplier: '三信金属制品厂',
    specDetails: [
      { id: 5, size: '通码', spec_value: 10, spec_unit: 'mm' }
    ]
  },
  {
    id: 1003,
    variant_id: 101,
    material_name: '包边织带',
    material_image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea3c6b49?w=150&h=150&fit=crop',
    material_color_text: '深灰色',
    usage: 2.5,
    unit: '米',
    supplier: '锦绣织带厂',
    specDetails: [
      { id: 6, size: '通码', spec_value: 2, spec_unit: 'cm' }
    ]
  },
  {
    id: 1004,
    variant_id: 101,
    material_name: '品牌标签',
    material_image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=150&h=150&fit=crop',
    material_color_text: '多色印刷',
    usage: 1,
    unit: '片',
    supplier: '华美印刷标签厂',
    specDetails: [
      { id: 7, size: '通码', spec_value: '5x3', spec_unit: 'cm' }
    ]
  },
  {
    id: 1005,
    variant_id: 101,
    material_name: '松紧绳',
    material_image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=150&h=150&fit=crop',
    material_color_text: '黑色',
    usage: 0.8,
    unit: '米',
    supplier: '永强辅料批发',
    specDetails: [
      { id: 8, size: 'S', spec_value: 0.6, spec_unit: '米' },
      { id: 9, size: 'M', spec_value: 0.7, spec_unit: '米' },
      { id: 10, size: 'L', spec_value: 0.8, spec_unit: '米' },
      { id: 11, size: 'XL', spec_value: 0.9, spec_unit: '米' }
    ]
  },
  
  // ========== 款号 9128 - 粉色马甲（variant_id: 102）的配料 ==========
  {
    id: 2001,
    variant_id: 102,
    material_name: '5号树脂拉链',
    material_image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=150&h=150&fit=crop',
    material_color_text: '玫瑰金',
    usage: 1,
    unit: '条',
    supplier: 'YKK拉链有限公司',
    specDetails: [
      { id: 12, size: 'S', spec_value: 58.5, spec_unit: 'cm' },
      { id: 13, size: 'M', spec_value: 59.5, spec_unit: 'cm' },
      { id: 14, size: 'L', spec_value: 60.5, spec_unit: 'cm' },
      { id: 15, size: 'XL', spec_value: 61.5, spec_unit: 'cm' }
    ]
  },
  {
    id: 2002,
    variant_id: 102,
    material_name: '四合扣',
    material_image_url: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=150&h=150&fit=crop',
    material_color_text: '玫瑰金',
    usage: 4,
    unit: '粒',
    supplier: '三信金属制品厂',
    specDetails: [
      { id: 16, size: '通码', spec_value: 10, spec_unit: 'mm' }
    ]
  },
  {
    id: 2003,
    variant_id: 102,
    material_name: '包边织带',
    material_image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea3c6b49?w=150&h=150&fit=crop',
    material_color_text: '淡粉色',
    usage: 2.5,
    unit: '米',
    supplier: '锦绣织带厂',
    specDetails: [
      { id: 17, size: '通码', spec_value: 2, spec_unit: 'cm' }
    ]
  },
  
  // ========== 款号 9128 - 天蓝色马甲（variant_id: 103）的配料 ==========
  {
    id: 3001,
    variant_id: 103,
    material_name: '5号树脂拉链',
    material_image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=150&h=150&fit=crop',
    material_color_text: '天蓝色',
    usage: 1,
    unit: '条',
    supplier: 'YKK拉链有限公司',
    specDetails: [
      { id: 18, size: 'S', spec_value: 58.5, spec_unit: 'cm' },
      { id: 19, size: 'M', spec_value: 59.5, spec_unit: 'cm' },
      { id: 20, size: 'L', spec_value: 60.5, spec_unit: 'cm' },
      { id: 21, size: 'XL', spec_value: 61.5, spec_unit: 'cm' }
    ]
  },
  
  // ========== 款号 9129 - 黑色夹克（variant_id: 104）的配料 ==========
  {
    id: 4001,
    variant_id: 104,
    material_name: '8号金属拉链（防水）',
    material_image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=150&h=150&fit=crop',
    material_color_text: '黑镍色',
    usage: 1,
    unit: '条',
    supplier: 'YKK拉链有限公司',
    specDetails: [
      { id: 22, size: 'M', spec_value: 68, spec_unit: 'cm' },
      { id: 23, size: 'L', spec_value: 70, spec_unit: 'cm' },
      { id: 24, size: 'XL', spec_value: 72, spec_unit: 'cm' },
      { id: 25, size: 'XXL', spec_value: 74, spec_unit: 'cm' }
    ]
  },
  {
    id: 4002,
    variant_id: 104,
    material_name: '魔术贴',
    material_image_url: 'https://images.unsplash.com/photo-1587467512961-120760940315?w=150&h=150&fit=crop',
    material_color_text: '黑色',
    usage: 0.3,
    unit: '米',
    supplier: '3M辅料专营店',
    specDetails: [
      { id: 26, size: '通码', spec_value: 3, spec_unit: 'cm' }
    ]
  },
  {
    id: 4003,
    variant_id: 104,
    material_name: '反光条',
    material_image_url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=150&h=150&fit=crop',
    material_color_text: '银灰色',
    usage: 1.2,
    unit: '米',
    supplier: '安全反光材料厂',
    specDetails: [
      { id: 27, size: '通码', spec_value: 2, spec_unit: 'cm' }
    ]
  },
  
  // ========== 款号 9130 - 白色卫衣（variant_id: 107）的配料 ==========
  {
    id: 5001,
    variant_id: 107,
    material_name: '圆形抽绳',
    material_image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=150&h=150&fit=crop',
    material_color_text: '白色',
    usage: 1.5,
    unit: '米',
    supplier: '永强辅料批发',
    specDetails: [
      { id: 28, size: '通码', spec_value: 0.5, spec_unit: 'cm' }
    ]
  },
  {
    id: 5002,
    variant_id: 107,
    material_name: '金属扣眼',
    material_image_url: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=150&h=150&fit=crop',
    material_color_text: '银色',
    usage: 8,
    unit: '粒',
    supplier: '三信金属制品厂',
    specDetails: [
      { id: 29, size: '通码', spec_value: 8, spec_unit: 'mm' }
    ]
  },
  {
    id: 5003,
    variant_id: 107,
    material_name: '罗纹布',
    material_image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea3c6b49?w=150&h=150&fit=crop',
    material_color_text: '白色',
    usage: 0.8,
    unit: '米',
    supplier: '华丰针织面料厂',
    specDetails: [
      { id: 30, size: 'S', spec_value: 0.7, spec_unit: '米' },
      { id: 31, size: 'M', spec_value: 0.8, spec_unit: '米' },
      { id: 32, size: 'L', spec_value: 0.9, spec_unit: '米' }
    ]
  }
];

// ==========================================
// 基础数据：客户管理
// ==========================================
export const mockCustomers: ICustomer[] = [
  {
    id: 1,
    customer_name: '优衣库（中国）有限公司',
    contact_person: '张经理',
    contact_phone: '13800138001',
    contact_email: 'zhang@uniqlo.cn',
    address: '上海市浦东新区世纪大道1000号',
    note: 'VIP客户，优先处理订单',
    create_date: '2023-01-15',
  },
  {
    id: 2,
    customer_name: 'ZARA 贸易（上海）有限公司',
    contact_person: '李总监',
    contact_phone: '13800138002',
    contact_email: 'li@zara.com',
    address: '上海市静安区南京西路1000号',
    note: '每月固定订单',
    create_date: '2023-02-20',
  },
  {
    id: 3,
    customer_name: 'H&M 服饰（中国）有限公司',
    contact_person: '王主管',
    contact_phone: '13800138003',
    contact_email: 'wang@hm.cn',
    address: '北京市朝阳区建国路100号',
    note: '',
    create_date: '2023-03-10',
  },
  {
    id: 4,
    customer_name: '海澜之家股份有限公司',
    contact_person: '陈采购',
    contact_phone: '13800138004',
    contact_email: 'chen@heilan.com',
    address: '江苏省无锡市新吴区',
    note: '国内品牌，合作多年',
    create_date: '2023-04-05',
  },
  {
    id: 5,
    customer_name: '美特斯邦威集团',
    contact_person: '刘经理',
    contact_phone: '13800138005',
    contact_email: 'liu@meters.com',
    address: '上海市闵行区',
    note: '',
    create_date: '2023-05-12',
  },
];

// ==========================================
// 基础数据：尺码管理
// ==========================================
export const mockSizes: ISize[] = [
  { id: 1, size_code: 'XS', size_name: '加小号', sort_order: 1, is_active: true },
  { id: 2, size_code: 'S', size_name: '小号', sort_order: 2, is_active: true },
  { id: 3, size_code: 'M', size_name: '中号', sort_order: 3, is_active: true },
  { id: 4, size_code: 'L', size_name: '大号', sort_order: 4, is_active: true },
  { id: 5, size_code: 'XL', size_name: '加大号', sort_order: 5, is_active: true },
  { id: 6, size_code: 'XXL', size_name: '特大号', sort_order: 6, is_active: true },
  { id: 7, size_code: '通码', size_name: '通用尺码', sort_order: 99, is_active: true, note: '适用于所有尺寸' },
  { id: 8, size_code: '90', size_name: '儿童90码', sort_order: 10, is_active: true },
  { id: 9, size_code: '100', size_name: '儿童100码', sort_order: 11, is_active: true },
  { id: 10, size_code: '110', size_name: '儿童110码', sort_order: 12, is_active: true },
  { id: 11, size_code: '120', size_name: '儿童120码', sort_order: 13, is_active: true },
  { id: 12, size_code: '130', size_name: '儿童130码', sort_order: 14, is_active: true },
];

// ==========================================
// 基础数据：单位管理
// ==========================================
export const mockUnits: IUnit[] = [
  { id: 1, unit_code: 'm', unit_name: '米', unit_type: '长度', is_active: true },
  { id: 2, unit_code: 'cm', unit_name: '厘米', unit_type: '长度', is_active: true },
  { id: 3, unit_code: 'mm', unit_name: '毫米', unit_type: '长度', is_active: true },
  { id: 4, unit_code: 'pcs', unit_name: '条', unit_type: '数量', is_active: true },
  { id: 5, unit_code: 'grain', unit_name: '粒', unit_type: '数量', is_active: true },
  { id: 6, unit_code: 'set', unit_name: '套', unit_type: '数量', is_active: true },
  { id: 7, unit_code: 'piece', unit_name: '片', unit_type: '数量', is_active: true },
  { id: 8, unit_code: 'pair', unit_name: '对', unit_type: '数量', is_active: true },
  { id: 9, unit_code: 'kg', unit_name: '千克', unit_type: '重量', is_active: true },
  { id: 10, unit_code: 'g', unit_name: '克', unit_type: '重量', is_active: true },
  { id: 11, unit_code: 'yard', unit_name: '码', unit_type: '长度', is_active: true },
  { id: 12, unit_code: 'inch', unit_name: '英寸', unit_type: '长度', is_active: true },
];

// ==========================================
// 辅助函数：根据资源名称获取数据
// ==========================================
export const getMockDataByResource = (resource: string): any[] => {
  const dataMap: Record<string, any[]> = {
    'styles': mockStyles,
    'variants': mockVariants,
    'bom_items': mockBomItems,
    'customers': mockCustomers,
    'sizes': mockSizes,
    'units': mockUnits,
  };
  return dataMap[resource] || [];
};

