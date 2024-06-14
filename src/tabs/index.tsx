import "../style.css"
import { ThemeProvider } from "~theme"
import React, { useState } from 'react';
import { Avatar, Flex, Layout, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Gender, Interaction, UserInfo } from "~data/user";
import { Content, Header } from "antd/es/layout/layout";
import mockUsers from '~data/mock-users.json'
import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import Search from "antd/es/input/Search";

const { Text, Link } = Typography

function IndexPanel() {
  const [users, setUsers] = useState<UserInfo[] | null>(mockUsers);

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
      <Layout>
        <Header>
        </Header>
        <Content>
          <Search placeholder="input search text" enterButton="Search" size="large" loading />
          <Table columns={columns} expandable={{
            expandedRowRender: (record) => <Text style={{ whiteSpace: 'pre-wrap' }}>{record.description}</Text>,
          }} dataSource={users?.map(user => ({ ...user, key: user.redId }))} />
        </Content>
      </Layout>
    </ThemeProvider>
  )
}

export default IndexPanel