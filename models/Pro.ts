import mongoose, { Schema, model, models } from 'mongoose';

const ProSchema = new Schema({
  name: { type: String, required: true },        // e.g. "s1mple"
  team: { type: String },                         // e.g. "NAVI"
  game: { type: String, default: 'CS2' },
  country: { type: String },
  imageUrl: { type: String },
  profileUrl: { type: String },                   // link to prosettings page
  gear: {
    mouse: { type: String },
    keyboard: { type: String },
    headset: { type: String },
    mousepad: { type: String },
    monitor: { type: String },
  },
  settings: {
    dpi: { type: String },
    sensitivity: { type: String },
    eDPI: { type: String },
    resolution: { type: String },
    aspect: { type: String },
  },
}, { timestamps: true });

const Pro = models.Pro || model('Pro', ProSchema);
export default Pro;