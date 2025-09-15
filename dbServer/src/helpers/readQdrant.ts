import model from "../connector/connectModel";
import connectQdrant from "../connector/connectQdrant"


interface top_matching_prompts {
    id : string;
    version : number;
    score : number;
    payload : {
        prompt : string , 
        workflow_id : number
    }
}

interface returnType {
    status : "error" | "success";
    data : top_matching_prompts[];
}

async function readQdrant(prompt : string) : Promise<returnType> {
    try{
        const qdrantClient = await connectQdrant();
        const result = await model.embedContent(prompt);
        const vector = result.embedding.values

        const [matching_results] = await qdrantClient.search("MeowDass", {
            vector : vector , 
            limit : 2
        })

        const match : top_matching_prompts[]  = matching_results as unknown as top_matching_prompts[]
        
        return {
            status : "success",
            data : match
        }
    }

    catch(error : unknown){
        console.log(error);
        return {
            status : "error" ,
            data : []
        }
    }
}


export default readQdrant