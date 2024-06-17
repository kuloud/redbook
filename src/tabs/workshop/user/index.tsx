
import React, { useEffect, useState } from 'react';
import { Avatar, Button, Flex, Space, Table, Tag, Typography, theme } from 'antd';
import { Gender, UserInfo } from "~data/user";
import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import { LightFilter, ProFormDatePicker, ProTable, type ProColumns } from '@ant-design/pro-components'
import { userStorage } from '~utils/storage';

const { Text, Link } = Typography

function UserPanel() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const [users, setUsers] = useState<UserInfo[] | null>();

  const columns: ProColumns<UserInfo>[] = [
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
      title: '标签', dataIndex: 'tags', key: 'tags',
      render: (_, record, index) => <Space>
        {record.tags?.map<React.ReactNode>((tag: Gender | string, i) => {
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
      title: '关注', dataIndex: 'interactions', key: 'follows', render: (_, record, index) => <p>{record.interactions[0]?.count ?? '0'}</p>, fixed: 'left'
    },
    {
      title: '粉丝', dataIndex: 'interactions', key: 'fans', render: (_, record, index) => <p>{record.interactions[1]?.count ?? '0'}</p>, fixed: 'left'
    },
    {
      title: '获赞和收藏', dataIndex: 'interactions', key: 'collected', render: (_, record, index) => <p>{record.interactions[2]?.count ?? '0'}</p>, fixed: 'left'
    },
    {
      title: '创建时间', dataIndex: 'createTime', key: 'create_at', fixed: 'left', search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
      valueType: 'date',
      sorter: true,
    },
    {
      title: '更新时间', dataIndex: 'updateTime', key: 'updated_at', fixed: 'left', search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      }, valueType: 'date', sorter: true,
    },
  ]

  useEffect(() => {
    userStorage.getAllItems().then((v) => {
      setUsers(v)
    }).catch(e => {
    })

  }, [])

  return (
    <Flex vertical gap={16}>
      {/* <Search placeholder="输入关键字" enterButton="查询" size="large" /> */}

      <ProTable<UserInfo> columns={columns} expandable={{
        expandedRowRender: (record) => <Text style={{ whiteSpace: 'pre-wrap' }}>{record.description}</Text>,
      }} dataSource={users?.map(user => ({ ...user, key: user.redId }))}
        //   request={(params, sorter, filter) => {
        //     // 表单搜索项会从 params 传入，传递给后端接口。
        //     console.log(params, sorter, filter);
        //     return Promise.resolve({
        //       data: { users?.map(user => ({ ...user, key: user.redId }))
        //     },
        //       success: true,
        //   });
        // }}
        toolbar={{
          search: {
            onSearch: (value: string) => {
              alert(value);
            },
          },
          filter: (
            <LightFilter>
              <ProFormDatePicker name="startdate" label="开始日期" />
            </LightFilter>
          ),
          actions: [
            <Button
              key="primary"
              type="primary"
              onClick={() => {
                alert('add');
              }}
            >
              添加
            </Button>,
          ],
        }}
        rowKey="key"
        search={false} />
    </Flex>
  )
}

export default UserPanel