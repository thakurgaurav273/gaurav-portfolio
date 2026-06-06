import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  tech: [{ type: String }],
  image: { type: String },
  media: [{ 
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' }
  }],
  featured: { type: Boolean, default: false },
  link: { type: String },
  githubUrl: { type: String },
  liveUrl: { type: String },
  order: { type: Number, default: 0 }
});

export const Project = mongoose.model('Project', projectSchema);
