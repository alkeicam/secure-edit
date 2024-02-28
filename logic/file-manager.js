const {dialog} = require('electron')
const fs = require('fs');
var path = require('path');
const prompt = require('electron-prompt');
var CryptoJS = require("crypto-js");
const fetch = require("node-fetch");
const persistentStore = require("./store")

/**
 * Information about file
 * @typedef {Object} FileMetadata
 * @property {string} id - unique if of the file, created when file is saved
 * @property {string} fileName - name of the file
 * @property {string} path - path to file, starts with "remote://" for remote one
 * @property {string} fullPath - full path to file
 * @property {string} password - currently used password, stored in memory
 * @property {string} contents - contents of the file?
 * @property {"local"|"remote"} destination - "local" or "remote"
 * @property {Object} error - when not empty then there was an error during item operation
 */


function FileOperationError(message, notify) {
    this.message = message;
    this.notify = notify
  }

class FileManager {
    constructor(){
        this.CONST = {
            REMOTE_PREFIX: "remote://"
        }
    }
    static getInstance(){
        const fm = new FileManager();
        return fm;
    }

    openSSLAESDecrypt(data, password){
        var salt          = data.toString("hex", 8, 16),
        enc           = data.toString("hex", 16, data.length),
        derivedParams = CryptoJS.kdf.OpenSSL.execute(
                        password,
                        256/32,
                        128/32,
                        CryptoJS.enc.Hex.parse(salt)
                        ),
        cipherParams  = CryptoJS.lib.CipherParams.create({
                        ciphertext : CryptoJS.enc.Hex.parse(enc)
                        }),
        decrypted     = CryptoJS.AES.decrypt(
                        cipherParams,
                        derivedParams.key,
                        { iv : derivedParams.iv }
                        );
    
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    openSSLAESEncrypt(data, password){
        const encrypted = CryptoJS.AES.encrypt(data.toString(), password);
        const buff = Buffer.from(encrypted.toString(), "base64");
        return buff;
        
    }

    openSSLAESEncryptBase64(data, password){
        const encrypted = CryptoJS.AES.encrypt(data.toString(), password);
        return encrypted.toString();                
    }

    /**
     * 
     * @param {*} fileFullPath 
     * @returns {Promise<FileMetadata>} returns file metadata
     */
    async loadFile(fileFullPath){
        // console.log("Internal load file")
    
        let contents = ``;
        let contentsPath = fileFullPath;
        try{
            if(!contentsPath){
                // no file location provided so open dialog
                const fileOpenDialogResult = await dialog.showOpenDialog({
                    properties: ['openFile', 'openDirectory']
                });
        
                if(fileOpenDialogResult.canceled)
                        throw new FileOperationError("Load cancelled", false);
        
                contentsPath = fileOpenDialogResult.filePaths[0];
            }        
    
            // contents = fs.readFileSync(contentsPath, 'utf8');
            // important - encoded file MUST not be read as utf-8
            contents = fs.readFileSync(contentsPath);
            // console.log(`File ${contentsPath} contents`);
            // console.log(contents);
    
            const pass = await prompt({
                title: 'Unlock file',
                label: 'Password:',
                // value: 'http://example.org',
                inputAttrs: {
                    type: 'password'
                },
                type: 'input',            
            })
    
            if(!pass)
                throw new FileOperationError("Password can't be empty", true);
            // if(pass){
            // var decrypted = CryptoJS.AES.decrypt(contents, pass).toString(CryptoJS.enc.Utf8);;
            var decrypted = undefined;
            try{
                decrypted = this.openSSLAESDecrypt(contents, pass);
            }catch(decryptError){
                console.error(decryptError);
            }        
            
            // console.log(`Decrypted ${contentsPath} contents:`)
            // console.log(decrypted);
            
            return {
                fileName: path.parse(contentsPath).base,
                path: path.parse(contentsPath).dir,
                fullPath: contentsPath,
                password: pass,
                contents: decrypted,
                destination: "local",
                // when decrypted is empty then probably there was an invalid password used in decryption
                error:decrypted?undefined:new FileOperationError("Invalid password. Try again.", true)
            }
        }catch(err){
            console.log(err)
            return {
                error: err
            }
        }

        // return dialog.showOpenDialog({
        //     properties: ['openFile', 'openDirectory']
        // }).then(result => {
        //     if(result.canceled)
        //         throw new FileOperationError("Load cancelled", false);
        //     // console.log(result.canceled)
        //     // console.log(result.filePaths)
    
        //     contentsPath = result.filePaths[0];
    
        //     // contents = fs.readFileSync(contentsPath, 'utf8');
        //     // important - encoded file MUST not be read as utf-8
        //     contents = fs.readFileSync(contentsPath);
        //     // console.log(`File ${contentsPath} contents`);
        //     // console.log(contents);
    
        //     return prompt({
        //         title: 'Unlock file',
        //         label: 'Password:',
        //         // value: 'http://example.org',
        //         inputAttrs: {
        //             type: 'password'
        //         },
        //         type: 'input',            
        //     })
    
        // }).then((pass)=>{
        //     if(!pass)
        //         throw new FileOperationError("Password can't be empty", true);
        //     // if(pass){
        //         // var decrypted = CryptoJS.AES.decrypt(contents, pass).toString(CryptoJS.enc.Utf8);;
        //         var decrypted = undefined;
        //         try{
        //             decrypted = this.openSSLAESDecrypt(contents, pass);
        //         }catch(decryptError){
        //             console.error(decryptError);
        //         }
                
                
        //         console.log(`Decrypted ${contentsPath} contents:`)
        //         console.log(decrypted);
                
        //         return {
        //             fileName: path.parse(contentsPath).base,
        //             path: path.parse(contentsPath).dir,
        //             fullPath: contentsPath,
        //             password: pass,
        //             contents: decrypted,
        //             // when decrypted is empty then probably there was an invalid password used in decryption
        //             error:decrypted?undefined:new FileOperationError("Invalid password. Try again.", true)
        //         }
        //     // }
        // }).catch(err => {
        //     console.log(err)
        //     return {
        //         error: err
        //     }
        // })
    }

    _isNewFileMetadata(fileMetadata){
        if(!fileMetadata)
            throw new Error("Invalid file metadata")
        return Object.keys(fileMetadata).length === 0;
    }

    /**
     * Saves file. Handles both new and existing files. Handles both remote and local save.
     * @param {*} contents file contents to be saved
     * @param {FileMetadata} fileMetadata information about the file
     * @returns {Promise<FileMetadata>} information about saved file, updated
     */
    async saveFile(contents, fileMetadata){        
        try{

            if(this._isNewFileMetadata(fileMetadata))
                fileMetadata = await this.prepareFileDestination(fileMetadata);

            // backward compatibility - existing file but saved before destination property was introduced
            if(!fileMetadata.destination){
                // prior only local files were supported
                fileMetadata.destination = "local"
            }

            if(fileMetadata.destination == "local"){
                return this.saveFileLocal(contents, fileMetadata)
            }else{
                return this.saveFileRemote(contents, fileMetadata)
            }            
        }
        catch(error){
            console.log(error);
            return {
                error: error
            }
        }        
    }
    /**
     * Saves file locally. Handles both new and existing files. 
     * @param {*} contents file contents to be saved
     * @param {FileMetadata} fileMetadata information about the file
     * @returns {Promise<FileMetadata>} information about saved file, updated
     */
    async saveFileLocal(contents, fileMetadata){
        // when there is a file metadata then we dont need save dialog as this is an existing file
        if(fileMetadata.fullPath){            
            // version with no password prompt, password is used from opening file or saving file
            return this.saveContentsLocal(contents, fileMetadata);            
        }

        // non existing file (new file) so show file dialog
        fileMetadata = await this.prepareLocationLocal(fileMetadata);
        // and also grab password for this new file
        fileMetadata = await this.preparePassword(fileMetadata);
        return this.saveContentsLocal(contents, fileMetadata);
    }

    /**
     * Saves file remotelly. Handles both new and existing files. 
     * @param {*} contents file contents to be saved
     * @param {FileMetadata} fileMetadata information about the file
     * @returns {Promise<FileMetadata>} information about saved file, updated
     */
    async saveFileRemote(contents, fileMetadata){
        if(!fileMetadata.id){
            // non saved file, new file, generate id
            fileMetadata = await this.prepareFileId(fileMetadata);
            // new file so ask for file name
            fileMetadata = await this.prepareFilename(fileMetadata);
            // new file so ask for password
            fileMetadata = await this.preparePassword(fileMetadata);
        }      
        
        return this.saveContentsRemote(contents, fileMetadata);
    }

    /**
     * Saves file to local storage (disk)
     * @param {*} contents 
     * @param {FileMetadata} fileMetadata 
     * @returns {Promise<FileMetadata>}
     */
    async saveContentsLocal(contents, fileMetadata){
        // version with no password prompt, password is used from opening file or saving file
        const buffer = this.openSSLAESEncrypt(contents, fileMetadata.password);
        const contentsPath = fileMetadata.fullPath;            
        fs.writeFileSync(contentsPath, buffer);
        return {
            fileName: path.parse(contentsPath).base,
            path: path.parse(contentsPath).dir,
            fullPath: contentsPath,
            password: fileMetadata.password,
            contents:contents ,
            error:undefined               
        }
    }

    /**
     * Saves file to remote storage (api cloud)
     * @param {*} contents 
     * @param {FileMetadata} fileMetadata 
     * @returns {Promise<FileMetadata>}
     */
    async saveContentsRemote(contents, fileMetadata){
        // encrypt file contents
        const base64String = this.openSSLAESEncryptBase64(contents, fileMetadata.password);

        let remoteURL = persistentStore.preferences().remoteBaseURL || "https://httpbin.org/post";
        let remotePath = `/${fileMetadata.id}`;
        remoteURL += remotePath;
        
        const response = await fetch(remoteURL, {method: 'POST', body: base64String});
        this.checkValidFetchResponse(response);
        const responseData = await response.json();

        fileMetadata.path = remotePath;
        fileMetadata.fullPath = remoteURL;
        fileMetadata.error = undefined;
        fileMetadata.contents = contents;

        return fileMetadata;
    }

    /**
     * Prompts user for file location and updates metadata accordingly
     * @param {FileMetadata} fileMetadata target file
     * @returns {Promise<FileMetadata>} file metadata with updated fullPath pointing to selected file location
     */
    async prepareLocationLocal(fileMetadata){
        const result = await dialog.showSaveDialog({
            'title':"Save file",
            'showsTagField': false
        })                
        if(result.canceled){
            console.log("cancelled save" );
            throw new FileOperationError("Save cancelled", false);
        }else{
            fileMetadata.fullPath = result.filePath
        }
        return fileMetadata;
    }

    /**
     * 
     * @param {FileMetadata} fileMetadata 
     * @returns 
     */
    async prepareFileDestination(fileMetadata){
        const destination = await prompt({
            title: 'Where to save?',   
            label: "Choose file destination",         
            type: 'select',         
            selectOptions: {
                "local": "Locally (disk)",
                "remote": "Remote (cloud)"
            }   
        })

        if(!destination)
            throw new FileOperationError("Save cancelled", true);

        fileMetadata.destination = destination;

        return fileMetadata;
    }

    /**
     * Updates/sets password
     * @param {FileMetadata} fileMetadata 
     * @return {Promise<FileMetadata>} file metadata with updated password
     */
    async preparePassword(fileMetadata){

        const password = await prompt({
            title: 'Lock file',
            label: 'Password:',            
            inputAttrs: {
                type: 'password'
            },
            type: 'input',            
        })

        if(!password)
            throw new FileOperationError("Password can't be empty", true);

        fileMetadata.password = password;

        return fileMetadata;
    }  
    
    /**
     * Updates/sets file name
     * @param {FileMetadata} fileMetadata 
     * @return {Promise<FileMetadata>} file metadata with updated fileName
     */
    async prepareFilename(fileMetadata){

        const filename = await prompt({
            title: 'Remote file name',
            label: 'Filename:',            
            inputAttrs: {
                type: 'text',
                required: true
            },
            type: 'input',            
        })

        if(!filename)
            throw new FileOperationError("Remote file name can't be empty", true);

        fileMetadata.fileName = filename;

        return fileMetadata;
    }  

    /**
     * 
     * @param {FileMetadata}} fileMetadata with updated id
     */
    async prepareFileId(fileMetadata){
        // generate a unique if to read the file in the future
        const fileId = `fid_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
        fileMetadata.id = fileId;

        return fileMetadata;
    }

    async checkValidFetchResponse(response){
        if (!response.ok) 
            throw new Error(`Communication error ${response.status} ${response.statusText}`)
    }



    // async saveNewFileRemote(){

    //     const filename = await prompt({
    //         title: 'Remote file name',
    //         label: 'Filename:',
    //         // value: 'http://example.org',
    //         inputAttrs: {
    //             type: 'text',
    //             required: true
    //         },
    //         type: 'input',            
    //     })

    //     if(!filename)
    //         throw new FileOperationError("Remote file name can't be empty", true);

    //     const pass = await prompt({
    //         title: 'Lock file',
    //         label: 'Password:',
    //         // value: 'http://example.org',
    //         inputAttrs: {
    //             type: 'password'
    //         },
    //         type: 'input',            
    //     })

    //     if(!pass)
    //         throw new FileOperationError("Password can't be empty", true);

    //     // encrypt file contents
    //     const base64String = this.openSSLAESEncryptBase64(contents, pass);

    //     // generate a unique if to read the file in the future
    //     const fileId = `fid_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;


    //     try{
    //         const response = await fetch('https://httpbin.org/post', {method: 'POST', body: base64String});
    //         this.checkValidFetchResponse(response);
    //         const responseData = await response.json();

    //         return {
    //             fileName: filename,
    //             path: `remote://${fileId}`,
    //             fullPath: path,
    //             password: password,
    //             contents:"",
    //             error: undefined                
    //         }

    //     }catch(error){
    //         console.log(err);
    //         return {
    //             error: err
    //         }
    //     }
        
        

    // }

    // async saveNewFileLocal(contents){
    //     // no existing file so show file dialog
    //     return dialog.showSaveDialog({
    //         'title':"Save file",
    //         'showsTagField': false
    //     }).then((result)=>{
    //         // console.log("Save is a ....")
    //         // console.log(result);
    
    //         if(result.canceled){
    //             console.log("cancelled save" );
    //             throw new FileOperationError("Save cancelled", false);
    //         }else{
    //             contentsPath = result.filePath;
    //             return prompt({
    //                 title: 'Lock file',
    //                 label: 'Password:',
    //                 // value: 'http://example.org',
    //                 inputAttrs: {
    //                     type: 'password'
    //                 },
    //                 type: 'input',            
    //             })
    //         }        
            
            
    //     }).then((pass)=>{
    //         if(!pass)
    //             throw new FileOperationError("Password can't be empty", true);
    //         password = pass;
    //         const buffer = this.openSSLAESEncrypt(contents, pass);
    //         fs.writeFileSync(contentsPath, buffer);
    //     }).then(()=>{
    //         return {
    //             fileName: path.parse(contentsPath).base,
    //             path: path.parse(contentsPath).dir,
    //             fullPath: contentsPath,
    //             password: password,
    //             contents:"",
    //             error: undefined                
    //         }
    //     }).catch(err=>{
    //         console.log(err);
    //         return {
    //             error: err
    //         }
    //     })
    // }
    
}

module.exports = FileManager