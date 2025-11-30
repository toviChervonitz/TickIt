import mongoose from "mongoose";
import { IProject } from "./types";


const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  color: { type: String },
}, { timestamps: true });

function getRandomPastel() {
  const r = Math.floor(Math.random() * 128) + 128;
  const g = Math.floor(Math.random() * 128) + 128;
  const b = Math.floor(Math.random() * 128) + 128;

  return `rgb(${r}, ${g}, ${b})`;
}

ProjectSchema.pre("save", function (next) {
  if (!this.color) {
    this.color = getRandomPastel();  
  }
  next();
});

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
