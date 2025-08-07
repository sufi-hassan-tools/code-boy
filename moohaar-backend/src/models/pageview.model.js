import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    sessionId: { type: String, required: true },
    path: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isBounce: { type: Boolean, default: true },
  },
  { versionKey: false },
);

PageViewSchema.index({ storeId: 1, timestamp: 1 });
PageViewSchema.index({ storeId: 1, sessionId: 1 });

export default mongoose.model('PageView', PageViewSchema);
