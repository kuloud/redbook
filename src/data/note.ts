export class Note {
  nid: string
  title: string
  desc: string
  date: string
  like: string
  collect: string
  chat: string
  createTime: Date
  updateTime: Date

  constructor(
    nid: string,
    title: string,
    desc: string,
    date: string,
    like: string,
    collect: string,
    chat: string,
    createTime: Date = new Date(),
    updateTime: Date = new Date()
  ) {
    this.nid = nid
    this.title = title
    this.desc = desc
    this.date = date
    this.like = like
    this.collect = collect
    this.chat = chat
    this.createTime =
      typeof createTime === "string" ? new Date(createTime) : createTime
    this.updateTime =
      typeof updateTime === "string" ? new Date(updateTime) : updateTime
  }
}
