**前端技术设计文档：服装配方管理系统 (SpecMaster)**

这是一份完整的、独立的 **SpecMaster 前端技术设计文档**。这份文档提供了从业务背景到技术实现的完整上下文，无需依赖任何先前的产品文档版本，方便您直接使用。

**前端技术设计文档：服装配方管理系统 (SpecMaster)**

![](./images/前端技术设计文档：服装配方管理系统 (SpecMaster)/media/image1.png)

**点击图片可查看完整电子表格**

**1. 项目概述与目标 (Introduction & Objectives)**

**1.1 背景**

**SpecMaster** 旨在为服装制造业提供一个现代化的 SaaS 管理平台。其核心目标是解决服装企业在管理“一款多色”工艺单（BOM - Bill of Materials）时面临的痛点。传统的 Excel/WPS 管理模式导致数据非结构化、图片排版错乱、协作低效、历史数据难以复用 (1)。

**1.2 核心业务挑战**

本系统前端实现的最大挑战在于处理**高度结构化的四级嵌套数据模型**。一个服装款式 (L1) 包含多个颜色版本 (L2)，每个颜色版本包含多条配料明细 (L3)，而每一条配料明细又可能包含针对不同尺码的多个规格定义 (L4) (2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)(2)。前端必须提供直观、高效的界面来展示和编辑这种复杂的数据结构。

**1.3 技术目标**

构建一个响应迅速、交互直观的企业级 B2B 中后台界面。

优雅地展示和编辑**四级嵌套数据结构 (L1-L4)**，特别是 L3 表格中 L4 子列表的聚合展示与编辑 (3)(3)。

实现复杂的交互功能，如多图预览、子列表聚合展示、以及触发后端的**深度克隆**操作 (4)(4)(4)(4)(4)(4)(4)(4)。

利用现代化框架减少 CRUD 重复代码，专注于核心业务组件开发。

构建高保真的 Mock 数据环境，用于在后端 API 就位前向甲方演示 Demo。

**2. 技术栈选型 (Technology Stack)**

基于企业级稳定性、开发效率和社区生态的考量，本项目采用以下技术栈：

![](./images/前端技术设计文档：服装配方管理系统 (SpecMaster)/media/image2.png)

**点击图片可查看完整电子表格**

**3. 核心数据结构说明 (Core Data Structure)**

理解本系统的关键在于理解其**四级嵌套数据模型**。前端的所有界面布局和交互逻辑都严格围绕此结构设计 (5)。

**L1: 款号层 (Style - Root)**

定义一个具体的服装款式的基础信息（如：款号 9128，儿童拼色马甲，创建日期）(6)。它是所有数据的容器。

**L2: 颜色版本层 (Color Variant - Container)**

同一款号下的不同颜色变体（如：灰色款、粉色款）(7)。

**它是配料表 (BOM) 的挂载点**。不同颜色的衣服通常需要不同的样衣图和不同的配料清单 (8)。

**L3: 配料明细层 (BOM Item - Main Record)**

依附于特定“颜色版本”的具体物料清单（如：拉链、纽扣）(9)。这是用户主要录入数据的层级。包含了辅料名称、图片、单耗等信息 (10)。

**L4: 规格明细层 (Spec Detail - Sub Record) \[核心难点\]**

依附于某一条“配料明细”。用于精确描述该配料在不同尺码下的具体规格参数 (11)。

**关系：** 一条 L3 记录对应 **N 条** L4 记录（一对多关系）。例如，一条“拉链”记录下，可能包含 "S码: 50cm", "M码: 52cm" 多条规格 (12)。

**4. TypeScript 数据模型定义 (Data Models)**

基于上述四级结构的前端类型定义。

TypeScript

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
// ==========================================// L4: 规格明细层 (Spec Detail) - 最底层子记录 [cite: 34]// ==========================================export interface ISpecDetail {<br />
id?: number; // 新增时可能暂时无 ID<br />
size?: string; // 尺码 (如: S, M, 通码)<br />
spec_value: string | number; // 规格值 (如: 58.5) spec_unit: string; // 规格单位 (如: cm)<br />
}<br />
<br />
// ==========================================// L3: 配料明细层 (BOM Item) - 主记录 [cite: 19]// ==========================================export interface IBOMItem {<br />
id: number;<br />
variant_id: number; // 归属的 L2 颜色版本 ID<br />
material_name: string; // 辅料名称 material_image_url: string; // 辅料图片 URL<br />
material_color_text?: string; // 辅料颜色(文字描述)<br />
material_color_image_url?: string; // 辅料颜色(图片色卡 URL) usage: number; // 单耗 unit: string; // 单耗单位<br />
supplier?: string; // 供应商 /**<br />
* 核心字段：关联的 L4 规格明细列表<br />
* 这是一个一对多的嵌套数组 [cite: 34]<br />
*/specDetails: ISpecDetail[];<br />
}<br />
<br />
// ==========================================// L2: 颜色版本层 (Color Variant) [cite: 15]// ==========================================export interface IColorVariant {<br />
id: number;<br />
style_id: number; // 归属的 L1 款号 ID<br />
color_name: string; // 款式颜色 (如:灰色) [cite: 17]sample_image_url: string; // 核心展示：样衣图片 URL [cite: 17]<br />
size_range?: string; // 尺码范围说明 [cite: 17]<br />
}<br />
<br />
// ==========================================// L1: 款号层 (Style) - 顶层容器 [cite: 11]// ==========================================export interface IStyle {<br />
id: number;<br />
style_no: string; // 款号 [cite: 13]<br />
style_name?: string; // 款式名称<br />
create_date: string; // 创建日期 [cite: 13]<br />
public_note?: string; // 公共备注 [cite: 13]<br />
}</td>
</tr>
</tbody>
</table>

**5. 组件架构与层级设计 (Component Architecture)**

为了直观呈现四级数据结构，前端采用**嵌套布局**的设计模式，实现三级视图管理 (13)。

**5.1 核心视图布局图**

代码段

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
flowchart TD<br />
%% 页面容器入口<br />
Page[Start: 款号详情页路由 /styles/:id] --&gt; StyleDetailPageNode<br />
<br />
%% 修复点：直接使用引号包裹标题，去掉前面的 ID<br />
subgraph "StyleDetailPage (自定义页面容器)"<br />
direction TB<br />
<br />
%% 节点定义<br />
StyleDetailPageNode[StyleDetailPage 布局组件]<br />
<br />
%% L1 区域<br />
StyleDetailPageNode --&gt; L1Header[L1: StyleHeaderInfo &lt;br/&gt; 展示款号基础信息]<br />
<br />
%% L2 导航区域<br />
StyleDetailPageNode --&gt; VariantTabs[L2: VariantTabs &lt;br/&gt; 颜色版本切换器 - Antd Tabs]<br />
<br />
%% L2 Tabs 内容区域：连接关系<br />
VariantTabs --Tab 1: 灰色--&gt; TabContentGray<br />
VariantTabs --Tab 2: 粉色--&gt; TabContentPink<br />
<br />
%% 嵌套子图：同样使用兼容写法<br />
subgraph "VariantTabContent (单颜色视图组件)"<br />
direction TB<br />
<br />
%% 节点定义<br />
TabContentGray[VariantTabContent &lt;br/&gt; 灰色款视图]<br />
TabContentPink[VariantTabContent &lt;br/&gt; 粉色款视图]<br />
<br />
%% L2 信息头<br />
TabContentGray --&gt; VariantHeader[L2: VariantHeader &lt;br/&gt; 展示样衣大图 &amp; 操作按钮]<br />
<br />
%% L3 主体表格<br />
TabContentGray --&gt; BOMTable[L3: BOMProTable &lt;br/&gt; 配料明细主表格]<br />
end<br />
end<br />
<br />
%% L4 交互区域（弹窗）<br />
BOMTable --点击规格列触发编辑--&gt; SpecEditModal[L4: SpecDetailModalForm &lt;br/&gt; 规格子列表编辑弹窗]</td>
</tr>
</tbody>
</table>

**5.2 关键组件职责说明**

![](./images/前端技术设计文档：服装配方管理系统 (SpecMaster)/media/image3.png)

**点击图片可查看完整电子表格**

**6. 关键功能实现策略 (Key Implementation Strategies)**

**6.1 L4 规格子列表的聚合展示 (Aggregation Display)**

**挑战：** 如何在 L3 主表格的单一行中，整洁地显示其包含的多条 L4 规格数据，而不破坏表格布局 (18)。

策略：

在 BOMTable 的列定义中，针对 specDetails 字段使用自定义 render 函数，将数组数据映射为堆叠的文本块。

TypeScript

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
// BOMTable 列定义片段示例<br />
{<br />
title: '规格明细 (尺码/值/单位)',<br />
dataIndex: 'specDetails', // 指向 L3 数据中的 L4 数组字段<br />
render: (_, record) =&gt; { // record 即为当前的 L3 IBOMItem 对象<br />
const specs = record.specDetails;<br />
if (!specs?.length) return &lt;span className="text-gray-400"&gt;无规格&lt;/span&gt;;<br />
<br />
// 将数组映射为多行 div 结构进行聚合展示<br />
return (<br />
&lt;div className="flex flex-col gap-1"&gt;<br />
{specs.map((spec, idx) =&gt; (<br />
&lt;div key={spec.id || idx} className="text-sm"&gt;<br />
{/* 示例显示效果: [S] 58.5 cm */}<br />
&lt;span className="font-bold"&gt;{spec.size ? `[${spec.size}] ` : ''}&lt;/span&gt;<br />
&lt;span&gt;{spec.spec_value} &lt;/span&gt;<br />
&lt;span className="text-gray-500"&gt;{spec.spec_unit}&lt;/span&gt;<br />
&lt;/div&gt;<br />
))}<br />
{/* 提供一个显式的编辑入口按钮，点击触发弹窗 */}<br />
&lt;Button type="link" size="small" onClick={() =&gt; handleOpenEditModal(record)}&gt;<br />
编辑规格<br />
&lt;/Button&gt;<br />
&lt;/div&gt;<br />
);<br />
},<br />
}</td>
</tr>
</tbody>
</table>

**6.2 L4 规格子列表的编辑交互 (Modal Editing)**

**挑战：** 提供一个用户友好的界面来增删改 L4 子记录数组 (19)。

策略：

采用弹窗 (Modal) + 动态表单列表的形式。

**触发：** 用户点击 L3 表格某行的“编辑规格”按钮，打开 SpecDetailModalForm 弹窗，并将当前 L3 记录的数据传递给弹窗。

**编辑组件：** 弹窗内部使用 Ant Design 的 **Form.List** 组件（或者嵌套一个轻量级的 EditableProTable）。这允许用户动态添加新行、删除旧行、修改每一行的 尺码、值、单位。

**提交：** 弹窗确认时，收集整个 L4 数组数据，使用 Refine 的 useUpdate 钩子调用后端 API，更新父级 L3 记录。

**6.3 深度克隆操作触发 (Deep Clone Trigger)**

**挑战：** 前端需要提供入口，触发后端执行复杂的“L2-\>L3-\>L4”三层级联数据复制事务，以实现“一键克隆”颜色版本的功能 (20)(20)(20)(20)。

**策略：**

**入口：** 在 VariantHeader 组件区域放置一个显眼的“复制此版本”按钮 (21)。

**交互：** 点击按钮弹出 Modal，要求用户输入新颜色的名称（如“蓝色”）(22)。

**调用：** 确认后，使用 Refine 的 **useCustomMutation** 钩子，向后端特定的 RPC 风格端点发送请求。

TypeScript

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
// 伪代码示例const { mutate: cloneVariant } = useCustomMutation();<br />
<br />
const handleClone = (newColorName: string) =&gt; {<br />
cloneVariant({<br />
url: `/api/styles/${styleId}/variants/${currentVariantId}/clone`, // 特定的后端 APImethod: 'post',<br />
values: { new_color_name: newColorName }, // PayloadsuccessNotification: { message: '克隆成功', type: 'success' },<br />
}, {<br />
onSuccess: () =&gt; {<br />
// 克隆成功后，Refine 会自动使相关查询失效，从而刷新 Tabs 列表显示新颜色<br />
}<br />
});<br />
};</td>
</tr>
</tbody>
</table>

**6.4 智能图像处理 (Smart Image Handling)**

**挑战：** 在表格中展示大量图片而不影响布局，同时支持查看细节 (23)。

策略：

充分利用 Ant Design 的 Image 组件特性。在 L3 表格的图片列 render 中，设置固定高度以显示缩略图，并利用其内置的预览功能 24。如果辅料颜色字段上传了色卡图，也采用相同方式处理 25。

TypeScript

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
{<br />
title: '辅料图片',<br />
dataIndex: 'material_image_url',<br />
width: 100,<br />
render: (url) =&gt; (<br />
// 固定高度确保表格整齐，点击即可弹出灯箱查看原图<br />
&lt;Image src={url} height={60} width={60} style={{ objectFit: 'cover', borderRadius: 4 }} /&gt;<br />
),<br />
}</td>
</tr>
</tbody>
</table>

**7. Mock 数据与演示方案 (Mock Data Strategy for Demo)**

为了向甲方提供高保真的 Demo 演示，在后端接口就位前，前端将采用 **自定义 Mock Data Provider** 的方案。这能精确模拟复杂的四级嵌套数据结构和联动交互。

**7.1 Mock 数据结构定义**

在 src/mock/data.ts 中定义静态的 JSON 数据，严格符合 TypeScript 类型定义。关键是要构造出 L1-L4 的关联关系。

TypeScript

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
// src/mock/data.ts// L1: 款号数据export const mockStyles: IStyle[] = [<br />
{ id: 1, style_no: '9128', style_name: '儿童拼色马甲', create_date: '2023-11-25', public_note: '注意面料色差' },<br />
];<br />
<br />
// L2: 颜色版本数据 (关联 style_id: 1)export const mockVariants: IColorVariant[] = [<br />
{ id: 101, style_id: 1, color_name: '灰色', sample_image_url: '/mock-images/gray-vest.jpg' },<br />
{ id: 102, style_id: 1, color_name: '粉色', sample_image_url: '/mock-images/pink-vest.jpg' },<br />
];<br />
<br />
// L3: 配料明细数据 (关联 variant_id, 并包含 L4 嵌套数组)export const mockBomItems: IBOMItem[] = [<br />
// --- 灰色款 (variant_id: 101) 的配料 ---<br />
{<br />
id: 1001, variant_id: 101, material_name: '5号树脂拉链', usage: 1, unit: '条',<br />
material_image_url: '/mock-images/zipper.jpg',<br />
// L4: 嵌套的规格明细列表 [cite: 34]specDetails: [<br />
{ id: 1, size: 'S', spec_value: '58.5', spec_unit: 'cm' },<br />
{ id: 2, size: 'M', spec_value: '59.5', spec_unit: 'cm' },<br />
{ id: 3, size: 'L', spec_value: '60.5', spec_unit: 'cm' },<br />
]<br />
},<br />
// --- 粉色款 (variant_id: 102) 的配料 ---<br />
{<br />
id: 2001, variant_id: 102, material_name: '5号树脂拉链', usage: 1, unit: '条',<br />
material_image_url: '/mock-images/zipper-pink.jpg',<br />
// L4 数据可能不同specDetails: [<br />
{ id: 4, size: 'S', spec_value: '58.5', spec_unit: 'cm' },<br />
]<br />
},<br />
// ...更多数据<br />
];</td>
</tr>
</tbody>
</table>

**7.2 自定义 Mock Data Provider 实现**

创建一个 src/providers/mockDataProvider.ts，拦截 Refine 的数据请求并返回本地数据。

TypeScript

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
// src/providers/mockDataProvider.ts (核心逻辑示意)import { DataProvider } from "@refinedev/core";<br />
import { mockStyles, mockVariants, mockBomItems } from "../mock/data";<br />
<br />
// 数据源映射const mockDatabase: any = {<br />
styles: mockStyles,<br />
variants: mockVariants,<br />
bom_items: mockBomItems,<br />
};<br />
<br />
export const mockDataProvider: DataProvider = {<br />
// 拦截列表查询请求 (如: 加载 L2 Tabs, 加载 L3 表格)getList: async ({ resource, filters, pagination }) =&gt; {<br />
// 模拟网络延迟，增加真实感await new Promise(r =&gt; setTimeout(r, 300));<br />
<br />
let data = mockDatabase[resource] || [];<br />
<br />
// 实现简单的前端筛选逻辑 (关键: 用于根据 variant_id 筛选 BOM 列表)if (filters) {<br />
filters.forEach((filter: any) =&gt; {<br />
if (filter.operator === 'eq' &amp;&amp; filter.value !== undefined) {<br />
// 简单相等比较过滤<br />
data = data.filter((item: any) =&gt; item[filter.field] == filter.value);<br />
}<br />
});<br />
}<br />
<br />
// 简易分页处理 (可选)const { current = 1, pageSize = 10 } = pagination ?? {};<br />
const start = (current - 1) * pageSize;<br />
const end = start + pageSize;<br />
const pageData = data.slice(start, end);<br />
<br />
return { data: pageData, total: data.length };<br />
},<br />
<br />
// 拦截单条详情查询请求 (如: 加载 L1 款号头信息)getOne: async ({ resource, id }) =&gt; {<br />
const data = mockDatabase[resource].find((item: any) =&gt; item.id == id);<br />
return { data };<br />
},<br />
<br />
// Mock 更新操作 (用于 L4 弹窗表单提交)update: async ({ resource, id, variables }) =&gt; {<br />
console.log(`[Mock Update] ${resource}#${id}`, variables);<br />
// Demo 阶段仅打印日志并返回成功，不实际修改内存数据，刷新后重置return { data: { id, ...variables } as any };<br />
},<br />
<br />
// Mock 自定义操作 (用于触发“深度克隆”)custom: async ({ url, method, payload }) =&gt; {<br />
if (url.includes('/clone') &amp;&amp; method === 'post') {<br />
console.log('[Mock Clone API Triggered]', payload);<br />
// 模拟克隆成功，返回一个新创建的 variant 对象结构return { data: { id: Date.now(), ...payload } };<br />
}<br />
throw new Error("Mock API not implemented");<br />
},<br />
<br />
// 其他不需要的方法可暂不实现create: async () =&gt; ({ data: {} as any }),<br />
deleteOne: async () =&gt; ({ data: {} as any }),<br />
getApiUrl: () =&gt; "",<br />
};</td>
</tr>
</tbody>
</table>

**7.3 Demo 环境配置**

在 App.tsx 中，使用环境变量来控制是否启用 Mock Provider。

TypeScript

<table style="width:88%;">
<colgroup>
<col style="width: 88%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: left;">Plain Text<br />
// App.tsx<br />
import { Refine } from "@refinedev/core";<br />
import { mockDataProvider } from "./providers/mockDataProvider";<br />
// import { nestJsDataProvider } from "./providers/nestJsDataProvider"; // 未来真实的 Provider<br />
<br />
// 通过环境变量控制，方便在 Demo 和真实开发间切换<br />
const isDemoMode = import.meta.env.VITE_APP_MODE === 'demo';<br />
<br />
const dataProvider = isDemoMode ? mockDataProvider : /* nestJsDataProvider */;<br />
<br />
function App() {<br />
return (<br />
&lt;Refine<br />
dataProvider={dataProvider}<br />
// ... 其他配置<br />
&gt;<br />
{/* ... 路由定义 */}<br />
&lt;/Refine&gt;<br />
);<br />
}</td>
</tr>
</tbody>
</table>

通过这种方式，我们可以构建一个功能完备、交互真实的纯前端 Demo，完美展示 SpecMaster 的核心价值。
