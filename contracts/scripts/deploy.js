const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying Rainmaker Arena contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy RainmakerArena contract
  console.log("\n🚀 Deploying RainmakerArena contract...");
  const RainmakerArena = await ethers.getContractFactory("RainmakerArena");
  
  // Price oracle address (can be updated later)
  const priceOracle = deployer.address; // Use deployer as initial oracle
  
  const rainmakerArena = await RainmakerArena.deploy(priceOracle);
  await rainmakerArena.deployed();
  
  console.log("✅ RainmakerArena deployed to:", rainmakerArena.address);
  console.log("   Price Oracle:", priceOracle);
  
  // Deploy RainmakerNFT contract
  console.log("\n🎨 Deploying RainmakerNFT contract...");
  const RainmakerNFT = await ethers.getContractFactory("RainmakerNFT");
  const rainmakerNFT = await RainmakerNFT.deploy();
  await rainmakerNFT.deployed();
  
  console.log("✅ RainmakerNFT deployed to:", rainmakerNFT.address);
  
  // Get deployment information
  const network = await ethers.provider.getNetwork();
  
  console.log("\n📋 Deployment Summary:");
  console.log("======================");
  console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("Deployer:", deployer.address);
  console.log("RainmakerArena:", rainmakerArena.address);
  console.log("RainmakerNFT:", rainmakerNFT.address);
  
  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    contracts: {
      RainmakerArena: rainmakerArena.address,
      RainmakerNFT: rainmakerNFT.address
    },
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Deployment info saved to deployment.json");
  
  // Display contract verification commands
  if (network.chainId === 8453 || network.chainId === 84532) {
    console.log("\n🔍 To verify contracts on Basescan, run:");
    console.log(`npx hardhat verify --network ${network.name} ${rainmakerArena.address} "${priceOracle}"`);
    console.log(`npx hardhat verify --network ${network.name} ${rainmakerNFT.address}`);
  }
  
  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  try {
    // Test RainmakerArena
    const stats = await rainmakerArena.getContractStats();
    console.log("✅ RainmakerArena stats:", {
      totalRounds: stats._totalRounds.toString(),
      totalVolume: stats._totalVolume.toString(),
      currentRound: stats._currentRound.toString(),
      balance: stats.contractBalance.toString()
    });
    
    // Test RainmakerNFT
    const categories = await rainmakerNFT.getCategories();
    const rarities = await rainmakerNFT.getRarities();
    console.log("✅ RainmakerNFT initialized with:");
    console.log("   Categories:", categories);
    console.log("   Rarities:", rarities);
    
    const marketplaceStats = await rainmakerNFT.getMarketplaceStats();
    console.log("✅ NFT Marketplace stats:", {
      totalNFTs: marketplaceStats.totalNFTs.toString(),
      listedNFTs: marketplaceStats.listedNFTs.toString(),
      totalVolume: marketplaceStats._totalVolume.toString(),
      totalSales: marketplaceStats._totalSales.toString()
    });
    
  } catch (error) {
    console.log("⚠️ Error testing contracts:", error.message);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your frontend with the new contract addresses");
  console.log("2. Verify contracts on Basescan if deploying to mainnet/testnet");
  console.log("3. Set up price oracle integration");
  console.log("4. Configure automatic round creation");
  console.log("5. Fund the contracts for initial operations");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
