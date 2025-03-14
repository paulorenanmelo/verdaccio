/* eslint-disable */
import constants from 'constants';
import buildDebug from 'debug';
import fs from 'fs';
import http from 'http';
import https from 'https';
import _, { assign, isFunction } from 'lodash';
import url from 'url';

import { findConfigFile, parseConfigFile } from '@verdaccio/config';
import { API_ERROR } from '@verdaccio/core';
import { logger, setup } from '@verdaccio/logger';
import server from '@verdaccio/server';
import { ConfigRuntime, HttpsConfKeyCert, HttpsConfPfx } from '@verdaccio/types';

import { getListListenAddresses } from './cli-utils';
import { displayExperimentsInfoBox } from './experiments';

const debug = buildDebug('verdaccio:node-api');

function unlinkAddressPath(addr) {
  if (addr.path && fs.existsSync(addr.path)) {
    fs.unlinkSync(addr.path);
  }
}

/**
 * Return a native HTTP/HTTPS server instance
 * @param config
 * @param addr
 * @param app
 */
export function createServerFactory(config: ConfigRuntime, addr, app) {
  let serverFactory;
  if (addr.proto === 'https') {
    debug('https enabled');
    try {
      let httpsOptions = {
        // disable insecure SSLv2 and SSLv3
        secureOptions: constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3,
      };

      const keyCertConfig = config.https as HttpsConfKeyCert;
      const pfxConfig = config.https as HttpsConfPfx;

      // https must either have key and cert or a pfx and (optionally) a passphrase
      if (!((keyCertConfig.key && keyCertConfig.cert) || pfxConfig.pfx)) {
        // logHTTPSError(configPath);
        throw Error('bad format https configuration');
      }

      if (pfxConfig.pfx) {
        const { pfx, passphrase } = pfxConfig;
        httpsOptions = assign(httpsOptions, {
          pfx: fs.readFileSync(pfx),
          passphrase: passphrase || '',
        });
      } else {
        const { key, cert, ca } = keyCertConfig;
        httpsOptions = assign(httpsOptions, {
          key: fs.readFileSync(key),
          cert: fs.readFileSync(cert),
          ...(ca && {
            ca: fs.readFileSync(ca),
          }),
        });
      }
      // TODO: enable http2 as feature
      // if (config.server.http2) <-- check if force http2
      serverFactory = https.createServer(httpsOptions, app);
    } catch (err: any) {
      throw new Error(`cannot create https server: ${err.message}`);
    }
  } else {
    // http
    debug('http enabled');
    serverFactory = http.createServer(app);
  }

  if (
    config.server &&
    typeof config.server.keepAliveTimeout !== 'undefined' &&
    // @ts-ignore
    config.server.keepAliveTimeout !== 'null'
  ) {
    // library definition for node is not up to date (doesn't contain recent 8.0 changes)
    serverFactory.keepAliveTimeout = config.server.keepAliveTimeout * 1000;
  }
  // FIXE: I could not find the reason of this code.
  unlinkAddressPath(addr);

  return serverFactory;
}

/**
 * Start the server on the port defined
 * @param config
 * @param port
 * @param version
 * @param pkgName
 */
export async function initServer(
  config: ConfigRuntime,
  port: string | void,
  version: string,
  pkgName: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // FIXME: get only the first match, the multiple address will be removed
    const [addr] = getListListenAddresses(port, config.listen);
    const logger = setup((config as ConfigRuntime).logs);
    displayExperimentsInfoBox(config.flags);
    const app = await server(config);
    const serverFactory = createServerFactory(config, addr, app);
    serverFactory
      .listen(addr.port || addr.path, addr.host, (): void => {
        // send a message for test
        if (isFunction(process.send)) {
          process.send({
            verdaccio_started: true,
          });
        }
        const addressServer = `${
          addr.path
            ? url.format({
                protocol: 'unix',
                pathname: addr.path,
              })
            : url.format({
                protocol: addr.proto,
                hostname: addr.host,
                port: addr.port,
                pathname: '/',
              })
        }`;
        logger.info(`http address ${addressServer}`);
        logger.info(`version: ${version}`);
        resolve();
      })
      .on('error', function (err): void {
        reject(err);
        process.exitCode = 1;
      });

    function handleShutdownGracefully() {
      logger.fatal('received shutdown signal - closing server gracefully...');
      serverFactory.close(() => {
        logger.info('server closed.');
        process.exit(0);
      });
    }

    process.on('SIGINT', handleShutdownGracefully);
    process.on('SIGTERM', handleShutdownGracefully);
    process.on('SIGHUP', handleShutdownGracefully);
  });
}

/**
 * Exposes a server factory to be instantiated programmatically.
 *
    const app = await runServer(); // default configuration
    const app = await runServer('./config/config.yaml');
    const app = await runServer({ configuration });
    app.listen(4000, (event) => {
    // do something
    });
 * @param config
 */
export async function runServer(config?: string | ConfigRuntime): Promise<any> {
  let configurationParsed: ConfigRuntime;
  if (config === undefined || typeof config === 'string') {
    const configPathLocation = findConfigFile(config);
    configurationParsed = parseConfigFile(configPathLocation);
  } else if (_.isObject(config)) {
    configurationParsed = config;
  } else {
    throw new Error(API_ERROR.CONFIG_BAD_FORMAT);
  }

  setup(configurationParsed.logs);
  displayExperimentsInfoBox(configurationParsed.flags);
  // FIXME: get only the first match, the multiple address will be removed
  const [addr] = getListListenAddresses(undefined, configurationParsed.listen);
  const app = await server(configurationParsed);
  return createServerFactory(configurationParsed, addr, app);
}
