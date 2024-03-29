/**
 * Recently open file item
 * @typedef {Object} RecentItem
 * @property {string} label - label/name of the file. 
 * @property {string} fileName - label/name of the file. 
 * @property {string} fullPath - full absolute path to file 
 * @property {"remote"|"local"} destination - file destination
 * @property {number} ttl - time when this recent expires
 */



const Store = require('electron-store');

const {secureDecorator} = require("./decorators")

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

    removeRecent(recent){                
        const recents = this.store.get("recents")
        const newRecents = recents.filter((item)=>item.fullPath!=recent.fullPath);        
        this.store.set("recents",newRecents);
        this._expiry();        
    }

    /**
     * 
     * @param {*} fullPath 
     * @returns {FileMetadataSecure}
     */
    remoteByFullPath(fullPath){
        const remotes = this.store.get("remotes");
        return remotes.find(item=>item.fullPath == fullPath)
    }

    /**
     * 
     * @param {FileMetadataSecure} remoteItem 
     */
    addRemote(remoteItem){
        const remotes = this.store.get("remotes");
        // we eventually going to replace record so remove if old exists
        const newRemotes = remotes.filter((item)=>item.fullPath!=remoteItem.fullPath);
        newRemotes.push(remoteItem);
        this.store.set("remotes",newRemotes);
        // console.log(newRemotes)
    }

    removeRemote(remoteItem){
        const remotes = this.store.get("remotes");
        // remove item
        const newRemotes = remotes.filter((item)=>item.fullPath!=remoteItem.fullPath);        
        this.store.set("remotes",newRemotes);
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
     * @returns {FileMetadataSecure[]}
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

    myUniqueId(){
        const prefs = this.store.get("preferences")||{};
        if(!prefs.myId){
            // first time, generate my unique id
            const id = `i_${Math.random().toString(36).substring(2, 12)}`
            prefs.myId = id;
            this.savePreferences(prefs);        
        }

        return prefs.myId;
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

let storeInstance = PersistentStore.getInstance();
storeInstance.addRemote = secureDecorator(storeInstance.addRemote, "id, fileName, path, fullPath, destination")
module.exports = storeInstance;