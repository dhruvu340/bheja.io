import express from "express";
import { Signin, Signup } from "../controllers/user.js";

const authRouter=express.Router();

authRouter.post("/signup",Signup);
authRouter.post("/signin",Signin);


export default authRouter;