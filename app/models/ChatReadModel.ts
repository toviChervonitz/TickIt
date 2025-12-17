import  { Schema, model, models } from "mongoose";

const ChatReadSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  projectId: { type: Schema.Types.ObjectId, required: true, ref: "Project" },
  lastReadMessageId: { type: Schema.Types.ObjectId, required: true, ref: "Message" },
  updatedAt: { type: Date, default: Date.now },
});

ChatReadSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const ChatRead = models.ChatRead || model("ChatRead", ChatReadSchema);

export default ChatRead;
