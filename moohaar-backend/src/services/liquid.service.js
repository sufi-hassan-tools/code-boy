import { Liquid } from 'liquidjs';
import config from '../config/index.js';

// Configure LiquidJS with template caching for performance
const engine = new Liquid({
  root: config.THEMES_PATH,
  extname: '.liquid',
  cache: true, // cache compiled templates
  dynamicPartials: false, // disable dynamic partials for speed
});

export default engine;
