import model from "../connector/connectModel";



async function insertQdrant(prompt : string) {

    const result = await model.embedContent(prompt);
}

export default insertQdrant