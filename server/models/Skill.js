import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [{ type: String }],
  order: { type: Number, default: 0 }
});

export const Skill = mongoose.model('Skill', skillSchema);
