import mongoose from "mongoose";
import { PhaseSchema } from "./Phase";
import { SubjectSchema } from "./Subject";

export const UserSchema = new mongoose.Schema({
  name: {type: String, required: true},
  nickname: {type: String, required: true},
  school: {type: String, required: true},
  email: {type: String, required: true},
  phone: {type: Number, required: false},

  phases: {type: [PhaseSchema], required: true},
  subjects: {type: [SubjectSchema], required: true},

  password: {type: String, required: true},
});