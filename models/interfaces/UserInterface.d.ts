import { ObjectId } from "mongoose";
import { IPhase, ISubject } from "./OthersInterface";

export interface IUserSchema {
  _id?: ObjectId;
  name: string;
  nickname: string;
  school: string;
  email: string;
  phone: number;
  password: string;
  phases: Array<IPhase>;
  subjects: Array<ISubject>
}

export interface IUserDeleteSchema{
  name: string;
  email: string;
  password: string;
}

export interface IUserLoginSchema{
  email: string;
  password: string;
}