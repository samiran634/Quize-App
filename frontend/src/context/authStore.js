/**
 * authStore.js
 * A plain module-level store for the current userId.
 * Since React Router loaders are plain async functions (not components),
 * they cannot use React Context directly. This module acts as a bridge:
 * - Loaders READ from here to guard protected routes (no API call needed)
 * - AuthContext WRITES to here on login/logout so loaders stay in sync
 */
let _userId = null;
let listeners = [];

export const authStore = {
    get userId() { return _userId; },
    setUser(id) { 
        _userId = id; 
        listeners.forEach(l => l(id));
    },
    clear() { 
        _userId = null; 
        listeners.forEach(l => l(null));
    },
    subscribe(listener) {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }
};
