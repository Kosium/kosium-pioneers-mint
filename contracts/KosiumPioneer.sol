// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";

/**
 * @title KosiumPioneer
 * KosiumPioneer - a contract for my non-fungible creatures.
 */
contract KosiumPioneer is ERC721Tradable {
    constructor(address _proxyRegistryAddress)
        ERC721Tradable("Kosium Pioneer", "KPR", _proxyRegistryAddress)
    {}

    function baseTokenURI() override public pure returns (string memory) {
        return "";
    }

    function contractURI() public pure returns (string memory) {
        return "";
    }
}
