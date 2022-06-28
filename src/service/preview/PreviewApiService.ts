import PreviewEngine from "@root/service/preview/PreviewEngine";
const express = require('express');

export default class PreviewApiService {
    public expressApp;
    public feathersApp: any = null;

    constructor(private previewEngine:PreviewEngine) {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.1.1";//increment this each time you change the api and break the backward compatibility (semver)
        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.post('/thumbnail/generate', (req, res) => {
            let json = req.body;
            let fileUrl = json.url;
            console.log("process /thumbnail/generate",json);
            if (fileUrl) {
                this.previewEngine.generateThumbnail(fileUrl).then(result => {
                    res.json(result);
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

    start(expressApp: any,socketio:any): void {
        this.feathersApp = expressApp;
        this.expressApp = expressApp;
        this.mountAPI();
    }

}