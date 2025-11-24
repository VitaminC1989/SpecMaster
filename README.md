# SpecMaster - 服装配方管理系统

<div align="center">

![SpecMaster](https://img.shields.io/badge/SpecMaster-v1.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6)
![Refine](https://img.shields.io/badge/Refine-4.47-ff4d4d)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.12-1890ff)

**一个现代化的服装制造业配方管理系统**

解决"一款多色"工艺单管理的痛点，实现四级嵌套数据结构的直观展示与编辑

</div>

---

## 📋 项目简介

SpecMaster 旨在为服装制造业提供一个现代化的 SaaS 管理平台，核心解决服装企业在管理"一款多色"工艺单（BOM - Bill of Materials）时面临的痛点。

### 核心特性

✅ **四级嵌套数据结构**  
- L1: 款号层（Style）- 服装款式基础信息  
- L2: 颜色版本层（Color Variant）- 不同颜色的变体  
- L3: 配料明细层（BOM Item）- 具体物料清单  
- L4: 规格明细层（Spec Detail）- 不同尺码的规格参数

✅ **智能交互**  
- L4 规格子列表的聚合展示（多条规格堆叠显示）  
- 弹窗式规格编辑（动态增删改）  
- 深度克隆功能（一键复制 L2→L3→L4 三层数据）

✅ **企业级体验**  
- 高性能表格（Ant Design Pro Components）  
- 响应式设计（TailwindCSS）  
- 图片预览和打印支持

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 **http://localhost:3000** 启动（如果端口被占用会自动选择其他端口）

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist/` 目录

---

## 📁 项目结构

```
SpecMaster/
├── src/
│   ├── components/              # 组件目录
│   │   ├── layouts/            # 布局组件
│   │   │   └── Layout.tsx      # 主布局
│   │   └── styles/             # 业务组件
│   │       ├── StyleHeaderInfo.tsx       # L1 款号头部
│   │       ├── VariantTabs.tsx           # L2 颜色切换
│   │       ├── VariantTabContent.tsx     # L2 内容容器
│   │       ├── VariantHeader.tsx         # L2 头部（样衣图）
│   │       ├── BOMTable.tsx              # L3 配料表格 ⭐
│   │       └── SpecDetailModalForm.tsx   # L4 规格编辑弹窗 ⭐
│   │
│   ├── pages/                   # 页面目录
│   │   └── styles/
│   │       ├── list.tsx        # 款号列表页
│   │       └── detail.tsx      # 款号详情页（核心）
│   │
│   ├── types/                   # TypeScript 类型定义
│   │   └── models.ts           # L1-L4 数据模型
│   │
│   ├── providers/               # 数据提供者
│   │   └── mockDataProvider.ts # Mock 数据提供者
│   │
│   ├── mock/                    # Mock 数据
│   │   └── data.ts             # 完整四级嵌套演示数据
│   │
│   ├── App.tsx                  # 应用入口
│   ├── main.tsx                 # React 挂载
│   └── index.css                # 全局样式
│
├── 文档/                        # 项目文档
│   ├── SpecMaster实现计划.md    # 详细实现计划
│   ├── 前端技术设计文档.md       # 技术设计文档
│   └── 周耀管理系统 V4.md        # 产品需求文档
│
└── package.json
```

---

## 🎯 核心功能演示

### 1️⃣ 款号列表 (L1)

进入系统后，首先看到的是款号列表页，展示所有服装款式：

- 款号、款式名称、创建日期
- 点击"查看详情"进入详情页

### 2️⃣ 款号详情页（四级数据展示）

#### L1 层 - 款号基础信息
显示款号、款式名称、创建日期、公共备注等信息

#### L2 层 - 颜色版本切换
使用 Tabs 组件切换不同颜色（如：灰色、粉色、蓝色）

每个颜色版本包含：
- 样衣大图（可点击预览）
- 尺码范围说明
- "复制此版本"按钮（深度克隆功能）
- "打印配方单"按钮

#### L3 层 - 配料明细表格
展示当前颜色下的所有配料，包括：
- 辅料名称、图片、颜色
- 单耗、单位、供应商
- **规格明细（L4 聚合展示）**

#### L4 层 - 规格明细编辑
点击"编辑规格"按钮，弹出编辑窗口：
- 动态添加多条规格记录
- 每条记录包含：尺码、规格值、规格单位
- 支持添加、删除、保存

### 3️⃣ 深度克隆功能

点击"复制此版本"按钮：
1. 弹出对话框，输入新颜色名称（如："蓝色"）
2. 系统自动完成三层级联复制：
   - 复制 L2 颜色版本信息
   - 复制该颜色下所有 L3 配料记录
   - 复制每条配料下的所有 L4 规格数据
3. 新颜色版本自动出现在 Tabs 中

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.2 | 前端框架 |
| **TypeScript** | 5.2 | 类型系统 |
| **Vite** | 5.0 | 构建工具 |
| **Refine** | 4.47 | 企业级框架（自动化 CRUD） |
| **Ant Design** | 5.12 | UI 组件库 |
| **Ant Design Pro Components** | 2.6 | 高级表格组件 |
| **TailwindCSS** | 3.3 | 样式方案 |
| **React Router** | 6.20 | 路由管理 |
| **dayjs** | 1.11 | 日期处理 |

---

## 📊 数据模型

### TypeScript 类型定义

```typescript
// L4: 规格明细
interface ISpecDetail {
  id?: number;
  size?: string;              // 尺码（如: S, M, L）
  spec_value: string | number; // 规格值（如: 58.5）
  spec_unit: string;          // 规格单位（如: cm）
}

// L3: 配料明细
interface IBOMItem {
  id: number;
  variant_id: number;         // 归属的 L2 颜色版本
  material_name: string;      // 辅料名称
  material_image_url: string; // 辅料图片
  usage: number;              // 单耗
  unit: string;               // 单位
  specDetails: ISpecDetail[]; // ⭐ 关联的 L4 数组
}

// L2: 颜色版本
interface IColorVariant {
  id: number;
  style_id: number;           // 归属的 L1 款号
  color_name: string;         // 颜色名称
  sample_image_url: string;   // 样衣图片
  size_range?: string;        // 尺码范围
}

// L1: 款号
interface IStyle {
  id: number;
  style_no: string;           // 款号（唯一索引）
  style_name?: string;        // 款式名称
  create_date: string;        // 创建日期
  public_note?: string;       // 公共备注
}
```

---

## 🔧 核心技术实现

### 1. L4 规格聚合显示

**挑战：** 如何在 L3 表格的单一行中，整洁地显示多条 L4 规格数据？

**解决方案：** 自定义 render 函数，将数组映射为堆叠文本块

```tsx
{
  title: '规格明细',
  dataIndex: 'specDetails',
  render: (_, record) => {
    const specs = record.specDetails;
    return (
      <div className="space-y-1">
        {specs.map(spec => (
          <div key={spec.id}>
            <Tag>{spec.size}</Tag>
            {spec.spec_value} {spec.spec_unit}
          </div>
        ))}
        <Button onClick={() => openEditModal(record)}>
          编辑规格
        </Button>
      </div>
    );
  }
}
```

### 2. L4 动态表单编辑

**挑战：** 提供友好的界面来增删改 L4 子记录数组

**解决方案：** 使用 Ant Design 的 Form.List 组件

```tsx
<Form.List name="specDetails">
  {(fields, { add, remove }) => (
    <>
      {fields.map(field => (
        <Space key={field.key}>
          <Form.Item name={[field.name, 'size']}>
            <Input placeholder="尺码" />
          </Form.Item>
          <Form.Item name={[field.name, 'spec_value']}>
            <InputNumber placeholder="规格值" />
          </Form.Item>
          <Form.Item name={[field.name, 'spec_unit']}>
            <Input placeholder="单位" />
          </Form.Item>
          <Button onClick={() => remove(field.name)}>删除</Button>
        </Space>
      ))}
      <Button onClick={() => add()}>添加规格</Button>
    </>
  )}
</Form.List>
```

### 3. 深度克隆（三层级联复制）

**实现流程：**

```typescript
// 前端调用
const handleClone = (newColorName: string) => {
  cloneVariant({
    url: `/api/styles/${styleId}/variants/${variantId}/clone`,
    method: 'post',
    values: { new_color_name: newColorName }
  });
};

// Mock Provider 实现
custom: async ({ url, method, payload }) => {
  // 1. 复制 L2 颜色版本
  const newVariant = { ...sourceVariant, color_name: newColorName };
  
  // 2. 查询源版本下的所有 L3 配料
  const sourceBomItems = mockDatabase.bom_items.filter(
    b => b.variant_id === sourceVariantId
  );
  
  // 3. 遍历复制 L3 和 L4
  sourceBomItems.forEach(bomItem => {
    // 深度复制 L4 数组
    const clonedSpecDetails = bomItem.specDetails.map(spec => ({
      ...spec,
      id: generateNewId()
    }));
    
    // 创建新的 L3 记录，关联克隆的 L4
    const newBomItem = {
      ...bomItem,
      variant_id: newVariant.id,
      specDetails: clonedSpecDetails
    };
    
    mockDatabase.bom_items.push(newBomItem);
  });
}
```

---

## 🎨 UI/UX 亮点

✨ **视觉层次清晰**  
- 四级数据结构通过卡片、标签页、表格、弹窗逐层展开
- 使用 Emoji 图标增强识别度（📋 款号、🎨 颜色、📦 配料、📏 规格）

✨ **交互流畅**  
- 表格行内编辑（减少页面跳转）
- 规格编辑弹窗（避免表格嵌套表格）
- 实时数据刷新（Refine 自动失效查询）

✨ **信息密度优化**  
- L4 规格聚合显示（多条数据不破坏表格布局）
- 图片缩略图 + 灯箱预览
- 合理的空状态提示

---

## 🔄 切换到真实 API

当前项目使用 Mock 数据提供者，切换到真实后端 API 只需两步：

### 1. 创建真实的 Data Provider

```typescript
// src/providers/nestJsDataProvider.ts
import { DataProvider } from "@refinedev/core";
import axios from "axios";

export const nestJsDataProvider = (apiUrl: string): DataProvider => {
  const axiosInstance = axios.create({ baseURL: apiUrl });
  
  return {
    getList: async ({ resource, filters, pagination }) => {
      // 实现真实的 API 调用
      const response = await axiosInstance.get(`/${resource}`, {
        params: { ...filters, ...pagination }
      });
      return response.data;
    },
    // ... 其他方法
  };
};
```

### 2. 修改 App.tsx

```typescript
// 环境变量配置
const isDemoMode = import.meta.env.VITE_APP_MODE === "demo";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://api.example.com";

// 动态选择数据提供者
const dataProvider = isDemoMode 
  ? mockDataProvider 
  : nestJsDataProvider(apiUrl);

<Refine dataProvider={dataProvider} ... />
```

---

## 📝 开发指南

### 添加新款号

1. 在 `src/mock/data.ts` 中的 `mockStyles` 数组添加新记录
2. 为新款号添加对应的颜色版本（`mockVariants`）
3. 为每个颜色添加配料明细（`mockBomItems`）
4. 刷新页面即可看到新数据

### 修改主题颜色

编辑 `src/App.tsx` 中的 ConfigProvider 配置：

```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: "#1890ff", // 修改为你的品牌色
      borderRadius: 6,
    },
  }}
>
```

### 自定义表格列

编辑 `src/components/styles/BOMTable.tsx` 中的 `columns` 数组

---

## 🐛 已知问题

- [ ] 打印功能待完善（当前仅提示）
- [ ] 图片上传功能待实现（当前使用固定 URL）
- [ ] 新建款号/颜色版本功能待实现（当前仅提供入口）

---

## 📄 相关文档

- [实现计划文档](./文档/SpecMaster实现计划.md) - 详细的开发计划和任务分解
- [技术设计文档](./文档/前端技术设计文档：服装配方管理系统%20(SpecMaster).md) - 完整的技术设计说明
- [产品需求文档](./文档/周耀管理系统%20V4.md) - 业务需求和功能定义

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📜 许可证

MIT License

---

## 👨‍💻 作者

SpecMaster Team

---

<div align="center">

**🎉 感谢使用 SpecMaster！**

如有问题，请查看文档或提交 Issue

</div>
