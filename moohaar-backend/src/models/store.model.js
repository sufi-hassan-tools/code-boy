import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // Store subdomain handle e.g. mystore.moohaar.com
    handle: { type: String, unique: true, required: true },
    // Optional user provided domain
    customDomain: { type: String, unique: true, sparse: true },
    // Reference to the currently active theme
    activeTheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
    config: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Helpful query performance indexes
StoreSchema.index({ handle: 1 });
StoreSchema.index({ customDomain: 1 });
StoreSchema.index({ ownerId: 1 });

export default mongoose.model('Store', StoreSchema);
