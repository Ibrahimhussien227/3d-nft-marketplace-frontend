// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NewNFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemesSold;
    Counters.Counter private _userCount;
    Counters.Counter private _totalTx;

    address payable owner;

    uint256 listingPrice = 0.0015 ether;

    mapping(uint256 => User) public usersList;

    struct User{
        uint256 userId;
        address owner;
        string name;
        string image;
    }

    event userCreated(
        uint256 indexed userId,
        address owner,
        string name,
        string image
    );

    struct Transaction {
        uint256 transactionId;
        uint256 tokenId;
        address owner;
        address seller;
        uint256 cost;
        string metadataURI;
        uint256 timestamp;
    }

    event TransactionCreate (
        uint256 indexed transactionId,
        uint256 tokenId,
        address owner,
        address seller,
        uint256 cost,
        string metadataURI,
        uint256 timestamp
    );

    mapping(uint256 => Transaction) public transactionList;

    // mapping(string => uint8) existingURIs;

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        string name;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        uint256 timestamp;
        address oldSeller;
    }

    event MarketItemCreated (
        uint256 indexed tokenId,
        string name,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        uint256 timestamp,
        address oldSeller
    );

    modifier onlyOwner() {
        require(owner == msg.sender, "Only marketplace owner can update the listing price");
        _;
    }

    constructor() ERC721("3D Market Token", "MY3D") {
        owner = payable(msg.sender);
    }

    function updateListingPrice(uint _listingPrice) public payable onlyOwner {
        listingPrice = _listingPrice;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createUser(string memory _username, string memory _image) public {     
        _userCount.increment();

        uint256 newUserId = _userCount.current();

        usersList[newUserId] = User(newUserId, msg.sender, _username, _image);

        changeItemName(_username);

        emit userCreated(newUserId, msg.sender, _username, _image);
    }

    function getName(address _address) external view returns (string memory name, uint256 userId, string memory image) {
        uint256 user = _userCount.current();

        for(uint256 i = 0; i < user; i++) {
            if(usersList[i + 1].owner == _address) {
                uint256 currentId = i + 1;
            return (usersList[currentId].name, usersList[currentId].userId, usersList[currentId].image);
            }
        }
    }

    function changeName(uint256 userId, string memory _username) public {
        require(usersList[userId].owner == msg.sender, "That's not your account");

        usersList[userId].name = _username;

        changeItemName(_username);
    }

    function changeProfileImage(uint256 userId, string memory _image) public {
        require(usersList[userId].owner == msg.sender, "That's not your account");

        usersList[userId].image = _image;
    }

    function changeItemName(string memory _username) public {
        uint256 itemCount = _tokenIds.current();

        for(uint256 i = 0; i < itemCount; i++) {
            if(idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;

                idToMarketItem[currentId].name = _username;
            }
        }
    }

    function createToken(string memory tokenURI, uint256 price, string memory name) public payable returns (uint) {
        // require(existingURIs[tokenURI] == 0, "This NFT is already minted!");

        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, price, name);

        // existingURIs[tokenURI] = 1;

        return newTokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price, string memory name) private {
        require(price > 0, 'Price must be greater than 1');
        require(msg.value == listingPrice, "Price must be equal to listing price");

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            name,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            block.timestamp,
            msg.sender
        );

        _totalTx.increment();

        uint256 totalTransaction = _totalTx.current();

        transactionList[totalTransaction] = Transaction(
                totalTransaction,
                tokenId,
                msg.sender,
                address(this),
                price,
                tokenURI(tokenId),
                block.timestamp
            );


        _transfer(msg.sender, address(this), tokenId);

        emit TransactionCreate(totalTransaction, tokenId, address(this), msg.sender, price, tokenURI(tokenId), block.timestamp);
        emit MarketItemCreated(tokenId, name, msg.sender, address(this), price, false, block.timestamp, msg.sender);
    }

    function resellToken(uint256 tokenId, uint256 price, string memory _username) public payable {
        require(idToMarketItem[tokenId].owner == msg.sender, "Only item can resell the token");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));
        idToMarketItem[tokenId].oldSeller = msg.sender;
        idToMarketItem[tokenId].name = _username;

        _itemesSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    function createMarketSale(uint256 tokenId) public payable {
        uint256 price = idToMarketItem[tokenId].price;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        require(idToMarketItem[tokenId].seller != msg.sender, "You can not buy your own nft");

        _totalTx.increment();

        uint256 totalTransaction = _totalTx.current();

        transactionList[totalTransaction] = Transaction(
                totalTransaction,
                tokenId,
                msg.sender,
                idToMarketItem[tokenId].seller,
                price,
                tokenURI(tokenId),
                block.timestamp
            );

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));

        _itemesSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        emit TransactionCreate(totalTransaction, tokenId, msg.sender, idToMarketItem[tokenId].seller, price, tokenURI(tokenId), block.timestamp);

        payable(owner).transfer(listingPrice);
        payable(idToMarketItem[tokenId].seller).transfer(msg.value);
    }

    function getTransaction(uint256 tokenId) public view returns (Transaction[] memory) {
        uint256 totalTransaction = _totalTx.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for(uint256 i = 0; i < totalTransaction; i++) {
            if(transactionList[i + 1].tokenId == tokenId) {
                itemCount += 1;
            }
        }

        Transaction[] memory items = new Transaction[](itemCount);

        for(uint256 i = 0; i < totalTransaction; i++) {
            if(transactionList[i + 1].tokenId == tokenId) {
                uint256 currentId = i + 1;

                Transaction storage currentItem = transactionList[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemesSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for(uint256 i = 0; i < itemCount; i++) {
            if(idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyNFTS(address add) public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for(uint256 i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i + 1].owner == add || idToMarketItem[i + 1].seller  == add  || idToMarketItem[i+1].oldSeller == add) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint256 i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i + 1].owner == add || idToMarketItem[i + 1].seller  == add || idToMarketItem[i+1].oldSeller == add) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }
        return items;
    }

        function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for(uint256 i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint256 i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }
        return items;
    }
}
