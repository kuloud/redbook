import type { PlasmoMessaging } from "@plasmohq/messaging"

import * as db from "~data/db"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { store, query, value, key, count } = req.body
  try {
    switch (req.body.method) {
      case "get":
        const item = (await db.getItem(store, query)) ?? {}
        res.send({
          code: 0,
          message: "success",
          value: item
        })
        break
      case "getAll":
        const allItems = (await db.getAllItems(store, query, count)) ?? []
        res.send({
          code: 0,
          message: "success",
          value: allItems
        })
        break
      case "set":
        await db.setItem(store, value, key)
        res.send({
          code: 0,
          message: "success"
        })
        break
      case "remove":
        await db.deleteItem(store, key)
        res.send({
          code: 0,
          message: "success"
        })
        break
      case "clear":
        await db.clearStore(store)
        res.send({
          code: 0,
          message: "success"
        })
        break
    }
  } catch (e) {
    res.send({
      code: 1,
      message: e.toString()
    })
  }
}

export default handler
