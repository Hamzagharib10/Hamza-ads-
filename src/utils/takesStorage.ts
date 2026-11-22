import { GeneratedTake } from "../types/studio";

const DB_NAME = "sawan_ads_studio_db";
const STORE_NAME = "takes";
const DB_VERSION = 1;

interface StoredTakeRecord extends Omit<GeneratedTake, "audioUrl"> {
  audioBlob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTakeToDb(take: GeneratedTake, audioBlob: Blob): Promise<void> {
  try {
    const db = await openDb();
    const { audioUrl: _ignored, ...rest } = take;
    const record: StoredTakeRecord = { ...rest, audioBlob };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Graceful no-op if IndexedDB is blocked in private mode
  }
}

export async function loadTakesFromDb(): Promise<GeneratedTake[]> {
  try {
    const db = await openDb();
    const records = await new Promise<StoredTakeRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve((req.result as StoredTakeRecord[]) || []);
      req.onerror = () => reject(req.error);
    });
    db.close();

    return records
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((rec) => {
        const { audioBlob, ...rest } = rec;
        return {
          ...rest,
          audioUrl: URL.createObjectURL(audioBlob),
        };
      });
  } catch {
    return [];
  }
}

export async function deleteTakeFromDb(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore storage errors
  }
}
