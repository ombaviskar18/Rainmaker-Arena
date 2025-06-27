# Rainmaker Arena Smart Contracts

Smart contracts for the Rainmaker Arena platform on Base blockchain.

## Contracts

- **RainmakerArena.sol** - Main price prediction game contract
- **RainmakerNFT.sol** - NFT marketplace contract

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp env.template .env
```

3. Fill in your environment variables in `.env`

## Deployment

### Local Testing
```bash
npm run compile
npx hardhat node
npm run deploy
```

### Base Testnet
```bash
npm run deploy:base-sepolia
```

### Base Mainnet
```bash
npm run deploy:base
```

## Verification

After deployment to Base, verify contracts:
```bash
npm run verify
```

Contract addresses will be saved to `deployment.json` after successful deployment. 