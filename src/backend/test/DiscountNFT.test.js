const { ethers } = require('hardhat');
const { expect } = require('chai');



describe("Discount NFTs", () => {

	beforeEach(async () => {
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		client = accounts[1]
	})


	describe('Creation of NFTs', () => {
		
		beforeEach(async () => {
			accounts = await ethers.getSigners()
			deployer = accounts[0]
			client = accounts[1]
			
		})

		describe("Success", () => {

			beforeEach(async () => {
				const DiscountNFT = await ethers.getContractFactory('DiscountNFT')
				discountNFT = await DiscountNFT.deploy("chelsea", "CHP", 10, 2)
				result = await discountNFT.connect(deployer).mintNFT()
				result = await result.wait()

			})

			it('has the correct discount amount', async () => {
				expect(await discountNFT.discount()).to.equal(10)
			})
			it('has the correct name', async () => {
				expect(await discountNFT.name()).to.equal("chelsea")
			})
			it('has the correct symbol', async () => {
				expect(await discountNFT.symbol()).to.equal("CHP")
			})
			it('has the correct royalty fee', async () => {
				expect(await discountNFT.royaltyFee()).to.equal(2)
			})
			it('emits a DiscountNFTMinted event', async () => {
		
				const event = result.events[1]
				expect(event.event).to.equal('DiscountNFTMinted')
				const args = event.args
				expect(args.tokenId).to.equal(0)
			})

		})

		describe('Failure', () => {
			let invalidAmount = 0

			beforeEach(async () => {
				const DiscountNFT = await ethers.getContractFactory('DiscountNFT')
			})
			
			it('rejects invalid fee amounts for contract creation', async () => {
				const DiscountNFT = await ethers.getContractFactory('DiscountNFT')
				expect(DiscountNFT.deploy("chelsea", "CHP", 0, 2)).to.be.reverted
			})

			it('rejects invalid royalty amounts for contract creation', async () => {
				const DiscountNFT = await ethers.getContractFactory('DiscountNFT')
				await expect(DiscountNFT.deploy("chelsea", "CHP", 2, 0)).to.be.reverted
			})

		})

	})

	describe('Reading NFT information', () => {

		beforeEach(async () => {
			const DiscountNFT = await ethers.getContractFactory('DiscountNFT')
			discountNFT = await DiscountNFT.deploy("chelsea", "CHP", 10, 2)
		})

		it('returns the correct discount amount', async () => {
			expect(await discountNFT.discount()).to.equal(10)
		})

		it('returns the correct royalty fee amount', async () => {
			expect(await discountNFT.royaltyFee()).to.equal(2)
		})

		it('mints NFTs with different token addresses', async () => {
			transaction = await discountNFT.connect(client).mintNFT()
			result = await transaction.wait()

			expect(await discountNFT.balanceOf(client.address)).to.equal(1)
		})

		it('returns the number of tokens', async () => {
			const first = await discountNFT.mintNFT()
			const second = await discountNFT.mintNFT()
			const third = await discountNFT.mintNFT()
			const fourth = await discountNFT.mintNFT()
			expect(await discountNFT.getTokenCounter()).to.equal(4)
		})

		it('returns the creator address', async () => {
			expect(await discountNFT.royaltyOwner()).to.equal('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
		})


	})

	describe('Sending Tokens', () => {
		beforeEach(async () => {
			const DiscountNFT = await ethers.getContractFactory('DiscountNFT')
			discountNFT = await DiscountNFT.deploy("chelsea", "CHP", 10, 2)
			discountNFT.mintNFT()
		})

		it('sends the tokens correctly', async () => {
			const transaction = await discountNFT.connect(deployer).transferNFT(deployer.address, client.address, 0)
			result = await transaction.wait()
			expect(await discountNFT.balanceOf(deployer.address)).to.equal(0)
			expect(await discountNFT.balanceOf(client.address)).to.equal(1)
		})

		it('requires ownership to send tokens', async () => {
			await expect(discountNFT.connect(client).transferNFT(client.address, deployer.address, 0)).to.be.reverted
		})
	})
	
})
