import * as jwt from "jsonwebtoken"

import * as dotenv from "dotenv"
import { IUserSchema } from "../models/interfaces/UserInterface";
import { resolve } from "path";
import { model } from "mongoose";
import { UserSchema } from "../models/User";
import { IToken } from "./interfaces/AuthInterface";
dotenv.config({path: resolve(__dirname, "../.env")});

const jwtSecret = process.env.SECRET_AUTH;

const User = model<IUserSchema>("User", UserSchema)

export function generateUserToken(user:IUserSchema){

  const token = jwt.sign(
    {"id": user._id},
    jwtSecret,
    {
      expiresIn: 60000
    }
  )

  return token;
}

export function decodeUserToken(token:string):string{
  const payload = jwt.verify(token, jwtSecret);

  const {id} = payload as IToken

  return id
}

export async function isTokenValid(token:string){
  const infoDecoded:any = decodeUserToken(token)

  return await User.findById(infoDecoded.id) != null
}