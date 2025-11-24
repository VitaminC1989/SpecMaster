/**
 * L1 款号详情页（核心页面）
 * 这是整个四级数据结构展示的主容器
 * 布局：L1 头部信息 + L2 颜色版本 Tabs（内含 L3 配料表格 + L4 规格编辑）
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { Button, Spin, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { IStyle } from "../../types/models";

// 导入子组件
import { StyleHeaderInfo } from "../../components/styles/StyleHeaderInfo";
import { VariantTabs } from "../../components/styles/VariantTabs";

export const StyleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 加载 L1 款号数据
  const { data, isLoading, isError } = useOne<IStyle>({
    resource: "styles",
    id: id!,
  });

  const styleData = data?.data;

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 错误状态
  if (isError || !styleData) {
    return (
      <div className="p-6">
        <Alert
          message="加载失败"
          description="无法加载款号信息，请稍后重试。"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/styles")}
        >
          返回列表
        </Button>
      </div>

      {/* L1: 款号基础信息展示 */}
      <StyleHeaderInfo style={styleData} />

      {/* L2: 颜色版本 Tabs 区域（内部包含 L3 和 L4）*/}
      <VariantTabs styleId={Number(id)} />
    </div>
  );
};

