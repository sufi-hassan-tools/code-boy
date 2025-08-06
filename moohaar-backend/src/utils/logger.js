import winston from 'winston';

const transports = [
  new winston.transports.File({ filename: 'logs/combined.log' }),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
];

if (process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console({ format: winston.format.simple() }));
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});

export default logger;
