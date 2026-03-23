import mongoose, { Schema, model, models } from 'mongoose';

const GearSchema = new Schema({
  userId: { type: String, required: true },
  discordId: { type: String },
  discordUsername: { type: String },
  name: { type: String, required: true },
  category: { type: String, required: true },
  isMain: { type: Boolean, default: false },
  imageUrl: { type: String },
}, { timestamps: true });

const Gear = models.Gear || model('Gear', GearSchema);
export default Gear;