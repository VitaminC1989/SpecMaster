/**
 * 主布局组件
 * 提供应用的整体框架：顶部导航栏 + 内容区域
 */

import { Layout as AntLayout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { DataBackup } from "../common/DataBackup";

const { Header, Content } = AntLayout;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路径确定选中的菜单项
  const currentPath = location.pathname.split('/')[1] || 'styles';

  const menuItems = [
    {
      key: 'styles',
      label: '📋 款号管理',
    },
    {
      key: 'customers',
      label: '👥 客户管理',
    },
    {
      key: 'sizes',
      label: '📏 尺码管理',
    },
    {
      key: 'units',
      label: '⚖️ 单位管理',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  return (
    <AntLayout className="min-h-screen">
      {/* 顶部导航栏 */}
      <Header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/styles")}
            >
              <span className="text-2xl">👔</span>
              <h1 className="text-xl font-bold text-gray-800 m-0">
                SpecMaster
              </h1>
            </div>

            {/* 导航菜单 */}
            <Menu
              mode="horizontal"
              selectedKeys={[currentPath]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{ border: 'none', background: 'transparent', minWidth: 500 }}
            />
          </div>

          {/* 右侧：数据管理 */}
          <div className="flex items-center gap-4">
            <DataBackup />
          </div>
        </div>
      </Header>

      {/* 主内容区域 */}
      <Content className="p-6 bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          {/* 子页面渲染位置 */}
          <Outlet />
        </div>
      </Content>
    </AntLayout>
  );
};

