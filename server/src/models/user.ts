import { Model, Schema, model, type InferSchemaType } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface UserMethods {
  comparePass(password:string):Promise<boolean>;
  genAccessToken():string;
  genRefreshToken():string;
}

const UserSchema = new Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    passhash:     { type: String, required: true },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.methods.comparePass = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passhash);
};

UserSchema.methods.genAccessToken = function (): string {
  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email },
    process.env.JWT_SECRET!,
    { expiresIn: Number(process.env.EXPIREIN) }
  );
};

UserSchema.methods.genRefreshToken = function (): string {
  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email },
    process.env.REFRESH_SECRET!,
    { expiresIn: Number(process.env.EXPIREINR) }
  );
};

UserSchema.pre("save", async function ():Promise<void> {
  if (this.isModified("passhash")) {
    this.passhash = await bcrypt.hash(this.passhash, 10);
  }
});


export type IUser = InferSchemaType<typeof UserSchema>;
export const User = model<IUser,Model<IUser,{},UserMethods>>("users",UserSchema);