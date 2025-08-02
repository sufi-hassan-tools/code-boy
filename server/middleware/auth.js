const jwt = require('jsonwebtoken');
const { getPublicKey } = require('../config/jwt');
const User = require('../models/User');

async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ msg: 'No token' });
  }
  try {
    const decoded = jwt.verify(token, getPublicKey(), { algorithm: 'RS256' });
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
}

module.exports = auth;
