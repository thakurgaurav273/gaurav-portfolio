import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  resumeUrl: { type: String }, // Optional, in case they want a resume link
  socialLinks: [{
    platform: String,
    url: String,
  }],
  stats: [{
    value: String,
    label: String
  }]
});

export const Hero = mongoose.model('Hero', heroSchema);
