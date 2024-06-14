import type { PlasmoCSConfig } from "plasmo"
import axios from 'redaxios'
import { getUserInfo } from "~platform/xhs/api";

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

if (currentUserId) {
  // getUserInfo(currentUserId)
}
