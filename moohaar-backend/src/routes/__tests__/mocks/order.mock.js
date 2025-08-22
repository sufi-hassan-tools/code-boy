/* eslint-env jest */
/* eslint-disable no-unused-vars */

class MockOrder {
  static async aggregate(pipeline) {
    // Mock aggregation for sales metrics
    const match = pipeline.find(p => p.$match);
    const group = pipeline.find(p => p.$group);
    
    if (match && group) {
      // Filter orders based on match criteria
      const filtered = this.orders.filter(order => {
        if (match.$match.storeId && order.storeId !== match.$match.storeId) return false;
        if (match.$match.createdAt) {
          if (match.$match.createdAt.$gte && new Date(order.createdAt) < match.$match.createdAt.$gte) return false;
          if (match.$match.createdAt.$lte && new Date(order.createdAt) > match.$match.createdAt.$lte) return false;
        }
        return true;
      });

      // Group by date
      const grouped = {};
      filtered.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (!grouped[date]) {
          grouped[date] = { _id: date, total: 0 };
        }
        grouped[date].total += order.amount;
      });

      return Object.values(grouped).sort((a, b) => a._id.localeCompare(b._id));
    }
    
    return [];
  }

  static setOrders(orders) {
    this.orders = orders;
  }
}