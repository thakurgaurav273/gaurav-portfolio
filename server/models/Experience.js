import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: [{ type: String }],
  order: { type: Number, default: 0 }
});

export const Experience = mongoose.model('Experience', experienceSchema);
