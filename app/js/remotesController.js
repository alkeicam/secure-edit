class Controller {
    
    constructor(emitter) {
        this.CONST = {
        }
        this.emitter = emitter
        this.model = {
            remotes: [],
            handlers: {
                handleRemoveRemote: this.handleRemoveRemote.bind(this)
            }
        }
    }

    static async getInstance(emitter){
        const a = new Controller(emitter)
        a.model.remotes = await electronAPI.seAPI.getRemotes();        
        return a;
    }

    handleClose(e, that){
        electronAPI.seAPI.closeRemotesWindow();
    }

    async handleRemoveRemote(e, that){
        that.model.remotes = await electronAPI.seAPI.removeRemote(that.item);
    }
}