import mongoose from "mongoose";
import { ITask } from "./types";

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: false },
    status: {
        type: String,
        enum: ["todo", "doing", "done"],
        default: "todo"
    },
    createdAt: { type: Date, default: Date.now, immutable: true, },
    dueDate: { type: Date, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
});

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);