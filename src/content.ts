import type { PlasmoCSConfig } from "plasmo"
import axios from 'redaxios'

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
  // console.log('--->|')
  // axios.get(`https://www.xiaohongshu.com/user/profile/${currentUserId}`, {
  //   responseType: "text"
  // }).then((res) => {
  //   console.log('--->', res)
  //   const doc = new DOMParser().parseFromString(res.data, "text/html")
  //   console.log('--doc->', doc)
  // }).catch((err) => {
  //   console.log('--err->', err)
  // })
  // 
  
  // const jsonStr = doc.getElementById("__NEXT_DATA__").textContent ?? ""
}
