/**
 * 单位管理列表页
 * 功能：展示所有单位、支持搜索、增删改查
 */

import React, { useState } from "react";
import { useTable, useModalForm } from "@refinedev/antd";
import { ProTable } from "@ant-design/pro-components";
import { Button, Modal, Form, Input, Switch, message, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDelete } from "@refinedev/core";
import type { IUnit } from "../../types/models";

export const UnitList: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // 表格数据
  const { tableProps } = useTable<IUnit>({
    resource: "units",
    pagination: { pageSize: 20 },
  });

  // 编辑表单
  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: showEdit,
  } = useModalForm<IUnit>({
    resource: "units",
    action: "edit",
    redirect: false,
  });

  // 删除
  const { mutate: deleteUnit } = useDelete();

  const handleDelete = (record: IUnit) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除单位"${record.unit_name}"吗？`,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        deleteUnit({
          resource: "units",
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
        <h2 className="text-2xl font-bold text-gray-800 m-0">⚖️ 单位管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateModalOpen(true)}
        >
          新建单位
        </Button>
      </div>

      <ProTable<IUnit>
        {...tableProps}
        rowKey="id"
        search={false}
        columns={[
          {
            title: "单位代码",
            dataIndex: "unit_code",
            width: 120,
            render: (text) => (
              <Tag color="blue" className="text-base px-3 py-1">
                {text}
              </Tag>
            ),
          },
          {
            title: "单位名称",
            dataIndex: "unit_name",
            width: 150,
            render: (text) => <span className="font-medium">{text}</span>,
          },
          {
            title: "单位类型",
            dataIndex: "unit_type",
            width: 120,
            render: (text) => (
              text ? <Tag color="cyan">{text}</Tag> : "-"
            ),
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

      {/* 新建单位弹窗 */}
      <CreateUnitModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* 编辑单位弹窗 */}
      <Modal {...editModalProps} title="编辑单位" width={600}>
        <Form {...editFormProps} layout="vertical">
          <Form.Item
            label="单位代码"
            name="unit_code"
            rules={[{ required: true, message: "请输入单位代码" }]}
          >
            <Input placeholder="如：m, pcs, kg" />
          </Form.Item>
          <Form.Item
            label="单位名称"
            name="unit_name"
            rules={[{ required: true, message: "请输入单位名称" }]}
          >
            <Input placeholder="如：米、条、千克" />
          </Form.Item>
          <Form.Item label="单位类型" name="unit_type">
            <Input placeholder="如：长度、数量、重量" />
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

// 新建单位弹窗组件
interface CreateUnitModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateUnitModal: React.FC<CreateUnitModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { mutate: createUnit, isLoading } = useModalForm<IUnit>({
    resource: "units",
    action: "create",
    redirect: false,
  }).formProps.onFinish as any;

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newUnit = {
        ...values,
        is_active: values.is_active !== false, // 默认启用
      };
      
      createUnit(
        { resource: "units", values: newUnit },
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
      title="新建单位"
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
          label="单位代码"
          name="unit_code"
          rules={[{ required: true, message: "请输入单位代码" }]}
        >
          <Input placeholder="如：m, pcs, kg" />
        </Form.Item>
        <Form.Item
          label="单位名称"
          name="unit_name"
          rules={[{ required: true, message: "请输入单位名称" }]}
        >
          <Input placeholder="如：米、条、千克" />
        </Form.Item>
        <Form.Item label="单位类型" name="unit_type">
          <Input placeholder="如：长度、数量、重量" />
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




