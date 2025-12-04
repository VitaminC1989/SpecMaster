/**
 * L1 款号基础信息展示组件
 * 以卡片形式展示款号的基本属性（款号、名称、客户、创建日期、备注）
 * 支持编辑功能
 */

import React, { useState, useEffect } from "react";
import { Card, Descriptions, Button, Modal, Form, Input, Select, message, Space } from "antd";
import { EditOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useUpdate, useInvalidate, useList } from "@refinedev/core";
import type { IStyle, ICustomer } from "../../types/models";
import { OrderModal } from "./OrderModal";

interface StyleHeaderInfoProps {
  style?: IStyle;
}

export const StyleHeaderInfo: React.FC<StyleHeaderInfoProps> = ({ style }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 用于更新款号的 Hook
  const { mutate: updateStyle, isLoading } = useUpdate();

  // 用于刷新数据的钩子
  const invalidate = useInvalidate();

  // 加载客户列表
  const { data: customersData } = useList<ICustomer>({
    resource: "customers",
    pagination: {
      pageSize: 1000,
    },
  });

  // 当弹窗打开时，填充表单数据
  useEffect(() => {
    if (editModalOpen && style) {
      form.setFieldsValue({
        style_no: style.style_no,
        style_name: style.style_name,
        customer_id: style.customer_id,
        public_note: style.public_note,
      });
    }
  }, [editModalOpen, style, form]);

  if (!style) return null;

  /**
   * 处理表单提交
   */
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // 查找选中的客户名称
        const selectedCustomer = customersData?.data?.find(
          (c) => c.id === values.customer_id
        );

        // 构造更新数据
        const updatedStyle: Partial<IStyle> = {
          style_no: values.style_no,
          style_name: values.style_name,
          customer_id: values.customer_id,
          customer_name: selectedCustomer?.customer_name,
          public_note: values.public_note || "",
        };

        // 调用更新 API
        updateStyle(
          {
            resource: "styles",
            id: style.id,
            values: updatedStyle,
            successNotification: {
              message: "更新成功",
              description: `款号"${values.style_no}"已更新`,
              type: "success",
            },
            errorNotification: {
              message: "更新失败",
              description: "请稍后重试",
              type: "error",
            },
          },
          {
            onSuccess: () => {
              // 刷新款号数据
              invalidate({
                resource: "styles",
                invalidates: ["all"],
              });

              // 关闭弹窗
              setEditModalOpen(false);

              message.success("款号信息已更新！");
            },
          }
        );
      })
      .catch((errorInfo) => {
        console.error("表单验证失败:", errorInfo);
      });
  };

  return (
    <>
      <Card
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-lg font-semibold">款号基础信息</span>
          </div>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => setOrderModalOpen(true)}
            >
              下单
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditModalOpen(true)}
            >
              编辑
            </Button>
          </Space>
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

          <Descriptions.Item label="关联客户" span={1}>
            <span className="font-medium text-green-600">
              {style.customer_name || "-"}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="公共备注" span={2}>
            <span className="text-gray-700">
              {style.public_note || "无备注"}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title={
          <div className="text-lg">
            <span className="mr-2">✏️</span>
            编辑款号信息
          </div>
        }
        open={editModalOpen}
        onOk={handleSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={isLoading}
        okText="保存"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <div className="py-4">
          <Form form={form} layout="vertical" autoComplete="off">
            {/* 关联客户字段 */}
            <Form.Item
              label="关联客户"
              name="customer_id"
              rules={[{ required: true, message: "请选择关联客户" }]}
              tooltip="选择该款号所属的客户"
            >
              <Select
                placeholder="请选择客户"
                size="large"
                showSearch
                optionFilterProp="label"
                options={customersData?.data?.map((customer) => ({
                  label: customer.customer_name,
                  value: customer.id,
                }))}
              />
            </Form.Item>

            {/* 款号字段 */}
            <Form.Item
              label="款号"
              name="style_no"
              rules={[
                { required: true, message: "请输入款号" },
                { max: 20, message: "款号不能超过 20 个字符" },
                {
                  pattern: /^[a-zA-Z0-9]+$/,
                  message: "款号只能包含字母和数字",
                },
              ]}
              tooltip="唯一标识，建议使用字母数字组合"
            >
              <Input placeholder="如：9128, ST001" maxLength={20} size="large" />
            </Form.Item>

            {/* 款式名称字段 */}
            <Form.Item
              label="款式名称"
              name="style_name"
              rules={[{ max: 50, message: "款式名称不能超过 50 个字符" }]}
              tooltip="对款号的描述性名称"
            >
              <Input
                placeholder="如：儿童拼色马甲、成人休闲夹克"
                maxLength={50}
                size="large"
              />
            </Form.Item>

            {/* 公共备注字段 */}
            <Form.Item
              label="公共备注"
              name="public_note"
              rules={[{ max: 200, message: "备注不能超过 200 个字符" }]}
              tooltip="所有颜色版本共用的备注信息"
            >
              <Input.TextArea
                placeholder="如：注意面料色差，拉链需采用YKK品牌"
                maxLength={200}
                rows={4}
                showCount
              />
            </Form.Item>

            {/* 创建日期（只读） */}
            <div className="text-sm text-gray-500 mt-2">
              <strong>创建日期：</strong> {style.create_date}（不可修改）
            </div>
          </Form>
        </div>
      </Modal>

      {/* 下单弹窗 */}
      <OrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        style={style}
      />
    </>
  );
};
