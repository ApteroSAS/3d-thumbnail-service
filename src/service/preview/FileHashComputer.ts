const  sha256File = require('sha256-file');
export class FileHashComputer {

    constructor() {
    }

    fromFilePath(filepathOut:string): Promise<string>{
        return new Promise((resolve, reject) => {
            resolve(sha256File(filepathOut));
        });
    }

}

