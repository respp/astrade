# Dojo intro

This repository contains a (very) simple [Dojo](https://book.dojoengine.org/) game.
The goal is to showcase how Dojo works and ease the developement for on-chain applications and games.

The game is built in two parts:

- `contracts`: The Dojo contracts deployed on Starknet.
- `client`: The client application that interacts with the contracts (and read data using Torii).

## Setup environment

To work with Dojo, install the toolchain using `asdf`:

```bash
curl -L https://raw.githubusercontent.com/dojoengine/dojo/main/dojoup/asdf-install | bash
```

## Deploy contracts

A simple "spawn and move" game letting you generate a character and move them around a board.

To set up your local blockchain environment, change directory to `contracts` and do:

```bash
# (Tab 1) Start the Katana sequencer
katana --config katana.toml

# (Tab 2) Build and deploy the contracts
sozo build && sozo migrate

# (Tab 3) Start the Torii indexer
torii --config torii_dev.toml
```

## Run client

A simple vite project (no React), configured to use `https` (necessary for the [Cartridge controller](https://docs.cartridge.gg/controller/overview)).

Head to the `client` directory and run:

```bash
# Install dependencies
pnpm install

# Run the client locally
pnpm run dev
```

You should be all set to play the game!
Navigate to your browser and start clicking away.

Currently, the best browser to test locally with Controller is Google Chrome.
