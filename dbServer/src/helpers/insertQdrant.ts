import { text } from "stream/consumers";
import model from "../connector/connectModel";
import {v4} from "uuid";
import connectQdrant from "../connector/connectQdrant";


async function insertQdrant(prompt : string) {

    try{
        const result = await model.embedContent(prompt);
        const vector = result.embedding.values

        const qdrantClient = await connectQdrant();

        await qdrantClient.upsert("texts",{
            points: [
                {
                   id : v4(),
                   vector,
                   payload : {prompt}
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

async function main() {
    await insertQdrant("I like cats")
    await insertQdrant("Java is difficult")
    await insertQdrant("I hate AI development")
    await insertQdrant("I am meow")
    await insertQdrant("Parotta is my favourite food")
    await insertQdrant("I also like poori")
}

main()