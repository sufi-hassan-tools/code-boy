import { Liquid } from 'liquidjs';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import config from '../config/index';

// Configure LiquidJS with template caching for performance
const engine = new Liquid({
  root: config.THEMES_PATH,
  extname: '.liquid',
  cache: true, // cache compiled templates
  dynamicPartials: false, // disable dynamic partials for speed
});

// Register HTML sanitization filter using DOMPurify
const {window} = new JSDOM('');
const DOMPurify = createDOMPurify(window);
engine.registerFilter('sanitize', (html) => DOMPurify.sanitize(html));

export default engine;
