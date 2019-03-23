import { config } from 'dotenv';
config();

/* eslint-disable import/first */
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import winston from './config/winston';
import crypto from 'crypto';

import fs from 'fs';
import childProcess from 'child_process';

// application error handler
process.on('uncaughtException', (err) => {
  winston.error('APPLICATION FAILED ', err);
  process.exit(1);
});

const mandatoryEnv = [
  'REPO_JAPANESE_FRONTENT_ID',
  'REPO_JAPANESE_FRONTENT_GITHUB_SECRET',
  'REPO_LJ_ADMIN_WEB_ID',
  'REPO_LJ_ADMIN_WEB_GITHUB_SECRET',
  'PORT',
];

winston.debug('Mandatory ENV:');
mandatoryEnv.forEach(x => winston.debug(`${x}: ${process.env[x]}`));

const emptyMandatoryEnv = mandatoryEnv.filter(x => !process.env[x]);
if (emptyMandatoryEnv.length > 0) {
  emptyMandatoryEnv.forEach(x => winston.error(`env ${x} not set`));
  throw new Error('Mandatory Env missing');
}

const optionalEnv = [
  {
    env: 'NODE_ENV',
    default: 'development',
  },
  {
    env: 'BASE_URL',
    default: '',
  },
];

winston.debug('Optional ENV:');
optionalEnv.forEach(x => winston.debug(`${x.env}: ${process.env[x.env]}`));

const emptyOptionalEnv = optionalEnv.filter(x => !process.env[x.env]);
if (emptyOptionalEnv.length > 0) {
  emptyOptionalEnv.forEach(x => winston.warn(`env ${x.env} not set. Using default: ${x.default}`));
}

const {
  REPO_JAPANESE_FRONTENT_ID,
  REPO_JAPANESE_FRONTENT_GITHUB_SECRET,
  REPO_LJ_ADMIN_WEB_ID,
  REPO_LJ_ADMIN_WEB_GITHUB_SECRET,
  PORT,
  BASE_URL = '',
} = process.env;

const repos = {
  speakingJapaneseFrontend: {
    id: Number(REPO_JAPANESE_FRONTENT_ID),
    secret: REPO_JAPANESE_FRONTENT_GITHUB_SECRET,
    script: 'speaking-japanese-frontend.sh',
  },
  ljAdminWeb: {
    id: Number(REPO_LJ_ADMIN_WEB_ID),
    secret: REPO_LJ_ADMIN_WEB_GITHUB_SECRET,
    script: 'lj-admin-web.sh',
  },
};

// ------------- API Node Server Setup -------------
const app = express();
app.set('port', PORT);
app.disable('x-powered-by');
app.use(logger('combined', { stream: winston.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const workDir = process.cwd();

const tempFolderExists = fs.existsSync(`${workDir}/temp`);
if (!tempFolderExists) {
  fs.mkdirSync(`${workDir}/temp`);
}

function getSignature(secret, body) {
  const bodyStringified = JSON.stringify(body);
  const generator = crypto.createHmac('sha1', secret);
  generator.update(bodyStringified);
  return `sha1=${generator.digest('hex')}`;
}

let isJobProcessing = false;

function getRepo(repoId) {
  switch (repoId) {
    case repos.speakingJapaneseFrontend.id:
      return repos.speakingJapaneseFrontend;
    case repos.ljAdminWeb.id:
      return repos.ljAdminWeb;

    default: {
      const err = new Error(`Repo Id ${repoId} not found`);
      err.status = 400;
      throw err;
    }
  }
}

// ------------- Payload Router -------------
app.post(`${BASE_URL}/payload`, (req, res) => {
  const repo = getRepo(req.body.repository.id);

  // 1. Check secret match
  const expectedSignature = getSignature(repo.secret, req.body);

  if (req.headers['x-hub-signature'] !== expectedSignature) {
    winston.warn(`x-hub-signature ${req.headers['x-hub-signature']} does not match expected`);
    const err = new Error('Credentials mismatch');
    err.status = 401;
    throw err;
  }

  // 3. Check if job is in process
  if (isJobProcessing) {
    const err = new Error('Job is in Progress');
    err.status = 400;
    throw err;
  }

  // 4. Start Job
  const child = childProcess.execFile(`${__dirname}/scripts/${repo.script}`, [], {
    cwd: `${workDir}/temp`,
  });
  isJobProcessing = true;

  child.stdout.on('data', (data) => {
    winston.info(`[build-script] ${data}`);
  });

  child.stderr.on('data', (data) => {
    winston.info(`[build-script-error] ${data}`);
  });

  child.on('exit', (code, signal) => {
    isJobProcessing = false;

    if (code === 0) {
      winston.info('build-script exited with ' +
      `code ${code} and signal ${signal}`);
    } else {
      winston.error('build-script exited with ' +
      `code ${code} and signal ${signal}`);
    }
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

app.listen(app.get('port'), async () => {
  winston.info(`server listen at :${app.get('port')}${BASE_URL}/`);
});
