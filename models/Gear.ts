import mongoose, { Schema, model, models } from 'mongoose';

const GearSchema = new Schema({
  userId: { type: String, required: true },
  discordId: { type: String },
  discordUsername: { type: String },
  name: { type: String, required: true },
  category: { type: String, required: true },
  isMain: { type: Boolean, default: false },
  isWishlist: { type: Boolean, default: false },
  imageUrl: { type: String },
  price: { type: String },
  priceUrl: { type: String },
}, { timestamps: true });

GearSchema.index({ discordUsername: 1 });
GearSchema.index({ userId: 1 });
GearSchema.index({ name: 1 });
GearSchema.index({ category: 1 });

const Gear = models.Gear || model('Gear', GearSchema);
export default Gear;