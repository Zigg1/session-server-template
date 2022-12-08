import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
  token: { type: String, required: true},
  createdAt: {type:String, default: Date()}
});

export const tokenModel = mongoose.model("token", tokenSchema);