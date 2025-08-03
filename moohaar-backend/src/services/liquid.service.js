import { Liquid } from 'liquidjs';
import config from '../config/index.js';

const engine = new Liquid({
  root: config.THEMES_PATH,
  extname: '.liquid',
});

export default engine;
