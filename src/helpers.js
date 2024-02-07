const { cast } = require('consis');
const config = require('./config');

const toFloat = function toFloat(n, option) {
  const number = cast.float(n);

  if (!number) {
    throw new Error(`${option} must be a float`);
  }

  return number;
};

const isPair = function isPair(pair) {
  if (!config.pairs.includes(pair)) {
    throw new Error(`unsupported pair ${pair}, supported pairs are ${config.pairs.join(', ')}`);
  }

  return pair;
};

const isSide = function isSide(side) {
  if (!config.sides.includes(side)) {
    throw new Error(`unknown side ${side}, side should be one of ${config.sides.join(', ')}`);
  }

  return side;
};

module.exports = Object.freeze({
  isPair,
  isSide,
  toFloat,
});
