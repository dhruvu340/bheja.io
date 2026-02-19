import express from "express";
import { Logout, Signin, Signup } from "../controllers/user.js";

const authRouter=express.Router();

authRouter.post("/signup",Signup);
authRouter.post("/signin",Signin);
authRouter.post("/logout",Logout);



export default authRouter;