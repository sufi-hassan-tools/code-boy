import Order from '../models/order.model';

// Create order after successful payment
export const createOrder = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { amount, items } = req.body;
    const order = await Order.create({ storeId, amount, items });
    return res.status(201).json(order);
  } catch (err) {
    return next(err);
  }
};

export default { createOrder };
