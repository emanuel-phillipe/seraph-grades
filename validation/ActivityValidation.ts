import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const activityValidation = Joi.object({
  name: Joi.string().min(5).required(),
  description: Joi.string().min(5),
  total: Joi.number().min(0).required(),
  date: Joi.date(),
  grade: Joi.number().min(0),
})

export const activityChangeValidation = Joi.object({
  name: Joi.string().min(5),
  description: Joi.string().min(5),
  total: Joi.number().min(0),
  date: Joi.date(),
  grade: Joi.number().min(0),
})

export function validateActivityChangeInfo(req:Request, res:Response, next:NextFunction){

  let {error} = activityChangeValidation.validate(req.body);
  const value = error == null;

  if(!value){
    return res.status(422).send("Corpo de requisição inválido")
  };

  return next()
}