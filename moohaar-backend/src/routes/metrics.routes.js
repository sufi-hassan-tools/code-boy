/* eslint-disable no-underscore-dangle */
import { Router } from 'express';
import Order from '../models/order.model.js';
import PageView from '../models/pageview.model.js';

const router = Router();

router.get('/stores/:storeId/metrics/sales', async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { from, to } = req.query;
    const match = { storeId };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    const sales = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.json(sales.map((s) => ({ date: s._id, total: s.total })));
  } catch (err) {
    return next(err);
  }
});

router.get('/stores/:storeId/metrics/traffic', async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { from, to } = req.query;
    const match = { storeId };
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }
    const traffic = await PageView.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
          bounces: { $sum: { $cond: ['$isBounce', 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          views: 1,
          bounces: 1,
          bounceRate: {
            $cond: [{ $gt: ['$views', 0] }, { $divide: ['$bounces', '$views'] }, 0],
          },
        },
      },
      { $sort: { date: 1 } },
    ]);
    return res.json(traffic);
  } catch (err) {
    return next(err);
  }
});

export default router;
