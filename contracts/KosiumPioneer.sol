// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";

/**
 * @title KosiumPioneer
 * KosiumPioneer - a contract for my non-fungible creatures.
 */
contract KosiumPioneer is ERC721Tradable {
    using SafeMath for uint256;

    bool public saleIsActive = false;

    uint public constant maxPioneerPurchase = 2;
    uint256 public MAX_PIONEERS;
    uint256 public constant pioneerPrice = 80000000000000000; //0.08 ETH

    bool public presaleIsActive = false;
    uint256 public MAX_PRESALE_PIONEERS = 2098;

    mapping(address => bool) public whitelistedPresaleAddresses;

    mapping(address => uint256) public presaleBoughtCounts;

    constructor(
            address _proxyRegistryAddress,
            uint256 maxNftSupply
        )
        ERC721Tradable("Kosium Pioneer", "KPR", _proxyRegistryAddress)
    {
        MAX_PIONEERS = maxNftSupply;
    }

    modifier userOnly{
        require(tx.origin==msg.sender,"Only a user may call this function");
        _;
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        msgSender().transfer(balance);
    }

    /**
     * Set some Kosium Pioneers aside
     */
    function reservePioneers(uint numberToReserve) public onlyOwner {        
        uint supply = totalSupply();
        uint i;
        for (i = 0; i < numberToReserve; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    /*
    * Pause sale if active, make active if paused
    */
    function flipSaleState() public onlyOwner {
        saleIsActive = !saleIsActive;
    }

    /*
    * Pause presale if active, make active if paused
    */
    function flipPresaleState() public onlyOwner {
        presaleIsActive = !presaleIsActive;
    }
    
    /**
    * Mints Kosium Pioneers
    */
    function mintPioneer(uint numberOfTokens) public payable userOnly {
        require(saleIsActive, "Sale must be active to mint Pioneer");
        require(numberOfTokens <= maxPioneerPurchase, "Can only mint 2 tokens at a time");
        require(totalSupply().add(numberOfTokens) <= MAX_PIONEERS, "Purchase would exceed max supply of Pioneers");
        require(pioneerPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < MAX_PIONEERS) {
                _safeMint(msg.sender, mintIndex);
            }
        } 
    }

     /**
    * Mints Kosium Pioneers for presale
    */
    function mintPresalePioneer(uint numberOfTokens) public payable userOnly {
        require(presaleIsActive && whitelistedPresaleAddresses[msgSender()], "Presale must be active to mint Pioneer");
        //check that address won't have more than 2 pioneers after minting
        require(numberOfTokens + presaleBoughtCounts[msgSender()] <= maxPioneerPurchase, "Each whitelisted address can only mint 2 Pioneers in the presale.");
        uint newSupplyTotal = totalSupply().add(numberOfTokens);
        require(newSupplyTotal <= MAX_PRESALE_PIONEERS, "Purchase would exceed max supply of Presale Pioneers");
        require(newSupplyTotal <= MAX_PIONEERS, "Purchase would exceed max supply of Pioneers");
        require(pioneerPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            presaleBoughtCounts[msg.sender] += numberOfTokens;
            if (totalSupply() < MAX_PIONEERS && totalSupply() < MAX_PRESALE_PIONEERS) {
                _safeMint(msg.sender, mintIndex);
            }
        } 
    }

    /*
    * Whitelist a user for the presale
    */
    function whitelistAddressForPresale(address earlyAdopterAddress) public onlyOwner{
        whitelistedPresaleAddresses[earlyAdopterAddress] = true;
    }

    /*
    * Change the max presale limit
    */
    function setPresaleLimit(uint maxToPresale) public onlyOwner{
        MAX_PRESALE_PIONEERS = maxToPresale;
    }
}
