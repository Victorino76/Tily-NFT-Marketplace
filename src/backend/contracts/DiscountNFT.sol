// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DiscountNFT is ERC721 {
    uint public discount;
    address public immutable royaltyOwner;
    uint public immutable royaltyFee;
    uint256 private tokenCounter;

    event DiscountNFTMinted(uint256 indexed tokenId);
    constructor(string memory name_, string memory symbol_, uint _discount, uint _royaltyFee) ERC721(name_, symbol_) {
        require(_discount > 0, "Discount must be more than 0");
        require(_royaltyFee > 0, "Royalty fee must be more than 0");
        discount = _discount;
        royaltyFee = _royaltyFee;
        royaltyOwner = msg.sender;
        tokenCounter = 0;

    }

    function mintNFT() public {
        _safeMint(msg.sender, tokenCounter);
        emit DiscountNFTMinted(tokenCounter);
        tokenCounter = tokenCounter + 1;
    }


    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }

    function exists(uint256 tokenId) public view returns(bool) {
        return _exists(tokenId);
    }

    function getName() public view returns(string memory) {
        return name();
    }

    function transferNFT(address _from, address _to, uint256 tokenId) external {
        safeTransferFrom(_from, _to, tokenId);
    }

}




