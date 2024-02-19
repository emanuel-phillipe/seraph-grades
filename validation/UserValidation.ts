import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { model } from "mongoose";
import { UserSchema } from "../models/User";
import { IUserSchema } from "../models/interfaces/UserInterface";

const User = model<IUserSchema>("User", UserSchema)

export const userRegisterValidation = Joi.object({
  name: Joi.string().min(5).required(),
  nickname: Joi.string().min(5).required(),
  school: Joi.string().min(5).required(),
  email: Joi.string().min(5).required(),
  phone: Joi.number().min(11),
  password: Joi.string().min(5).required(),
})

export const userChangeInfoValidation = Joi.object({
  name: Joi.string().min(5),
  nickname: Joi.string().min(5),
  school: Joi.string().min(5),
})

export const userDeleteValidation = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().min(5).required(),
  password: Joi.string().min(5).required(),
})

export const userLoginValidation = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
})

export function validateRegisterBodyInfo(req:Request, res:Response, next:NextFunction){

  let {error} = userRegisterValidation.validate(req.body);
  const value = error == null;

  if(!value){
    return res.status(422).send("Corpo de requisição inválido")
  };

  return next()
}

export function validateDeleteBodyInfo(req:Request, res:Response, next:NextFunction){

  let {error} = userDeleteValidation.validate(req.body);
  const value = error == null;

  if(!value){
    return res.status(422).send("Corpo de requisição inválido")
  }

  return next()
}

export function validateLoginBodyInfo(req: Request, res:Response, next:NextFunction){

  let {error} = userLoginValidation.validate(req.body);
  const value = error == null;

  if(!value){
    return res.status(422).send("Corpo de requisição inválido")
  }

  return next()
}

export function validateChangeBodyInfo(req: Request, res:Response, next:NextFunction){
  let {error} = userChangeInfoValidation.validate(req.body);
  const value = error == null;

  if(!value){
    return res.status(422).send("Corpo de requisição inválido")
  }

  return next()
}