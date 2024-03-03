class Controller {
    
    constructor(emitter) {
        this.CONST = {
        }
        this.emitter = emitter
    }

    static async getInstance(emitter){
        const a = new Controller(emitter)
        return a;
    }

    handleClose(e, that){
        electronAPI.seAPI.closeRemotesWindow();
    }
}