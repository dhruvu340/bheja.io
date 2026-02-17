import express from "express";

const app = express();

app.use("/api/v1",UserRouter);

app.listen(3000,():void=>{
    console.log("app listening to port 3000");  
})