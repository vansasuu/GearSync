import mongoose, { Schema, model, models } from 'mongoose';

const GearHistorySchema = new Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true }, // 'added' | 'removed' | 'set_main' | 'wishlist_imported'
  gearName: { type: String, required: true },
  category: { type: String, required: true },
  detail: { type: String },
}, { timestamps: true });

const GearHistory = models.GearHistory || model('GearHistory', GearHistorySchema);
export default GearHistory;
