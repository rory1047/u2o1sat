// db.js
const DB_NAME = 'ModelUploaderDB';
const STORE_NAME = 'models';

export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'name' });
            }
        };
    });
}

export async function saveModel(name, file) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ name, file });
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
            db.close();
            resolve();
        };
        tx.onerror = () => {
            reject(tx.error);
        };
        tx.onabort = () => {
            reject(tx.error);
        };
    });
}

export async function getAllModels() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const allRequest = store.getAll();
    return new Promise((resolve, reject) => {
        allRequest.onsuccess = () => {
            db.close();
            resolve(allRequest.result);
        };
        allRequest.onerror = () => {
            reject(allRequest.error);
        };
    });
}

export async function deleteModel(name) {
    if (!name) throw new Error('No key provided to deleteModel');
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const deleteRequest = store.delete(name);
    return new Promise((resolve, reject) => {
        deleteRequest.onsuccess = () => {
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
        };
        deleteRequest.onerror = () => {
            reject(deleteRequest.error);
        };
    });
}
