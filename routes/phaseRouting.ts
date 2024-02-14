import { IResponses } from "../data/info.model";
import * as dotenv from "dotenv";
import { IUserSchema } from "../models/interfaces/UserInterface";
import { model } from "mongoose";
import { UserSchema } from "../models/User";
import express, { Request, Response } from "express";
import { authenticationValidation } from "./userRouting";
import { validateNewPhaseBodyInfo } from "../validation/PhaseValidation";

export var jsonData:IResponses = require("../data/info.json")
dotenv.config()

const User = model<IUserSchema>("User", UserSchema)

export const phaseRouter = express.Router();

phaseRouter.get("/all", authenticationValidation, async (req:Request, res:Response) => {

  const id = res.get("id")

  const user = await User.findById(id)

  return res.status(jsonData.ok.code).send(user.phases)
})

phaseRouter.get("/:phaseName", authenticationValidation, async (req:Request, res:Response) => {

  const id = res.get("id")
  const user = await User.findById(id)

  const filteredPhase = user.phases.filter((phase) => {
    return Number.parseInt(req.params.phaseName) == phase.name // FILTRA A LISTA PARA PEGAR APENAS A ETAPA COM O NOME IGUAL
  })

  if(!filteredPhase[0]) return res.status(jsonData.notFound.code).send("Etapa não encontrada")

  return res.status(jsonData.ok.code).send(filteredPhase)
})

phaseRouter.post("/create", validateNewPhaseBodyInfo, authenticationValidation, async (req:Request, res:Response) => {

  const id = res.get("id")
  const user = await User.findById(id)
  
  const updatedPhases = user.phases // LISTA TODAS AS ETAPAS

  updatedPhases.push(req.body) // PUXA A NOVA ETAPA PARA O FINAL DA LISTA

  await user.updateOne({phases: updatedPhases})

  return res.status(jsonData.accepted.code).send(jsonData.accepted.message)
})

phaseRouter.delete("/delete/:phaseName", authenticationValidation, async (req:Request, res:Response) => {

  const id = res.get("id")
  const user = await User.findById(id)

  const allPhases = user.phases // LISTA TODAS AS ETAPAS

  const phaseToDelete = allPhases.filter((phase) => {
    return Number.parseInt(req.params.phaseName) == phase.name // FILTRA A ETAPA QUE TIVER O NOME IGUAL
  })

  // VALIDAÇÃO
  if(!phaseToDelete[0]) return res.status(jsonData.notFound.code).send("Etapa não encontrada")

  const filteredPhasesWithoutSelected = allPhases.filter((phase) => {
    return Number.parseInt(req.params.phaseName) != phase.name // FILTRA AS ETAPAS QUE TIVEREM O NOME DIFERENTE
  })

  await user.updateOne({phases: filteredPhasesWithoutSelected})

  return res.status(jsonData.accepted.code).send(jsonData.accepted.message)
})