#! /usr/bin/env node
/* eslint-disable no-console */
const { PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const { Command } = require('commander');
const { isPair, isSide, toFloat } = require('./helpers');
const { version } = require('../package.json');

// run
const run = async function run() {
  const link = new Link({
    grape: 'http://127.0.0.1:30001',
  });

  link.start();

  const peer = new PeerRPCClient(link, {});
  peer.init();

  // peer request based on a specific action
  const requestPeer = function requestPeer({ action, data } = {}) {
    peer.request('crypto-exchange', { action, data }, { timeout: 10000 }, (err, response) => {
      if (err) {
        console.error('Error received from crypto exchange:', err.message);
        process.exit(1);
      }

      console.log(`Action ${action} processed: ${response.processed}`);
      console.log(`Data: ${JSON.stringify(response.data, null, 2)}`);
      process.exit(0);
    });
  };

  // main program
  const program = new Command();

  program
    .version(version, '-v, --version', 'output the current version')
    .description('The crypto exchange client')
    .name('crypto-exchange')
    .showHelpAfterError('(add --help for additional information)')
    .showSuggestionAfterError();

  // place order program
  const placeOrder = program.command('place-order');

  placeOrder.requiredOption('--side <string>', 'buy or sell', isSide)
    .requiredOption('--pair <string>', 'crypto pair in a format base/quote currency', isPair)
    .requiredOption('--price <float>', 'quote currency price', (value) => toFloat(value, 'price'))
    .requiredOption('--amount <float>', 'the amount of base currency', (value) => toFloat(value, 'amount'))
    .action((options) => {
      console.debug(`Placing order: ${options.side} ${options.amount} ${options.pair?.split('/')[0]} at ${options.price} ${options.pair?.split('/')[1]}...`);

      requestPeer({ action: 'placeOrder', data: options });
    });

  // get orderbook program
  const getOrderbook = program.command('get-orderbook');

  getOrderbook
    .option('--pair <string>', 'crypto pair in a format base/quote currency', isPair)
    .action((options) => {
      // eslint-disable-next-line prefer-template
      console.debug(`Getting orderbook${options.pair ? ' for pair ' + options.pair : ''}...`);

      requestPeer({ action: 'getOrderbook', data: options });
    });

  // validate command and options
  try {
    program.parse(process.argv);
  } catch (error) {
    console.error('Command validation error:', error.message);
    process.exit(1);
  }
};

run();
