import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  password: {type: String},
  verified: {type: Boolean, default: false},
  createdAt: {type: String, default: Date()}
});

export const userModel = mongoose.model("users", userSchema);