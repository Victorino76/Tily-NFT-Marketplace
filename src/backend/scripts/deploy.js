async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  
  // Get the ContractFactories and Signers here.
  const discountNFT = await ethers.getContractFactory("DiscountNFT");
  const discountNFTMarketplace = await ethers.getContractFactory("DiscountNFTMarketplace");
  // deploy contracts
  const discountNFTMarketplaceSettings = await discountNFTMarketplace.deploy("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", 5);
  const discountNFTSettings = await discountNFT.deploy("chelsea", "CHP", 10, 2);
  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(discountNFTMarketplaceSettings , "DiscountNFTMarketplace");
  saveFrontendFiles(discountNFTSettings, "DiscountNFT");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });