import PreviewEngine from "@root/service/preview/PreviewEngine";
import BlenderEngine from "@root/service/preview/BlenderEngine";
import Fs from "fs";
import path from "path";
import {ChatGPTService} from "@root/service/preview/ChatGPTService";
const express = require('express');

export default class PreviewApiService {
    public expressApp;

    constructor(private previewEngine:PreviewEngine,private blenderEngine: BlenderEngine) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.0.1";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json({version:apiVersion});
        });

        router.get('/thumbnail/', (req, res) => {
            let fileUrl = req.query.url;
            console.log("process /thumbnail",fileUrl);
            if (fileUrl) {
                this.previewEngine.generateThumbnail(fileUrl).then(result => {
                    //res.json(result);
                    res.sendFile(result.filepathOut,(err: Error) => {
                        Fs.rmdir(result.folder, { recursive: true },()=>{
                            console.log("removed temp folder at: " + result.folder);
                        });
                    })
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error());
                res.status(500).json("incorrect json");
            }
        });

        router.post('/blender/script/:mode', (req, res) => {
            let json:{
                script:string,
                scene:string,
                config:string
            } = req.body;
            if (json.script) {
                this.blenderEngine.execScript(json.script,json.scene,req.params.mode,json.config || {}).then(result => {
                    //res.json(result);
                    res.sendFile(result.filepath,(err: Error) => {
                        Fs.rmdir(result.folder, { recursive: true },()=>{
                            console.log("removed temp folder at: " + result.folder);
                        });
                    });
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error());
                res.status(500).json("incorrect json");
            }
        });

        router.get('/blender/project/:mode', (req, res) => {
            let fileUrl = req.query.url;
            console.log("process /blender",fileUrl);
            if (fileUrl) {
                this.blenderEngine.execZipProject(fileUrl,req.params.mode).then(result => {
                    //res.json(result);
                    res.sendFile(result.filepath,(err: Error) => {
                        Fs.rmdir(result.folder, { recursive: true },()=>{
                            console.log("removed temp folder at: " + result.folder);
                        });
                    });
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error());
                res.status(500).json("incorrect json");
            }
        });

        router.post('/script2glb', (req, res) => {
            let script = req.body;
            if (script) {
                this.blenderEngine.script2glb(script).then(result => {
                    console.log("send file start : "+result.filepath)
                    res.download(result.filepath,(err: Error) => {
                        if(err){
                            console.error(err);
                        }else{
                            console.log("send file done")
                        }
                        setTimeout(()=>{
                            Fs.rmdir(result.folder, { recursive: true },()=>{
                            console.log("removed temp folder at: " + result.folder);
                        });},300000);
                    });
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error());
                res.status(500).json("incorrect json");
            }
        });

        /*router.get('/debug', async (req, res) => {
            try {
                const ret = await new ChatGPTService().textToPythonBlenderScript("Sphere");
                res.json(ret);
            }catch (err) {
                console.error(err);
                res.status(500).json(err);
            }
        });*/

        router.post('/description2glb', (req, res) => {
            let json:{
                text:string
            } = req.body;
            if (json.text) {
                this.blenderEngine.description2glbAI(json.text).then(result => {
                    res.sendFile(result.filepath,(err: Error) => {
                        Fs.rmdir(result.folder, { recursive: true },()=>{
                            console.log("removed temp folder at: " + result.folder);
                        });
                    });
                }).catch((err) => {
                    console.error(err);
                    res.status(500).json(err);
                });
            } else {
                console.error(new Error());
                res.status(500).json("incorrect json");
            }
        });

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}