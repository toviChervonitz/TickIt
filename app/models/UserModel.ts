import mongoose from "mongoose";
import { IUser } from "./types";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tel: { type: String, required: false },
    password: { type: String, required: true },
    image: { type: String, required: false },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
