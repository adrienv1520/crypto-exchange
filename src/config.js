const availableActions = [
  'getOrderbook',
  'placeOrder',
];

const pairs = [
  'btc/usdt',
  'eth/usdt',
  'bnb/usdt',
  'sol/usdt',
  'xrp/usdt',
  'ada/usdt',
  'avax/usdt',
  'doge/usdt',
  'trx/usdt',
  'link/usdt',
  'dot/usdt',
];

const sides = [
  'buy',
  'sell',
];

module.exports = Object.freeze({
  availableActions,
  pairs,
  sides,
});
