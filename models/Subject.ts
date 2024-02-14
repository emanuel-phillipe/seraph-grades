import mongoose from "mongoose";
import { ActivitySchema } from "./Activity";

export const SubjectSchema = new mongoose.Schema({
  name: {type: String, required: true},
  teacher: {type: String, required: true},
  total: {type: Number, required: true},
  activities: {type: [ActivitySchema], required: false},
})

mongoose.model("Subject", SubjectSchema);