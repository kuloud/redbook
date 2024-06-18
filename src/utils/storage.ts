import { sendToBackgroundViaRelay } from "@plasmohq/messaging"

import { Store } from "~data/db"

function handleResponse(response: any) {
  return new Promise<any>((resolve, reject) => {
    if (response.code == 0) {
      resolve(response.value)
    } else {
      reject(new Error(response.message))
    }
  })
}
const storage = {
  getItem: async (store: Store, query: string | IDBKeyRange) => {
    const response = await sendToBackgroundViaRelay({
      name: "storage",
      body: { method: "get", store, query }
    })
    return handleResponse(response)
  },
  getAllItems: async (
    store: Store,
    query?: string | IDBKeyRange,
    count?: number
  ): Promise<any[]> => {
    const response = await sendToBackgroundViaRelay({
      name: "storage",
      body: { method: "getAll", store, query, count }
    })
    return handleResponse(response)
  },
  setItem: async (store: Store, value: any, key?: string | IDBKeyRange) => {
    const response = await sendToBackgroundViaRelay({
      name: "storage",
      body: { method: "set", store, value, key }
    })
    return handleResponse({ ...response, value: null })
  },
  removeItem: async (store: Store, key: string | IDBKeyRange) => {
    const response = await sendToBackgroundViaRelay({
      name: "storage",
      body: { method: "remove", store, key }
    })
    return handleResponse({ ...response, value: null })
  },
  clearStore: async (store: Store) => {
    const response = await sendToBackgroundViaRelay({
      name: "storage",
      body: { method: "clear", store }
    })
    return handleResponse({ ...response, value: null })
  }
}
export default storage

function createStorageNS(store: Store) {
  return {
    getItem: async (query: string | IDBKeyRange) => {
      return await storage.getItem(store, query)
    },
    getAllItems: async (
      query?: string | IDBKeyRange,
      count?: number
    ): Promise<any[]> => {
      return await storage.getAllItems(store, query, count)
    },
    setItem: async (value: any, key: string | IDBKeyRange) => {
      const response = (await storage.getItem(store, key)) || {}
      return storage.setItem(store, { ...response, ...value })
    },
    removeItem: async (key: string | IDBKeyRange) => {
      return storage.removeItem(store, key)
    },
    clearStore: async () => {
      return storage.clearStore(store)
    }
  }
}

export const userStorage = createStorageNS(Store.Profiles)

export function clearAllStorages() {
  ;[userStorage].forEach((storage) => storage.clearStore())
}
