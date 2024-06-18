import type { PlasmoCSConfig } from "plasmo"

import { relayMessage } from "@plasmohq/messaging"

import type { UserInfo } from "~data/user"
import { parseUserInfoByDom } from "~platform/xhs/api"
import { extractUserId } from "~platform/xhs/utils"
import { userStorage } from "~utils/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://www.xiaohongshu.com/user/profile/*"],
  all_frames: true
}

const href = window.location.href
const currentUserId = extractUserId(href)

console.log("currentUserId: ", currentUserId)

relayMessage({ name: "storage" })

if (currentUserId) {
  const user = parseUserInfoByDom(document, currentUserId)
  if (user) {
    userStorage.getItem(user.redId).then((userInfo: UserInfo | undefined) => {
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
  }
}
