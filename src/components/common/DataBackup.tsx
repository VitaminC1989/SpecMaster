/**
 * 数据备份与恢复组件
 * 功能：导出数据为 JSON、从 JSON 导入数据、重置数据库
 */

import React, { useState, useRef } from "react";
import { Button, Modal, message, Popconfirm, Card, Typography } from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { exportAllData, importAllData, resetDatabase } from "../../providers/database";

const { Text } = Typography;

interface DataBackupProps {
  onDataChange?: () => void; // 数据变更后的回调（用于刷新页面）
}

export const DataBackup: React.FC<DataBackupProps> = ({ onDataChange: _onDataChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 导出数据为 JSON 文件
   */
  const handleExport = async () => {
    setExporting(true);
    try {
      const jsonData = await exportAllData();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `specmaster_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success("数据导出成功！");
    } catch (error) {
      console.error("导出失败:", error);
      message.error("数据导出失败");
    } finally {
      setExporting(false);
    }
  };

  /**
   * 从 JSON 文件导入数据
   */
  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      await importAllData(text);
      message.success("数据导入成功！页面将刷新...");
      setModalOpen(false);
      // 刷新页面以加载新数据
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("导入失败:", error);
      message.error("数据导入失败，请检查文件格式");
    } finally {
      setImporting(false);
    }
  };

  /**
   * 重置数据库为初始状态
   */
  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDatabase();
      message.success("数据库已重置！页面将刷新...");
      setModalOpen(false);
      // 刷新页面以加载新数据
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("重置失败:", error);
      message.error("数据库重置失败");
    } finally {
      setResetting(false);
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        message.error("请选择 JSON 格式的文件");
        return;
      }
      handleImport(file);
    }
    // 清空 input 以便可以再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button
        icon={<DatabaseOutlined />}
        onClick={() => setModalOpen(true)}
        size="small"
      >
        数据管理
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <DatabaseOutlined />
            <span>数据管理</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4 py-4">
          {/* 数据说明 */}
          <Card size="small" className="bg-blue-50">
            <Text type="secondary">
              数据存储在浏览器 IndexedDB 中，刷新页面不会丢失。
              建议定期导出备份，以防浏览器清理数据。
            </Text>
          </Card>

          {/* 导出数据 */}
          <Card size="small" title="导出备份">
            <div className="flex items-center justify-between">
              <Text type="secondary">将所有数据导出为 JSON 文件</Text>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exporting}
              >
                导出数据
              </Button>
            </div>
          </Card>

          {/* 导入数据 */}
          <Card size="small" title="导入备份">
            <div className="flex items-center justify-between">
              <Text type="secondary">从 JSON 备份文件恢复数据</Text>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  style={{ display: "none" }}
                />
                <Popconfirm
                  title="确认导入？"
                  description="导入将覆盖所有现有数据，此操作不可撤销！"
                  onConfirm={() => fileInputRef.current?.click()}
                  okText="确认导入"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={importing}
                  >
                    导入数据
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </Card>

          {/* 重置数据库 */}
          <Card size="small" title="重置数据">
            <div className="flex items-center justify-between">
              <Text type="secondary">恢复为初始演示数据</Text>
              <Popconfirm
                title="确认重置？"
                description="这将删除所有数据并恢复为初始状态，此操作不可撤销！"
                onConfirm={handleReset}
                okText="确认重置"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<ReloadOutlined />}
                  loading={resetting}
                >
                  重置数据库
                </Button>
              </Popconfirm>
            </div>
          </Card>
        </div>
      </Modal>
    </>
  );
};
