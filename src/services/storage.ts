import { VaultItem, Category, StorageLocation, VaultBackup } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_LOCATIONS, INITIAL_SAMPLE_ITEMS } from '../data/sampleData';
import JSZip from 'jszip';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
    req.onsuccess = () => {
      const cats = req.result || [];
      const mapped = cats.map((c: Category, index: number) => {
        if (c.color && c.color.startsWith('#')) {
          const patterns = ['pattern-solid-black', 'pattern-stripes', 'pattern-dots', 'pattern-checks', 'pattern-crosshatch', 'pattern-stripes-light', 'pattern-dots-dark'];
          c.color = patterns[index % patterns.length];
        }
        return c;
      });
      resolve(mapped);
    };
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
export async function exportVaultData(): Promise<{ blob: Blob; base64: string }> {
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

  const zip = new JSZip();
  zip.file('backup.json', JSON.stringify(backup, null, 2));

  // Bundle local filesystem photos into the ZIP
  for (const item of items) {
    for (const imageUri of item.images) {
      if (imageUri.includes('/photos/')) {
        const filename = imageUri.split('/').pop();
        if (filename) {
          try {
            const fileData = await Filesystem.readFile({
              path: `photos/${filename}`,
              directory: Directory.Data,
            });
            zip.file(`photos/${filename}`, fileData.data, { base64: true });
          } catch (err) {
            console.error(`Failed to read file ${imageUri} for export:`, err);
          }
        }
      }
    }
  }

  // Generate the ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const base64 = await zip.generateAsync({ type: 'base64' });
  return { blob, base64 };
}

export async function importVaultData(file: File): Promise<{ itemsCount: number; categoriesCount: number }> {
  // Load ZIP file
  const zip = await JSZip.loadAsync(file);
  const backupStr = await zip.file('backup.json')?.async('string');
  
  if (!backupStr) {
    throw new Error('Invalid backup file. Could not find backup.json in the zip archive.');
  }

  const data: VaultBackup = JSON.parse(backupStr);
  if (!data || !Array.isArray(data.items)) {
    throw new Error('Invalid backup file format. Expected a valid MyVault export.');
  }

  // Extract photos and write them to the local device filesystem
  for (const item of data.items) {
    const updatedImages = [];
    for (const imageUri of item.images) {
      if (imageUri.includes('/photos/')) {
        const filename = imageUri.split('/').pop();
        if (filename && zip.file(`photos/${filename}`)) {
          try {
            const base64Data = await zip.file(`photos/${filename}`)!.async('base64');
            const savedFile = await Filesystem.writeFile({
              path: `photos/${filename}`,
              data: base64Data,
              directory: Directory.Data,
              recursive: true,
            });
            updatedImages.push(savedFile.uri);
          } catch (err) {
            console.error(`Failed to restore photo ${filename}`, err);
            updatedImages.push(imageUri); // Fallback to old URI if write fails
          }
        } else {
          updatedImages.push(imageUri); // Keep original if not in zip
        }
      } else {
        updatedImages.push(imageUri); // Keep default / remote images
      }
    }
    item.images = updatedImages;
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
