
import React, { useEffect, useState } from 'react';
import { Avatar, Button, Flex, Space, Table, Tag, Typography, theme } from 'antd';
import { Gender, UserInfo } from "~data/user";
import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import { LightFilter, ProFormDatePicker, ProFormDateRangePicker, ProTable, TableDropdown, type ProColumns } from '@ant-design/pro-components'
import { userStorage } from '~utils/storage';
import { parseFormatNumber } from '~utils/parse';

const { Text, Link } = Typography

function UserPanel() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const [searchKeyword, setSearchKeyword] = useState('')

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
        {Array.isArray(record.tags) && record.tags.map<React.ReactNode>((tag: Gender | string, i) => {
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
      title: '关注', dataIndex: 'interactions', key: 'follows', hideInSearch: true, render: (_, record, index) => <p>{record.interactions[0]?.count ?? '0'}</p>, fixed: 'left', sorter: (a, b) => parseFormatNumber(a.interactions[0]?.count ?? '0') - parseFormatNumber(b.interactions[0]?.count ?? '0')
    },
    {
      title: '粉丝', dataIndex: 'interactions', key: 'fans',
      hideInSearch: true, render: (_, record, index) => <p>{record.interactions[1]?.count ?? '0'}</p>, fixed: 'left', sorter: (a, b) => parseFormatNumber(a.interactions[1]?.count ?? '0') - parseFormatNumber(b.interactions[1]?.count ?? '0')
    },
    {
      title: '获赞和收藏', dataIndex: 'interactions', key: 'collected',
      hideInSearch: true, render: (_, record, index) => <p>{record.interactions[2]?.count ?? '0'}</p>, fixed: 'left', sorter: (a, b) => parseFormatNumber(a.interactions[2]?.count ?? '0') - parseFormatNumber(b.interactions[2]?.count ?? '0')
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
      sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
      hideInSearch: true,
    },
    {
      title: '更新时间', dataIndex: 'updateTime', key: 'updated_at', fixed: 'left', search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      }, valueType: 'date', sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      hideInSearch: true,
      render: (text, record, _, action) => [
        <a href={`https://www.xiaohongshu.com/user/profile/${record.uid}`} target="_blank" rel="noopener noreferrer" key="view">
          查看
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={() => action?.reload()}
          menus={[
            { key: 'copy', name: '复制' },
            { key: 'delete', name: '删除' },
          ]}
        />,
      ],
    },
  ]

  return (
    <Flex vertical gap={16}>

      <ProTable<UserInfo> columns={columns} expandable={{
        expandedRowRender: (record) => <Text style={{ whiteSpace: 'pre-wrap' }}>{record.description}</Text>,
      }}
        request={async (params, sorter, filter) => {
          try {
            const items = await userStorage.getAllItems()
            if (Array.isArray(items)) {
              const filteredItems = filterData(items, params, sorter, filter);
              const users = filteredItems.map(user => ({ ...user, key: user.redId }))
              // console.log('-->', users)
              return Promise.resolve({
                data: users,
                success: true,
              })
            } else {
              Promise.resolve({
                data: [],
                success: true,
              })
            }

          } catch (error) {
            console.error(error)
            return Promise.reject({
              data: [],
              success: false,
            })
          }

        }}
        toolbar={{
          filter: (
            <LightFilter>
              <ProFormDateRangePicker name={"dateRange"} label={"时间范围"} />
            </LightFilter>
          ),
          actions: [
            // <Button
            //   key="primary"
            //   type="primary"
            //   onClick={() => {
            //     alert('add');
            //   }}
            // >
            //   添加
            // </Button>,
          ],
        }}
        rowKey="key"
      />
    </Flex>
  )
}

const filterData = (data: any[], params, sorter, filter) => {
  console.log('filterData:', data, params, sorter, filter)
  let filteredData = data;

  if (params.base) {
    filteredData = filteredData.filter(item => item.nickname.includes(params.base) || item.redId.includes(params.base));
  }
  if (params.location) {
    filteredData = filteredData.filter(item => item.location.includes(params.location));
  }

  if (params.dateRange) {
    const [start, end] = params.dateRange;
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.createTime);
      return itemDate >= new Date(start) && itemDate <= new Date(end);
    });
  }

  if (sorter.lenght > 0) {
    const [sortKey, sortOrder] = Object.entries(sorter)[0];
    filteredData.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (valueA < valueB) return sortOrder === 'ascend' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'ascend' ? 1 : -1;
      return 0;
    });
  }

  return filteredData;
};

export default UserPanel