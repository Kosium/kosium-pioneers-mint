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

    uint256 public maxPioneerPurchase = 2;
    uint256 public MAX_PIONEERS;
    uint256 public constant pioneerPrice = 60000000000000000; //0.06 ETH

    bool public presaleIsActive = false;
    uint256 public MAX_PRESALE_PIONEERS = 2100;
    uint256 public PIONEERS_RESERVED = 1000;

    uint256 public numReserved = 0;

    mapping(address => bool) public whitelistedPresaleAddresses;

    mapping(address => uint256) public presaleBoughtCounts;

    mapping(address => uint256) public accountPledges;
    mapping(address => uint256) public accountPledgesBought;
    uint256 public numPledged = 0;

    constructor(
            uint256 maxNftSupply,
            address _imx
        )
        ERC721Tradable("Kosium Pioneer", "KPR", _imx)
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
     * Set some Kosium Pioneers aside
     */
    function reservePioneers(uint numberToReserve) external onlyOwner {        
        uint supply = totalSupply();
        require(supply + numberToReserve <= MAX_PIONEERS, "Reserving would exceed max supply of Pioneers");
        uint i;
        for (i = 0; i < numberToReserve; i++) {
            _safeMint(msg.sender, supply + i);
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

    /*
    * Pledge so that account can mint later when gas is lower
    */
    function pledge(uint numberOfTokens) external payable userOnly {
        require(saleIsActive, "Sale must be active to pledge eth for Pioneer");
        require(numberOfTokens + accountPledges[msg.sender] <= maxPioneerPurchase, "Can only mint maxPioneerPurchase tokens per wallet address");
        require(totalSupply().add(numberOfTokens) <= MAX_PIONEERS - PIONEERS_RESERVED + numReserved - numPledged, "Purchase would exceed max supply of Pioneers");
        require(pioneerPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");
        accountPledges[msg.sender] += numberOfTokens;
        numPledged += numberOfTokens;
    }
    
    /**
    * Mints Kosium Pioneers that have already been bought through pledge
    */
    function mintPioneer(uint numberOfTokens) external userOnly {
        require(saleIsActive, "Sale must be active to mint Pioneer");//
        require(numberOfTokens + accountPledgesBought[msg.sender] <= accountPledges[msg.sender], "Cannot mint more tokens than pledged");
        require(totalSupply() <= MAX_PIONEERS - PIONEERS_RESERVED + numReserved - numPledged, "Purchase would exceed max supply of Pioneers");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < MAX_PIONEERS) {
                _safeMint(msg.sender, mintIndex);
                ++accountPledgesBought[msg.sender];
                --numPledged;
            }
        } 
    }

     /**
    * Mints Kosium Pioneers for presale
    */
    function mintPresalePioneer(uint numberOfTokens) external payable userOnly {
        require(presaleIsActive, "Presale must be active to mint Pioneer");
        require(whitelistedPresaleAddresses[msg.sender], "Sender address must be whitelisted for presale minting");
        require(numberOfTokens + presaleBoughtCounts[msg.sender] <= maxPioneerPurchase, "Each whitelisted address can only mint maxPioneerPurchase Pioneers in the presale.");
        uint newSupplyTotal = totalSupply().add(numberOfTokens);
        require(newSupplyTotal <= MAX_PRESALE_PIONEERS + numReserved - numPledged, "Purchase would exceed max supply of Presale Pioneers");
        require(newSupplyTotal <= MAX_PIONEERS, "Purchase would exceed max supply of Pioneers");
        require(pioneerPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            presaleBoughtCounts[msg.sender] += numberOfTokens;
            if (totalSupply() < MAX_PIONEERS && totalSupply() < MAX_PRESALE_PIONEERS + numReserved) {
                _safeMint(msg.sender, mintIndex);
            }
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
        MAX_PRESALE_PIONEERS = maxToPresale;
    }

    /*
    * Change the max number of pioneers each account can purchase
    */
    function setPurchaseLimit(uint purchaseLimit) public onlyOwner{
        maxPioneerPurchase = purchaseLimit;
    }
}
