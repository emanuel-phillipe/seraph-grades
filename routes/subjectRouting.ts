import { IResponses } from "../data/info.model";
import * as dotenv from "dotenv";
import { IUserSchema } from "../models/interfaces/UserInterface";
import { model } from "mongoose";
import { UserSchema } from "../models/User";
import express, { NextFunction, Request, Response } from "express";
import { authenticationValidation } from "./userRouting";
import { validateNewSubjectBodyInfo } from "../validation/SubjectValidation";
import { ISubjectBody } from "./interfaces/SubjectInterface";

export var jsonData:IResponses = require("../data/info.json")
dotenv.config()

const User = model<IUserSchema>("User", UserSchema)

export const subjectRouter = express.Router();

subjectRouter.get("/:phaseName/:subjectName", authenticationValidation, async (req:Request, res:Response) => {
  
  const id = res.get("id")
  const user = await User.findById(id)

  const selectedPhase = user.phases.filter((phase) => {
    return phase.name == Number.parseInt(req.params.phaseName)
  })

  if(!selectedPhase[0]) return res.status(jsonData.notFound.code).send("Etapa não encontrada")

  const selectedSubject = selectedPhase[0].subjects.filter((subject) => {
    return subject.name == req.params.subjectName
  })

  if(!selectedSubject[0]) return res.status(jsonData.notFound.code).send("Matéria não encontrada")

  return res.status(jsonData.ok.code).send(selectedSubject[0])
})

subjectRouter.post("/create/:phaseName", validateNewSubjectBodyInfo, authenticationValidation, async (req:Request, res:Response) => {
  
  const id = res.get("id")

  let bodyResponse:ISubjectBody = req.body;

  bodyResponse.map((subject) => {
    subject.name = subject.name.replace(" ", "+")
  })

  const phaseName = Number.parseInt(req.params.phaseName)

  const user = await User.findById(id)
  let userPhases = user.phases

  let phaseToChange = userPhases.filter((phase) => {
    return phase.name == phaseName
  })

  // VALIDAÇÃO
  // LÓGICA PARA QUE NÃO OCORRA REPETIÇÃO DE NOMES
  let areThereEqualNames = false
  phaseToChange[0].subjects.map((subject) => {
    bodyResponse.map((subjectBody) => {
      if(subject.name == subjectBody.name){ 
        areThereEqualNames = true
      }
    })
  })
  if(areThereEqualNames) return res.status(jsonData.badRequest.code).send("Nomes não podem repetir")
  // ---------------------------------------------

  let phasesWithoutSelected = userPhases.filter((phase) => {
    return phase.name != phaseName
  })

  phaseToChange[0].subjects = [...phaseToChange[0].subjects, ...bodyResponse]
  
  phasesWithoutSelected.push(...phaseToChange)

  await user.updateOne({phases: phasesWithoutSelected})

  return res.status(jsonData.created.code).send(jsonData.created.message)
})

subjectRouter.delete("/delete/:phaseName/:subjectName", authenticationValidation, async (req:Request, res:Response) => {
  const id = res.get("id")

  const user = await User.findById(id)
  user._id.toString()

  let phase = user.phases.filter((phase) => {
    return phase.name == Number.parseInt(req.params.phaseName) // SELECIONA A ETAPA NA QUAL A MATÉRIA SERÁ DELETADA
  })

  if(!phase[0]) return res.status(jsonData.notFound.code).send("Etapa não encontrada")

  let phaseList = user.phases.filter((phase) => {
    return phase.name != Number.parseInt(req.params.phaseName) // LISTA DE ETAPAS SEM A DE CIMA
  })

  const subject = phase[0].subjects.filter((subject) => { // LISTA DE MATÉRIAS DA ETAPA SEM A QUE SERÁ DELETADA
    return subject.name == req.params.subjectName
  })
 
  if(!subject[0]) return res.status(jsonData.notFound.code).send("Matéria não encontrada")

  const subjectList = phase[0].subjects.filter((subject) => { // LISTA DE MATÉRIAS DA ETAPA SEM A QUE SERÁ DELETADA
    return subject.name != req.params.subjectName
  })

  phase[0].subjects = subjectList

  phaseList.push(phase[0])

  await user.updateOne({phases: phaseList})
  return res.status(jsonData.accepted.code).send(jsonData.accepted.message)
})