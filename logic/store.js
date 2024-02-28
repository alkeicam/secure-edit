/**
 * Recently open file item
 * @typedef {Object} RecentItem
 * @property {string} label - label/name of the file.
 * @property {string} fullPath - full absolute path to file
 * @property {"remote"|"local"} destination - file destination
 * @property {number} ttl - time when this recent expires
 */

/**
 * Recently open file item
 * @typedef {Object} RemoteItem
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
        if(!store.store.get("remotes"))
            store._setupRemotes();
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
     * @param {RecentItem} remoteItem 
     */
    addRemote(remoteItem){
        const remotes = this.store.get("remotes");
        // we eventually going to replace record so remove if old exists
        const newRemotes = remotes.filter((item)=>item.fullPath!=remoteItem.fullPath);
        remotes.push(remoteItem);
        this.store.set("remotes",remotes);
    }

    /**
     * 
     * @returns {RecentItem[]}
     */
    recents(){
        return this.store.get("recents");
    }

    /**
     * 
     * @returns {RecentItem[]}
     */
    remotes(){
        return this.store.get("remotes");
    }

    mergeObjects(target, source) {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
                mergeObjects(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        // Include properties from source that are not present in target
        for (const key of Object.keys(target)) {
            if (!(key in source)) {
                source[key] = target[key];
            }
        }
        return source;
    }

    /**
     * Saves/updates preferences object
     * @param {*} preferences 
     */
    savePreferences(preferences){
        let savedPreferences = this.preferences()||{};
        if(typeof savedPreferences !== 'object')
            preferences = {}


        const mergedObj = this.mergeObjects(preferences, savedPreferences);        
        this.store.set("preferences", mergedObj);
    }

    preferences(){
        return this.store.get("preferences")||{};
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
    _setupRemotes(){
        this.store.set("remotes",[]);
    }
}

module.exports = PersistentStore.getInstance();