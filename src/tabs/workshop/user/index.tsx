import { ManOutlined, WomanOutlined } from "@ant-design/icons"
import {
  ActionType,
  ModalForm,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  TableDropdown,
  type ProColumns
} from "@ant-design/pro-components"
import {
  Avatar,
  Button,
  Flex,
  message,
  Space,
  Table,
  Tag,
  Typography
} from "antd"
import React, { useRef, useState } from "react"

import { Gender, UserInfo } from "~data/user"
import { getUserInfo } from "~platform/xhs/api"
import { extractUserId } from "~platform/xhs/utils"
import { sleep } from "~utils/common"
import { parseFormatNumber } from "~utils/parse"
import { userStorage } from "~utils/storage"

const { Text } = Typography

function UserPanel() {
  const [modalAddRecord, setModalAddRecord] = useState(false)
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<UserInfo>[] = [
    {
      title: "用户",
      key: "base",
      render: (_, record) => (
        <Flex align="center" gap="small">
          <Avatar src={record.avatar} size={"large"}></Avatar>
          <Flex vertical>
            <Text strong>{record.nickname}</Text>
            <Space>
              <Text type="secondary">ID:</Text>
              <Text type="secondary" copyable>
                {record.redId}
              </Text>
            </Space>
          </Flex>
        </Flex>
      )
    },
    Table.EXPAND_COLUMN,
    {
      title: "IP属地",
      dataIndex: "location",
      key: "location"
    },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      render: (_, record) => (
        <Space>
          {Array.isArray(record.tags) &&
            record.tags.map<React.ReactNode>((tag: Gender | string, i) => {
              if (typeof tag === "object") {
                if ("gender" in tag) {
                  const gender = new Gender(tag.gender, tag.genderText)
                  return (
                    <Tag
                      key={`tag-gender-${i}`}
                      color={
                        gender.gender === "male"
                          ? "blue"
                          : gender.gender === "female"
                            ? "red"
                            : null
                      }>
                      {gender.gender === "male" && <ManOutlined />}
                      {gender.gender === "female" && <WomanOutlined />}
                      {gender.genderText}
                    </Tag>
                  )
                }
              } else {
                return <Tag key={`tag-${i}`}>{tag.toString()}</Tag>
              }
            })}
        </Space>
      )
    },
    {
      title: "关注",
      dataIndex: "interactions",
      key: "follows",
      hideInSearch: true,
      render: (_, record) => <p>{record.interactions[0]?.count ?? "0"}</p>,
      sorter: (a, b) =>
        parseFormatNumber(a.interactions[0]?.count ?? "0") -
        parseFormatNumber(b.interactions[0]?.count ?? "0")
    },
    {
      title: "粉丝",
      dataIndex: "interactions",
      key: "fans",
      hideInSearch: true,
      render: (_, record) => <p>{record.interactions[1]?.count ?? "0"}</p>,
      sorter: (a, b) =>
        parseFormatNumber(a.interactions[1]?.count ?? "0") -
        parseFormatNumber(b.interactions[1]?.count ?? "0")
    },
    {
      title: "获赞和收藏",
      dataIndex: "interactions",
      key: "collected",
      hideInSearch: true,
      render: (_, record) => <p>{record.interactions[2]?.count ?? "0"}</p>,
      sorter: (a, b) =>
        parseFormatNumber(a.interactions[2]?.count ?? "0") -
        parseFormatNumber(b.interactions[2]?.count ?? "0")
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "create_at",
      valueType: "date",
      sorter: (a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
      hideInSearch: true
    },
    {
      title: "时间范围",
      key: "dateRange",
      dataIndex: "createTime",
      hideInTable: true,
      valueType: "dateRange",
      fieldProps: {
        // placeholder: []
      },
      renderFormItem: (_, { type, defaultRender }) => {
        if (type === "form") {
          return null
        }

        return defaultRender(_)
      }
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      key: "updated_at",
      valueType: "date",
      sorter: (a, b) =>
        new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(),
      hideInSearch: true
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      hideInSearch: true,
      render: (text, record, _, action) => [
        <a
          href={`https://www.xiaohongshu.com/user/profile/${record.uid}`}
          target="_blank"
          rel="noopener noreferrer"
          key="view">
          查看
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={(key: string) => {
            if (key === "delete") {
              userStorage.removeItem(record.redId).then(() => {
                message.success("记录已删除")
                action?.reload()
              })
            } else {
              const recordString = JSON.stringify(record, null, 2)
              navigator.clipboard
                .writeText(recordString)
                .then(() => {
                  message.success("记录已复制到剪贴板")
                })
                .catch((err) => {
                  message.error("复制失败")
                  console.error("Could not copy text: ", err)
                })
            }
          }}
          menus={[
            { key: "copy", name: "复制" },
            { key: "delete", name: "删除" }
          ]}
        />
      ]
    }
  ]

  return (
    <>
      <ProTable<UserInfo>
        actionRef={actionRef}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <Text style={{ whiteSpace: "pre-wrap" }}>{record.description}</Text>
          )
        }}
        request={async (params, sorter, filter) => {
          try {
            const items = await userStorage.getAllItems()
            if (Array.isArray(items)) {
              const filteredItems = filterData(items, params, sorter, filter)
              const users = filteredItems.map((user) => ({
                ...user,
                key: user.redId
              }))
              return Promise.resolve({
                data: users,
                success: true
              })
            } else {
              Promise.resolve({
                data: [],
                success: true
              })
            }
          } catch (error) {
            console.error(error)
            return Promise.reject({
              data: [],
              success: false
            })
          }
        }}
        toolbar={{
          actions: [
            <Button
              key="primary"
              type="primary"
              onClick={() => {
                setModalAddRecord(true)
              }}>
              添加
            </Button>
          ]
        }}
        rowKey="key"
      />
      <ModalForm
        title="添加记录"
        open={modalAddRecord}
        onFinish={async (formData) => {
          console.log("onFinish---", formData)
          const uidData: string = formData.uidData ?? ""
          const uidFetchs = uidData
            .split(",")
            .map((item) => extractUserId(item))
            .filter(Boolean)
            .map((uid) => getUserInfo(uid))
          const results = await Promise.allSettled(uidFetchs)
          console.log("uidFetchs", results)
          const successUserInfos = results.filter(
            (item) => item.status === "fulfilled"
          )
          successUserInfos.forEach(
            (result: PromiseFulfilledResult<UserInfo>) => {
              const user = result.value
              userStorage
                .getItem(user.redId)
                .then((userInfo: UserInfo | undefined) => {
                  if (userInfo) {
                    const newUserInfo = {
                      ...userInfo,
                      ...user,
                      createTime: userInfo?.createTime ?? new Date()
                    }
                    userStorage.setItem(newUserInfo, user.redId)
                  } else {
                    userStorage.setItem(user, user.redId)
                  }
                })
                .catch((reason) => {
                  console.error(reason)
                })
            }
          )
          await sleep(500)
          if (successUserInfos.length > 0) {
            message.success(
              `提交成功, 新增 ${successUserInfos.length} 条数据。`
            )
            actionRef.current?.reload()
          } else {
            message.error("提交失败")
          }

          return successUserInfos.length > 0
        }}
        onOpenChange={setModalAddRecord}>
        <ProFormTextArea
          name="uidData"
          required
          cacheForSwr={false}
          placeholder={"输入用户主页地址或24位用户ID，用 , 隔开"}
        />
      </ModalForm>
    </>
  )
}

const filterData = (data: any[], params, sorter, filter) => {
  let filteredData = data

  if (params.base) {
    filteredData = filteredData.filter(
      (item) =>
        item.nickname.includes(params.base) || item.redId.includes(params.base)
    )
  }
  if (params.location) {
    filteredData = filteredData.filter((item) =>
      item.location.includes(params.location)
    )
  }
  if (params.tags) {
    filteredData = filteredData.filter((item) => {
      if (Array.isArray(item.tags)) {
        return item.tags.find(
          (tag) =>
            (typeof tag === "string" && tag.includes(params.tags)) ||
            (typeof tag === "object" &&
              tag.genderText &&
              tag.genderText.includes(params.tags))
        )
      } else {
        return false
      }
    })
  }

  if (params.dateRange) {
    const [start, end] = params.dateRange
    filteredData = filteredData.filter((item) => {
      const itemDate = new Date(item.createTime)
      return itemDate >= new Date(start) && itemDate <= new Date(end)
    })
  }

  if (sorter.lenght > 0) {
    const [sortKey, sortOrder] = Object.entries(sorter)[0]
    filteredData.sort((a, b) => {
      const valueA = a[sortKey]
      const valueB = b[sortKey]
      if (valueA < valueB) return sortOrder === "ascend" ? -1 : 1
      if (valueA > valueB) return sortOrder === "ascend" ? 1 : -1
      return 0
    })
  }

  return filteredData
}

export default UserPanel
