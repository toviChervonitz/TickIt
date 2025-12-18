// import mongoose from "mongoose";

// const ChatReadSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
//   projectId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Project" }, // or chatId
//   lastReadMessageId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Message" },
//   updatedAt: { type: Date, default: Date.now },
// });

// ChatReadSchema.index({ userId: 1, projectId: 1 }, { unique: true });

// export const ChatRead = mongoose.model("ChatRead", ChatReadSchema);
import mongoose, { Schema, model, models } from "mongoose";

const ChatReadSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  projectId: { type: Schema.Types.ObjectId, required: true, ref: "Project" },
  lastReadMessageId: { type: Schema.Types.ObjectId, required: true, ref: "Message" },
  updatedAt: { type: Date, default: Date.now },
});

// Unique index per user per project
ChatReadSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const ChatRead = models.ChatRead || model("ChatRead", ChatReadSchema);

export default ChatRead;
