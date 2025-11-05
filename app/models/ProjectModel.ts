import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
