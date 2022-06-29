import 'module-alias/register';
import {properties} from "@root/properties/properties";

let bodyParser = require('body-parser');

let cors = require('cors');
let express = require('express');
import PreviewApiService from "@root/service/preview/PreviewApiService";
import PreviewEngine from "@root/service/preview/PreviewEngine";
import BlenderEngine from "@root/service/preview/BlenderEngine";

console.log(properties.VERSION);


let expressApp = express();
expressApp.use(bodyParser.json());
expressApp.use(cors());
// Parse JSON and form HTTP bodies
expressApp.use(bodyParser.urlencoded({extended: true}));

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    console.error(reason);
});

let port = 8086;
expressApp.listen(port, () => {
    let previewEngine = new PreviewEngine(properties.FILE_3D_TMP_STORAGE);
    let blenderEngine = new BlenderEngine(properties.FILE_3D_TMP_STORAGE);
    let apiService: PreviewApiService = new PreviewApiService(previewEngine,blenderEngine);
    apiService.start(expressApp);
    console.log('Listening on ' + port);
    console.log("Usage example : \n" +
      "http://127.0.0.1:"+port+"/thumbnail/?url="+"https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"+"\n" +
      "http://127.0.0.1:"+port+"/blender/?url="+"https://files.aptero.co/api/public/dl/CJTvv0V7?inline=true"+"\n")
});

