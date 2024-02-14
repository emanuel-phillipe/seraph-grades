import { IResponses } from "../data/info.model";
import * as dotenv from "dotenv";
import { IUserSchema } from "../models/interfaces/UserInterface";
import mongoose, { Mongoose, isObjectIdOrHexString, model } from "mongoose";
import { UserSchema } from "../models/User";
import express, { Request, Response } from "express";
import { authenticationValidation } from "./userRouting";
import { IActivity, IPhase } from "../models/interfaces/OthersInterface";

export var jsonData:IResponses = require("../data/info.json")
dotenv.config()

const User = model<IUserSchema>("User", UserSchema)

export const activityRouter = express.Router();

activityRouter.get("/:phaseName/:subjectName/:activityId", authenticationValidation, async (req:Request, res:Response) => {

  const id = res.get("id")
  const user = await User.findById(id)

  let phase = user.phases.filter((phase) => {
    return phase.name == Number.parseInt(req.params.phaseName) // PEGA A ETAPA QUE TIVER O MESMO NOME
  })

  // VALIDAÇÃO
  if(!phase[0]) return res.status(jsonData.notFound.code).send("Etapa não encontrada")

  let subject = phase[0].subjects.filter((subject) => { // PEGA A MATÉRIA DENTRO DA ETAPA QUE TIVER O MESMO NOME
    return subject.name == req.params.subjectName
  })

  // VALIDAÇÃO
  if(!subject[0]) return res.status(jsonData.notFound.code).send("Matéria não encontrada")

  const activity = subject[0].activities.filter((activity) => { // FILTRA A ATIVIDADE DA MATÉRIA SELECIONADA
    return activity._id.toString() == req.params.activityId
  })

  return res.status(jsonData.ok.code).send(activity)
})

activityRouter.post("/create/:phaseName/:subjectName", authenticationValidation, async (req:Request, res:Response) => {

  const id = res.get("id")
  const user = await User.findById(id)

  const bodyResponse:Array<IActivity> = req.body

  // VALIDAÇÃO
  let numberOfActivitiesLessThanZero = 0;
  bodyResponse.map((activity) => {
    if(activity.total <= 0) numberOfActivitiesLessThanZero++
  })
  if(numberOfActivitiesLessThanZero > 0) return res.status(jsonData.badRequest.code).send("Total não pode ser menor ou igual a zero")

  let phase = user.phases.filter((phase) => {
    return phase.name == Number.parseInt(req.params.phaseName) // PEGA A ETAPA QUE TIVER O MESMO NOME
  })

  // VALIDAÇÃO
  if(!phase[0]) return res.status(jsonData.notFound.code).send("Etapa não encontrada")
  
  let subject = phase[0].subjects.filter((subject) => { // PEGA A MATÉRIA DENTRO DA ETAPA QUE TIVER O MESMO NOME
    return subject.name == req.params.subjectName
  })

  // VALIDAÇÃO
  if(!subject[0]) return res.status(jsonData.notFound.code).send("Matéria não encontrada")
   
  subject[0].activities.push(...req.body) // COLOCA AS ATIVIDADES DO BODY NO ARRAY DE ATIVIDADES DA MATÉRIA
  
  let totalGrades = 0;
  subject[0].activities.map((activity) => { // SOMA O VALOR DAS ATIVIDADES E COLOCA NO TOTAL DA ETAPA
    totalGrades+=activity.total
  })

  // VALIDAÇÃO
  if(totalGrades>phase[0].total) return res.status(jsonData.badRequest.code).send("Total de pontos ultrapassa o valor da etapa")

  subject[0].total = totalGrades
  
  let subjectsWithoutUpdated = phase[0].subjects.filter((subject) => { // PEGA AS MATÉRIAS QUE NÃO TEM O MESMO NOME
    return subject.name != req.params.subjectName
  })
  
  let phasesWithoutUpdated = user.phases.filter((phase) => { // PEGA AS ETAPAS QUE NÃO TEM O NOME IGUAL
    return phase.name != Number.parseInt(req.params.phaseName)
  })
 
  phase[0].subjects = [...subjectsWithoutUpdated, subject[0]] // COLOCA AS MATÉRIAS ATUALIZADAS DENTRO DA ETAPA

  phasesWithoutUpdated = [...phasesWithoutUpdated, ...phase] // COLOCA A ETAPA EDITADA NO ARRAY COM AS OUTRAS

  await user.updateOne({phases: phasesWithoutUpdated}) // ATUALIZA A LISTA DE ETAPAS NO BANCO DE DADOS

  return res.status(jsonData.created.code).send("Atividade criada com êxito")
})

activityRouter.delete("/delete/:phaseName/:subjectName/:activityId", authenticationValidation, async (req:Request, res:Response) => {
  const id = res.get("id")
  const user = await User.findById(id)

  let phase = user.phases.filter((phase) => {
    return phase.name == Number.parseInt(req.params.phaseName) // PEGA A ETAPA QUE TIVER O MESMO NOME
  })

  // VALIDAÇÃO
  if(!phase[0]) return res.status(jsonData.notFound.code).send("Etapa não encontrada")

  let subject = phase[0].subjects.filter((subject) => { // PEGA A MATÉRIA DENTRO DA ETAPA QUE TIVER O MESMO NOME
    return subject.name == req.params.subjectName
  })

  // VALIDAÇÃO
  if(!subject[0]) return res.status(jsonData.notFound.code).send("Matéria não encontrada")

  const activity = subject[0].activities.filter((activity) => { // FILTRA A ATIVIDADE DA MATÉRIA QUE TIVER O MESMO NOME
    return activity._id.toString() == req.params.activityId
  })

  // VALIDAÇÃO
  if(!activity[0]) return res.status(jsonData.notFound.code).send("Atividade não encontrada")

  const filteredActivitiesWithoutSelected = subject[0].activities.filter((activity) => { // FILTRA AS ATIVIDADES DA MATÉRIA SEM A SELECIONADA
    return activity._id.toString() != req.params.activityId
  })

  let totalGradeActivities = 0;
  filteredActivitiesWithoutSelected.map((activity) => {
    totalGradeActivities+=activity.total
  })

  subject[0].total = totalGradeActivities

  subject[0].activities = filteredActivitiesWithoutSelected // COLOCA A NOVA LISTA DE ATIVIDADES NA MATÉRIA

  let subjectListWithoutSelected = phase[0].subjects.filter((subject) => { // PEGA AS MATÉRIAS 
    return subject.name != req.params.subjectName
  })

  subjectListWithoutSelected.push(subject[0]) // COLOCA MATÉRIA ATUALIZADA NO FINAL DA LISTA
  phase[0].subjects = subjectListWithoutSelected // COLOCA A LISTA DE MATÉRIAS NA ETAPA SELECIONADA

  let phaseListWithoutSelected = user.phases.filter((phase) => { // PEGA AS MATÉRIAS 
    return phase.name != Number.parseInt(req.params.phaseName)
  })

  phaseListWithoutSelected.push(phase[0]) // COLOCA ETAPA ATUALIZADA NO FINAL DA LISTA
  await user.updateOne({phases: phaseListWithoutSelected}) // ATUALIZA AS ETAPAS NO BANCO DE DADOS DO USUÁRIO

  return res.status(jsonData.ok.code).send("Atividade removida com êxito")
})