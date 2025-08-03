import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    activeTheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
    config: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Store', StoreSchema);
