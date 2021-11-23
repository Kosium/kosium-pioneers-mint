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
    bool public presaleIsActive = false;

    uint256 public maxPioneerPurchase = 5;
    uint256 public maxPioneerPurchasePresale = 2;
    uint256 public constant pioneerPrice = 60000000000000000; //0.06 ETH

    uint256 public MAX_PIONEERS;
    uint256 public MAX_PRESALE_PIONEERS = 2000;
    uint256 public PIONEERS_RESERVED = 1000;

    uint256 public numReserved = 0;

    mapping(address => bool) public whitelistedPresaleAddresses;
    mapping(address => uint256) public presaleBoughtCounts;

    constructor(
            uint256 maxNftSupply
        )
        ERC721Tradable("Kosium Pioneer", "KPR")
    {
        MAX_PIONEERS = maxNftSupply;
    }

    modifier userOnly{
        require(tx.origin==msg.sender,"Only a user may call this function");
        _;
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    /**
     * Mints numToMint tokens to an address
    */
    function mintTo(address _to, uint numToMint) external onlyOwner {
        require(numReserved + numToMint <= PIONEERS_RESERVED, "Reserving would exceed max number of Pioneers to reserve");
        require(totalSupply().add(numToMint) <= MAX_PIONEERS, "Reserving would exceed max number of Pioneers to reserve");
        
        for (uint i = 0; i < numToMint; i++) {
            uint mintIndex = totalSupply();
            _safeMint(_to, mintIndex);
            ++numReserved;
        }
    }

    /**
     * Set some Kosium Pioneers aside
    */
    function reservePioneers(uint numberToReserve) external onlyOwner { 
        require(numReserved + numberToReserve <= PIONEERS_RESERVED, "Reserving would exceed max number of Pioneers to reserve");
        require(totalSupply().add(numberToReserve) <= MAX_PIONEERS, "Reserving would exceed max number of Pioneers to reserve");

        for (uint i = 0; i < numberToReserve; i++) {
            uint mintIndex = totalSupply();
            _safeMint(msg.sender, mintIndex);
            ++numReserved;
        }
    }

    /*
    * Pause sale if active, make active if paused
    */
    function flipSaleState() external onlyOwner {
        saleIsActive = !saleIsActive;
    }

    /*
    * Pause presale if active, make active if paused
    */
    function flipPresaleState() external onlyOwner {
        presaleIsActive = !presaleIsActive;
    }
    
    /**
    * Mints Kosium Pioneers that have already been bought through pledge
    */
    function mintPioneer(uint numberOfTokens) external payable userOnly {
        require(saleIsActive, "Sale must be active to mint Pioneer");
        require(numberOfTokens <= maxPioneerPurchase, "Can't mint that many tokens at a time");
        require(totalSupply().add(numberOfTokens) <= MAX_PIONEERS - PIONEERS_RESERVED + numReserved, "Purchase would exceed max supply of Pioneers");
        require(pioneerPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            _safeMint(msg.sender, mintIndex);
        } 
    }

    /**
    * Mints Kosium Pioneers for presale
    */
    function mintPresalePioneer(uint numberOfTokens) external payable userOnly {
        require(presaleIsActive, "Presale must be active to mint Pioneer");
        require(whitelistedPresaleAddresses[msg.sender], "Sender address must be whitelisted for presale minting");
        require(numberOfTokens + presaleBoughtCounts[msg.sender] <= maxPioneerPurchasePresale, "Each whitelisted address can only mint maxPioneerPurchasePresale Pioneers in the presale.");
        uint newSupplyTotal = totalSupply().add(numberOfTokens);
        require(newSupplyTotal <= MAX_PRESALE_PIONEERS + numReserved, "Purchase would exceed max supply of Presale Pioneers");
        require(newSupplyTotal <= MAX_PIONEERS - PIONEERS_RESERVED + numReserved, "Purchase would exceed max supply of Pioneers");
        require(pioneerPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            _safeMint(msg.sender, mintIndex);
            ++presaleBoughtCounts[msg.sender];
        }
    }

    /*
    * Whitelist a user for the presale
    */
    function whitelistAddressForPresale(address[] calldata earlyAdopterAddresses) external onlyOwner{
        for (uint i = 0; i < earlyAdopterAddresses.length; i++){
            whitelistedPresaleAddresses[earlyAdopterAddresses[i]] = true;
        }
    }

    /*
    * Whitelist a user for the presale
    */
    function removeFromWhitelist(address[] calldata earlyAdopterAddresses) external onlyOwner{
        for (uint i = 0; i < earlyAdopterAddresses.length; i++){
            whitelistedPresaleAddresses[earlyAdopterAddresses[i]] = false;
        }
    }

    /*
    * Change the max presale limit
    */
    function setPresaleLimit(uint maxToPresale) public onlyOwner{
        if (maxToPresale > 0){
            MAX_PRESALE_PIONEERS = maxToPresale;
        }
    }

    /*
    * Change the reserved number of Pioneers
    */
    function setReserveLimit(uint reservedLimit) public onlyOwner{
        if (reservedLimit > 0){
            PIONEERS_RESERVED = reservedLimit;
        }
    }

    /*
    * Change the max number of pioneers each account can purchase at a time in the open sale
    */
    function setPurchaseLimit(uint purchaseLimit) public onlyOwner{
        maxPioneerPurchase = purchaseLimit;
    }

    /*
    * Change the max number of pioneers each account can purchase at a time in the presale
    */
    function setPurchaseLimitPresale(uint purchaseLimit) public onlyOwner{
        maxPioneerPurchasePresale = purchaseLimit;
    }
}
