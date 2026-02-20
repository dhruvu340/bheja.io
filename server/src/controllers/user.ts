import { Request, Response, CookieOptions } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

import { AsyncHandler, ApiError } from "../utils/error.js";
import { ApiResponse } from "../utils/ires.js";
import { User } from "../models/user.js";



interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshPayload extends JwtPayload {
  _id: string;
}


const generateAccessAndRefreshToken = async (
  userId: string
): Promise<TokenPair> => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.genAccessToken();
    const refreshToken = user.genRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err: any) {
    throw new ApiError(500, err.message || "Token generation failed");
  }
};


const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
};



export const Signup = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password } = req.body;

    if ([name, email, password].some((f) => !f?.trim())) {
      throw new ApiError(400, "All fields required");
    }

    const exists = await User.findOne({ email });
    if (exists) {
      throw new ApiError(409, "User already exists with this email");
    }

    const newUser = await User.create({
      name,
      email,
      passhash: password, 
    });

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(newUser._id.toString());

    const safeUser = await User.findById(newUser._id).select(
      "-passhash -refreshToken"
    );

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .send(new ApiResponse(201, safeUser, "Signup successful"));
  }
);



export const Signin = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.passhash);
    if (!valid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id.toString());

    const safeUser = await User.findById(user._id).select(
      "-passhash -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .send(new ApiResponse(200, safeUser, "Signin successful"));
  }
);



export const Logout = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (incomingRefreshToken) {
      await User.findOneAndUpdate(
        { refreshToken: incomingRefreshToken },
        { $set: { refreshToken: "" } }
      );
    }

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .send(new ApiResponse(200, {}, "Logged out successfully"));
  }
);



export const genAccessToken = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const incomingRefreshToken: string | undefined =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    let decoded: RefreshPayload;

    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_SECRET as string
      ) as RefreshPayload;
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or reused");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id.toString());

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .send(new ApiResponse(200, {}, "Access token refreshed"));
  }
);