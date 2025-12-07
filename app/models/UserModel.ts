import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDoc extends Document {
  provider: "credentials" | "google";
  name: string;
  email: string;
  tel?: string;
  password?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
provider: {
  type: String,
  enum: ["credentials", "google"],
  required: true,
  default: "credentials", // ✅
},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tel: { type: String },
    password: {
      type: String,
      required: function (this: IUserDoc) {
        return this.provider === "credentials";
      },
    },
    image: { type: String },
  },
  { timestamps: true }
);

// ✅ Defensive fix for Turbopack / ESM environment
// Sometimes mongoose.models is undefined initially
// if (!mongoose.models) {
//   (mongoose as any).models = {};
// }

const User: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);

export default User;
