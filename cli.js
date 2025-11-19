#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const { createProxy } = require('./src/core/ProxyEngine');

yargs(hideBin(process.argv))
  .command('start [config]', 'Start proxy', (y) => {
    y.positional('config', { type: 'string', describe: 'Path to config file' });
  }, (args) => {
    const cfg = args.config ? require(path.resolve(process.cwd(), args.config)) : require('./config/default');
    const proxy = createProxy(cfg);
    proxy.start();
  })
  .command('stop', 'Stop proxy — use process manager to stop', () => {
    console.log('Stop via process manager (pm2/systemd) or send SIGINT to process.');
  })
  .demandCommand(1)
  .help()
  .argv;
