import { config } from 'dotenv';
config();

/* eslint-disable import/first */
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import morganBody from 'morgan-body';
import winston from './config/winston';
import crypto from 'crypto';

import fs from 'fs';
import childProcess from 'child_process';

// application error handler
process.on('uncaughtException', (err) => {
  winston.error('APPLICATION FAILED', err);
  process.exit(1);
});

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

if (!process.env.REPO_ID_JAPANESE_FRONTENT) {
  throw new Error('ENV: REPO_ID_JAPANESE_FRONTENT not set');
}

const repos = {
  speakingJapaneseFrontend: Number(process.env.REPO_ID_JAPANESE_FRONTENT),
};

const workDir = process.cwd();

const tempFolderExists = fs.existsSync(`${workDir}/temp`);
if (!tempFolderExists) {
  fs.mkdirSync(`${workDir}/temp`);
}

if (!process.env.GITHUB_SECRET) {
  throw new Error('ENV: GITHUB_SECRET not set');
}
const gitHubsecret = process.env.GITHUB_SECRET;

function getSignature(secret) {
  const generator = crypto.createHash('sha1');
  generator.update(secret);
  return `sha1=${generator.digest('hex')}`;
}

let isJobProcessing = false;

// ------------- Payload Router -------------
const BASE_URL = process.env.BASE_URL || '';
app.post(`${BASE_URL}/payload`, (req, res) => {
  // 1. Check secret match
  const expectedSignature = getSignature(gitHubsecret);

  if (req.headers['x-hub-signature'] !== expectedSignature) {
    winston.warn(`x-hub-signature ${req.headers['x-hub-signature']} does not match expected`);
    const err = new Error('Credentials mismatch');
    err.status = 401;
    throw err;
  }

  // 2. Check which push
  if (req.body.repository.id !== repos.speakingJapaneseFrontend) {
    winston.warn(`request repo id ${req.body.repository.id} does not match expected`);
    const err = new Error('Repo ID mismatch');
    err.status = 400;
    throw err;
  }

  // 3. Check if job is in process
  if (isJobProcessing) {
    const err = new Error('Job is in Progress');
    err.status = 400;
    throw err;
  }

  // 4. Start Job
  const child = childProcess.execFile(`${__dirname}/scripts/speaking-japanese-frontend.sh`, [], {
    cwd: `${workDir}/temp`,
  });
  isJobProcessing = true;

  child.stdout.on('data', (data) => {
    winston.info(`[build-script] ${data}`);
  });

  child.on('exit', (code, signal) => {
    isJobProcessing = false;

    winston.info('build-script exited with ' +
      `code ${code} and signal ${signal}`);
  });
  child.on('error', (code, signal) => {
    isJobProcessing = false;

    winston.error('build-script exited with ' +
      `code ${code} and signal ${signal}`);
  });

  res.send('ok');
});

// 404
app.use((req, res, next) => {
  winston.debug('404 catcher reached', req.url);
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
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

const port = process.env.PORT || 5050;

app.listen(port, async () => {
  winston.info(`server listens to port ${port}`);
  winston.info(`ENV used:
    process.env.PORT: ${process.env.PORT}
    process.env.BASE_URL: ${process.env.BASE_URL}
    process.env.REPO_ID_JAPANESE_FRONTENT: ${process.env.REPO_ID_JAPANESE_FRONTENT}
    process.env.GITHUB_SECRET: ${process.env.GITHUB_SECRET}
    `);
});
