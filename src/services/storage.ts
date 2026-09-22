import { VaultItem, Category, StorageLocation, VaultBackup } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_LOCATIONS, INITIAL_SAMPLE_ITEMS } from '../data/sampleData';

const DB_NAME = 'MyVault_LocalDB';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('categoryId', 'categoryId', { unique: false });
        itemStore.createIndex('locationId', 'locationId', { unique: false });
        itemStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('locations')) {
        db.createObjectStore('locations', { keyPath: 'id' });
      }

      if (db.objectStoreNames.contains('quantityLogs')) {
        db.deleteObjectStore('quantityLogs');
      }
    };

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Auto seed initial data if empty
      const tx = db.transaction(['items', 'categories', 'locations'], 'readonly');
      const countReq = tx.objectStore('items').count();
      
      countReq.onsuccess = () => {
        if (countReq.result === 0) {
          seedDatabase(db).then(() => resolve(db)).catch(reject);
        } else {
          resolve(db);
        }
      };

      countReq.onerror = () => resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

async function seedDatabase(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['items', 'categories', 'locations'], 'readwrite');
    
    const catStore = tx.objectStore('categories');
    DEFAULT_CATEGORIES.forEach((cat) => catStore.put(cat));

    const locStore = tx.objectStore('locations');
    DEFAULT_LOCATIONS.forEach((loc) => locStore.put(loc));

    const itemStore = tx.objectStore('items');
    INITIAL_SAMPLE_ITEMS.forEach((item) => itemStore.put(item));

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Items API
export async function getAllItems(): Promise<VaultItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('items', 'readonly');
    const store = tx.objectStore('items');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveItem(item: VaultItem): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Categories API
export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('categories', 'readonly');
    const store = tx.objectStore('categories');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCategory(category: Category): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    const req = store.put(category);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['categories', 'items'], 'readwrite');
    const catStore = tx.objectStore('categories');
    const itemStore = tx.objectStore('items');

    // 1. Delete the category itself
    catStore.delete(id);

    // 2. Cascade delete sub-categories belonging to this category
    const catReq = catStore.getAll();
    catReq.onsuccess = () => {
      const allCats: Category[] = catReq.result || [];
      allCats.forEach((c) => {
        if (c.parentId === id) {
          catStore.delete(c.id);
        }
      });
    };

    // 3. Re-assign any items under this category to 'cat_misc' so items are never lost
    const itemReq = itemStore.getAll();
    itemReq.onsuccess = () => {
      const allItems: VaultItem[] = itemReq.result || [];
      allItems.forEach((item) => {
        if (item.categoryId === id) {
          item.categoryId = 'cat_misc';
          item.subcategory = undefined;
          itemStore.put(item);
        }
      });
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Locations API
export async function getAllLocations(): Promise<StorageLocation[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('locations', 'readonly');
    const store = tx.objectStore('locations');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocation(loc: StorageLocation): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('locations', 'readwrite');
    const store = tx.objectStore('locations');
    const req = store.put(loc);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteLocation(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('locations', 'readwrite');
    const store = tx.objectStore('locations');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Backup & Export / Import
export async function exportVaultData(): Promise<string> {
  const items = await getAllItems();
  const categories = await getAllCategories();
  const locations = await getAllLocations();

  const backup: VaultBackup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    items,
    categories,
    locations,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importVaultData(jsonString: string): Promise<{ itemsCount: number; categoriesCount: number }> {
  const data: VaultBackup = JSON.parse(jsonString);
  if (!data || !Array.isArray(data.items)) {
    throw new Error('Invalid backup file format. Expected a valid MyVault export.');
  }

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['items', 'categories', 'locations'], 'readwrite');

    const itemStore = tx.objectStore('items');
    data.items.forEach((item) => itemStore.put(item));

    if (Array.isArray(data.categories)) {
      const catStore = tx.objectStore('categories');
      data.categories.forEach((cat) => catStore.put(cat));
    }

    if (Array.isArray(data.locations)) {
      const locStore = tx.objectStore('locations');
      data.locations.forEach((loc) => locStore.put(loc));
    }

    tx.oncomplete = () => {
      resolve({
        itemsCount: data.items.length,
        categoriesCount: data.categories?.length || 0,
      });
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetToSampleData(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['items', 'categories', 'locations'], 'readwrite');
    tx.objectStore('items').clear();
    tx.objectStore('categories').clear();
    tx.objectStore('locations').clear();

    tx.oncomplete = async () => {
      await seedDatabase(db);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['items', 'categories', 'locations'], 'readwrite');
    tx.objectStore('items').clear();
    tx.objectStore('locations').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
