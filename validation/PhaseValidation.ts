import Joi from "joi";
import { subjectValidation } from "./SubjectValidation";
import { NextFunction, Request, Response } from "express";

export const phaseValidation = Joi.object({
  name: Joi.number().required(),
  total: Joi.number().required(),
  actual: Joi.bool().required(),
  subjects: Joi.array().items(subjectValidation),
})

export function validateNewPhaseBodyInfo(req:Request, res:Response, next:NextFunction){

  let {error} = phaseValidation.validate(req.body);
  const value = error == null;

  if(!value){
    return res.status(422).send("Corpo de requisição inválido")
  };

  return next()
}