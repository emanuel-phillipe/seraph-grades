import Joi from "joi";

export const activityValidation = Joi.object({
  name: Joi.string().min(5).required(),
  description: Joi.string().min(5),
  total: Joi.number().min(0).required(),
  date: Joi.date(),
  grade: Joi.number().min(0),
})