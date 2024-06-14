import "../style.css"
import { ThemeProvider } from "~theme"
import React, { useState } from 'react';
import { Avatar, Flex, Layout, Menu, Space, Table, Tag, Typography, theme } from 'antd';
import type { MenuProps, TableColumnsType } from 'antd';
import { Gender, Interaction, UserInfo } from "~data/user";
import { Content, Header } from "antd/es/layout/layout";
import mockUsers from '~data/mock-users.json'
import { BookOutlined, BookOutlined, DesktopOutlined, FileOutlined, ManOutlined, PieChartOutlined, TeamOutlined, UserOutlined, WomanOutlined } from "@ant-design/icons";
import Search from "antd/es/input/Search";
import Sider from "antd/es/layout/Sider";

const { Text, Link } = Typography

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
  getItem('数据大盘', 'dashboard', <PieChartOutlined />),
  getItem('工作台', 'desktop', <DesktopOutlined />, [
    getItem('用户管理', 'user', <UserOutlined />),
    getItem('笔记管理', 'note', <BookOutlined />),
  ]),
  getItem('Files', '9', <FileOutlined />),
]

function IndexPanel() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const [users, setUsers] = useState<UserInfo[] | null>(mockUsers);
  const [collapsed, setCollapsed] = useState(false)

  const platforms: MenuProps['items'] = [{
    key: 'xhs',
    label: '小红书'
  }]

  const xhsMenus: MenuProps['items'] = [{
    key: 'search',
    label: '搜索'
  }]

  const columns: TableColumnsType<UserInfo> = [
    {
      title: '用户', key: 'base', render: (_, record, index) => <Flex align="center" gap="small">
        <Avatar src={record.avatar} size={"large"}></Avatar>
        <Flex vertical>
          <Text strong>{record.nickname}</Text>
          <Space>
            <Text type="secondary">ID:</Text>
            <Text type="secondary" copyable >{record.redId}</Text>
          </Space>
        </Flex>
      </Flex>,
      fixed: 'left'
    },
    Table.EXPAND_COLUMN,
    {
      title: 'IP属地', dataIndex: 'location', key: 'location', fixed: 'left'
    },
    {
      title: '标签', dataIndex: 'tags', key: 'tags', render: (tags: (Gender | string)[], record, index) => <Space>
        {tags?.map<React.ReactNode>((tag: Gender | string, i) => {
          if (typeof tag === 'object') {
            if ('gender' in tag) {
              const gender = new Gender(tag.gender, tag.genderText)
              return <Tag key={`tag-gender-${i}`} color={gender.gender === 'male' ? 'blue' : gender.gender === 'female' ? 'red' : null}>
                {gender.gender === 'male' && <ManOutlined />}
                {gender.gender === 'female' && <WomanOutlined />}
                {gender.genderText}
              </Tag>
            }
          } else {
            return <Tag key={`tag-${i}`}>
              {tag.toString()}
            </Tag>
          }

        })}
      </Space>, fixed: 'left'
    },
    {
      title: '关注', dataIndex: 'interactions', key: 'follows', render: (interactions: Interaction[], record, index) => <p>{interactions[0]?.count ?? '0'}</p>, fixed: 'left'
    },
    {
      title: '粉丝', dataIndex: 'interactions', key: 'fans', render: (interactions: Interaction[], record, index) => <p>{interactions[1]?.count ?? '0'}</p>, fixed: 'left'
    },
    {
      title: '获赞和收藏', dataIndex: 'interactions', key: 'collected', render: (interactions: Interaction[], record, index) => <p>{interactions[2]?.count ?? '0'}</p>, fixed: 'left'
    }
  ]

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
          <Sider style={{ background: colorBgContainer }} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['dashboard']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%', borderRight: 0 }}
              items={items}
            />
          </Sider>
          <Content className=" p-4">
            <Search placeholder="input search text" enterButton="Search" size="large" loading />
            <Table columns={columns} expandable={{
              expandedRowRender: (record) => <Text style={{ whiteSpace: 'pre-wrap' }}>{record.description}</Text>,
            }} dataSource={users?.map(user => ({ ...user, key: user.redId }))} />
          </Content>
        </Layout>
      </Layout>
    </ThemeProvider>
  )
}

export default IndexPanel