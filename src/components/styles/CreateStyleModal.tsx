/**
 * 新建款号弹窗组件
 * 功能：
 * 1. 表单收集款号基础信息（款号、款式名称、公共备注）
 * 2. 创建日期自动生成
 * 3. 提交后创建新款号
 */

import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { useCreate, useInvalidate, useList } from "@refinedev/core";
import type { IStyle, ICustomer } from "../../types/models";
import dayjs from "dayjs";

interface CreateStyleModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateStyleModal: React.FC<CreateStyleModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();

  // 用于创建款号的 Hook
  const { mutate: createStyle, isLoading } = useCreate();

  // 用于刷新数据的钩子
  const invalidate = useInvalidate();

  // 加载客户列表
  const { data: customersData } = useList<ICustomer>({
    resource: "customers",
    pagination: {
      pageSize: 1000, // 加载所有客户
    },
  });

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

        // 构造款号数据（创建日期自动生成）
        const newStyle: Omit<IStyle, "id"> = {
          style_no: values.style_no,
          style_name: values.style_name,
          customer_id: values.customer_id,
          customer_name: selectedCustomer?.customer_name,
          create_date: dayjs().format("YYYY-MM-DD"), // 当前日期
          public_note: values.public_note || "",
        };

        // 调用创建 API
        createStyle(
          {
            resource: "styles",
            values: newStyle,
            successNotification: {
              message: "创建成功",
              description: `款号"${values.style_no}"已创建`,
              type: "success",
            },
            errorNotification: {
              message: "创建失败",
              description: "请稍后重试",
              type: "error",
            },
          },
          {
            onSuccess: (_data) => {
              // 刷新款号列表
              invalidate({
                resource: "styles",
                invalidates: ["list"],
              });

              // 关闭弹窗并重置表单
              handleClose();

              // 提示是否跳转到详情页
              message.success({
                content: "款号创建成功！",
                duration: 2,
              });
            },
          }
        );
      })
      .catch((errorInfo) => {
        console.error("表单验证失败:", errorInfo);
      });
  };

  /**
   * 处理关闭弹窗
   */
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="text-lg">
          <span className="mr-2">📋</span>
          新建款号
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleClose}
      confirmLoading={isLoading}
      okText="创建"
      cancelText="取消"
      width={600}
      destroyOnClose
    >
      <div className="py-4">
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-gray-700 m-0">
            💡 <strong>提示：</strong>创建款号后，您可以为其添加不同的颜色版本和配料明细。
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          {/* 关联客户字段（必填）*/}
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

          {/* 款号字段（必填）*/}
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
            tooltip="唯一标识，建议使用字母数字组合，如：9128, ST001"
          >
            <Input
              placeholder="如：9128, ST001, A2023"
              maxLength={20}
              size="large"
            />
          </Form.Item>

          {/* 款式名称字段（可选）*/}
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

          {/* 公共备注字段（可选）*/}
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

          {/* 创建日期（自动生成，无需用户输入）*/}
          <div className="text-sm text-gray-500 mt-2">
            <strong>创建日期：</strong> {dayjs().format("YYYY-MM-DD")}（自动生成）
          </div>
        </Form>
      </div>
    </Modal>
  );
};

