/**
 * Recently open file item
 * @typedef {Object} RecentItem
 * @property {string} label - label/name of the file.
 * @property {string} fullPath - full absolute path to file
 * @property {number} ttl - time when this recent expires
 */

const Store = require('electron-store');


class PersistentStore{
    constructor(){
        // 7 days
        this.expiryMs = 1000*60*60*24*7
        this.store = new Store();
    }

    static getInstance(){
        const store = new PersistentStore();
        if(!store.store.get("recents"))
            store._setupRecents();
        store._expiry();
        return store;
    }

    /**
     * 
     * @param {RecentItem} recent 
     */
    addRecent(recent){
        
        recent.ttl = Date.now()+this.expiryMs;
        const recents = this.store.get("recents")
        const newRecents = recents.filter((item)=>item.fullPath!=recent.fullPath);
        newRecents.unshift(recent);
        this.store.set("recents",newRecents);
        this._expiry();        
    }

    /**
     * 
     * @returns {RecentItem[]}
     */
    recents(){
        return this.store.get("recents");
    }

    purge(){
        this._setupRecents();
    }
    _expiry(){
        const oldRecents = this.store.get("recents");
        const newRecents = oldRecents.filter((item)=>{
            console.log("Item", item, Date.now());
            return item.ttl>=Date.now()
        });
        this.store.set("recents", newRecents);
    }

    _setupRecents(){
        this.store.set("recents",[]);
    }
}

module.exports = PersistentStore.getInstance();