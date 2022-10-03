//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NftForYou.sol";

interface nftInterface {
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);

    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract NFTMarketplace is Ownable {
    NftForYou private nftForYou;

    constructor() {
        nftForYou = new NftForYou();
    }

    uint256 private listedIds;
    uint256 private minPrice = 0.001 ether;
    uint256 private royaltyRate = 10;
    uint256 private commisionRate = 1;

    event ListedSuccess(EmitInfo emitInfo);

    event SaledSuccess(EmitInfo emitInfo);

    struct EmitInfo {
        uint256 listedIds;
        ListedToken listedToken;
        uint256 timeStamp;
    }

    struct ListedToken {
        address nftAddress;
        uint256 tokenId;
        address originOwner;
        address currentOwner;
        uint256 price;
        bool isListed;
    }
    mapping(uint256 => ListedToken) private listedIdToListedToken;
    mapping(address => uint256) private fundsBalanceOfUser;

    modifier biggerThanMinPrice(uint256 _price) {
        require(_price >= minPrice, "Price should more than 0.001 ether!");
        _;
    }

    function createFromInside(string memory tokenURI, uint256 _price)
        public
        biggerThanMinPrice(_price)
    {
        uint256 tokenId = nftForYou.mint(tokenURI, msg.sender);
        createListedToken(address(nftForYou), tokenId, msg.sender, _price);
    }

    function createFromOutside(
        address nftAddress,
        uint256 tokenId,
        uint256 _price
    ) public biggerThanMinPrice(_price) {
        nftInterface nftContract = nftInterface(nftAddress);
        require(
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Please set approval for this address before"
        );
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        address _originOwner = nftAddress == address(nftForYou)
            ? nftForYou.get_originOwner(tokenId)
            : msg.sender;

        createListedToken(nftAddress, tokenId, _originOwner, _price);
    }

    function createListedToken(
        address nftAddress,
        uint256 tokenId,
        address _originOwner,
        uint256 _price
    ) private {
        listedIdToListedToken[listedIds] = ListedToken(
            nftAddress,
            tokenId,
            _originOwner,
            msg.sender,
            _price,
            true
        );

        EmitInfo memory emitInfo = EmitInfo(
            listedIds,
            listedIdToListedToken[listedIds],
            block.timestamp
        );
        emit ListedSuccess(emitInfo);
        listedIds++;
    }

    modifier isNftOwner(uint256 listedId) {
        require(
            msg.sender == listedIdToListedToken[listedId].currentOwner,
            "Can't operate other's NFT!"
        );
        _;
    }

    function setPriceAndList(uint256 listedId, uint256 _price)
        public
        isNftOwner(listedId)
    {
        ListedToken storage listedToken = listedIdToListedToken[listedId];
        listedToken.price = _price;
        listedToken.isListed = true;
    }

    function deList(uint256 listedId) public isNftOwner(listedId) {
        listedIdToListedToken[listedId].isListed = false;
    }

    function executeSale(uint256 listedId) public payable {
        ListedToken storage listedToken = listedIdToListedToken[listedId];
        address pre_owner = listedToken.currentOwner;
        require(msg.sender != pre_owner, "You are buying your NFT!");
        require(listedToken.isListed == true, "Sold out!");

        uint256 _price = listedToken.price;
        uint256 fundsOfBuyer = fundsBalanceOfUser[msg.sender] + msg.value;
        require(fundsOfBuyer >= _price, "No enough funds to buy!");
        fundsBalanceOfUser[msg.sender] = (fundsOfBuyer - _price);
        address _originOwner = listedToken.originOwner;

        uint256 commision = (_price / 100) * commisionRate;
        uint256 seller_get = _price - commision;
        if (_originOwner != pre_owner) {
            uint256 royalty = (_price / 100) * royaltyRate;
            fundsBalanceOfUser[_originOwner] += royalty;
            seller_get -= royalty;
        }

        fundsBalanceOfUser[pre_owner] += seller_get;
        fundsBalanceOfUser[owner()] += commision;
        listedToken.currentOwner = msg.sender;
        listedToken.isListed = false;

        EmitInfo memory emitInfo = EmitInfo(
            listedId,
            listedToken,
            block.timestamp
        );
        emit SaledSuccess(emitInfo);
    }

    function withdraw_nft(uint256 listedId) public isNftOwner(listedId) {
        ListedToken storage listedToken = listedIdToListedToken[listedId];
        nftInterface nftContract = nftInterface(listedToken.nftAddress);
        nftContract.transferFrom(
            address(this),
            msg.sender,
            listedToken.tokenId
        );
        listedIds--;
        if (listedId != listedIds) {
            listedIdToListedToken[listedId] = listedIdToListedToken[listedIds];
        }
        delete listedIdToListedToken[listedIds];
    }

    function withdraw_funds() public {
        uint256 transAmount = fundsBalanceOfUser[msg.sender];
        require(transAmount > 0, "No balance can be withdrawn.");
        fundsBalanceOfUser[msg.sender] = 0;
        payable(msg.sender).transfer(transAmount);
    }

    // --------------------------------getter--------------------------------------- //
    struct IlistedToken {
        ListedToken listedToken;
        string tokenURI;
    }

    function getAllNFTs() public view returns (IlistedToken[] memory) {
        IlistedToken[] memory ilistedTokens = new IlistedToken[](listedIds);
        ListedToken memory listedToken;
        string memory tokenURI;
        nftInterface nftContract;
        for (uint256 i = 0; i < listedIds; i++) {
            listedToken = listedIdToListedToken[i];
            nftContract = nftInterface(listedToken.nftAddress);
            tokenURI = nftContract.tokenURI(listedToken.tokenId);
            ilistedTokens[i] = IlistedToken(listedToken, tokenURI);
        }
        return ilistedTokens;
    }

    function getAddressOfNFU() public view returns (address) {
        return address(nftForYou);
    }

    function getListedIds() public view returns (uint256) {
        return listedIds;
    }

    function getMinPrice() public view returns (uint256) {
        return minPrice;
    }

    function getRoyaltyRate() public view returns (uint256) {
        return royaltyRate;
    }

    function getCommisionRate() public view returns (uint256) {
        return commisionRate;
    }

    function getListedToken(uint256 listedId)
        public
        view
        returns (ListedToken memory)
    {
        return listedIdToListedToken[listedId];
    }

    function getFundsBalanceOfUser(address _user)
        public
        view
        returns (uint256)
    {
        return fundsBalanceOfUser[_user];
    }
}
