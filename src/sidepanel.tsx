import "./style.css"
import { ThemeProvider } from "~theme"
import React, { useState } from 'react';
import { Avatar, Button, Card, Dropdown, Flex, Menu, Space } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import axios from 'redaxios'
import { UserInfo } from "~data/user";
import { getUserInfo } from "~platform/xhs/api";



function IndexSidePanel() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const items: MenuProps['items'] = [
    {
      key: 'mail',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
          1st menu item
        </a>
      ),

    },
  ]



  return (
    <ThemeProvider>
      <Flex vertical>
        {/* <Dropdown.Button type="primary" icon={<DownOutlined />} menu={{ items }}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              Hover me
            </Space>
          </a>
        </Dropdown.Button> */}
        <Button onClick={() => {
          getUserInfo('63c89c5a0000000026007e78').then((res) => {
            setUserInfo(res)
          }).catch((err) => {
            console.log('--err->', err)
          })
        }}>Get</Button>

        {userInfo ? (
          <div>
            <Card title={(<Avatar icon={<UserOutlined />} src={<img src={userInfo.avatar} alt="avatar" />} />)} bordered={false} size="small">
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
            <h1>User Information</h1>
            <p><strong>Nickname:</strong> {userInfo.nickname}</p>
            <p><strong>Red ID:</strong> {userInfo.redId}</p>
            <p><strong>Location:</strong> {userInfo.location}</p>
            <p><strong>Description:</strong> {userInfo.description}</p>
            <p><strong>Tags:</strong> {userInfo.tags?.map(t => `${t}`).join(',') ?? ''}</p>
            <p><strong>Interactions:</strong> {userInfo.interactions.map(t => t.toString()).join(', ')}</p>
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
      </Flex>
    </ThemeProvider>
  )
}

export default IndexSidePanel