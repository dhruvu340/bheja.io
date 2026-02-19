import { Response, Request } from "express";
import { AsyncHandler, ApiError } from "../utils/error.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt"

interface Tokentype{
    accessToken:string,
    refreshToken:string,
}

interface Optype{
  httpOnly:boolean,
  secure:boolean,
}

const generateAccessAndRefreshToken = async (userId: string):Promise<Tokentype> => {
  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    const accessToken = user.genAccessToken();
    const refreshToken = user.genRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch {
    throw new ApiError(400,"Error while authentication");
  }
};

export const Signup = AsyncHandler(async (req: Request, res: Response) : Promise<Response> => {
  const { name, email, password } = req.body;

  if ([name, email, password].some(f => !f?.trim())) {
    throw new ApiError(400, "All fields required");
  }

  const currUser = await User.findOne({ email });

  if (currUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const newUser = await User.create({
    name,
    email,
    passhash: password,
  });

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(newUser._id.toString());

  const loggedUser = await User.findById(newUser._id)
    .select("-passhash -refreshToken");

  const options :Optype = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      msg: "Signup successfully",
      user: loggedUser,
      accessToken,
    });
});



export const Signin= AsyncHandler(async (req:Request,res:Response):Promise<Response>=>{
  const {email,password} = req.body;
  if(email.trim()===""||password.trim()===""){
    throw new ApiError(400,"all fields are required");
  }
  const newUser=await User.findOne({email});
  if(!newUser){
    throw new ApiError(409,"user does not exist with the email");
  }
  const flag : boolean =await bcrypt.compare(password,newUser.passhash);
  if(!flag){
    throw new ApiError(400,"wrong password");
  }
  const {accessToken,refreshToken}= await generateAccessAndRefreshToken(newUser._id.toString());
  const loguser=await User.findById(newUser._id).select("-passhash -refreshToken");
  const options : Optype ={
    httpOnly:true,
    secure:false
   }
   return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      msg: "Signin successfully",
      user: loguser,
      accessToken,
    });

})
