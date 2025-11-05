import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: false },
    status: {
        type: String,
        enum: ["todo", "doing", "done"],
        default: "todo"
    },
    createdAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);