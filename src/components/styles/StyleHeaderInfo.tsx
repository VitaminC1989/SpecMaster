/**
 * L1 款号基础信息展示组件
 * 以卡片形式展示款号的基本属性（款号、名称、创建日期、备注）
 */

import React from "react";
import { Card, Descriptions } from "antd";
import type { IStyle } from "../../types/models";

interface StyleHeaderInfoProps {
  style?: IStyle;
}

export const StyleHeaderInfo: React.FC<StyleHeaderInfoProps> = ({ style }) => {
  if (!style) return null;

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <span className="text-lg font-semibold">款号基础信息</span>
        </div>
      }
      className="shadow-sm"
    >
      <Descriptions column={3} bordered>
        <Descriptions.Item label="款号" span={1}>
          <span className="font-bold text-blue-600 text-lg">
            {style.style_no}
          </span>
        </Descriptions.Item>
        
        <Descriptions.Item label="款式名称" span={1}>
          <span className="font-medium text-gray-800">
            {style.style_name || "-"}
          </span>
        </Descriptions.Item>
        
        <Descriptions.Item label="创建日期" span={1}>
          <span className="text-gray-600">{style.create_date}</span>
        </Descriptions.Item>
        
        <Descriptions.Item label="公共备注" span={3}>
          <span className="text-gray-700">
            {style.public_note || "无备注"}
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

