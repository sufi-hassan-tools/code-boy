import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    author: { type: String },
    paths: {
      type: Map,
      of: String,
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Theme', ThemeSchema);
