// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NftForYou is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => address) tokenIdToOriginOwner;

    constructor() ERC721("NftForYou", "NFU") {}

    function mint(string memory tokenURI, address _originOwner)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(owner(), tokenId);
        _setTokenURI(tokenId, tokenURI);

        tokenIdToOriginOwner[tokenId] = _originOwner;
        return tokenId;
    }

    function get_originOwner(uint256 tokenId) public view returns (address) {
        require(
            tokenId < _tokenIdCounter.current(),
            "No nft for this tokenId."
        );
        return tokenIdToOriginOwner[tokenId];
    }
}
