import express from "express";
import { Logout, Signin, Signup ,genAccessToken } from "../controllers/user.js";

const authRouter=express.Router();

authRouter.post("/signup",Signup);
authRouter.post("/signin",Signin);
authRouter.post("/logout",Logout);
authRouter.post("/genaccess",genAccessToken);



export default authRouter;