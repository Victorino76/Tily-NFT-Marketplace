const { ethers } = require('hardhat');
const { assert, expect } = require('chai');

describe('Exchange', ()=> {

	let deployer, feeAccount, exchange

	const feePercent = 10

	beforeEach(async ()=> {
		const DiscountNFTMarketplace = await ethers.getContractFactory('DiscountNFTMarketplace')
		const DiscountNFT = await ethers.getContractFactory('DiscountNFT')
		
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]
		user2 = accounts[3]
		discountNFT = await DiscountNFT.connect(user1).deploy("chelsea", "CHP", 10, 2)
		discountNFTMarketplace = await DiscountNFTMarketplace.deploy(feeAccount.address, feePercent)
		ROYALTY = discountNFT.royaltyFee()
		CREATOR = discountNFT.royaltyOwner()
	})

	describe('Deployment', async () => {
		it('tracks the fee account', async ()=> {
			expect(await discountNFTMarketplace.feeAccount()).to.equal(feeAccount.address)
			console.log(discountNFT.address)
		})

		it('tracks the fee percent', async () => {
			expect(await discountNFTMarketplace.feePercent()).to.equal(feePercent)
		})
	})

	describe('Creating NFTs', async () => {
		//user1 is the creator here
		it('creates an NFT and sends it to the creators wallet', async () => {
			
			await discountNFT.connect(user1).mintNFT()
			expect(await discountNFT.getTokenCounter()).to.equal(1)
			expect(await discountNFT.balanceOf(user1.address)).to.equal(1)

			await discountNFT.connect(user2).mintNFT()
			expect(await discountNFT.getTokenCounter()).to.equal(2)
			expect(await discountNFT.balanceOf(user2.address)).to.equal(1)

			
		 })
	})

	describe('Listing NFTs', async () => {
		describe('Creating Listings', async () => {
			let TOKEN_ID = 0
			let PRICE = 1

			beforeEach(async () => {
				await discountNFT.connect(user1).mintNFT()
				await discountNFT.connect(user1).mintNFT()
	            await discountNFT.connect(user1).approve(discountNFTMarketplace.address, 0)
			})

			it("emits an event after listing an item", async ()=> {
				expect(await discountNFT.getTokenCounter()).to.equal(2)
				
				const listingItem = await discountNFTMarketplace.connect(user1).listItem(discountNFT.address, TOKEN_ID, PRICE)
	            result = await listingItem.wait()

	            const event = result.events[0]
				expect(event.event).to.equal('ItemListed')

				const args = event.args
				expect(args.seller).to.equal(user1.address)
				expect(args.nftAddress).to.equal(discountNFT.address)
				expect(args.tokenId).to.equal(TOKEN_ID)
				expect(args.price).to.equal(PRICE)
				expect(args.royalty).to.equal(2)
				expect(args.discount).to.equal(10)
	        })

	        it('only lists items that have not been listed', async () => {
	        	const listingItem = await discountNFTMarketplace.connect(user1).listItem(discountNFT.address, TOKEN_ID, PRICE)
	        	await expect(discountNFTMarketplace.connect(user1).listItem(discountNFT.address, TOKEN_ID, PRICE)).to.be.reverted
	        })

	        it('only allows owners to list', async () => {
				await expect(discountNFTMarketplace.connect(user2).listItem(discountNFT.address, TOKEN_ID, PRICE)).to.be.reverted

	        })

	        it('needs approvals to list items', async () => {
	        	expect(await discountNFT.balanceOf(user1.address)).to.equal(2)
	        	await expect(discountNFTMarketplace.connect(user1).listItem(discountNFT.address, 1, PRICE)).to.be.reverted
	        })

	        it('updates listings with new price', async () => {
	        	await discountNFTMarketplace.connect(user1).listItem(discountNFT.address, TOKEN_ID, PRICE)

	        	const listing = await discountNFTMarketplace.getListing(discountNFT.address, TOKEN_ID)
	        	expect(await listing.price.toString()).to.equal(PRICE.toString())
	        })
		})
	})
	

		describe('Canceling Listings', async () => {
			it('reverts if there is no listing', async () => {
				await discountNFT.connect(user1).mintNFT()
				await expect(discountNFTMarketplace.connect(user1).cancelListing(discountNFT.address, 0)).to.be.reverted
			})

			it('reverts if someone other than the owner tries to cancel', async () => {
				await discountNFT.connect(user1).mintNFT()
			await expect(discountNFTMarketplace.connect(user2).cancelListing(discountNFT.address, 0)).to.be.revertedWith("NotOwner")
			})

			it('emits an event and removes the listing', async () => {
				await discountNFT.connect(user1).mintNFT()
				await discountNFT.connect(user1).approve(discountNFTMarketplace.address, 0)
				await discountNFTMarketplace.connect(user1).listItem(discountNFT.address, 0, 1)
				const thing = await discountNFTMarketplace.connect(user1).cancelListing(discountNFT.address, 0)
				result = await thing.wait()

				const event = result.events[0]
				expect(event.event).to.equal('ItemCanceled')

				const args = event.args
				expect(args.seller).to.equal(user1.address)
				expect(args.nftAddress).to.equal(discountNFT.address)
				expect(args.tokenId).to.equal(0)

				const listing = await discountNFTMarketplace.getListing(discountNFT.address, 0)

				expect(await listing.price.toString()).to.equal("0")
			})
		})





		describe('Updating Listings', async () => {
			it('must be owner and listed to update', async () => {
				await expect(discountNFTMarketplace.connect(user1).updateListing(discountNFT.address, 0, 10)).to.be.revertedWith("NotListed")
			

				await discountNFT.connect(user2).mintNFT()
				await discountNFT.connect(user2).approve(discountNFTMarketplace.address, 0)
				await discountNFTMarketplace.connect(user2).listItem(discountNFT.address, 0, 10)

				await expect(discountNFTMarketplace.connect(user1).updateListing(discountNFT.address, 0, 11)).to.be.revertedWith("NotOwner")

			})

			it('updates the price of the item', async () => {
				await discountNFT.connect(user2).mintNFT()
				await discountNFT.connect(user2).approve(discountNFTMarketplace.address, 0)
				await discountNFTMarketplace.connect(user2).listItem(discountNFT.address, 0, 10)

				await discountNFTMarketplace.connect(user2).updateListing(discountNFT.address, 0, 11)
				const t = await discountNFTMarketplace.getListing(discountNFT.address, 0)
				expect(t.price.toString()).to.equal('11')
			})
		})

	

	describe('Buying NFTs', async () => {


		const PRICE = ethers.utils.parseEther("5")
		it('reverts if the item is not listed', async () => {

			await expect(discountNFTMarketplace.connect(user2).buyItem(discountNFT.address, 0)).to.be.revertedWith("NotListed")

		})

		it('reverts if the price is not met', async () => {
			await discountNFT.connect(user1).mintNFT()
			await discountNFT.connect(user1).approve(discountNFTMarketplace.address, 0)
			await discountNFTMarketplace.connect(user1).listItem(discountNFT.address, 0, PRICE)
			await (discountNFTMarketplace.connect(user2).buyItem(discountNFT.address, 0, { value: PRICE }))
		})

		it('transfers the nft to the buyer and updates internal proceeds record', async () => {

			
			
			await discountNFT.connect(user1).mintNFT()
			await discountNFT.connect(user1).approve(discountNFTMarketplace.address, 0)
			await discountNFTMarketplace.connect(user1).listItem(discountNFT.address, 0, PRICE)
			const t = await discountNFTMarketplace.connect(user2).buyItem(discountNFT.address, 0, { value: PRICE})
			await discountNFTMarketplace.connect(user1).withdrawProceeds();
			await discountNFTMarketplace.connect(feeAccount).withdrawProceeds()
			
			
			
			result = await t.wait()

			event = result.events[1]
		
			expect(event.event).to.equal("ItemBought")
		})

	})

	describe('Withdrawing Proceeds', async () => {
		it('doesnt allow 0 proceed withdrawals', async () => {
			await expect(discountNFTMarketplace.connect(user2).withdrawProceeds()).to.be.revertedWith('NoProceeds')
		})

		it('withdraws proceeds', async () => {
			await discountNFT.connect(user1).mintNFT()
			await discountNFT.connect(user1).approve(discountNFTMarketplace.address, 0)
			await discountNFTMarketplace.connect(user1).listItem(discountNFT.address, 0, 5)
			await discountNFTMarketplace.connect(user2).buyItem(discountNFT.address, 0, { value: 5})

			// await discountNFTMarketplace.connect(user1).withdrawProceeds()

			// const proceedsBefore = await discountNFTMarketplace.getProceeds(user1.address)
			// const balanceBefore = await user1.getBalance()
			// const tx = await discountNFTMarketplace.connect(user1).withdrawProceeds()
			// const receipt = await tx.wait(1)
			// const { gasUsed, effectiveGasPrice } = receipt
			// const gasCost = gasUsed * effectiveGasPrice
			// const balanceAfter = await user1.getBalance()
			// const left = balanceAfter + gasCost
			// const right = proceedsBefore + balanceBefore
			// console.log(left)
			// console.log(right)

			
		})
	})


	// describe('Lending NFTs', async () => {

	// })
	

})



