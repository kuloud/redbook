import type { PlasmoCSConfig } from "plasmo"
import { parseUserInfoByDom } from "~platform/xhs/api";
import type { UserInfo } from "~data/user";
import { userStorage } from "~utils/storage";
import { relayMessage } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
  matches: ["https://www.xiaohongshu.com/user/profile/*"],
  all_frames: true
}

const extractUserId = (url: string): string | null => {
  const regex = /user\/profile\/([a-f0-9]{24})(?:\?|$)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const href = window.location.href
const currentUserId = extractUserId(href)

console.log('currentUserId: ', currentUserId)

relayMessage({ name: "storage" })

if (currentUserId) {
  const user = parseUserInfoByDom(document)
  if (user) {
    userStorage.getItem(user.redId).then((userInfo: UserInfo | undefined) => {
      if (userInfo) {
        const newUserInfo = { ...userInfo, ...user, createTime: userInfo?.createTime ?? new Date() }
        userStorage.setItem(newUserInfo)
      } else {
        userStorage.setItem(user)
      }
    })
  }

}

