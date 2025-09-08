import model from "../connector/connectModel";
import connectQdrant from "../connector/connectQdrant"

async function readQdrant(prompt : string) {
    const qdrantClient = await connectQdrant();
    const result = await model.embedContent(prompt);
    const vector = result.embedding.values

    const matching_results = await qdrantClient.search("MeowDass", {
        vector : vector , 
        limit : 2
    })
    matching_results.forEach(res => {
        console.log(res.payload?.text)
    })
}

async function main() {
    await readQdrant("Typescript is peak")
}

main()
export default readQdrant