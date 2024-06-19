import {
  ModalForm,
  ProFormTextArea,
  ProTable,
  TableDropdown,
  type ActionType,
  type ProColumns
} from "@ant-design/pro-components"
import { message, Row, Typography } from "antd"
import React, { useRef, useState } from "react"

import type { Note } from "~data/note"
import { UserInfo } from "~data/user"
import { getUserInfo } from "~platform/xhs/api"
import { extractUserId } from "~platform/xhs/utils"
import { sleep } from "~utils/common"
import { parseFormatNumber } from "~utils/parse"
import { noteStorage, userStorage } from "~utils/storage"

function NotePanel() {
  const [modalAddRecord, setModalAddRecord] = useState(false)
  const actionRef = useRef<ActionType>()
  const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>(
    {}
  )
  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const columns: ProColumns<Note>[] = [
    {
      title: "笔记ID",
      dataIndex: "nid",
      key: "nid",
      copyable: true,
      width: 100
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      width: 200
    },
    {
      title: "内容",
      dataIndex: "desc",
      key: "desc",
      width: 300,
      render: (dom, record) => {
        const isExpanded = expandedKeys[record.nid] || false

        return (
          <Row>
            <p
              style={{
                whiteSpace: "pre-wrap",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: isExpanded ? undefined : 3,
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
              {record.desc}
            </p>
            {record.desc.length > 100 && (
              <a
                onClick={() => toggleExpand(record.nid)}
                className=" text-blue-500">
                {isExpanded ? "收起" : "展开"}
              </a>
            )}
          </Row>
        )
      }
    },
    {
      title: "日期&IP属地",
      dataIndex: "date",
      key: "date",
      hideInSearch: true
    },
    {
      title: "喜欢",
      dataIndex: "like",
      key: "like",
      hideInSearch: true,
      render: (_, record) => <p>{record.like ?? "0"}</p>,
      sorter: (a, b) =>
        parseFormatNumber(a.like ?? "0") - parseFormatNumber(b.like ?? "0")
    },
    {
      title: "收藏",
      dataIndex: "collect",
      key: "collect",
      hideInSearch: true,
      render: (_, record) => <p>{record.collect ?? "0"}</p>,
      sorter: (a, b) =>
        parseFormatNumber(a.collect ?? "0") -
        parseFormatNumber(b.collect ?? "0")
    },
    {
      title: "评论",
      dataIndex: "chat",
      key: "chat",
      hideInSearch: true,
      render: (_, record) => <p>{record.chat ?? "0"}</p>,
      sorter: (a, b) =>
        parseFormatNumber(a.chat ?? "0") - parseFormatNumber(b.chat ?? "0")
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
          href={`https://www.xiaohongshu.com/explore/${record.nid}`}
          target="_blank"
          rel="noopener noreferrer"
          key="view">
          查看
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={(key: string) => {
            if (key === "delete") {
              userStorage.removeItem(record.nid).then(() => {
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
      <ProTable<Note>
        actionRef={actionRef}
        columns={columns}
        request={async (params, sorter, filter) => {
          try {
            const items = await noteStorage.getAllItems()
            if (Array.isArray(items)) {
              const filteredItems = filterData(items, params, sorter, filter)
              const notes = filteredItems.map((note) => ({
                ...note,
                key: note.nid
              }))
              return Promise.resolve({
                data: notes,
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
            // <Button
            //   key="primary"
            //   type="primary"
            //   onClick={() => {
            //     setModalAddRecord(true)
            //   }}>
            //   添加
            // </Button>
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

  if (params.nid) {
    filteredData = filteredData.filter((item) => item.nid.includes(params.nid))
  }
  if (params.title) {
    filteredData = filteredData.filter((item) =>
      item.title.includes(params.title)
    )
  }
  if (params.desc) {
    filteredData = filteredData.filter((item) =>
      item.desc.includes(params.desc)
    )
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

export default NotePanel
