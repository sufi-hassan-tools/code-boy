/* eslint-env jest */
/* eslint-disable no-unused-vars */

class MockPageView {
  static async aggregate(pipeline) {
    // Mock aggregation for traffic metrics
    const match = pipeline.find(p => p.$match);
    const group = pipeline.find(p => p.$group);
    // Removed unused variable: project
    
    if (match && group) {
      // Filter page views based on match criteria
      const filtered = this.pageViews.filter(view => {
        if (match.$match.storeId && view.storeId !== match.$match.storeId) return false;
        if (match.$match.timestamp) {
          if (match.$match.timestamp.$gte && new Date(view.timestamp) < match.$match.timestamp.$gte) return false;
          if (match.$match.timestamp.$lte && new Date(view.timestamp) > match.$match.timestamp.$lte) return false;
        }
        return true;
      });

      // Group by date
      const grouped = {};
      filtered.forEach(view => {
        const date = new Date(view.timestamp).toISOString().split('T')[0];
        if (!grouped[date]) {
          grouped[date] = { 
            _id: date, 
            views: 0, 
            bounces: 0 
          };
        }
        grouped[date].views += 1;
        if (view.isBounce) {
          grouped[date].bounces += 1;
        }
      });

      // Apply projection
      return Object.values(grouped).map(item => ({
        date: item._id,
        views: item.views,
        bounces: item.bounces,
        bounceRate: item.views > 0 ? item.bounces / item.views : 0
      })).sort((a, b) => a.date.localeCompare(b.date));
    }
    
    return [];
  }

  static setPageViews(pageViews) {
    this.pageViews = pageViews;
  }
}

export default MockPageView;