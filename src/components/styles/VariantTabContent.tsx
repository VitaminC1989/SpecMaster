/**
 * L2 单个颜色版本的内容容器
 * 结构：VariantHeader（样衣图 + 操作按钮）+ BOMTable（配料明细表格）
 */

import React from "react";
import type { IColorVariant } from "../../types/models";
import { VariantHeader } from "./VariantHeader";
import { BOMTable } from "./BOMTable";

interface VariantTabContentProps {
  variant: IColorVariant;
}

export const VariantTabContent: React.FC<VariantTabContentProps> = ({
  variant,
}) => {
  return (
    <div className="space-y-6">
      {/* L2 头部：样衣大图 + 信息 + 操作按钮 */}
      <VariantHeader variant={variant} />

      {/* L3 主体：配料明细表格（内含 L4 规格聚合显示）*/}
      <BOMTable variantId={variant.id} />
    </div>
  );
};

