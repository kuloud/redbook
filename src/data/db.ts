import { openDB, type DBSchema, type IDBPDatabase } from "idb"

import type { Note } from "./note"
import type { UserInfo } from "./user"

const DB_NAME = "redbook-extension-db"
const DB_VERSION = 1

export enum Store {
  Profiles = "profiles",
  Notes = "notes"
}

interface RedbookDB extends DBSchema {
  [Store.Profiles]: {
    value: UserInfo
    key: string
  }
  [Store.Notes]: {
    value: Note
    key: string
  }
}

const initDB = async (): Promise<IDBPDatabase<RedbookDB>> => {
  return openDB<RedbookDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log("onUpgrade", oldVersion, newVersion)
      const profilesStore = db.createObjectStore(Store.Profiles, {
        keyPath: "redId"
      })
      const notesStore = db.createObjectStore(Store.Notes, {
        keyPath: "nid"
      })
    }
  })
}

export const getDb = async (): Promise<IDBPDatabase<RedbookDB>> => {
  const db = await initDB()
  return db
}

export const getAllItems = async (
  store: Store,
  query?: string | IDBKeyRange,
  count?: number
): Promise<any[]> => {
  const db = await getDb()
  return await db.getAll(store, query, count)
}

export const setItem = async (
  store: Store,
  value: any,
  key?: string | IDBKeyRange
): Promise<string> => {
  const db = await getDb()
  return await db.put(store, value, key)
}

export const getItem = async (
  store: Store,
  query: string | IDBKeyRange
): Promise<any> => {
  const db = await getDb()
  return await db.get(store, query)
}

export const deleteItem = async (
  store: Store,
  key: string | IDBKeyRange
): Promise<void> => {
  const db = await getDb()
  await db.delete(store, key)
}

export const clearStore = async (store: Store): Promise<void> => {
  const db = await getDb()
  await db.clear(store)
}
