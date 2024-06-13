import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

const DB_NAME = 'redbook-extension-db';
const DB_VERSION = 1;
const STORE_NAME_PROFILES = 'profiles';
const STORE_NAME_NOTES = 'notes';

type Store = 'profiles' | 'notes'

interface RedbookDB extends DBSchema {
    [STORE_NAME_PROFILES]: {
        value: {
            uid: string
            name: string
        }
        key: string
        indexes: {}
    }
    [STORE_NAME_NOTES]: {
        value: {
            uid: string
            name: string
        }
        key: string
        indexes: {}
    }
}

const initDB = async (): Promise<IDBPDatabase<RedbookDB>> => {
    return openDB<RedbookDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            const profilesStore = db.createObjectStore(STORE_NAME_PROFILES, {
                // keyPath: ''
            });
            // profilesStore.createIndex()
        }
    });
};

export const getDb = async (): Promise<IDBPDatabase<RedbookDB>> => {
    const db = await initDB();
    return db;
};

export const setItem = async (store: Store, key: string, value: any): Promise<void> => {
    const db = await getDb();
    await db.put(store, value, key);
};

export const getItem = async (store: Store, key: string): Promise<any> => {
    const db = await getDb();
    return await db.get(store, key);
};

export const deleteItem = async (store: Store, key: string): Promise<void> => {
    const db = await getDb();
    await db.delete(store, key);
};

export const clearStore = async (store: Store,): Promise<void> => {
    const db = await getDb();
    await db.clear(store);
};
