# SpecMaster 前端实现计划文档

**版本：** v1.0  
**日期：** 2025-11-23  
**项目名称：** 服装配方管理系统（SpecMaster）前端开发  
**编制依据：**
- 产品需求文档 v1.4
- 前端技术设计文档

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [开发阶段规划](#2-开发阶段规划)
3. [详细任务分解](#3-详细任务分解)
4. [技术实现要点](#4-技术实现要点)
5. [关键里程碑](#5-关键里程碑)
6. [风险评估与应对](#6-风险评估与应对)
7. [质量保证计划](#7-质量保证计划)

---

## 1. 项目概述

### 1.1 项目目标

构建一个高性能、交互友好的服装配方管理系统前端应用，核心解决"一款多色"工艺单管理中的四级嵌套数据结构（L1-L4）的展示与编辑问题。

### 1.2 核心技术栈

| 技术 | 版本建议 | 用途 |
|------|---------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 5.x | 构建工具 |
| Refine | 4.x | 企业级框架 |
| Ant Design | 5.x | UI组件库 |
| TailwindCSS | 3.x | 样式方案 |

### 1.3 项目规模估算

- **预计开发周期：** 4-6 周
- **代码规模估算：** 约 8,000-12,000 行（不含依赖）
- **核心组件数量：** 15-20 个
- **页面数量：** 5-8 个

---

## 2. 开发阶段规划

### 阶段划分概览

```
Phase 0: 项目初始化 (3-5天)
   ↓
Phase 1: 基础架构搭建 (5-7天)
   ↓
Phase 2: 核心功能实现 (10-15天)
   ↓
Phase 3: 高级功能与优化 (5-7天)
   ↓
Phase 4: Demo演示准备 (3-5天)
   ↓
Phase 5: 测试与交付 (3-5天)
```

---

## 3. 详细任务分解

### Phase 0: 项目初始化 (3-5天)

#### 任务 0.1: 开发环境搭建
**优先级：** 🔴 Critical  
**预计时间：** 1天

**子任务：**
- [ ] 安装 Node.js (v18+) 和包管理器（pnpm 推荐）
- [ ] 初始化 Vite + React + TypeScript 项目
  ```bash
  pnpm create vite specmaster-frontend --template react-ts
  ```
- [ ] 配置 Git 仓库和 .gitignore
- [ ] 配置 ESLint + Prettier 代码规范

**交付物：**
- ✅ 可运行的空白 React 项目
- ✅ 代码规范配置文件

---

#### 任务 0.2: 核心依赖安装与配置
**优先级：** 🔴 Critical  
**预计时间：** 2天

**子任务：**
- [ ] 安装 Refine 核心包
  ```bash
  pnpm add @refinedev/core @refinedev/react-router-v6 @refinedev/antd
  ```
- [ ] 安装 Ant Design 及图标库
  ```bash
  pnpm add antd @ant-design/icons
  ```
- [ ] 安装 TailwindCSS 并配置
  ```bash
  pnpm add -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] 配置 TailwindCSS 与 Ant Design 的样式兼容
- [ ] 安装工具库（axios, dayjs 等）

**交付物：**
- ✅ package.json 包含所有依赖
- ✅ tailwind.config.js 配置完成
- ✅ Ant Design 主题配置文件

---

#### 任务 0.3: 项目结构规划
**优先级：** 🟡 High  
**预计时间：** 1天

**目录结构设计：**
```
src/
├── components/          # 通用组件
│   ├── layouts/        # 布局组件
│   └── common/         # 公共组件（Loading, Empty等）
├── pages/              # 页面组件
│   ├── styles/         # 款号管理页面
│   │   ├── list.tsx   # L1 列表页
│   │   └── detail.tsx # L1 详情页（核心）
│   └── dashboard/      # 仪表盘
├── types/              # TypeScript 类型定义
│   └── models.ts       # L1-L4 数据模型
├── providers/          # 数据提供者
│   ├── mockDataProvider.ts    # Mock 数据
│   └── nestJsDataProvider.ts  # 真实后端（预留）
├── mock/               # Mock 静态数据
│   └── data.ts
├── utils/              # 工具函数
├── hooks/              # 自定义 Hooks
└── App.tsx             # 应用入口
```

**子任务：**
- [ ] 创建目录结构
- [ ] 编写 README.md 项目说明文档

**交付物：**
- ✅ 规范的项目目录结构
- ✅ README.md 开发指南

---

### Phase 1: 基础架构搭建 (5-7天)

#### 任务 1.1: TypeScript 类型系统定义
**优先级：** 🔴 Critical  
**预计时间：** 1天  
**依赖：** 无

**实现内容：**

创建 `src/types/models.ts`，定义四级数据模型：

```typescript
// L4: 规格明细层 (Spec Detail)
export interface ISpecDetail {
  id?: number;              // 新增时可能无ID
  size?: string;            // 尺码（如: S, M, 通码）
  spec_value: string | number;  // 规格值（如: 58.5）
  spec_unit: string;        // 规格单位（如: cm）
}

// L3: 配料明细层 (BOM Item)
export interface IBOMItem {
  id: number;
  variant_id: number;       // 归属的L2颜色版本ID
  material_name: string;    // 辅料名称
  material_image_url: string;  // 辅料图片URL
  material_color_text?: string;     // 辅料颜色（文字）
  material_color_image_url?: string; // 辅料颜色（色卡图）
  usage: number;            // 单耗
  unit: string;             // 单耗单位
  supplier?: string;        // 供应商
  specDetails: ISpecDetail[];  // 关联的L4规格明细数组
}

// L2: 颜色版本层 (Color Variant)
export interface IColorVariant {
  id: number;
  style_id: number;         // 归属的L1款号ID
  color_name: string;       // 款式颜色（如: 灰色）
  sample_image_url: string; // 样衣图片URL
  size_range?: string;      // 尺码范围说明
}

// L1: 款号层 (Style)
export interface IStyle {
  id: number;
  style_no: string;         // 款号（唯一索引）
  style_name?: string;      // 款式名称
  create_date: string;      // 创建日期
  public_note?: string;     // 公共备注
}
```

**交付物：**
- ✅ `src/types/models.ts` 文件
- ✅ 所有接口包含详细中文注释

---

#### 任务 1.2: Mock 数据准备
**优先级：** 🟡 High  
**预计时间：** 2天  
**依赖：** 任务 1.1

**实现内容：**

创建 `src/mock/data.ts`，构造完整的四级嵌套模拟数据：

```typescript
import { IStyle, IColorVariant, IBOMItem } from '../types/models';

// L1: 款号数据（至少2条用于列表演示）
export const mockStyles: IStyle[] = [
  {
    id: 1,
    style_no: '9128',
    style_name: '儿童拼色马甲',
    create_date: '2023-11-25',
    public_note: '注意面料色差，拉链需采用YKK品牌'
  },
  {
    id: 2,
    style_no: '9129',
    style_name: '成人休闲夹克',
    create_date: '2023-11-26',
    public_note: ''
  }
];

// L2: 颜色版本数据（每个款号至少2个颜色）
export const mockVariants: IColorVariant[] = [
  // 款号9128的颜色版本
  {
    id: 101,
    style_id: 1,
    color_name: '灰色',
    sample_image_url: 'https://via.placeholder.com/400x600/808080/FFFFFF?text=Gray+Vest',
    size_range: 'S/M/L/XL'
  },
  {
    id: 102,
    style_id: 1,
    color_name: '粉色',
    sample_image_url: 'https://via.placeholder.com/400x600/FFC0CB/FFFFFF?text=Pink+Vest',
    size_range: 'S/M/L/XL'
  },
  // 款号9129的颜色版本
  {
    id: 103,
    style_id: 2,
    color_name: '黑色',
    sample_image_url: 'https://via.placeholder.com/400x600/000000/FFFFFF?text=Black+Jacket',
    size_range: 'M/L/XL/XXL'
  }
];

// L3: 配料明细数据（包含L4嵌套数组）
export const mockBomItems: IBOMItem[] = [
  // 灰色马甲（variant_id: 101）的配料
  {
    id: 1001,
    variant_id: 101,
    material_name: '5号树脂拉链',
    material_image_url: 'https://via.placeholder.com/150/4169E1/FFFFFF?text=Zipper',
    material_color_text: '银灰色',
    usage: 1,
    unit: '条',
    supplier: 'YKK拉链有限公司',
    specDetails: [  // L4 数据
      { id: 1, size: 'S', spec_value: '58.5', spec_unit: 'cm' },
      { id: 2, size: 'M', spec_value: '59.5', spec_unit: 'cm' },
      { id: 3, size: 'L', spec_value: '60.5', spec_unit: 'cm' },
      { id: 4, size: 'XL', spec_value: '61.5', spec_unit: 'cm' }
    ]
  },
  {
    id: 1002,
    variant_id: 101,
    material_name: '四合扣',
    material_image_url: 'https://via.placeholder.com/150/32CD32/FFFFFF?text=Button',
    material_color_text: '亮银',
    usage: 4,
    unit: '粒',
    supplier: '三信金属制品厂',
    specDetails: [
      { id: 5, size: '通码', spec_value: '10', spec_unit: 'mm' }
    ]
  },
  // 粉色马甲（variant_id: 102）的配料
  {
    id: 2001,
    variant_id: 102,
    material_name: '5号树脂拉链',
    material_image_url: 'https://via.placeholder.com/150/FF69B4/FFFFFF?text=Pink+Zipper',
    material_color_text: '玫瑰金',
    usage: 1,
    unit: '条',
    supplier: 'YKK拉链有限公司',
    specDetails: [
      { id: 6, size: 'S', spec_value: '58.5', spec_unit: 'cm' },
      { id: 7, size: 'M', spec_value: '59.5', spec_unit: 'cm' },
      { id: 8, size: 'L', spec_value: '60.5', spec_unit: 'cm' },
      { id: 9, size: 'XL', spec_value: '61.5', spec_unit: 'cm' }
    ]
  },
  // ... 更多数据
];
```

**交付物：**
- ✅ `src/mock/data.ts` 包含完整四级数据
- ✅ 至少2个款号、每个款号2个颜色、每个颜色3条配料

---

#### 任务 1.3: Mock Data Provider 实现
**优先级：** 🔴 Critical  
**预计时间：** 2天  
**依赖：** 任务 1.2

**实现内容：**

创建 `src/providers/mockDataProvider.ts`，实现 Refine 数据提供者接口：

**核心功能点：**
- ✅ `getList`: 支持 filters 过滤（用于按 variant_id 筛选 BOM 列表）
- ✅ `getOne`: 根据 ID 获取单条记录
- ✅ `create`: Mock 创建操作
- ✅ `update`: Mock 更新操作（用于保存 L4 编辑）
- ✅ `deleteOne`: Mock 删除操作
- ✅ `custom`: Mock 自定义操作（用于深度克隆 API）

**关键实现：**
```typescript
getList: async ({ resource, filters, pagination }) => {
  // 模拟300ms网络延迟
  await new Promise(r => setTimeout(r, 300));
  
  let data = mockDatabase[resource] || [];
  
  // 实现filters逻辑（关键：用于variant_id筛选）
  if (filters) {
    filters.forEach((filter: any) => {
      if (filter.operator === 'eq') {
        data = data.filter((item: any) => 
          item[filter.field] == filter.value
        );
      }
    });
  }
  
  // 分页处理
  const { current = 1, pageSize = 10 } = pagination ?? {};
  const start = (current - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);
  
  return { data: pageData, total: data.length };
}
```

**交付物：**
- ✅ `src/providers/mockDataProvider.ts` 完整实现
- ✅ 支持所有 CRUD 操作的 Mock 逻辑

---

#### 任务 1.4: Refine 应用初始化
**优先级：** 🔴 Critical  
**预计时间：** 1天  
**依赖：** 任务 1.3

**实现内容：**

配置 `src/App.tsx`，初始化 Refine 框架：

```typescript
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerBindings from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

import { mockDataProvider } from "./providers/mockDataProvider";
import { Layout } from "./components/layouts/Layout";

// 通过环境变量控制 Demo 模式
const isDemoMode = import.meta.env.VITE_APP_MODE === 'demo';

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={zhCN}>
        <RefineKbarProvider>
          <Refine
            dataProvider={mockDataProvider}
            routerProvider={routerBindings}
            resources={[
              {
                name: "styles",
                list: "/styles",
                show: "/styles/:id",
                meta: { label: "款号管理" }
              }
            ]}
          >
            {/* 路由配置 */}
            <Routes>
              <Route element={<Layout />}>
                <Route path="/styles" element={<div>款号列表</div>} />
                <Route path="/styles/:id" element={<div>款号详情</div>} />
              </Route>
            </Routes>
            <RefineKbar />
          </Refine>
        </RefineKbarProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
```

**交付物：**
- ✅ Refine 应用可正常启动
- ✅ 路由系统配置完成
- ✅ 中文语言包配置完成

---

### Phase 2: 核心功能实现 (10-15天)

#### 任务 2.1: 主布局组件开发
**优先级：** 🟡 High  
**预计时间：** 1天  
**依赖：** Phase 1 完成

**实现内容：**

创建 `src/components/layouts/Layout.tsx`：

```typescript
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";

const { Header, Content } = AntLayout;

export const Layout: React.FC = () => {
  return (
    <AntLayout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">SpecMaster - 服装配方管理系统</h1>
          {/* 未来可添加用户菜单、设置等 */}
        </div>
      </Header>
      <Content className="p-6 bg-gray-50">
        <Outlet />
      </Content>
    </AntLayout>
  );
};
```

**交付物：**
- ✅ 响应式主布局组件
- ✅ 集成 Ant Design Layout 和 TailwindCSS

---

#### 任务 2.2: L1 款号列表页开发
**优先级：** 🟡 High  
**预计时间：** 2天  
**依赖：** 任务 2.1

**实现内容：**

创建 `src/pages/styles/list.tsx`：

**核心功能：**
- ✅ 使用 Refine 的 `useTable` Hook
- ✅ 使用 Ant Design Pro Components 的 `ProTable`
- ✅ 展示列：款号、款式名称、创建日期、操作
- ✅ 支持搜索、分页
- ✅ 行操作：查看详情、删除

**关键代码示例：**
```typescript
import { useTable } from "@refinedev/antd";
import { ProTable } from "@ant-design/pro-components";
import { IStyle } from "../../types/models";

export const StyleList: React.FC = () => {
  const { tableProps } = useTable<IStyle>({
    resource: "styles",
  });

  return (
    <ProTable<IStyle>
      {...tableProps}
      search={false}
      columns={[
        { title: '款号', dataIndex: 'style_no', key: 'style_no' },
        { title: '款式名称', dataIndex: 'style_name', key: 'style_name' },
        { title: '创建日期', dataIndex: 'create_date', key: 'create_date' },
        {
          title: '操作',
          key: 'action',
          render: (_, record) => (
            <Space>
              <Button type="link" href={`/styles/${record.id}`}>查看</Button>
            </Space>
          )
        }
      ]}
    />
  );
};
```

**交付物：**
- ✅ 功能完整的款号列表页
- ✅ 数据能从 Mock Provider 正确加载

---

#### 任务 2.3: L1 款号详情页框架搭建（核心页面）
**优先级：** 🔴 Critical  
**预计时间：** 1天  
**依赖：** 任务 2.2

**实现内容：**

创建 `src/pages/styles/detail.tsx`，作为 **四级数据展示的主容器**。

**页面结构：**
```typescript
export const StyleDetailPage: React.FC = () => {
  const { id } = useParams();
  
  // 加载L1数据
  const { data: styleData } = useOne<IStyle>({
    resource: "styles",
    id: id!
  });
  
  return (
    <div className="space-y-6">
      {/* L1: 款号头部信息 */}
      <StyleHeaderInfo style={styleData?.data} />
      
      {/* L2: 颜色版本 Tabs 区域 */}
      <VariantTabs styleId={Number(id)} />
    </div>
  );
};
```

**交付物：**
- ✅ 详情页路由和基础框架
- ✅ L1 数据加载逻辑

---

#### 任务 2.4: StyleHeaderInfo 组件（L1展示）
**优先级：** 🟡 High  
**预计时间：** 0.5天  
**依赖：** 任务 2.3

**实现内容：**

创建 `src/components/styles/StyleHeaderInfo.tsx`：

```typescript
import { Card, Descriptions } from "antd";
import { IStyle } from "../../types/models";

interface Props {
  style?: IStyle;
}

export const StyleHeaderInfo: React.FC<Props> = ({ style }) => {
  if (!style) return null;
  
  return (
    <Card title="款号基础信息" className="shadow-sm">
      <Descriptions column={3}>
        <Descriptions.Item label="款号">{style.style_no}</Descriptions.Item>
        <Descriptions.Item label="款式名称">{style.style_name}</Descriptions.Item>
        <Descriptions.Item label="创建日期">{style.create_date}</Descriptions.Item>
        <Descriptions.Item label="公共备注" span={3}>
          {style.public_note || '无'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
```

**交付物：**
- ✅ L1 基础信息展示组件

---

#### 任务 2.5: VariantTabs 组件（L2导航）
**优先级：** 🔴 Critical  
**预计时间：** 2天  
**依赖：** 任务 2.4

**实现内容：**

创建 `src/components/styles/VariantTabs.tsx`：

**核心逻辑：**
- ✅ 加载当前款号下的所有 L2 颜色版本
- ✅ 使用 Ant Design 的 `Tabs` 组件
- ✅ 每个 Tab 渲染一个 `VariantTabContent` 组件
- ✅ 支持"新建颜色版本"操作

**关键代码：**
```typescript
import { Tabs, Button } from "antd";
import { useList } from "@refinedev/core";
import { IColorVariant } from "../../types/models";
import { VariantTabContent } from "./VariantTabContent";

interface Props {
  styleId: number;
}

export const VariantTabs: React.FC<Props> = ({ styleId }) => {
  // 加载L2数据（按style_id筛选）
  const { data: variantsData } = useList<IColorVariant>({
    resource: "variants",
    filters: [{ field: "style_id", operator: "eq", value: styleId }]
  });
  
  const variants = variantsData?.data || [];
  
  return (
    <Tabs
      type="card"
      items={variants.map(variant => ({
        key: String(variant.id),
        label: variant.color_name,
        children: <VariantTabContent variant={variant} />
      }))}
      tabBarExtraContent={
        <Button type="primary">+ 新建颜色版本</Button>
      }
    />
  );
};
```

**交付物：**
- ✅ 颜色版本 Tabs 导航组件
- ✅ 能正确加载和切换不同颜色

---

#### 任务 2.6: VariantTabContent 组件（L2内容容器）
**优先级：** 🔴 Critical  
**预计时间：** 1天  
**依赖：** 任务 2.5

**实现内容：**

创建 `src/components/styles/VariantTabContent.tsx`：

```typescript
import { IColorVariant } from "../../types/models";
import { VariantHeader } from "./VariantHeader";
import { BOMTable } from "./BOMTable";

interface Props {
  variant: IColorVariant;
}

export const VariantTabContent: React.FC<Props> = ({ variant }) => {
  return (
    <div className="space-y-4">
      {/* L2头部：样衣图 + 操作按钮 */}
      <VariantHeader variant={variant} />
      
      {/* L3主体：配料明细表格 */}
      <BOMTable variantId={variant.id} />
    </div>
  );
};
```

**交付物：**
- ✅ 单个颜色版本的内容容器组件

---

#### 任务 2.7: VariantHeader 组件（L2信息展示）
**优先级：** 🟡 High  
**预计时间：** 1天  
**依赖：** 任务 2.6

**实现内容：**

创建 `src/components/styles/VariantHeader.tsx`：

**核心功能：**
- ✅ 展示样衣大图（可预览）
- ✅ 展示尺码范围等信息
- ✅ 提供"复制此版本"按钮（触发深度克隆）
- ✅ 提供"打印"按钮（预留）

**关键代码：**
```typescript
import { Card, Image, Button, Space, Descriptions, Modal, Input } from "antd";
import { CopyOutlined, PrinterOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { IColorVariant } from "../../types/models";

interface Props {
  variant: IColorVariant;
}

export const VariantHeader: React.FC<Props> = ({ variant }) => {
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  
  const { mutate: cloneVariant } = useCustomMutation();
  
  const handleClone = () => {
    cloneVariant({
      url: `/api/styles/${variant.style_id}/variants/${variant.id}/clone`,
      method: 'post',
      values: { new_color_name: newColorName },
      successNotification: {
        message: "克隆成功",
        description: `新颜色"${newColorName}"已创建`,
        type: "success"
      }
    }, {
      onSuccess: () => {
        setCloneModalOpen(false);
        setNewColorName("");
        // Refine会自动刷新数据
      }
    });
  };
  
  return (
    <>
      <Card className="shadow-sm">
        <div className="flex gap-6">
          {/* 样衣大图 */}
          <Image
            src={variant.sample_image_url}
            width={300}
            height={400}
            style={{ objectFit: 'cover' }}
            className="rounded-lg"
          />
          
          {/* 信息和操作 */}
          <div className="flex-1 space-y-4">
            <Descriptions column={1}>
              <Descriptions.Item label="颜色">
                {variant.color_name}
              </Descriptions.Item>
              <Descriptions.Item label="尺码范围">
                {variant.size_range || '未设置'}
              </Descriptions.Item>
            </Descriptions>
            
            <Space>
              <Button 
                type="primary" 
                icon={<CopyOutlined />}
                onClick={() => setCloneModalOpen(true)}
              >
                复制此版本
              </Button>
              <Button icon={<PrinterOutlined />}>
                打印配方单
              </Button>
            </Space>
          </div>
        </div>
      </Card>
      
      {/* 克隆弹窗 */}
      <Modal
        title="复制颜色版本"
        open={cloneModalOpen}
        onOk={handleClone}
        onCancel={() => setCloneModalOpen(false)}
      >
        <Input
          placeholder="请输入新颜色名称（如：蓝色）"
          value={newColorName}
          onChange={e => setNewColorName(e.target.value)}
        />
      </Modal>
    </>
  );
};
```

**交付物：**
- ✅ L2 头部展示组件
- ✅ 深度克隆功能入口

---

#### 任务 2.8: BOMTable 组件（L3主表格）⭐核心难点
**优先级：** 🔴 Critical  
**预计时间：** 3天  
**依赖：** 任务 2.7

**实现内容：**

创建 `src/components/styles/BOMTable.tsx`：

**核心功能：**
- ✅ 使用 `EditableProTable` 实现可编辑表格
- ✅ 列定义：辅料名称、辅料图片、辅料颜色、单耗、单位、供应商、**规格明细（L4聚合展示）**
- ✅ 支持行内编辑（除规格明细外）
- ✅ 规格明细列使用自定义 render，聚合展示 L4 数组
- ✅ 点击规格明细触发弹窗编辑

**关键实现（L4聚合展示逻辑）：**
```typescript
import { EditableProTable } from "@ant-design/pro-components";
import { Image, Button, Tag } from "antd";
import { useState } from "react";
import { useList, useUpdate } from "@refinedev/core";
import { IBOMItem } from "../../types/models";
import { SpecDetailModalForm } from "./SpecDetailModalForm";

interface Props {
  variantId: number;
}

export const BOMTable: React.FC<Props> = ({ variantId }) => {
  const [editingRecord, setEditingRecord] = useState<IBOMItem | null>(null);
  
  // 加载L3数据（按variant_id筛选）
  const { data: bomData } = useList<IBOMItem>({
    resource: "bom_items",
    filters: [{ field: "variant_id", operator: "eq", value: variantId }]
  });
  
  const dataSource = bomData?.data || [];
  
  return (
    <>
      <EditableProTable<IBOMItem>
        rowKey="id"
        value={dataSource}
        columns={[
          {
            title: '辅料名称',
            dataIndex: 'material_name',
            width: 150,
          },
          {
            title: '辅料图片',
            dataIndex: 'material_image_url',
            width: 100,
            render: (url) => (
              <Image 
                src={url} 
                width={60} 
                height={60} 
                style={{ objectFit: 'cover', borderRadius: 4 }}
              />
            ),
            editable: false,
          },
          {
            title: '辅料颜色',
            dataIndex: 'material_color_text',
            width: 120,
          },
          {
            title: '单耗',
            dataIndex: 'usage',
            width: 80,
            valueType: 'digit',
          },
          {
            title: '单位',
            dataIndex: 'unit',
            width: 80,
            valueType: 'select',
            valueEnum: {
              '米': { text: '米' },
              '条': { text: '条' },
              '粒': { text: '粒' },
              '套': { text: '套' },
            }
          },
          {
            title: '供应商',
            dataIndex: 'supplier',
            width: 150,
          },
          {
            title: '规格明细（尺码/值/单位）',
            dataIndex: 'specDetails',
            width: 250,
            editable: false,
            render: (_, record) => {
              const specs = record.specDetails;
              if (!specs?.length) {
                return <span className="text-gray-400">无规格</span>;
              }
              
              return (
                <div className="space-y-1">
                  {specs.map((spec, idx) => (
                    <div key={spec.id || idx} className="text-sm">
                      {spec.size && (
                        <Tag color="blue" className="mr-1">{spec.size}</Tag>
                      )}
                      <span className="font-medium">{spec.spec_value}</span>
                      <span className="text-gray-500 ml-1">{spec.spec_unit}</span>
                    </div>
                  ))}
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => setEditingRecord(record)}
                    className="p-0 h-auto"
                  >
                    编辑规格
                  </Button>
                </div>
              );
            }
          }
        ]}
        recordCreatorProps={{
          creatorButtonText: '添加配料',
        }}
      />
      
      {/* L4 编辑弹窗 */}
      <SpecDetailModalForm
        open={!!editingRecord}
        bomItem={editingRecord}
        onClose={() => setEditingRecord(null)}
      />
    </>
  );
};
```

**交付物：**
- ✅ 功能完整的 L3 表格组件
- ✅ L4 数组聚合展示逻辑
- ✅ 支持行内编辑和新增配料

---

#### 任务 2.9: SpecDetailModalForm 组件（L4弹窗编辑）⭐核心难点
**优先级：** 🔴 Critical  
**预计时间：** 3天  
**依赖：** 任务 2.8

**实现内容：**

创建 `src/components/styles/SpecDetailModalForm.tsx`：

**核心功能：**
- ✅ Modal 弹窗容器
- ✅ 使用 Ant Design 的 `Form.List` 实现动态表单列表
- ✅ 支持添加新行、删除行
- ✅ 三个输入字段：尺码（Input）、规格值（InputNumber）、单位（Input）
- ✅ 保存时调用 `useUpdate` 更新父级 L3 记录

**关键代码：**
```typescript
import { Modal, Form, Input, InputNumber, Button, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useUpdate } from "@refinedev/core";
import { IBOMItem, ISpecDetail } from "../../types/models";

interface Props {
  open: boolean;
  bomItem: IBOMItem | null;
  onClose: () => void;
}

export const SpecDetailModalForm: React.FC<Props> = ({ 
  open, 
  bomItem, 
  onClose 
}) => {
  const [form] = Form.useForm();
  const { mutate: updateBomItem } = useUpdate();
  
  // 初始化表单数据
  React.useEffect(() => {
    if (bomItem) {
      form.setFieldsValue({
        specDetails: bomItem.specDetails || []
      });
    }
  }, [bomItem, form]);
  
  const handleSave = () => {
    form.validateFields().then(values => {
      // 提取 L4 数组数据
      const updatedSpecDetails: ISpecDetail[] = values.specDetails;
      
      // 调用更新API
      updateBomItem({
        resource: "bom_items",
        id: bomItem!.id,
        values: {
          ...bomItem,
          specDetails: updatedSpecDetails
        },
        successNotification: {
          message: "规格明细已更新",
          type: "success"
        }
      }, {
        onSuccess: () => {
          onClose();
          form.resetFields();
        }
      });
    });
  };
  
  return (
    <Modal
      title="编辑规格明细"
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      width={700}
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.List name="specDetails">
          {(fields, { add, remove }) => (
            <>
              <div className="space-y-4">
                {fields.map(field => (
                  <Space key={field.key} align="baseline" className="w-full">
                    <Form.Item
                      {...field}
                      name={[field.name, 'size']}
                      label="尺码"
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="如: S, M, 通码" style={{ width: 120 }} />
                    </Form.Item>
                    
                    <Form.Item
                      {...field}
                      name={[field.name, 'spec_value']}
                      label="规格值"
                      rules={[{ required: true, message: '请输入规格值' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber placeholder="如: 58.5" style={{ width: 120 }} />
                    </Form.Item>
                    
                    <Form.Item
                      {...field}
                      name={[field.name, 'spec_unit']}
                      label="单位"
                      rules={[{ required: true, message: '请输入单位' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="如: cm, mm" style={{ width: 100 }} />
                    </Form.Item>
                    
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(field.name)}
                    >
                      删除
                    </Button>
                  </Space>
                ))}
              </div>
              
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="mt-4"
              >
                添加规格行
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};
```

**交付物：**
- ✅ L4 规格编辑弹窗组件
- ✅ 支持动态增删改 L4 记录
- ✅ 数据保存逻辑完整

---

### Phase 3: 高级功能与优化 (5-7天)

#### 任务 3.1: 深度克隆功能完善
**优先级：** 🟡 High  
**预计时间：** 2天  
**依赖：** Phase 2 完成

**实现内容：**
- ✅ 完善 `mockDataProvider` 的 `custom` 方法，模拟深度克隆逻辑
- ✅ 在克隆成功后，自动刷新 Tabs 列表
- ✅ 添加加载状态和错误处理
- ✅ 添加成功提示和引导（如：高亮新创建的 Tab）

**交付物：**
- ✅ 完整可用的深度克隆功能
- ✅ 良好的用户体验反馈

---

#### 任务 3.2: 图片上传功能
**优先级：** 🟡 High  
**预计时间：** 2天  
**依赖：** 任务 3.1

**实现内容：**
- ✅ 集成 Ant Design 的 `Upload` 组件
- ✅ 实现样衣图片上传（L2）
- ✅ 实现辅料图片上传（L3）
- ✅ 实现色卡图片上传（L3）
- ✅ Demo 模式下使用 base64 或本地存储模拟上传

**关键技术：**
```typescript
<Upload
  listType="picture-card"
  maxCount={1}
  beforeUpload={file => {
    // Demo模式：转base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    return false; // 阻止默认上传
  }}
>
  {imageUrl ? <img src={imageUrl} /> : '+ 上传'}
</Upload>
```

**交付物：**
- ✅ 三处图片上传功能完整实现
- ✅ Demo 模式下可正常演示

---

#### 任务 3.3: 响应式优化
**优先级：** 🟢 Medium  
**预计时间：** 1天  
**依赖：** 任务 3.2

**实现内容：**
- ✅ 使用 TailwindCSS 的响应式类优化布局
- ✅ 表格在小屏幕下的适配（滚动/折叠）
- ✅ 样衣大图在移动端的适配
- ✅ Modal 弹窗的移动端优化

**交付物：**
- ✅ 在平板和大屏手机上有良好体验

---

#### 任务 3.4: 打印功能实现
**优先级：** 🟢 Medium  
**预计时间：** 1天  
**依赖：** 任务 3.3

**实现内容：**
- ✅ 创建打印专用组件 `PrintView.tsx`
- ✅ 使用 CSS `@media print` 样式
- ✅ 隐藏不必要的UI元素（按钮、Tabs等）
- ✅ 保持 L4 规格的聚合显示格式

**关键代码：**
```typescript
const handlePrint = () => {
  window.print();
};

// 在样式中添加
@media print {
  .no-print {
    display: none !important;
  }
  .print-full-width {
    width: 100% !important;
  }
}
```

**交付物：**
- ✅ 可打印的配方单视图
- ✅ 打印格式规范、清晰

---

### Phase 4: Demo 演示准备 (3-5天)

#### 任务 4.1: Mock 数据丰富
**优先级：** 🟡 High  
**预计时间：** 1天  
**依赖：** Phase 3 完成

**实现内容：**
- ✅ 扩充至少 5 个完整的款号
- ✅ 每个款号至少 3 个颜色版本
- ✅ 每个颜色至少 5 条配料
- ✅ 确保 L4 数据多样性（单尺码、多尺码）
- ✅ 使用真实的服装行业术语

**交付物：**
- ✅ 丰富的演示数据集

---

#### 任务 4.2: 演示脚本编写
**优先级：** 🟡 High  
**预计时间：** 1天  
**依赖：** 任务 4.1

**实现内容：**
- ✅ 编写 Demo 演示操作指南
- ✅ 准备演示话术（突出核心功能）
- ✅ 设计演示流程（5-10分钟）

**演示流程建议：**
1. 进入款号列表，展示多款号管理
2. 点击进入款号 9128 详情页
3. 展示四级数据结构的直观呈现
4. 切换颜色 Tab，演示多色版本管理
5. 点击编辑规格，演示 L4 弹窗编辑
6. 演示一键克隆功能
7. 演示打印功能

**交付物：**
- ✅ 演示脚本文档
- ✅ 关键功能点清单

---

#### 任务 4.3: UI/UX 细节打磨
**优先级：** 🟢 Medium  
**预计时间：** 2天  
**依赖：** 任务 4.2

**实现内容：**
- ✅ 统一颜色主题和间距
- ✅ 添加合适的 Loading 状态
- ✅ 添加 Empty 空状态提示
- ✅ 优化动画和过渡效果
- ✅ 完善错误提示信息
- ✅ 添加操作成功的视觉反馈

**交付物：**
- ✅ 视觉一致、体验流畅的界面

---

### Phase 5: 测试与交付 (3-5天)

#### 任务 5.1: 功能测试
**优先级：** 🔴 Critical  
**预计时间：** 2天  
**依赖：** Phase 4 完成

**测试清单：**
- [ ] L1 列表页加载和分页
- [ ] L1 详情页数据展示
- [ ] L2 Tabs 切换和数据加载
- [ ] L3 表格数据展示和编辑
- [ ] L4 弹窗打开、编辑、保存
- [ ] L4 数组聚合显示正确性
- [ ] 深度克隆功能完整性
- [ ] 图片上传和预览
- [ ] 打印功能
- [ ] 响应式布局在不同屏幕下的表现

**交付物：**
- ✅ 测试报告
- ✅ Bug 修复记录

---

#### 任务 5.2: 性能优化
**优先级：** 🟡 High  
**预计时间：** 1天  
**依赖：** 任务 5.1

**优化项：**
- ✅ 使用 React.memo 优化组件渲染
- ✅ 图片懒加载
- ✅ 表格虚拟滚动（如果数据量大）
- ✅ 代码分割和按需加载

**交付物：**
- ✅ 优化后的性能指标报告

---

#### 任务 5.3: 文档编写
**优先级：** 🟡 High  
**预计时间：** 1天  
**依赖：** 任务 5.2

**文档内容：**
- ✅ 项目 README.md（安装、启动、构建）
- ✅ 组件使用说明文档
- ✅ Mock 数据切换真实 API 的迁移指南
- ✅ 常见问题 FAQ

**交付物：**
- ✅ 完整的开发和部署文档

---

#### 任务 5.4: 最终交付
**优先级：** 🔴 Critical  
**预计时间：** 0.5天  
**依赖：** 任务 5.3

**交付清单：**
- ✅ 完整的源代码仓库
- ✅ 构建产物（可部署的静态文件）
- ✅ 演示视频或 GIF
- ✅ 技术文档和用户手册

---

## 4. 技术实现要点

### 4.1 四级数据关联关系处理

**核心思路：** 使用 Refine 的 `filters` 参数实现父子级联查询。

```typescript
// 加载 L2 数据时，按 style_id 筛选
useList<IColorVariant>({
  resource: "variants",
  filters: [{ field: "style_id", operator: "eq", value: styleId }]
});

// 加载 L3 数据时，按 variant_id 筛选
useList<IBOMItem>({
  resource: "bom_items",
  filters: [{ field: "variant_id", operator: "eq", value: variantId }]
});

// L4 数据直接嵌套在 L3 的 specDetails 字段中，无需单独查询
```

### 4.2 L4 聚合展示的数据映射

**关键代码模式：**

```typescript
render: (_, record) => {
  const specs = record.specDetails; // 获取 L4 数组
  
  return (
    <div className="flex flex-col gap-1">
      {specs.map((spec, idx) => (
        <div key={spec.id || idx}>
          <Tag>{spec.size}</Tag>
          {spec.spec_value} {spec.spec_unit}
        </div>
      ))}
      <Button onClick={() => handleEdit(record)}>编辑</Button>
    </div>
  );
}
```

### 4.3 深度克隆的事务完整性

**前端调用：**
```typescript
cloneVariant({
  url: `/api/styles/${styleId}/variants/${variantId}/clone`,
  method: 'post',
  values: { new_color_name: newColorName }
});
```

**后端实现要点（供参考）：**
```typescript
// 伪代码
async cloneVariant(sourceVariantId, newColorName) {
  // 1. 复制 L2 记录
  const newVariant = await Variant.create({
    ...sourceVariant,
    color_name: newColorName
  });
  
  // 2. 查询源 L3 列表
  const sourceBomItems = await BOMItem.findAll({ 
    where: { variant_id: sourceVariantId },
    include: [SpecDetail] // 关联查询 L4
  });
  
  // 3. 遍历复制 L3 和 L4
  for (const bomItem of sourceBomItems) {
    const newBomItem = await BOMItem.create({
      ...bomItem,
      variant_id: newVariant.id
    });
    
    // 4. 复制每条 L3 下的 L4 数组
    for (const spec of bomItem.specDetails) {
      await SpecDetail.create({
        ...spec,
        bom_item_id: newBomItem.id
      });
    }
  }
}
```

### 4.4 Mock Provider 切换真实 API

**配置环境变量：**
```bash
# .env.demo
VITE_APP_MODE=demo

# .env.production
VITE_APP_MODE=production
VITE_API_BASE_URL=https://api.specmaster.com
```

**App.tsx 中动态切换：**
```typescript
const isDemoMode = import.meta.env.VITE_APP_MODE === 'demo';

const dataProvider = isDemoMode 
  ? mockDataProvider 
  : nestJsDataProvider(import.meta.env.VITE_API_BASE_URL);
```

---

## 5. 关键里程碑

| 里程碑 | 日期（相对周） | 关键交付物 |
|--------|--------------|----------|
| **M1: 项目启动** | Week 1 Day 3 | 项目框架搭建完成，Mock数据就位 |
| **M2: 核心视图完成** | Week 2 Day 5 | L1-L3 层级展示完整实现 |
| **M3: L4编辑功能完成** | Week 3 Day 3 | L4 弹窗编辑和聚合显示完成 |
| **M4: Demo 就绪** | Week 4 Day 5 | 所有功能完整，可向甲方演示 |
| **M5: 项目交付** | Week 5-6 | 测试完成，文档齐全，正式交付 |

---

## 6. 风险评估与应对

### 6.1 技术风险

| 风险 | 等级 | 应对措施 |
|------|------|---------|
| L4 嵌套数组的状态管理复杂 | 🟡 中 | 使用 Refine 的自动查询失效机制；拆分组件减少状态耦合 |
| Ant Design 表格性能问题 | 🟡 中 | 限制单页数据量；使用虚拟滚动；考虑 ProTable 的性能优化选项 |
| Mock 数据与真实 API 结构不一致 | 🟡 中 | 严格按照后端接口文档定义 TypeScript 类型；预留 API 适配层 |
| 深度克隆功能后端实现复杂 | 🟡 中 | 前端提供清晰的需求文档；可先实现浅克隆 |

### 6.2 进度风险

| 风险 | 等级 | 应对措施 |
|------|------|---------|
| L4 编辑功能开发时间超预期 | 🟡 中 | 提前准备 Form.List 的技术预研；预留 buffer 时间 |
| 甲方需求变更 | 🟡 中 | 控制变更流程；核心功能优先完成 |
| 测试阶段发现重大 Bug | 🟢 低 | 分阶段测试，及早发现问题 |

### 6.3 资源风险

| 风险 | 等级 | 应对措施 |
|------|------|---------|
| 设计资源不足（图片、图标） | 🟢 低 | 使用 Placeholder 图片；使用 Ant Design 图标库 |
| 开发人员不熟悉 Refine 框架 | 🟡 中 | Phase 0 安排技术预研和学习时间 |

---

## 7. 质量保证计划

### 7.1 代码规范

- ✅ 使用 ESLint + Prettier 自动格式化
- ✅ TypeScript 严格模式开启
- ✅ 组件、函数、类型必须有注释
- ✅ 提交前进行 Lint 检查

### 7.2 测试策略

**Demo 阶段（当前）：**
- ✅ 手动功能测试（按测试清单）
- ✅ 多浏览器兼容性测试（Chrome, Safari, Firefox）
- ✅ 响应式布局测试（Desktop, Tablet, Mobile）

**后续版本（可选）：**
- ⬜ 集成单元测试（Vitest + React Testing Library）
- ⬜ E2E 测试（Playwright）

### 7.3 Code Review

- ✅ 关键组件（BOMTable, SpecDetailModalForm）必须进行 Code Review
- ✅ 数据流逻辑必须有第二人确认

---

## 8. 附录

### 8.1 技术参考资源

- **Refine 官方文档：** https://refine.dev/docs/
- **Ant Design 组件库：** https://ant.design/components/overview-cn
- **Ant Design Pro Components：** https://procomponents.ant.design/
- **TailwindCSS 文档：** https://tailwindcss.com/docs

### 8.2 关键技术决策记录

| 决策点 | 选择方案 | 理由 |
|--------|---------|------|
| 框架选型 | Refine | 企业级框架，减少 CRUD 重复代码；内置数据管理 |
| UI 库 | Ant Design | 中后台标准选择；组件丰富；中文友好 |
| L4 编辑方式 | Modal + Form.List | 避免表格嵌套表格的布局复杂性；用户体验更好 |
| Demo 数据方案 | 自定义 Mock Provider | 完全控制数据逻辑；便于演示复杂场景 |

### 8.3 术语表

| 术语 | 英文 | 说明 |
|------|------|------|
| L1 | Level 1 | 款号层，数据结构的第一层 |
| L2 | Level 2 | 颜色版本层，数据结构的第二层 |
| L3 | Level 3 | 配料明细层，数据结构的第三层 |
| L4 | Level 4 | 规格明细层，数据结构的第四层 |
| BOM | Bill of Materials | 物料清单 |
| Mock | Mock Data | 模拟数据 |
| Provider | Data Provider | Refine 的数据提供者接口 |

---

## 9. 总结

本实现计划基于产品需求文档 v1.4 和技术设计文档，将 SpecMaster 前端开发分解为 **5 个阶段、30+ 个具体任务**。核心难点在于**四级嵌套数据结构的展示与编辑**，特别是 **L4 规格子列表的聚合显示和弹窗编辑**。

通过合理使用 Refine 框架的数据管理能力、Ant Design 的企业级组件，以及精心设计的组件架构，预计可在 **4-6 周**内完成一个功能完整、体验优秀的 Demo 系统，为后续的生产环境开发打下坚实基础。

**关键成功因素：**
1. ✅ 严格遵循四级数据模型定义
2. ✅ 充分利用 Refine 的自动化能力
3. ✅ 高质量的 Mock 数据
4. ✅ 组件化和模块化的开发思路
5. ✅ 及时的测试和迭代

**下一步行动：**
- [ ] 团队评审本计划
- [ ] 确认开发资源和时间表
- [ ] 启动 Phase 0 项目初始化
- [ ] 建立项目进度跟踪机制

---

**文档变更记录**

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|---------|
| v1.0 | 2025-11-23 | AI Assistant | 初始版本 |

---

**批准签字**

| 角色 | 姓名 | 签字 | 日期 |
|------|------|------|------|
| 项目经理 |  |  |  |
| 技术负责人 |  |  |  |
| 产品经理 |  |  |  |

