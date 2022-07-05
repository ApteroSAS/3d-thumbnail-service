import PreviewEngine from "@root/service/preview/PreviewEngine";
import BlenderEngine from "@root/service/preview/BlenderEngine";
import Fs from "fs";
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

        this.expressApp.use('/', router);
    }

    start(expressApp: any): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}