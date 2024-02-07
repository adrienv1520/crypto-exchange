/* eslint-disable no-console */
const { PeerRPCServer } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const { object: { exists } } = require('consis');
const config = require('./config');
const Lock = require('./Lock');

/* orderbook
 * {
 *  pair: {
 *    asks: {
 *      price: amount
 *      price: amount
 *    }
 *    bids: {
 *      price: amount
 *      price: amount
 *    },
 *  }
 *  ...
 * }
*/
const orderbook = {};
/* ordersLocked
 * {
 *  pair: Lock,
 *  ...
 * }
*/
const ordersLocked = {};

config.pairs.forEach((pair) => {
  orderbook[pair] = {
    asks: {},
    bids: {},
  };
});

const link = new Link({
  grape: 'http://127.0.0.1:30001',
});

link.start();

const peer = new PeerRPCServer(link, {
  timeout: 300000,
});

peer.init();

const port = 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport('server');
service.listen(port);
console.info(`server listening on port ${port}`);

// announce worker
setInterval(() => {
  link.announce('crypto-exchange', service.port, {});
}, 1000);

// handles graceful exit
process.on('SIGINT', () => {
  console.info('Ended Node process gracefully and unlinking from Grape');
  link.stop();
  process.exit(0);
});

// placing an order (simple order matching engine)
const placeOrder = async function placeOrder({
  amount,
  pair,
  price,
  side,
} = {}) {
  // for a buy order
  let orderType = 'bids';
  let matchType = 'asks';

  if (side === 'sell') {
    orderType = 'asks';
    matchType = 'bids';
  }

  // check we have a match for this order
  const orderBookAmount = orderbook[pair][matchType][price];

  // order matching at this exact price
  if (orderBookAmount) {
    const remaining = orderBookAmount - amount;

    if (remaining === 0) {
      delete orderbook[pair][matchType][price];
    } else if (remaining > 0) {
      orderbook[pair][matchType][price] = remaining;
    } else {
      orderbook[pair][orderType][price] = Math.abs(remaining);
      delete orderbook[pair][matchType][price];
    }
  } else { // order does not match anything
    // eslint-disable-next-line no-lonely-if
    if (!exists(orderbook[pair][orderType][price])) {
      orderbook[pair][orderType][price] = amount;
    } else {
      orderbook[pair][orderType][price] += amount;
    }
  }
};

// handle an order with lock system
const handleOrder = async function handlerOrder(order = {}) {
  const lock = ordersLocked[order.pair] || (ordersLocked[order.pair] = new Lock());

  return new Promise((resolve, reject) => {
    lock.acquire(async () => {
      try {
        await placeOrder(order);
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        lock.release();
      }
    });
  });
};

service.on('request', async (rid, key, payload, handler) => {
  // we can imagine handling different actions like closing an order,
  // checking the client's balance, trading the futures etc.
  if (!exists(payload) || !exists(payload.data)) {
    return handler.reply(new Error('payload and payload.data must be set'));
  }

  if (!config.availableActions.includes(payload.action)) {
    return handler.reply(new Error(`unknown action ${payload.action}, mst be one of ${config.availableActions.join(', ')}`));
  }

  switch (payload.action) {
    case 'placeOrder': {
      if (!exists(payload.data.amount)
        || !exists(payload.data.pair)
        || !exists(payload.data.price)
        || !exists(payload.data.side)) {
        return handler.reply(new Error('Order amount, pair, price and side are required'));
      }

      try {
        await handleOrder(payload.data);
      } catch (error) {
        return handler.reply(error);
      }

      return handler.reply(null, { data: orderbook, processed: true });
    }
    case 'getOrderbook': {
      if (exists(payload.data?.pair)) {
        return handler.reply(null, { data: orderbook[payload.data.pair], processed: true });
      }

      return handler.reply(null, { data: orderbook, processed: true });
    }
    default:
      break;
  }

  return handler.reply(null, {});
});
