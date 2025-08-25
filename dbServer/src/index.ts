import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import router from "./router/router.js";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: [
            "http://localhost:4005", // langgraphh server
            "http://localhost:4006", // python crew - ai server
            "http://localhost:4007", // mcp server 1 - placement
            "http://localhost:4008", // mcp server 2 - exam cell
            "http://localhost:4009"  // mcp server 3 - transport
        ]
    }
));
app.use(router)

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the DB Server");
});

app.listen(4004, () => {
  console.log("DB Server is running on http://localhost:4004");
});