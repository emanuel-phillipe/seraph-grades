import Joi from "joi";
import { activityValidation } from "./ActivityValidation";
import { NextFunction, Request, Response } from "express";

export const subjectValidation = Joi.object({
  name: Joi.string().min(5).required(),
  teacher: Joi.string().required(),
  total: Joi.number(),
  activities: Joi.array().items(activityValidation),
});

export const subjectBodyResponseValidation = Joi.array().items(subjectValidation)

export function validateNewSubjectBodyInfo(req:Request, res:Response, next:NextFunction){

  let {error} = subjectBodyResponseValidation.validate(req.body);
  const value = error == null;

  if(!value){
    return res.status(422).send("Corpo de requisição inválido")
  };

  return next()
}