import { Schema, model, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,  
      trim: true,
      index: true
    },

    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,   
      lowercase: true
    },

    passhash: {
      type: String,
      select: false,
      required: true    
    },

    refreshToken: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true
  }
);

export type IUser = InferSchemaType<typeof UserSchema>;

export const User = model<IUser>("User", UserSchema);
