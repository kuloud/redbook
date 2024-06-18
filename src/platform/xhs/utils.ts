export const truncateUrl = (url: string): string => {
  const index = url.indexOf("|")
  return index !== -1 ? url.substring(0, index) : url
}

export const extractUserId = (data: string): string | null => {
  const regexUrl = /user\/profile\/([a-f0-9]{24})(?:\?|$)/
  const match = data.match(regexUrl)
  if (match) {
    return match[1]
  } else {
    const regexUid = /([a-f0-9]{24})/
    const match = data.trim().match(regexUid)
    return match ? match[1] : null
  }
}
