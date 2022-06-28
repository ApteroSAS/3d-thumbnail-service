import * as Path from "path";
import * as Fs from "fs";
import Axios from "axios";
const {exec} = require("child_process");

export default class BlenderEngine {

    constructor(private folder:string = ""){
    }

    async downloadFile(url: string){
        let folder=this.folder;
        if(folder===""){
            folder =  Path.resolve(__dirname, 'media/');
            if (!Fs.existsSync(folder)) {
                Fs.mkdirSync(folder);
            }
        }
        folder =  Path.resolve(folder,"tmp_"+Math.random()+"/");

        console.log("downloading 3d file : "+url);
        //url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true';
        //https://hub.aptero.co/data/data/Pot_blanc_smooth.glb
        if (!Fs.existsSync(folder)) {
            Fs.mkdirSync(folder);
            console.log("created temp folder at: " + folder);
        }
        const filepath = Path.resolve(folder, "scene.zip");
        await Fs.closeSync(Fs.openSync(filepath, 'w'));
        const writer = Fs.createWriteStream(filepath);

        const response = await Axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        return {
            folder:folder,
            filepath:filepath,
        }
    }

    async execBlender(urlZipFolder: string,params:{width:number,height:number}): Promise<{ filepath:string }> {
        //1) download urlZip eg https://files.aptero.co/api/public/dl/CJTvv0V7?inline=true
        //2) unzip file 7z x scene1.zip
        //2) exec docker
        //3) provide the zipFile

        console.log("start downloading :"+urlZipFolder);
        const {folder,filepath} = await this.downloadFile(urlZipFolder);

        console.log("start unzip :"+urlZipFolder);
        await new Promise((resolve, reject) => {
            //useage a 3d glb file must be present in the media folder "3dfile.glb"
            let cmd = "7z x "+filepath+" -o"+folder;
            console.log(cmd);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    console.log(`stdout: ${stdout}`);
                    //HACK the container fails but the image is generated
                    //reject(stderr);
                    //return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    reject(stderr);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                resolve(stdout);
            });
        });

        console.log("Start blender execution");

        //execCommand
        //registry.aptero.co/docker-blender:latest
        //docker run --rm -v C:\Workspace\ApteroVR\tmp\blend\media:/media/ docker-blender
        await new Promise((resolve, reject) => {
            //useage a 3d glb file must be present in the media folder "3dfile.glb"
            let cmd = "docker run --rm -e DISPLAY_WIDTH="+params.width || 1080+" -e DISPLAY_HEIGHT="+params.height || 768+" -v " + folder + "/:/media/ registry.aptero.co/docker-blender:latest";
            console.log(cmd);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    console.log(`stdout: ${stdout}`);
                    //HACK the container fails but the image is generated
                    //reject(stderr);
                    //return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    reject(stderr);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                resolve(stdout);
            });
        });

        return {
            filepath:filepath
        };
    }

}