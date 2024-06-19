import type { PlasmoCSConfig } from "plasmo"

import { relayMessage } from "@plasmohq/messaging"

import type { UserInfo } from "~data/user"
import { parseNoteByDom, parseUserInfoByDom } from "~platform/xhs/api"
import { extractNoteId, extractUserId } from "~platform/xhs/utils"
import { sleep } from "~utils/common"
import { userStorage } from "~utils/storage"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.xiaohongshu.com/user/profile/*",
    "https://www.xiaohongshu.com/explore/*"
  ],
  all_frames: true
}

relayMessage({ name: "storage" })

// Mixed Content workarround
setTimeout(() => {
  const href = window.location.href
  if (href.includes("https://www.xiaohongshu.com/user/profile/")) {
    const currentUserId = extractUserId(href)

    console.log("currentUserId: ", currentUserId)

    if (currentUserId) {
      const user = parseUserInfoByDom(document, currentUserId)
      if (user) {
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
      }
    }
  } else if (href.includes("https://www.xiaohongshu.com/explore/")) {
    const currentNoteId = extractNoteId(href)

    console.log("currentNoteId: ", currentNoteId)

    if (currentNoteId) {
      const note = parseNoteByDom(document, currentNoteId)
    }
  }
}, 200)
