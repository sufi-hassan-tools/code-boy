import Store from '../models/store.model';

// POST /api/store/:storeId/theme
// Sets a store's active theme reference
const setActiveTheme = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { themeId } = req.body;
    if (!themeId) {
      return res.status(400).json({ message: 'themeId is required' });
    }
    await Store.findByIdAndUpdate(storeId, { activeTheme: themeId });
    // 204 indicates success with no content
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

export default setActiveTheme;
