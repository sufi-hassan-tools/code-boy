const mongoose = require('mongoose');

const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  description: String,
  author: String,
  thumbnail: String,
  isActive: { type: Boolean, default: false },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  settings: {
    colors: {
      primary: { type: String, default: '#1C2B64' },
      secondary: { type: String, default: '#FBECB2' },
      accent: { type: String, default: '#F8BDEB' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#333333' }
    },
    fonts: {
      heading: { type: String, default: 'Montserrat' },
      body: { type: String, default: 'Montserrat' }
    },
    layout: {
      headerStyle: { type: String, default: 'modern' },
      footerStyle: { type: String, default: 'minimal' },
      productLayout: { type: String, default: 'grid' }
    }
  },
  templates: {
    homepage: String,
    productPage: String,
    categoryPage: String,
    aboutPage: String,
    contactPage: String
  },
  assets: [{
    name: String,
    type: String, // css, js, image
    content: String,
    url: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Theme', ThemeSchema);