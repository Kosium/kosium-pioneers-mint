// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OwnableDelegateProxy721 {}

contract ProxyRegistry721 {
    mapping(address => OwnableDelegateProxy721) public proxies;
}

/**
 * @title ERC721Tradable
 * ERC721Tradable - ERC721 contract that implements some basic ERC721 functionality.
 */
abstract contract ERC721Tradable is ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    address proxyRegistryAddress;

    string public baseURI;

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseTokenURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return string(abi.encodePacked(_baseURI(), Strings.toString(tokenId)));
    }
}
