export let properties = {
    FILE_3D_TMP_STORAGE: process.env.FILE_3D_TMP_STORAGE ? process.env.FILE_3D_TMP_STORAGE : "",
    VERSION: "2.0.0"
};

export function checkRequiredProperties(){
    if(process.env.PROD) {
        Object.keys(properties).forEach(value => {
            if (!process.env[value] && value!=="VERSION") {
                throw new Error("process.env."+value);
            }
        });
    }
}

checkRequiredProperties();