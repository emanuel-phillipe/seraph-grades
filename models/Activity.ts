import mongoose from "mongoose";

export const ActivitySchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: false},
  total: {type: Number, required: true},
  date: {type: Date, required: false},
  grade: {type: Number, required: false},
})

mongoose.model("Activity", ActivitySchema);