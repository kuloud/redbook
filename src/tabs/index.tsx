import "../style.css"

import { BookOutlined, DesktopOutlined, UserOutlined } from "@ant-design/icons"
import { Layout, Menu, theme } from "antd"
import type { MenuProps } from "antd"
import { Content, Header } from "antd/es/layout/layout"
import Sider from "antd/es/layout/Sider"
import React, { useState } from "react"

import { relayMessage } from "@plasmohq/messaging"

import { UserInfo } from "~data/user"
import { ThemeProvider } from "~theme"

import NotePanel from "./workshop/note"
import UserPanel from "./workshop/user"

type MenuItem = Required<MenuProps>["items"][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label
  } as MenuItem
}

const items: MenuItem[] = [
  getItem("工作台", "workshop", <DesktopOutlined />, [
    getItem("用户管理", "user", <UserOutlined />),
    getItem("笔记管理", "note", <BookOutlined />)
  ])
]

function IndexPanel() {
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()
  const [selectedKey, setSelectedKey] = useState("user")
  const [collapsed, setCollapsed] = useState(false)

  const platforms: MenuProps["items"] = [
    {
      key: "xhs",
      label: "小红书"
    }
  ]

  return (
    <ThemeProvider>
      <Layout>
        <Header>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultActiveFirst
            defaultSelectedKeys={["xhs"]}
            items={platforms}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Layout>
          <Sider
            style={{ background: colorBgContainer }}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["user"]}
              defaultOpenKeys={["workshop"]}
              style={{ height: "100%", borderRight: 0 }}
              items={items}
              onSelect={(info) => setSelectedKey(info.key)}
            />
          </Sider>
          <Content className=" p-4">
            {selectedKey === "note" ? <NotePanel /> : <UserPanel />}
          </Content>
        </Layout>
      </Layout>
    </ThemeProvider>
  )
}

relayMessage({ name: "storage" })

export default IndexPanel
