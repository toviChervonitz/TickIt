import mongoose from "mongoose";

const ResetCodeSchema = new mongoose.Schema({
  email: String,
  code: String,
  expiresAt: Number,
});

ResetCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.ResetCode || mongoose.model("ResetCode", ResetCodeSchema);
