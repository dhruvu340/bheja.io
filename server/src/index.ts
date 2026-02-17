import express, { Express , Request ,Response} from "express";
import { config } from "dotenv"
import cors from "cors";
import { connectDb } from "./db/db.js";
config();
type portNumber= number|string;
const app : Express = express();
connectDb();

app.use(cors(
    { 
        origin : process.env.HOST_URL||"*",
    }
))


app.use(express.urlencoded({extended:true}));
app.use(express.json());

const Port : portNumber  = process.env.PORT||8080;


app.listen(Port,():void=>{
    console.log(`server running on port ${Port}`);  
})