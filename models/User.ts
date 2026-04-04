import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, unique: true, sparse: true },
  discordId: { type: String, unique: true, sparse: true },
  discordUsername: { type: String },
  steamId: { type: String },
  valorantId: { type: String }, // e.g. "sassuan#1234"
}, { timestamps: true });

UserSchema.index({ discordUsername: 1 });

const User = models.User || model('User', UserSchema);
export default User;