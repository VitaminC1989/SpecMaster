/**
 * 尺码管理列表页
 * 功能：展示所有尺码、支持搜索、增删改查、排序
 */

import React, { useState } from "react";
import { useTable, useModalForm } from "@refinedev/antd";
import { ProTable } from "@ant-design/pro-components";
import { Button, Modal, Form, Input, InputNumber, Switch, message, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDelete } from "@refinedev/core";
import type { ISize } from "../../types/models";

export const SizeList: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // 表格数据
  const { tableProps } = useTable<ISize>({
    resource: "sizes",
    pagination: { pageSize: 20 },
    sorters: { initial: [{ field: "sort_order", order: "asc" }] },
  });

  // 编辑表单
  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: showEdit,
  } = useModalForm<ISize>({
    resource: "sizes",
    action: "edit",
    redirect: false,
  });

  // 删除
  const { mutate: deleteSize } = useDelete();

  const handleDelete = (record: ISize) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除尺码"${record.size_code}"吗？`,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        deleteSize({
          resource: "sizes",
          id: record.id,
          successNotification: {
            message: "删除成功",
            type: "success",
          },
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 m-0">📏 尺码管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateModalOpen(true)}
        >
          新建尺码
        </Button>
      </div>

      <ProTable<ISize>
        {...tableProps}
        rowKey="id"
        search={false}
        columns={[
          {
            title: "尺码代码",
            dataIndex: "size_code",
            width: 150,
            render: (text) => (
              <Tag color="blue" className="text-base px-3 py-1">
                {text}
              </Tag>
            ),
          },
          {
            title: "尺码名称",
            dataIndex: "size_name",
            width: 150,
            render: (text) => <span className="font-medium">{text}</span>,
          },
          {
            title: "排序",
            dataIndex: "sort_order",
            width: 100,
            sorter: true,
          },
          {
            title: "状态",
            dataIndex: "is_active",
            width: 100,
            render: (active) => (
              <Tag color={active ? "green" : "red"}>
                {active ? "启用" : "禁用"}
              </Tag>
            ),
          },
          {
            title: "备注",
            dataIndex: "note",
            ellipsis: true,
          },
          {
            title: "操作",
            width: 150,
            fixed: "right",
            render: (_, record) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => showEdit(record.id)}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 新建尺码弹窗 */}
      <CreateSizeModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* 编辑尺码弹窗 */}
      <Modal {...editModalProps} title="编辑尺码" width={600}>
        <Form {...editFormProps} layout="vertical">
          <Form.Item
            label="尺码代码"
            name="size_code"
            rules={[{ required: true, message: "请输入尺码代码" }]}
          >
            <Input placeholder="如：S, M, L" />
          </Form.Item>
          <Form.Item
            label="尺码名称"
            name="size_name"
            rules={[{ required: true, message: "请输入尺码名称" }]}
          >
            <Input placeholder="如：小号、中号" />
          </Form.Item>
          <Form.Item label="排序序号" name="sort_order">
            <InputNumber placeholder="数字越小越靠前" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="是否启用" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="备注" name="note">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 新建尺码弹窗组件
interface CreateSizeModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateSizeModal: React.FC<CreateSizeModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { mutate: createSize, isLoading } = useModalForm<ISize>({
    resource: "sizes",
    action: "create",
    redirect: false,
  }).formProps.onFinish as any;

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newSize = {
        ...values,
        is_active: values.is_active !== false, // 默认启用
      };
      
      createSize(
        { resource: "sizes", values: newSize },
        {
          onSuccess: () => {
            message.success("创建成功");
            form.resetFields();
            onClose();
          },
        }
      );
    });
  };

  return (
    <Modal
      title="新建尺码"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isLoading}
      width={600}
      okText="创建"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
        <Form.Item
          label="尺码代码"
          name="size_code"
          rules={[{ required: true, message: "请输入尺码代码" }]}
        >
          <Input placeholder="如：S, M, L, XL" />
        </Form.Item>
        <Form.Item
          label="尺码名称"
          name="size_name"
          rules={[{ required: true, message: "请输入尺码名称" }]}
        >
          <Input placeholder="如：小号、中号、大号" />
        </Form.Item>
        <Form.Item label="排序序号" name="sort_order">
          <InputNumber placeholder="数字越小越靠前" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="是否启用" name="is_active" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item label="备注" name="note">
          <Input.TextArea placeholder="请输入备注" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};




