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


    constructor(
            address _proxyRegistryAddress,
            uint256 maxNftSupply
        )
        ERC721Tradable("Kosium Pioneer", "KPR", _proxyRegistryAddress)
    {
        MAX_PIONEERS = maxNftSupply;
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
    
    /**
    * Mints Kosium Pioneers
    */
    function mintPioneer(uint numberOfTokens) public payable {
        require(saleIsActive, "Sale must be active to mint Pioneer");
        require(numberOfTokens <= maxPioneerPurchase, "Can only mint 20 tokens at a time");
        require(totalSupply().add(numberOfTokens) <= MAX_PIONEERS, "Purchase would exceed max supply of Pioneers");
        require(pioneerPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < MAX_PIONEERS) {
                _safeMint(msg.sender, mintIndex);
            }
        }

        // If we haven't set the starting index and this is either 1) the last saleable token or 2) the first token to be sold after
        // the end of pre-sale, set the starting index block
        // if (startingIndexBlock == 0 && (totalSupply() == MAX_APES || block.timestamp >= REVEAL_TIMESTAMP)) {
        //     startingIndexBlock = block.number;
        // } 
    }
}
