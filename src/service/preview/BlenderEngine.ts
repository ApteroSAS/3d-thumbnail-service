import * as Path from "path";
import * as Fs from "fs";
import Axios from "axios";
const {exec} = require("child_process");

export default class BlenderEngine {

    constructor(private folder:string = ""){
    }
    //async execScriptToImage

    /*async execSimpleThumbnail(urlOfGlb: string,output:"zip"|"img", config:({ "DISPLAY_HEIGHT": number, "DISPLAY_WIDTH": number, TAG: string } | any) = {}): Promise<{ filepath:string,folder:string }> {
        const folder = await this.createTmpFolder();

        // File destination.txt will be created or overwritten by default.
        Fs.copyFileSync('./blender_scene/thumbnail', folder);

        console.log("start downloading scene :"+urlOfGlb);
        await this.downloadFile(urlOfGlb,folder+"/in/","3dfile.glb");


        console.log("start writing config");
        Fs.writeFileSync(folder+'config.json', config);

        await this.execBlenderDocker(folder);

        let resultFile;
        if(output==="img"){
            resultFile = folder+"/out/thumbnail.png";
        }else {
            resultFile = await this.zipFolder(folder);
        }

        return {
            folder:folder,
            filepath:resultFile
        };
    }*/


    async execScript(script:string, urlOfScene: string,output:"zip"|"img", config:({ "DISPLAY_HEIGHT": number, "DISPLAY_WIDTH": number, TAG: string } | any) = {}): Promise<{ filepath:string,folder:string }> {
        //1) download urlZip eg https://files.aptero.co/api/public/dl/CJTvv0V7?inline=true
        //2) unzip file 7z x scene1.zip
        //2) exec docker
        //3) provide the zipFile

        const folder = await this.createTmpFolder();

        console.log("start downloading scene :"+urlOfScene);
        await this.downloadFile(urlOfScene,folder,"main.blend");

        if(script.startsWith("http")) {
            console.log("start downloading script :"+script);
            await this.downloadFile(script,folder,"script.py");
        }else{
            console.log("start writing script");
            Fs.writeFileSync(folder+'/script.py', script);
        }

        console.log("start writing config");
        Fs.writeFileSync(folder+'/config.json', JSON.stringify(config));

        await this.execBlenderDocker(folder);

        let resultFile;
        if(output==="img"){
            resultFile = folder+"/out/thumbnail.png";
        }else {
            resultFile = await this.zipFolder(folder);
        }

        return {
            folder:folder,
            filepath:resultFile
        };
    }

    async execZipProject(urlZipFolder: string,output:"zip"|"img"): Promise<{ filepath:string,folder:string }> {
        //1) download urlZip eg https://files.aptero.co/api/public/dl/CJTvv0V7?inline=true
        //2) unzip file 7z x scene1.zip
        //2) exec docker
        //3) provide the zipFile

        const folder = await this.createTmpFolder();
        console.log("start downloading :"+urlZipFolder);
        const filepath = await this.downloadFile(urlZipFolder,folder,"scene.zip");

        console.log("start unzip :"+filepath);
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

        console.log("remove :"+filepath);
        try {
            Fs.unlinkSync(filepath)
            //file removed
        } catch(err) {
            console.error(err)
        }

        await this.execBlenderDocker(folder);

        let resultFile;
        if(output==="img"){
            resultFile = folder+"/out/thumbnail.png";
        }else {
            resultFile = await this.zipFolder(folder);
        }

        return {
            folder:folder,
            filepath:resultFile
        };
    }

    private async createTmpFolder():Promise<string>{
        let folder=this.folder;
        if(folder===""){
            folder =  Path.resolve(__dirname, 'media/');
            if (!Fs.existsSync(folder)) {
                Fs.mkdirSync(folder);
            }
        }
        folder =  Path.resolve(folder,"tmp_"+Math.random()+"/");
        //url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true';
        //https://hub.aptero.co/data/data/Pot_blanc_smooth.glb
        if (!Fs.existsSync(folder)) {
            Fs.mkdirSync(folder);
            console.log("created temp folder at: " + folder);
        }
        return folder;
    }

    private async downloadFile(url: string,folder:string,filename:string):Promise<string>{
        console.log("downloading file : "+url+ " "+filename);
        const filepath = Path.resolve(folder, filename);
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

        return filepath;
    }

    private async execBlenderDocker(folder){
        let config:({ "DISPLAY_HEIGHT": number, "DISPLAY_WIDTH": number, TAG: string } | any) = {}
        try {
            let rawdata = Fs.readFileSync('config.json', 'utf-8');
            config = JSON.parse(rawdata);
        }catch (e) {
            /* ignore since config is optional */
        }
        console.log("Start blender execution ",config);
        //execCommand
        //registry.aptero.co/docker-blender:latest
        //docker run --rm -v C:\Workspace\ApteroVR\tmp\blend\media:/media/ docker-blender
        await new Promise((resolve, reject) => {
            //useage a 3d glb file must be present in the media folder "3dfile.glb"
            const image = "registry.aptero.co/docker-blender:"+(config.TAG || "latest")
            let cmd = "docker run --rm -e DISPLAY_WIDTH="+(config["DISPLAY_WIDTH"] || 1024)+" -e DISPLAY_HEIGHT="+(config["DISPLAY_HEIGHT"] || 768)+" -v " + folder + "/:/media/ "+image;
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
                if(stdout.includes("Aborted") ||
                  stdout.includes("Error")
                ){
                    reject(stdout)
                }else {
                    resolve(stdout);
                }
            });
        });
    }

    private async zipFolder(folder):Promise<string>{
        console.log("start zip :"+folder);
        await new Promise((resolve, reject) => {
            //useage a 3d glb file must be present in the media folder "3dfile.glb"
            let cmd = "7z a "+folder+"/result.zip "+folder+"/*";
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
        return folder+"/result.zip";
    }


}