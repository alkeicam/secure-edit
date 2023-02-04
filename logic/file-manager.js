const {dialog} = require('electron')
const fs = require('fs');
var path = require('path');
const prompt = require('electron-prompt');
var CryptoJS = require("crypto-js");

function FileOperationError(message, notify) {
    this.message = message;
    this.notify = notify
  }

class FileManager {
    constructor(){}
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

    async saveFile(contents, fileMetadata){
        // console.log("Internal save file")
        // console.log(contents);
        let contentsPath = "";
        let password;
        // when there is a file metadata then we dont need save dialog as this is existing file
        if(fileMetadata.fullPath){
            contentsPath = fileMetadata.fullPath;
            // return prompt({
            //     title: 'Lock file',
            //     label: 'Password:',
            //     // value: 'http://example.org',
            //     inputAttrs: {
            //         type: 'password'
            //     },
            //     type: 'input',            
            // }).then((pass)=>{
            //     const buffer = this.openSSLAESEncrypt(contents, pass);
            //     fs.writeFileSync(contentsPath, buffer);
            // }).then(()=>{
            //     return {
            //         fileName: path.parse(contentsPath).base,
            //         path: path.parse(contentsPath).dir,
            //         fullPath: contentsPath,
            //         contents:""                
            //     }
            // })

            // version with no password prompt, password is used from opening file or saving file
            const buffer = this.openSSLAESEncrypt(contents, fileMetadata.password);
            fs.writeFileSync(contentsPath, buffer);
            return {
                fileName: path.parse(contentsPath).base,
                path: path.parse(contentsPath).dir,
                fullPath: contentsPath,
                password: fileMetadata.password,
                contents:"" ,
                error:undefined               
            }
        }

        // no existing file so show file dialog
        return dialog.showSaveDialog({
            'title':"Save file",
            'showsTagField': false
        }).then((result)=>{
            // console.log("Save is a ....")
            // console.log(result);
    
            if(result.canceled){
                console.log("cancelled save" );
                throw new FileOperationError("Save cancelled", false);
            }else{
                contentsPath = result.filePath;
                return prompt({
                    title: 'Lock file',
                    label: 'Password:',
                    // value: 'http://example.org',
                    inputAttrs: {
                        type: 'password'
                    },
                    type: 'input',            
                })
            }        
            
            
        }).then((pass)=>{
            if(!pass)
                throw new FileOperationError("Password can't be empty", true);
            password = pass;
            const buffer = this.openSSLAESEncrypt(contents, pass);
            fs.writeFileSync(contentsPath, buffer);
        }).then(()=>{
            return {
                fileName: path.parse(contentsPath).base,
                path: path.parse(contentsPath).dir,
                fullPath: contentsPath,
                password: password,
                contents:"",
                error: undefined                
            }
        }).catch(err=>{
            console.log(err);
            return {
                error: err
            }
        })
    }
    
}

module.exports = FileManager