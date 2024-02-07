# crypto-exchange <!-- omit in toc -->

![Grenache](docs/grenache.png "Grenache")

## Table of Contents <!-- omit in toc -->

- [Presentation](#presentation)
- [Installation](#installation)
- [Technical information](#technical-information)
  - [Stack](#stack)
  - [Code quality](#code-quality)
  - [Tests](#tests)
  - [Security](#security)
- [Requirements](#requirements)
- [Usage](#usage)
  - [Environment variables](#environment-variables)
  - [Setting up the DHT](#setting-up-the-dht)
  - [Server](#server)
  - [Client](#client)
  - [Errors](#errors)
  - [Development](#development)
    - [Linting](#linting)
    - [Unit test](#unit-test)
- [Known issues](#known-issues)
- [License](#license)

## Presentation

A simplified P2P distributed crypto exchange using Bitfinex's [Grenache](https://github.com/bitfinexcom/grenache) for communication between nodes.

## Installation

`npm ci`

## Technical information

### Stack

- Language: JavaScript ES6/ES7
- Node.js >= 20.11.0

### Code quality

Code style follows [Airbnb JavaScript Best Practices](https://github.com/airbnb/javascript) using ESLint.

### Tests

None.

### Security

- [Code security](https://docs.npmjs.com/packages-and-modules/securing-your-code) and most precisely module dependencies can be audited running `npm audit`.

## Requirements

- See [Stack](#stack)

## Usage

### Environment variables

None.

### Setting up the DHT

```shell
# start two Grapes and connect them to each other
npm run start:dht

# stop dht
npm run stop:dht
```

### Server

```shell
# The server announces its crypto exchange service and waits for any order from clients
npm run start:crypto-exchange
```

### Client

```shell
# link bin file client.js (see package.json in bin)
sudo npm link

# place an order on the exchange
crypto-exchange place-order --side "buy" --pair "btc/usdt" --price "42000" --amount "1"

# get the orderbook
crypto-exchange get-orderbook
crypto-exchange get-orderbook --pair "btc/usdt"
```

### Errors

None.

### Development

#### Linting

`npm run lint` or `npm run lint:fix`

#### Unit test

`npm test`

## Known issues

/

## License

[Copyright (C) 2024 Bitfinex](LICENSE.md).
