/**
 * L3 配料明细表格组件（核心难点）
 * 功能：
 * 1. 展示当前颜色版本下的所有配料明细
 * 2. 支持行内编辑（除规格明细外的字段）
 * 3. L4 规格明细聚合展示（多条规格记录显示为堆叠文本）
 * 4. 点击"编辑规格"按钮打开 L4 编辑弹窗
 * 5. 支持添加、删除配料
 */

import React, { useState } from "react";
import { EditableProTable } from "@ant-design/pro-components";
import { Image, Button, Tag, Upload, message } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import type { IBOMItem, ISpecDetail } from "../../types/models";
import { SpecDetailModalForm } from "./SpecDetailModalForm";
import { MaterialColorEditor, MaterialColorDisplay } from "./MaterialColorEditor";
import { uploadToQiniu } from "../../utils/qiniuUpload";

interface BOMTableProps {
  variantId: number;
}

/**
 * 辅料图片上传组件
 */
interface MaterialImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
}

const MaterialImageUploader: React.FC<MaterialImageUploaderProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToQiniu({
        file,
        prefix: "materials", // 辅料图片前缀
        onProgress: (percent) => {
          console.log(`辅料图片上传进度: ${percent}%`);
        },
      });

      onChange?.(url);
      message.success("辅料图片上传成功");
    } catch (error) {
      console.error("辅料图片上传失败:", error);
      message.error("辅料图片上传失败");
    } finally {
      setUploading(false);
    }
    return false; // 阻止默认上传
  };

  return (
    <div className="relative inline-block">
      <Upload
        listType="picture-card"
        showUploadList={false}
        beforeUpload={handleUpload}
        accept="image/*"
        disabled={uploading}
      >
        {value ? (
          <Image
            src={value}
            width={100}
            height={100}
            style={{ objectFit: "cover" }}
            preview={false}
          />
        ) : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>
              {uploading ? "上传中..." : "上传图片"}
            </div>
          </div>
        )}
      </Upload>
      {value && (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onChange?.("");
            message.success("图片已移除");
          }}
          className="absolute -top-2 -right-2 z-10"
          style={{ minWidth: 24, padding: "0 4px" }}
        />
      )}
    </div>
  );
};

export const BOMTable: React.FC<BOMTableProps> = ({ variantId }) => {
  // 当前正在编辑规格的配料记录
  const [editingRecord, setEditingRecord] = useState<IBOMItem | null>(null);

  // 加载 L3 配料数据（按 variant_id 筛选）
  const { data: bomData, isLoading } = useList<IBOMItem>({
    resource: "bom_items",
    filters: [{ field: "variant_id", operator: "eq", value: variantId }],
    pagination: { pageSize: 100 }, // 加载所有配料
  });

  const dataSource = bomData?.data || [];

  // 创建配料的 Hook
  const { mutate: createBomItem } = useCreate();

  // 更新配料的 Hook
  const { mutate: updateBomItem } = useUpdate();

  // 删除配料的 Hook
  const { mutate: deleteBomItem } = useDelete();

  /**
   * 处理行内编辑保存
   * 智能判断：新记录调用 CREATE，已存在记录调用 UPDATE
   */
  const handleSave = async (_key: React.Key, record: IBOMItem) => {
    // 检查记录是否已存在于数据库中
    const existingRecord = dataSource.find((item) => item.id === record.id);

    if (existingRecord) {
      // 已存在 -> 更新
      updateBomItem({
        resource: "bom_items",
        id: record.id,
        values: record,
        successNotification: {
          message: "保存成功",
          type: "success",
        },
      });
    } else {
      // 不存在 -> 创建新记录
      createBomItem({
        resource: "bom_items",
        values: {
          ...record,
          variant_id: variantId, // 确保关联正确的颜色版本
        },
        successNotification: {
          message: "添加成功",
          type: "success",
        },
      });
    }
  };

  /**
   * 处理删除配料
   */
  const handleDelete = (record: IBOMItem) => {
    deleteBomItem(
      {
        resource: "bom_items",
        id: record.id,
        successNotification: {
          message: "删除成功",
          type: "success",
        },
      }
    );
  };

  /**
   * 渲染 L4 规格明细聚合显示
   * 关键实现：将 specDetails 数组映射为堆叠的文本块
   */
  const renderSpecDetails = (specDetails: ISpecDetail[], record: IBOMItem) => {
    if (!specDetails || specDetails.length === 0) {
      return (
        <div className="text-center">
          <span className="text-gray-400">无规格</span>
          <div className="mt-2">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditingRecord(record)}
            >
              添加规格
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* 聚合显示所有规格 */}
        <div className="space-y-1">
          {specDetails.map((spec, idx) => (
            <div key={spec.id || idx} className="flex items-center gap-2">
              {/* 尺码标签 */}
              {spec.size && (
                <Tag color="blue" className="m-0">
                  {spec.size}
                </Tag>
              )}
              {/* 规格值和单位 */}
              <span className="font-medium text-gray-800">
                {spec.spec_value}
              </span>
              <span className="text-gray-500 text-sm">{spec.spec_unit}</span>
            </div>
          ))}
        </div>

        {/* 编辑按钮 */}
        <div>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditingRecord(record)}
            className="p-0 h-auto"
          >
            编辑规格
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 m-0">
            📦 配料明细表（BOM）
          </h3>
        </div>

        <EditableProTable<IBOMItem>
          rowKey="id"
          loading={isLoading}
          value={dataSource}
          columns={[
            {
              title: "辅料名称",
              dataIndex: "material_name",
              width: 180,
              formItemProps: {
                rules: [{ required: true, message: "请输入辅料名称" }],
              },
            },
            {
              title: "辅料图片",
              dataIndex: "material_image_url",
              width: 120,
              render: (url) => {
                if (!url) {
                  return (
                    <div className="w-[60px] h-[60px] bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      无图片
                    </div>
                  );
                }
                return (
                  <Image
                    src={url as string}
                    width={60}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                );
              },
              renderFormItem: (_, { record, recordKey }, form) => {
                return (
                  <MaterialImageUploader
                    value={record?.material_image_url}
                    onChange={(url) => {
                      if (record && recordKey !== undefined) {
                        record.material_image_url = url;
                        form?.setFieldsValue({
                          [recordKey as string]: {
                            ...record,
                            material_image_url: url,
                          },
                        });
                      }
                    }}
                  />
                );
              },
            },
            {
              title: "辅料颜色",
              dataIndex: "material_color_text", // 使用真实字段名
              width: 250,
              render: (_, record) => (
                <MaterialColorDisplay
                  text={record.material_color_text}
                  imageUrl={record.material_color_image_url}
                />
              ),
              renderFormItem: (_, { record, recordKey }, form) => {
                return (
                  <MaterialColorEditor
                    value={{
                      text: record?.material_color_text,
                      imageUrl: record?.material_color_image_url,
                    }}
                    onChange={(value) => {
                      // 使用表单实例更新值（确保被追踪）
                      if (record && recordKey !== undefined) {
                        record.material_color_text = value.text;
                        record.material_color_image_url = value.imageUrl;
                        // 触发表单值变化
                        form?.setFieldsValue({
                          [recordKey as string]: {
                            ...record,
                            material_color_text: value.text,
                            material_color_image_url: value.imageUrl,
                          },
                        });
                      }
                    }}
                  />
                );
              },
            },
            // 隐藏字段：辅料颜色图片URL（用于保存数据）
            {
              title: "色卡图片",
              dataIndex: "material_color_image_url",
              hideInTable: true, // 表格中隐藏
              editable: false,   // 不可编辑（通过上面的颜色列编辑）
            },
            {
              title: "单耗",
              dataIndex: "usage",
              width: 80,
              valueType: "digit",
              formItemProps: {
                rules: [{ required: true, message: "请输入单耗" }],
              },
            },
            {
              title: "单位",
              dataIndex: "unit",
              width: 80,
              valueType: "select",
              valueEnum: {
                米: { text: "米" },
                条: { text: "条" },
                粒: { text: "粒" },
                套: { text: "套" },
                片: { text: "片" },
              },
              formItemProps: {
                rules: [{ required: true, message: "请选择单位" }],
              },
            },
            {
              title: "供应商",
              dataIndex: "supplier",
              width: 150,
            },
            {
              title: "规格明细（尺码/值/单位）",
              dataIndex: "specDetails",
              width: 260,
              editable: false,
              render: (_, record) => renderSpecDetails(record.specDetails, record),
            },
            {
              title: "操作",
              valueType: "option",
              width: 120,
              render: (_, record, __, action) => [
                <a
                  key="edit"
                  onClick={() => {
                    action?.startEditable(record.id);
                  }}
                >
                  编辑
                </a>,
                <a
                  key="delete"
                  onClick={() => handleDelete(record)}
                  className="text-red-500"
                >
                  删除
                </a>,
              ],
            },
          ]}
          recordCreatorProps={{
            creatorButtonText: "添加配料",
            record: () => ({
              id: Date.now(), // 临时ID
              variant_id: variantId,
              material_name: "",
              material_image_url: "", // 让用户自己上传
              usage: 1,
              unit: "条",
              specDetails: [],
            }),
          }}
          editable={{
            type: "multiple",
            onSave: async (key, record) => {
              await handleSave(key as React.Key, record as IBOMItem);
            },
          }}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </div>

      {/* L4 规格编辑弹窗 */}
      <SpecDetailModalForm
        open={!!editingRecord}
        bomItem={editingRecord}
        onClose={() => setEditingRecord(null)}
      />
    </>
  );
};

