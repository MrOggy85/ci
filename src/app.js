import { config } from 'dotenv';
config();

/* eslint-disable import/first */
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import morganBody from 'morgan-body';
import winston from './config/winston';

import fs from 'fs';
import childProcess from 'child_process';

// ------------- API Node Server Setup -------------
const app = express();
app.disable('x-powered-by');
app.use(logger('combined', { stream: winston.stream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// hook morganBody to express app
morganBody(app);

// enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const BASE_URL = process.env.BASE_URL || '';
winston.info(`base URL is: ${BASE_URL}`);

console.log('process.cwd()', process.cwd());
const workDir = process.cwd();

const tempFolderExists = fs.existsSync(`${workDir}/temp`);
if (!tempFolderExists) {
  fs.mkdirSync(`${workDir}/temp`);
}

// ------------- Game Router -------------
app.post(`${BASE_URL}/payload`, (req, res) => {
  const execFileSync = childProcess.execFileSync;

  const stout = execFileSync(`${__dirname}/scripts/speaking-japanese-frontend.sh`, {
    cwd: `${workDir}/temp`,
  });
  console.log(stout);

  res.send(stout);
});

// 404
app.use((req, res, next) => {
  winston.debug('404 catcher reached', req.url);
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  winston.error(`${req.ip} - ${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - `, err);

  // render the error page
  res.status(err.status || 500);
  res.send({
    error: res.locals.error,
    message: res.locals.message,
  });
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  winston.info(`server listens to port ${port}`);
});
