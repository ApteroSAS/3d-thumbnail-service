import * as Path from "path";
import * as Fs from "fs";
import Axios from "axios";
const {exec} = require("child_process");

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    let bitmap = Fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

export default class PreviewEngine {

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
        const folderIn = Path.resolve(folder, 'in');
        if (!Fs.existsSync(folderIn)) {
            Fs.mkdirSync(folderIn);
        }
        const folderOut = Path.resolve(folder, 'out');
        if (!Fs.existsSync(folderOut)) {
            Fs.mkdirSync(folderOut);
        }
        const filepath = Path.resolve(folderIn, "3dfile.glb");
        const filepathOut = Path.resolve(folderOut, "thumbnail.png");
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
            filepathOut:filepathOut,
            filepath:filepath,
        }
    }

    async generateThumbnail(url: string): Promise<{ filepathOut:string,folder:string }> {
        //1) download url
        //2) generate thumbnail image
        //3) compute base64

        const {folder,filepathOut,filepath} = await this.downloadFile(url);

        console.log("generating thumbnail");

        //execCommand
        //registry.aptero.co/docker-blender:latest
        //docker run --rm -v C:\Workspace\ApteroVR\tmp\blend\media:/media/ docker-blender
        await new Promise((resolve, reject) => {
            //useage a 3d glb file must be present in the media folder "3dfile.glb"
            let cmd = "docker run --rm -v " + folder + "/in/:/media/in/ -v " + folder + "/out/:/media/out/ registry.aptero.co/docker-blender:latest";
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

        console.log("uploading file : "+filepathOut);
        /*
        TODO file cleanup
        Fs.rmdir(folder, { recursive: true },()=>{
            console.log("removed temp folder at: " + folder);
        });
         */
        return {
            folder,
            filepathOut:filepathOut
        };
    }

}