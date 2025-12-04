/**
 * 下单弹窗组件
 * 功能：
 * 1. 选择颜色版本
 * 2. 根据配料的规格明细自动提取所有尺码
 * 3. 输入各尺码的下单数量
 * 4. 计算配料需求量（区分尺码/不区分尺码两种情况）
 * 5. 生成 Excel 预览表格并支持导出（含图片）
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Card,
  Space,
  Divider,
  message,
  Image,
  Tag,
  Statistic,
  Row,
  Col,
  Spin,
  DatePicker,
} from "antd";
import {
  ShoppingCartOutlined,
  DownloadOutlined,
  CalculatorOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useList } from "@refinedev/core";
import type {
  IStyle,
  IColorVariant,
  IBOMItem,
  ISizeOrderQty,
} from "../../types/models";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs, { Dayjs } from "dayjs";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  style: IStyle;
}

/**
 * 计算结果行 - 区分尺码的配料
 */
interface ISizedMaterialRow {
  type: "sized";
  materialName: string;
  materialImageUrl: string;
  materialColor: string;
  materialColorImageUrl?: string;
  unit: string;
  usage: number;
  supplier?: string;
  size: string;
  specValue: string | number;
  specUnit: string;
  orderQty: number;        // 该尺码下单数量
  actualUsage: number;     // 实际用量 = 单耗 × 下单数量
  deliveryQty: number;     // 交货数量（用户可调整，默认=实际用量）
  difference: number;      // 差数 = 交货数量 - 实际用量
}

/**
 * 计算结果行 - 不区分尺码的配料
 */
interface IUniversalMaterialRow {
  type: "universal";
  materialName: string;
  materialImageUrl: string;
  materialColor: string;
  materialColorImageUrl?: string;
  unit: string;
  usage: number;
  supplier?: string;
  specValue: string | number;
  specUnit: string;
  totalOrderQty: number;   // 总下单数量（所有尺码加总）
  actualUsage: number;     // 实际用量 = 单耗 × 总下单数量
  deliveryQty: number;     // 交货数量
  difference: number;      // 差数
}

type IMaterialRow = ISizedMaterialRow | IUniversalMaterialRow;

/**
 * 将图片 URL 转换为 Base64
 */
const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * 根据 URL 获取图片扩展名
 */
const getImageExtension = (url: string): "jpeg" | "png" | "gif" => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes(".png")) return "png";
  if (lowerUrl.includes(".gif")) return "gif";
  return "jpeg";
};

export const OrderModal: React.FC<OrderModalProps> = ({
  open,
  onClose,
  style,
}) => {
  const [form] = Form.useForm();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [sizeOrders, setSizeOrders] = useState<ISizeOrderQty[]>([]);
  const [calculatedData, setCalculatedData] = useState<IMaterialRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [orderDate, setOrderDate] = useState<Dayjs>(dayjs());

  // 加载颜色版本
  const { data: variantsData } = useList<IColorVariant>({
    resource: "variants",
    filters: [{ field: "style_id", operator: "eq", value: style.id }],
  });

  const variants = variantsData?.data || [];

  // 加载选中颜色版本的配料数据
  const { data: bomData } = useList<IBOMItem>({
    resource: "bom_items",
    filters: selectedVariantId
      ? [{ field: "variant_id", operator: "eq", value: selectedVariantId }]
      : [],
    queryOptions: {
      enabled: !!selectedVariantId,
    },
  });

  const bomItems = bomData?.data || [];

  // 从配料的规格明细中提取所有唯一尺码
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    bomItems.forEach((item) => {
      item.specDetails?.forEach((spec) => {
        if (spec.size && spec.size !== "通码") {
          sizeSet.add(spec.size);
        }
      });
    });
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    return Array.from(sizeSet).sort((a, b) => {
      const indexA = sizeOrder.indexOf(a);
      const indexB = sizeOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [bomItems]);

  // 当选择颜色版本后，初始化尺码订单列表
  const handleVariantChange = (variantId: number) => {
    setSelectedVariantId(variantId);
    setShowPreview(false);
    setCalculatedData([]);
  };

  // 当可用尺码变化时，更新尺码订单列表
  React.useEffect(() => {
    if (availableSizes.length > 0) {
      setSizeOrders(
        availableSizes.map((size) => ({
          size,
          quantity: 0,
        }))
      );
    }
  }, [availableSizes]);

  // 更新某个尺码的下单数量
  const handleSizeQtyChange = (size: string, quantity: number) => {
    setSizeOrders((prev) =>
      prev.map((item) =>
        item.size === size ? { ...item, quantity: quantity || 0 } : item
      )
    );
  };

  // 计算配料需求量
  const calculateMaterialRequirements = useCallback(() => {
    const hasValidOrder = sizeOrders.some((s) => s.quantity > 0);
    if (!hasValidOrder) {
      message.warning("请至少输入一个尺码的下单数量");
      return;
    }

    const results: IMaterialRow[] = [];
    const activeSizeOrders = sizeOrders.filter((so) => so.quantity > 0);
    const totalOrderQty = activeSizeOrders.reduce((sum, s) => sum + s.quantity, 0);

    bomItems.forEach((item) => {
      // 判断是否需要区分尺码：如果规格明细中只有"通码"，则不区分尺码
      const hasOnlyUniversalSize =
        !item.specDetails ||
        item.specDetails.length === 0 ||
        (item.specDetails.length === 1 && item.specDetails[0].size === "通码");

      if (hasOnlyUniversalSize) {
        // 不区分尺码的配料：所有尺码数量加总
        const universalSpec = item.specDetails?.[0];
        const actualUsage = item.usage * totalOrderQty;

        results.push({
          type: "universal",
          materialName: item.material_name,
          materialImageUrl: item.material_image_url,
          materialColor: item.material_color_text || "-",
          materialColorImageUrl: item.material_color_image_url,
          unit: item.unit,
          usage: item.usage,
          supplier: item.supplier,
          specValue: universalSpec?.spec_value ?? "-",
          specUnit: universalSpec?.spec_unit ?? item.unit,
          totalOrderQty,
          actualUsage,
          deliveryQty: Math.ceil(actualUsage), // 默认向上取整
          difference: actualUsage - Math.ceil(actualUsage), // 差数 = 实际用量 - 交货数量
        });
      } else {
        // 区分尺码的配料：每个尺码单独计算
        activeSizeOrders.forEach((so) => {
          const specDetail = item.specDetails?.find((spec) => spec.size === so.size);
          if (specDetail) {
            const actualUsage = item.usage * so.quantity;

            results.push({
              type: "sized",
              materialName: item.material_name,
              materialImageUrl: item.material_image_url,
              materialColor: item.material_color_text || "-",
              materialColorImageUrl: item.material_color_image_url,
              unit: item.unit,
              usage: item.usage,
              supplier: item.supplier,
              size: so.size,
              specValue: specDetail.spec_value,
              specUnit: specDetail.spec_unit,
              orderQty: so.quantity,
              actualUsage,
              deliveryQty: Math.ceil(actualUsage),
              difference: actualUsage - Math.ceil(actualUsage), // 差数 = 实际用量 - 交货数量
            });
          }
        });
      }
    });

    setCalculatedData(results);
    setShowPreview(true);
  }, [bomItems, sizeOrders]);

  // 更新交货数量
  const handleDeliveryQtyChange = (index: number, value: number) => {
    setCalculatedData((prev) => {
      const newData = [...prev];
      const row = newData[index];
      row.deliveryQty = value;
      row.difference = row.actualUsage - value; // 差数 = 实际用量 - 交货数量
      return newData;
    });
  };

  // 导出 Excel（含图片）
  const exportToExcel = useCallback(async () => {
    if (calculatedData.length === 0) {
      message.warning("没有可导出的数据");
      return;
    }

    setExporting(true);

    try {
      const selectedVariant = variants.find((v) => v.id === selectedVariantId);
      const activeSizes = sizeOrders.filter((s) => s.quantity > 0);
      const totalOrderQty = activeSizes.reduce((sum, s) => sum + s.quantity, 0);

      // 创建工作簿
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "SpecMaster";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("配料下单表");

      // ========== 图片尺寸配置 ==========
      const sampleImageColWidth = 15;   // 样衣图片列宽（字符数）
      const materialImageColWidth = 12; // 辅料图片列宽
      const rowHeight = 60;             // 行高（点）

      // Excel列宽转像素（约7.5像素/字符）
      const sampleImageWidth = sampleImageColWidth * 7.5;
      const materialImageWidth = materialImageColWidth * 7.5;
      // Excel行高转像素（约1.33像素/点）
      const imageHeight = rowHeight * 1.33;

      // ========== 表头行 ==========
      const headers = [
        "日期",
        "款号",
        "样衣图片",
        "颜色",
        "总件数",
        "辅料名称",
        "辅料图片",
        "规格",
        "单位",
        "颜色",
        "下单数量",
        "单耗",
        "单位",
        "实际用量",
        "交货数量",
        "差数",
        "供应商",
      ];

      const headerRow = worksheet.getRow(1);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true, size: 10 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9EAD3" }, // 浅绿色背景
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      });
      headerRow.height = 25;

      // ========== 设置列宽（先设置，图片才能正确适应）==========
      worksheet.getColumn(1).width = 12;   // 日期
      worksheet.getColumn(2).width = 10;   // 款号
      worksheet.getColumn(3).width = sampleImageColWidth;   // 样衣图片
      worksheet.getColumn(4).width = 10;   // 颜色
      worksheet.getColumn(5).width = 10;   // 总件数
      worksheet.getColumn(6).width = 18;   // 辅料名称
      worksheet.getColumn(7).width = materialImageColWidth; // 辅料图片
      worksheet.getColumn(8).width = 12;   // 规格
      worksheet.getColumn(9).width = 8;    // 单位
      worksheet.getColumn(10).width = 10;  // 颜色
      worksheet.getColumn(11).width = 10;  // 下单数量
      worksheet.getColumn(12).width = 8;   // 单耗
      worksheet.getColumn(13).width = 8;   // 单位
      worksheet.getColumn(14).width = 12;  // 实际用量
      worksheet.getColumn(15).width = 12;  // 交货数量
      worksheet.getColumn(16).width = 10;  // 差数
      worksheet.getColumn(17).width = 16;  // 供应商

      // ========== 数据行 ==========
      let currentRowNum = 2;

      for (let i = 0; i < calculatedData.length; i++) {
        const row = calculatedData[i];
        const rowNum = currentRowNum + i;
        const dataRow = worksheet.getRow(rowNum);
        dataRow.height = rowHeight;

        // 第一行显示日期、款号、样衣图片、颜色、总件数
        if (i === 0) {
          dataRow.getCell(1).value = orderDate.format("YYYY-MM-DD");
          dataRow.getCell(2).value = style.style_no;
          dataRow.getCell(3).value = ""; // 样衣图片列
          dataRow.getCell(4).value = selectedVariant?.color_name || "";
          dataRow.getCell(5).value = totalOrderQty;
        }

        // 辅料名称（区分尺码的配料添加尺码标识）
        if (row.type === "sized") {
          dataRow.getCell(6).value = `${row.materialName}\n（${row.size}）`;
        } else {
          dataRow.getCell(6).value = row.materialName;
        }
        // 辅料图片列
        dataRow.getCell(7).value = "";
        // 规格
        dataRow.getCell(8).value = `${row.specValue}${row.specUnit}`;
        // 单位（规格单位）
        dataRow.getCell(9).value = row.specUnit;
        // 颜色
        dataRow.getCell(10).value = row.materialColor;
        // 下单数量
        dataRow.getCell(11).value = row.type === "sized" ? row.orderQty : row.totalOrderQty;
        // 单耗
        dataRow.getCell(12).value = row.usage;
        // 单位（单耗单位）
        dataRow.getCell(13).value = row.unit;
        // 实际用量
        dataRow.getCell(14).value = Number(row.actualUsage.toFixed(2));
        // 交货数量 - 高亮显示
        const deliveryCell = dataRow.getCell(15);
        deliveryCell.value = row.deliveryQty;
        deliveryCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" }, // 黄色高亮
        };
        // 差数
        const diffCell = dataRow.getCell(16);
        diffCell.value = Number(row.difference.toFixed(2));
        if (row.difference < 0) {
          diffCell.font = { color: { argb: "FFFF0000" } }; // 负数红色
        }
        // 供应商
        dataRow.getCell(17).value = row.supplier || "";

        // 设置边框和对齐
        for (let c = 1; c <= headers.length; c++) {
          const cell = dataRow.getCell(c);
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        }

        // 添加辅料图片（居中显示在单元格内）
        if (row.materialImageUrl) {
          const imageBase64 = await fetchImageAsBase64(row.materialImageUrl);
          if (imageBase64) {
            const imageId = workbook.addImage({
              base64: imageBase64,
              extension: getImageExtension(row.materialImageUrl),
            });
            // 计算图片尺寸，保持正方形且适应单元格
            const imgSize = Math.min(materialImageWidth - 8, imageHeight - 8);
            // 计算居中偏移（使用单元格内的相对位置 0-1）
            const colOffset = (materialImageWidth - imgSize) / 2 / materialImageWidth;
            const rowOffset = (imageHeight - imgSize) / 2 / imageHeight;

            worksheet.addImage(imageId, {
              tl: { col: 6 + colOffset, row: (rowNum - 1) + rowOffset },
              ext: { width: imgSize, height: imgSize },
            });
          }
        }
      }

      // 合并日期、款号、样衣图片、颜色、总件数列（所有数据行）
      const lastDataRow = currentRowNum + calculatedData.length - 1;
      if (calculatedData.length > 1) {
        worksheet.mergeCells(`A2:A${lastDataRow}`);
        worksheet.mergeCells(`B2:B${lastDataRow}`);
        worksheet.mergeCells(`C2:C${lastDataRow}`);
        worksheet.mergeCells(`D2:D${lastDataRow}`);
        worksheet.mergeCells(`E2:E${lastDataRow}`);
      }

      // 添加样衣图片（合并后的单元格居中显示）
      if (selectedVariant?.sample_image_url) {
        const sampleImageBase64 = await fetchImageAsBase64(selectedVariant.sample_image_url);
        if (sampleImageBase64) {
          const sampleImageId = workbook.addImage({
            base64: sampleImageBase64,
            extension: getImageExtension(selectedVariant.sample_image_url),
          });

          // 计算合并单元格的总高度（像素）
          const totalRows = calculatedData.length;
          const mergedHeightPx = totalRows * imageHeight;

          // 样衣图片保持2:3的比例（宽:高）
          const targetWidth = sampleImageWidth - 10;
          const targetHeight = targetWidth * 1.5;
          // 如果高度超出合并区域，则按高度缩放
          const finalHeight = Math.min(targetHeight, mergedHeightPx - 10);
          const finalWidth = finalHeight / 1.5;

          // 计算水平居中偏移（在单个列内的相对位置）
          const colOffset = (sampleImageWidth - finalWidth) / 2 / sampleImageWidth;

          // 计算垂直居中偏移（跨多行的情况）
          // 需要计算图片应该从第几行开始，以及在那一行内的偏移
          const topMarginPx = (mergedHeightPx - finalHeight) / 2;
          const startRowIndex = Math.floor(topMarginPx / imageHeight);
          const rowOffsetWithinCell = (topMarginPx - startRowIndex * imageHeight) / imageHeight;

          worksheet.addImage(sampleImageId, {
            tl: { col: 2 + colOffset, row: 1 + startRowIndex + rowOffsetWithinCell },
            ext: { width: finalWidth, height: finalHeight },
          });
        }
      }

      // ========== 导出文件 ==========
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `配料下单表_${style.style_no}_${selectedVariant?.color_name || ""}_${orderDate.format("YYYY-MM-DD")}.xlsx`
      );

      message.success("Excel 导出成功！");
    } catch (error) {
      console.error("导出失败:", error);
      message.error("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }, [calculatedData, style, variants, selectedVariantId, sizeOrders, orderDate]);

  // 重置弹窗状态
  const handleClose = () => {
    setSelectedVariantId(null);
    setSizeOrders([]);
    setCalculatedData([]);
    setShowPreview(false);
    form.resetFields();
    onClose();
  };

  // 计算总件数
  const totalOrderQty = sizeOrders.reduce((sum, s) => sum + s.quantity, 0);

  // 预览表格列定义
  const previewColumns = useMemo(() => {
    return [
      {
        title: "辅料名称",
        dataIndex: "materialName",
        key: "materialName",
        width: 150,
        fixed: "left" as const,
        render: (name: string, record: IMaterialRow) => (
          <div>
            <div className="font-medium">{name}</div>
            {record.type === "sized" && (
              <Tag color="blue" className="mt-1">{record.size}</Tag>
            )}
            {record.type === "universal" && (
              <Tag color="green" className="mt-1">通码</Tag>
            )}
          </div>
        ),
      },
      {
        title: "辅料图片",
        dataIndex: "materialImageUrl",
        key: "materialImageUrl",
        width: 80,
        render: (url: string) => (
          <Image src={url} width={50} height={50} style={{ objectFit: "cover" }} />
        ),
      },
      {
        title: "规格",
        key: "spec",
        width: 100,
        render: (_: unknown, record: IMaterialRow) => (
          <span>{record.specValue}{record.specUnit}</span>
        ),
      },
      {
        title: "辅料颜色",
        dataIndex: "materialColor",
        key: "materialColor",
        width: 100,
      },
      {
        title: "下单数量",
        key: "orderQty",
        width: 100,
        render: (_: unknown, record: IMaterialRow) => (
          <span className="font-medium">
            {record.type === "sized" ? record.orderQty : record.totalOrderQty} 件
          </span>
        ),
      },
      {
        title: "单耗",
        dataIndex: "usage",
        key: "usage",
        width: 80,
        render: (usage: number, record: IMaterialRow) => (
          <span>{usage} {record.unit}</span>
        ),
      },
      {
        title: "实际用量",
        dataIndex: "actualUsage",
        key: "actualUsage",
        width: 100,
        render: (val: number, record: IMaterialRow) => (
          <span>{val.toFixed(2)} {record.unit}</span>
        ),
      },
      {
        title: "交货数量",
        key: "deliveryQty",
        width: 140,
        render: (_: unknown, record: IMaterialRow, index: number) => (
          <Space size={4}>
            <InputNumber
              min={0}
              value={record.deliveryQty}
              onChange={(val) => handleDeliveryQtyChange(index, val || 0)}
              size="small"
              style={{ width: 80 }}
            />
            <span className="text-gray-500">{record.unit}</span>
          </Space>
        ),
      },
      {
        title: "差数",
        dataIndex: "difference",
        key: "difference",
        width: 80,
        render: (val: number) => (
          <span className={val < 0 ? "text-red-500" : "text-gray-600"}>
            {val.toFixed(2)}
          </span>
        ),
      },
      {
        title: "供应商",
        dataIndex: "supplier",
        key: "supplier",
        width: 120,
      },
    ];
  }, []);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined className="text-blue-500" />
          <span>配料下单 - {style.style_no}</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={showPreview ? 1300 : 700}
      footer={
        showPreview
          ? [
              <Button key="back" onClick={() => setShowPreview(false)} disabled={exporting}>
                返回修改
              </Button>,
              <Button
                key="export"
                type="primary"
                icon={exporting ? <LoadingOutlined /> : <DownloadOutlined />}
                onClick={exportToExcel}
                loading={exporting}
              >
                {exporting ? "导出中..." : "导出 Excel"}
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={handleClose}>
                取消
              </Button>,
              <Button
                key="calculate"
                type="primary"
                icon={<CalculatorOutlined />}
                onClick={calculateMaterialRequirements}
                disabled={!selectedVariantId || totalOrderQty === 0}
              >
                计算配料并预览
              </Button>,
            ]
      }
      destroyOnClose
    >
      {!showPreview ? (
        <div className="space-y-6">
          {/* 步骤1: 选择日期和颜色版本 */}
          <Card title="步骤1: 基本信息" size="small">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-gray-600">下单日期</div>
                <DatePicker
                  value={orderDate}
                  onChange={(date) => date && setOrderDate(date)}
                  style={{ width: "100%" }}
                  size="large"
                />
              </div>
              <div>
                <div className="mb-2 text-gray-600">颜色版本</div>
                <Select
                  placeholder="请选择颜色版本"
                  style={{ width: "100%" }}
                  size="large"
                  value={selectedVariantId}
                  onChange={handleVariantChange}
                  options={variants.map((v) => ({
                    label: v.color_name,
                    value: v.id,
                  }))}
                />
              </div>
            </div>
          </Card>

          {/* 步骤2: 输入各尺码下单数量 */}
          {selectedVariantId && availableSizes.length > 0 && (
            <Card title="步骤2: 输入各尺码下单数量" size="small">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sizeOrders.map((item) => (
                  <div
                    key={item.size}
                    className="flex flex-col items-center p-3 border rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <Tag color="blue" className="mb-2 text-base px-3 py-1">
                      {item.size}
                    </Tag>
                    <InputNumber
                      min={0}
                      max={99999}
                      value={item.quantity}
                      onChange={(val) => handleSizeQtyChange(item.size, val || 0)}
                      placeholder="数量"
                      className="w-full"
                      size="large"
                    />
                    <span className="text-xs text-gray-400 mt-1">件</span>
                  </div>
                ))}
              </div>

              <Divider />

              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="下单总件数"
                    value={totalOrderQty}
                    suffix="件"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="配料种类"
                    value={bomItems.length}
                    suffix="种"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="已选尺码"
                    value={sizeOrders.filter((s) => s.quantity > 0).length}
                    suffix={`/ ${availableSizes.length}`}
                  />
                </Col>
              </Row>
            </Card>
          )}

          {selectedVariantId && availableSizes.length === 0 && (
            <Card>
              <div className="text-center text-gray-500 py-8">
                该颜色版本暂无带尺码的配料规格明细
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 预览表格 */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>配料需求预览</span>
                <Space>
                  <Tag color="orange">日期: {orderDate.format("YYYY-MM-DD")}</Tag>
                  <Tag color="blue">总件数: {totalOrderQty}</Tag>
                  <Tag color="green">
                    配料行数: {calculatedData.length}
                  </Tag>
                </Space>
              </div>
            }
            size="small"
          >
            {exporting && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                <Spin size="small" />
                <span className="text-blue-600">正在生成 Excel 文件并下载图片，请稍候...</span>
              </div>
            )}
            <div className="mb-3 text-gray-500 text-sm">
              提示：区分尺码的配料会按尺码分行显示，不区分尺码的配料（通码）会合并计算。您可以在"交货数量"列调整实际交货数量。
            </div>
            <Table
              dataSource={calculatedData}
              columns={previewColumns}
              rowKey={(_, index) => String(index)}
              pagination={false}
              scroll={{ x: 1100 }}
              bordered
              size="small"
            />
          </Card>
        </div>
      )}
    </Modal>
  );
};
