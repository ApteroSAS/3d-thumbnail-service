import axios from "axios";

const PY_START = "```python";
const CODE_START = "```";
const CODE_END = "```";

export class ChatGPTService {

    API_KEY = "XXX";

    async execGptQuery2(prompt) {
        //https://platform.openai.com/docs/api-reference/chat/create
        const MODEL_ID = 'gpt-3.5-turbo';
        const API_KEY = this.API_KEY;
        const response = await axios.post(
            `https://api.openai.com/v1/chat/completions`,
            {
                model:MODEL_ID,
                temperature:0,
                "messages": [{"role": "user", "content": prompt}]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );
        const choice= response.data?.choices?.[0] || {};
        return choice?.message?.content;
    }

    async execGptQuery(prompt) {
        const MODEL_ID = 'text-davinci-003'; // gpt-3.5-turbo
        const API_KEY = this.API_KEY;
        //https://platform.openai.com/docs/api-reference/completions/create
        const response = await axios.post(
            `https://api.openai.com/v1/completions`,
            {
                prompt,
                model:MODEL_ID
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );
        const {choices} = response.data?.choices?.[0] || {};
        return choices?.[0]?.text;
    }

    async textToPythonBlenderScript(description): Promise<string> {
        const res = await this.execGptQuery2("Write a Blender Python code to create a procedural model corresponding to this description " +
            "as a Blender expert would write it (Only the code in the response): \""+description+"\".")
            //+ "diffuse_color should be on 4 component");
        console.log("GPT Result");
        console.log(res);
        if(res.indexOf("import bpy") <0){
            throw new Error(res);
        }

        let result = "";
        if(res.indexOf(PY_START)>=0) {
            const regex = new RegExp(`${PY_START}([\\s\\S]*?)${CODE_END}`, 'g');
            let extractedString = '';

            let match;
            while ((match = regex.exec(res)) !== null) {
                extractedString += match[1].trim() + '\n';
            }

            result = extractedString.trim();
        }else if(res.indexOf(CODE_START)>=0) {
            const regex = new RegExp(`${PY_START}([\\s\\S]*?)${CODE_END}`, 'g');
            let extractedString = '';

            let match;
            while ((match = regex.exec(res)) !== null) {
                extractedString += match[1].trim() + '\n';
            }

            result = extractedString.trim();
        }{
            result = res;
        }

        console.log("Cleaned Result");
        console.log(result);
        return result;
    }
}