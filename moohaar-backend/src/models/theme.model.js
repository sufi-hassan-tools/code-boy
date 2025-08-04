import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    author: { type: String },
    // Semantic version of the theme
    version: { type: String, required: true },
    // Brief description of the theme
    description: { type: String, required: true },
    // URL pointing to a preview image
    previewImage: { type: String, required: true },
    paths: {
      type: Map,
      of: String,
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Theme', ThemeSchema);
