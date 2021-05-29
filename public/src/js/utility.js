const dbPromise = idb.open("posts-store", 1, function (db) {
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
    }
})

function writeData(storeName, data) {
    return dbPromise
        .then((db) => {
            let tx = db.transaction(storeName, 'readwrite');
            let store = tx.objectStore(storeName);
            store.put(data);
            return tx.complete;
        });
}

function readAllData(storeName) {
    return dbPromise
        .then((db) => {
            let tx = db.transaction(storeName, 'readonly');
            let store = tx.objectStore(storeName);
            return store.getAll();
        });
}

function clearAllData(storeName) {
    return dbPromise
        .then((db) => {
            let tx = db.transaction(storeName, 'readwrite');
            let store = tx.objectStore(storeName);
            store.clear();
            return tx.complete;
        });
}

function deleteItemFromStore(storeName, id) {
    return dbPromise
        .then((db) => {
            let tx = db.transaction(storeName, 'readwrite');
            let store = tx.objectStore(storeName);
            store.delete(id);
            return tx.complete;
        })
        .then(() => console.log('Item deleted'));
}