import mongoose from "mongoose";

const ProjectUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  role: { type: String, enum: ["owner", "editor", "viewer"], default: "viewer" },
}, { timestamps: true });

export default mongoose.models.ProjectUser || mongoose.model("ProjectUser", ProjectUserSchema);