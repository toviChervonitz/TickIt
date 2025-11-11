// UserModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDoc extends Document {
  provider: "credentials" | "google";
  name: string;
  email: string;
  tel?: string;
  password?: string;
  image?: string;
}

const UserSchema: Schema<IUserDoc> = new Schema(
  {
    provider: {
      type: String,
      enum: ["credentials", "google"],
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tel: { type: String },
    password: {
      type: String,
      required: function () {
        // required only if provider is credentials
        return this.provider === "credentials";
      },
    },
    image: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);

export default User;
