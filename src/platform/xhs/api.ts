import axios from "redaxios"

import { Gender, Interaction, UserInfo } from "~data/user"

import { truncateUrl } from "./utils"

const http = axios.create({
  baseURL: "https://www.xiaohongshu.com"
})

export function parseUserInfoByDom(
  doc: Document,
  uid: string
): UserInfo | null {
  const userElement = doc.querySelector(".user-page#userPageContainer .user")
  if (userElement) {
    const avatar =
      userElement
        .querySelector<HTMLImageElement>(".avatar-wrapper .user-image")
        ?.src?.trim() || ""
    const nickname =
      userElement
        .querySelector<HTMLDivElement>(".user-nickname .user-name")
        ?.textContent?.trim() || ""
    const redId =
      userElement
        .querySelector<HTMLSpanElement>(".user-content .user-redId")
        ?.textContent?.replace("小红书号：", "")
        .trim() || ""
    const location =
      userElement
        .querySelector<HTMLSpanElement>(".user-content .user-IP")
        ?.textContent?.replace("IP属地：", "")
        .trim() || ""
    const description =
      userElement
        .querySelector<HTMLDivElement>(".user-desc")
        ?.textContent?.trim() || ""

    const tagsElements = userElement.querySelectorAll<SVGUseElement>(
      ".user-tags .tag-item"
    )
    const tags = Array.from(tagsElements).map((tag) => {
      const div = tag.firstElementChild
      if (div.className === "gender") {
        const useElement = div.querySelector("use")
        const genderText =
          div
            .querySelector<HTMLSpanElement>(".gender-text")
            ?.textContent?.trim() || ""
        return new Gender(
          useElement?.getAttribute("xlink:href")?.replace("#", "") || "",
          genderText
        )
      } else {
        return div?.textContent?.trim() || ""
      }
    })

    const interactionsElements = userElement.querySelectorAll<HTMLDivElement>(
      ".user-interactions div"
    )
    const interactions = Array.from(interactionsElements).map((interaction) => {
      const count =
        interaction
          .querySelector<HTMLSpanElement>(".count")
          ?.textContent?.trim() || ""
      const shows =
        interaction
          .querySelector<HTMLSpanElement>(".shows")
          ?.textContent?.trim() || ""
      return new Interaction(count, shows)
    })

    const followingText =
      userElement
        .querySelector<HTMLSpanElement>(
          ".info-right-area .reds-button-new-text"
        )
        ?.textContent?.trim() || ""
    const following = followingText === "已关注"

    const userInfo = new UserInfo(
      uid,
      nickname,
      redId,
      truncateUrl(avatar),
      location,
      description,
      tags,
      interactions,
      following
    )

    console.log("--userInfo->", userInfo)
    return userInfo
  }

  return null
}

export function parseNoteByDom(doc: Document, nid: string) {
  const noteContainerElement = doc.querySelector(
    ".note-container#noteContainer"
  )

  if (noteContainerElement) {
    const noteContentElement = noteContainerElement.querySelector(
      ".interaction-container .note-content"
    )

    const title =
      noteContentElement
        .querySelector<HTMLDivElement>(".title#detail-title")
        ?.textContent?.trim() || ""
    const desc =
      noteContentElement
        .querySelector<HTMLSpanElement>(".desc#detail-desc")
        ?.children[0]?.textContent?.trim() || ""
    const date =
      noteContentElement
        .querySelector<HTMLSpanElement>(".bottom-container .date span")
        ?.textContent?.trim() || ""

    const interactsElement = noteContainerElement.querySelector(
      ".interaction-container .engage-bar-container"
    )
    // Mixed Content workarround
    const like =
      interactsElement
        .querySelector(".like-wrapper .count")
        ?.textContent?.trim() || ""
    const collect =
      interactsElement
        .querySelector(".collect-wrapper .count")
        ?.textContent?.trim() || ""
    const chat =
      interactsElement
        .querySelector(".chat-wrapper .count")
        ?.textContent?.trim() || ""

    console.log(">>>", title, desc, date, like, collect, chat)
  }

  return null
}

export async function getUserInfo(uid: string) {
  const res = await http.get(`/user/profile/${uid}`, {
    responseType: "text"
  })
  const doc = new DOMParser().parseFromString(res.data, "text/html")

  return parseUserInfoByDom(doc, uid)
}
