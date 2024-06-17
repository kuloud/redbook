import "../style.css"
import { ThemeProvider } from "~theme"
import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import { UserInfo } from "~data/user";
import { Content, Header } from "antd/es/layout/layout";
import { BookOutlined, DesktopOutlined, UserOutlined } from "@ant-design/icons";
import UserPanel from "./workshop/user";
import { relayMessage } from "@plasmohq/messaging";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('工作台', 'workshop', <DesktopOutlined />, [
    getItem('用户管理', 'user', <UserOutlined />),
    getItem('笔记管理', 'note', <BookOutlined />),
  ]),
]

function IndexPanel() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const [users, setUsers] = useState<UserInfo[] | null>();
  const [collapsed, setCollapsed] = useState(false)

  const platforms: MenuProps['items'] = [{
    key: 'xhs',
    label: '小红书'
  }]

  return (
    <ThemeProvider>
      <Layout >
        <Header>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultActiveFirst
            defaultSelectedKeys={['xhs']}
            items={platforms}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Layout>
          {/* <Sider style={{ background: colorBgContainer }} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['workshop']}
              defaultOpenKeys={['user']}
              style={{ height: '100%', borderRight: 0 }}
              items={items}
            />
          </Sider> */}
          <Content className=" p-4" >
            <UserPanel />
          </Content>
        </Layout>
      </Layout>
    </ThemeProvider>
  )
}

relayMessage({ name: "storage" })

export default IndexPanel