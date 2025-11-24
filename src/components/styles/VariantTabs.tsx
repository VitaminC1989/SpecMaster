/**
 * L2 颜色版本导航组件（Tabs）
 * 功能：
 * 1. 加载当前款号下的所有颜色版本
 * 2. 使用 Tabs 切换不同颜色
 * 3. 每个 Tab 渲染一个 VariantTabContent 组件
 * 4. 提供"新建颜色版本"功能
 * 5. 支持删除颜色版本
 */

import React, { useState } from "react";
import { Tabs, Button, Empty, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import type { IColorVariant } from "../../types/models";
import { VariantTabContent } from "./VariantTabContent";
import { CreateVariantModal } from "./CreateVariantModal";

interface VariantTabsProps {
  styleId: number;
}

export const VariantTabs: React.FC<VariantTabsProps> = ({ styleId }) => {
  // 控制新建颜色版本弹窗的显示状态
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 加载当前款号下的所有 L2 颜色版本（使用 filters 筛选）
  const { data, isLoading } = useList<IColorVariant>({
    resource: "variants",
    filters: [{ field: "style_id", operator: "eq", value: styleId }],
  });

  const variants = data?.data || [];

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spin size="large" tip="加载颜色版本..." />
      </div>
    );
  }

  // 无颜色版本时的空状态
  if (variants.length === 0) {
    return (
      <>
        <Empty
          description="暂无颜色版本，请先创建一个颜色版本"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            新建颜色版本
          </Button>
        </Empty>

        {/* 新建颜色版本弹窗 */}
        <CreateVariantModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          styleId={styleId}
        />
      </>
    );
  }

  return (
    <>
      <Tabs
        type="card"
        size="large"
        items={variants.map((variant) => ({
          key: String(variant.id),
          label: (
            <span className="px-2 py-1 text-base font-medium">
              🎨 {variant.color_name}
            </span>
          ),
          children: <VariantTabContent variant={variant} />,
        }))}
        tabBarExtraContent={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="mb-2"
            onClick={() => setCreateModalOpen(true)}
          >
            新建颜色版本
          </Button>
        }
        className="bg-white rounded-lg shadow-sm p-4"
      />

      {/* 新建颜色版本弹窗 */}
      <CreateVariantModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        styleId={styleId}
      />
    </>
  );
};

