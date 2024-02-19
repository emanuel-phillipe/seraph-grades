import express, { NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv";
import { model } from "mongoose";
import { UserSchema } from "../models/User";
import { validateRegisterBodyInfo, validateDeleteBodyInfo, validateLoginBodyInfo, validateChangeBodyInfo } from "../validation/UserValidation";
import { IUserDeleteSchema, IUserLoginSchema, IUserSchema } from "../models/interfaces/UserInterface";
import {hash, compare} from "bcrypt";
import { decodeUserToken, generateUserToken, isTokenValid } from "../auth/userAuth";
import { IResponses } from "../data/info.model";

export var jsonData:IResponses = require("../data/info.json")

dotenv.config()

const User = model<IUserSchema>("User", UserSchema)

export const userRouter = express.Router();

// FUNÇÃO PARA VERIFICAR SE O USER ESTÁ AUTENTICADO
export function authenticationValidation(req:Request, res:Response, next:NextFunction){
  const userToken = req.cookies.auth_token

  if(!userToken) return res.status(jsonData.user_not_authenticated.code).send(jsonData.user_not_authenticated.message)

  const decodedId = decodeUserToken(userToken) // DECODIFICAR O TOKEN QUE ESTÁ NO COOKIE

  //VALIDAÇÃO
  if(!decodedId) return res.status(jsonData.server_error.code).send(jsonData.server_error.message)

  res.set("id", decodedId)

  return next()
}

userRouter.post("/register", validateRegisterBodyInfo, async (req: Request, res: Response) => {

  const userToken = res.get("id")

  if(userToken) return res.status(jsonData.user_already_authenticated.code).send(jsonData.user_already_authenticated.message)

  let bodyResponse : IUserSchema = req.body; // LET - POIS AS INFORMAÇÕES VÃO SER ALTERADAS DEPOIS NO CÓDIGO!!!
  
  //VALIDAÇÃO
  const isInfoAlreadyUsed = await User.findOne({"email": bodyResponse.email, "phone": bodyResponse.phone}) != null
  if(isInfoAlreadyUsed) return res.status(jsonData.info_already_exist.code).send(jsonData.info_already_exist.message)

  bodyResponse.name = bodyResponse.name.toUpperCase(); // O NAME NO BANCO DE DADOS É EM LETRA CAIXA-ALTA

  const hashedPassword = await hash(bodyResponse.password, 15); // CRIAÇÃO DO HASH DA SENHA DO USER
  bodyResponse.password = hashedPassword;
  
  await User.create(bodyResponse); // CRIA O USER NO BANCO DE DADOS

  return res.status(jsonData.user_created.code).send(jsonData.user_created.message)
})

userRouter.delete("/delete", validateDeleteBodyInfo, authenticationValidation, async (req:Request, res:Response) => {

  const decodedId = res.get("id")

  try{
    const user = await User.findById(decodedId);
    const bodyResponse : IUserDeleteSchema = req.body;

    //VALIDAÇÃO
    if(user == null) return res.status(jsonData.user_not_found.code).send(jsonData.user_not_found.message)
    
    //VALIDAÇÃO
    if(user.name.toUpperCase() != bodyResponse.name.toUpperCase()) return res.status(jsonData.incorrect_info.code).send(jsonData.incorrect_info.message)
    if(user.email != bodyResponse.email) return res.status(jsonData.incorrect_info.code).send(jsonData.incorrect_info.message)
    
    //VALIDAÇÃO DE SENHA
    const isPasswordMatched = await compare(bodyResponse.password, user.password) // COMPARA AS SENHAS DO DB E REQUEST
    if(!isPasswordMatched) return res.status(jsonData.incorrect_info.code).send(jsonData.incorrect_info.message)

    await User.deleteOne({"email": user.email, "name": user.name}) // DELETA O USER NO BANCO DE DADOS

    res.clearCookie("auth_token") // LIMPEZA DO COOKIE
    return res.status(jsonData.accepted.code).send(jsonData.accepted.message)
  }catch(erro){
    return res.status(jsonData.server_error.code).send(jsonData.server_error.message)
  }  
})

userRouter.post("/login", validateLoginBodyInfo, async (req:Request, res:Response) => {

  const tokenCookie = req.cookies.auth_token

  if(tokenCookie) return res.status(jsonData.user_already_authenticated.code).send(jsonData.user_already_authenticated.message)
  
  const bodyResponse : IUserLoginSchema = req.body;
  const userRegistered = await User.findOne({"email": bodyResponse.email})

  //VALIDAÇÃO
  if(userRegistered == null) return res.status(jsonData.user_not_found.code).send(jsonData.user_not_found.message)

  //VALIDAÇÃO DE SENHA
  const isPasswordMatched = await compare(bodyResponse.password, userRegistered.password)
  if(!isPasswordMatched) return res.status(jsonData.incorrect_info.code).send(jsonData.incorrect_info.message)

  const userToken = generateUserToken(userRegistered) // GERAÇÃO DO TOKEN PARA O USUÁRIO

  res.cookie("auth_token", userToken, { // CRIAÇÃO DO COOKIE NA RESPOSTA
    httpOnly: false,
    maxAge: 60000 * 1000
  })
  return res.status(jsonData.user_succesfully_logged.code).send(jsonData.user_succesfully_logged.message)
})

userRouter.post("/logout", authenticationValidation, (req:Request, res:Response) => {
  
  res.clearCookie("auth_token") // LIMPEZA DO COOKIE
  return res.status(jsonData.ok.code).send(jsonData.ok.message)
})  

userRouter.put("/change", validateChangeBodyInfo, authenticationValidation, async (req:Request, res:Response) => {
  const decodedId = res.get("id")

  const user = await User.findById(decodedId); // ACHA O USER PELO ID QUE ESTÁ NO TOKEN

  //VALIDAÇÃO
  if(!user) res.status(jsonData.user_not_found.code).send(jsonData.user_not_found.message)

  let bodyResponse = req.body
  if(bodyResponse.name) bodyResponse.name = bodyResponse.name.toUpperCase()

  await user.updateOne(bodyResponse)

  return res.status(jsonData.ok.code).send(jsonData.ok.message)
})

userRouter.get("/info", authenticationValidation, async (req:Request, res:Response) => {
  const decodedId = res.get("id")

  try{
    const user = await User.findById(decodedId); // ACHA O USER PELO ID QUE ESTÁ NO TOKEN

    //VALIDAÇÃO
    if(!user) throw new Error("Usuário não encontrado")

    const userInfoFiltered = {name: user.name, nickname: user.nickname, school: user.school, email: user.email, phone: user.phone, phases:user.phases} // FILTRA AS INFORMAÇÕES DA RESPOSTA

    return res.status(jsonData.accepted.code).send(userInfoFiltered);
  }catch(erro){
    return res.status(jsonData.user_not_authenticated.code).send(jsonData.user_not_authenticated.message)
  }  
})