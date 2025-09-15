import { text } from "stream/consumers";
import model from "../connector/connectModel";
import {v4} from "uuid";
import connectQdrant from "../connector/connectQdrant";


async function insertQdrant(prompt : string , workflow_id : number) {

    try{
        const result = await model.embedContent(prompt);
        const vector = result.embedding.values

        const qdrantClient = await connectQdrant();

        await qdrantClient.upsert("texts",{
            points: [
                {
                   id : v4(),
                   vector,
                   payload : {"prompt" : prompt , "workflow_id" : workflow_id}
                }
            ],
        })

        return {
            status : "success" , 
            message : "vector embedding creation and updation in db is successful"
        }
    }
    catch(error : unknown){
        console.log(error);
        return {
            status : "error" ,
            message : "etho error panta vro"
        }
    }


}

export default insertQdrant