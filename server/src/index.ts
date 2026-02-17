import express from "express";

const app = express();

app.get("/api/v1/home",(req,res)=>{
    return res.send("<h1>hello world from server</h1>")
})

app.listen(3000,():void=>{
    console.log("app listening to port 3000");  
})