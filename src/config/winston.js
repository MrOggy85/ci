const appRoot = require('app-root-path');
const winston = require('winston');
const { format } = require('logform');

const env = process.env.NODE_ENV || 'development';

const options = {
  file: {
    level: env === 'development' ? 'debug' : 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    json: true,
    colorize: false,
    maxFiles: 5,
    format: format.combine(
      format.timestamp(),
      format.prettyPrint(),
    ),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: format.combine(
      // format.colorize(),
      format.timestamp(),
      format.printf(info => {
        const level = `${info.level.padStart(15, ' ')}:`;
        return `${info.timestamp} ${level} ${info.message}`;
      }),
    ),
  },
};
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.File(options.file),
  ],
  exitOnError: false,
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  },
};

module.exports = logger;
