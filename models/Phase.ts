import mongoose from "mongoose";
import { SubjectSchema } from "./Subject";

export const PhaseSchema = new mongoose.Schema({
  name: {type: Number, required: true},
  total: {type: Number, required: true},
  actual: {type: Boolean, required: true},
  subjects: {type: [SubjectSchema], required: true},
})

mongoose.model("Phase", PhaseSchema);