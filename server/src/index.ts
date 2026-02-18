import express, { Express , Request ,Response} from "express";
import { config } from "dotenv"
import cors from "cors";
import { connectDb } from "./db/db.js";
import authRouter from "./routes/user.js";
import cookieparser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";

config();
type portNumber= number|string;
const Port : portNumber  = process.env.PORT||8080;

const app : Express = express();
connectDb();

app.use(cors(
    { 
        origin : process.env.HOST_URL||"*",
    }
))
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieparser());

app.use("/api/v1/auth",authRouter);


app.use(errorMiddleware);
app.listen(Port,():void=>{
    console.log(`server running on port ${Port}`);  
})