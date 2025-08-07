import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    amount: { type: Number, required: true },
    items: [
      {
        productId: String,
        quantity: Number,
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model('Order', OrderSchema);
