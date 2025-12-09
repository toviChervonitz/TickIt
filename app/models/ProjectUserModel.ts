import mongoose from "mongoose";
import { IProjectUser } from "./types";

const ProjectUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role: {
      type: String,
      enum: ["manager", "viewer"],
      default: "viewer",
    },
    lastOpenedAt: { type: Date},
  },
  { timestamps: true }
);

export default mongoose.models.ProjectUser ||
  mongoose.model<IProjectUser>("ProjectUser", ProjectUserSchema);
