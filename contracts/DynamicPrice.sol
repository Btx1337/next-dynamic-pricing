// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DynamicPriceToken is ERC721, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OFFERER_ROLE = keccak256("OFFERER_ROLE");
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("DynamicPriceToken", "DPT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(OFFERER_ROLE, msg.sender);
        safedPriceCalc = false;
        
    }

    event NewNFTMinted(address sender, uint256 tokenId);

    // create Offering Struct
    // create mapping for Offerings

    // State variables
    uint256 public startTime;
    uint256 public maxSupply;
    uint256 public maxSupply2;
    uint256 public offeringPrice;
    uint256 public durationTime;
    bool offeringInitiated = false;
    uint256 public supplyPerUnit;

    uint256 public currentTime;
    uint256 public plannedSale;

    uint256 public safedPrice;
    bool public safedPriceCalc;

    uint256 private tokenCounter;
    uint256 public tokenCounter2;
    uint256 public priceKoefficient;
    uint256 public dynamicPrice;

    // Events
    // event initOffering();
    // event safePrice();

    function initOffering(uint256 _maxSupply, uint256 _offeringPrice, uint256 _durationTime) public returns(uint256, uint256, uint256, bool){
        startTime = block.timestamp;
        maxSupply2 = _maxSupply**18;
        maxSupply = maxSupply2;
        offeringPrice = _offeringPrice;
        durationTime = _durationTime;
        offeringInitiated = true;

        supplyPerUnit = maxSupply / durationTime;  // Calculate Supply per Time Unit -> Traditional without dynamic pricing
        // emit event
    return (supplyPerUnit, offeringPrice, startTime, offeringInitiated);
    }

// Not Needed
    function calculateSale() public returns(uint256, uint256) {
        currentTime = block.timestamp - startTime;
        plannedSale = supplyPerUnit * currentTime;
        return (currentTime, plannedSale);
    }

// Works
    function getLastPrice() public view returns (uint256) {
        uint256 _currentTime = block.timestamp - startTime;
        uint256 _plannedSale = supplyPerUnit * _currentTime;
        uint256 currentDynamicPriceKoefficient = _tokenIdCounter._value * 1 ether / _plannedSale;
        uint256 currentDynamicPrice = currentDynamicPriceKoefficient * offeringPrice;
        // emit event
        return currentDynamicPrice;
    }


// Probably not needed
    function calculateDynamicPrice() public returns(uint256, uint256) {
       calculateSale();

       tokenCounter = _tokenIdCounter._value;
       tokenCounter2 = tokenCounter * 1 ether;
       priceKoefficient = tokenCounter2 * 1 ether / plannedSale;
       dynamicPrice = priceKoefficient * offeringPrice;
       // Cap at minumum price loss of 20 % 


        return (tokenCounter2, priceKoefficient);

        // freeze dynamic price value for 10 seconds -> set dynamicprice calculated = true -> After 10s dynamicPrice Calculated = false -> Start Counter in Frontend
    }

// called by enduser to safe price -> _currentDynamicPrice has to come from frontend -> Output of eventcall
    function safeYourPrice(uint256 _currentDynamicPrice) public returns(uint256) {
        require(_currentDynamicPrice != 0, 'No Price set');
        safedPrice = _currentDynamicPrice;
        safedPriceCalc = true;
        // emit event
        return safedPrice;
    }


    function safeMint(address to) public payable onlyRole(MINTER_ROLE) {
        // require dynamicPrice calculated = true
        require (safedPriceCalc == true, 'no price safed');
        require (msg.value >= safedPrice, 'value below safed price');
        require(totalSupply() < maxSupply, 'total supply exceeded, no more tokens available');
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        safedPriceCalc = false;

        emit NewNFTMinted(msg.sender, tokenId);
        // set dynamicPrice Calculated = false;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
