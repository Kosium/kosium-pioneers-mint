const Web3 = require('web3');

let web3 = new Web3('ws://localhost:7545');
// console.log(web3);//shows all methods

const KosiumPioneer = artifacts.require(
    "../contracts/KosiumPioneer.sol"
);

const pledgePriceEthTimesOneHundred = 6;

const mintCost = function(numMint){
    return pledgePriceEthTimesOneHundred * 10000000000000000 * numMint;
}

const underMintCost = function(numMint){
    return mintCost(numMint) - 20000000000000000;
}

let numMinted = 0;
let numReserved = 0;

//need to test if MAX_PIONEERS are minted that it stops minting with correct error msg
  
contract("KosiumPioneer", (accounts) => {
    let kosiumPioneer;
    let printError = (e)=>{
        console.log(e.data[Object.keys(e.data)[0]].reason);
    };

    before(async () => {
        kosiumPioneer = await KosiumPioneer.deployed();
    });

    it('should reserve pioneers', async ()=>{
        let numToMint = 1;
        let reserveReturn = await kosiumPioneer.reservePioneers(numToMint, {gas: 5000000});
        numReserved += numToMint;
        numMinted += numToMint;
        assert(reserveReturn.hasOwnProperty('tx'));
        let addrOwner = await kosiumPioneer.ownerOf(0);
        assert.equal(accounts[0], addrOwner);
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
    });

    it('should mint to a different address', async()=>{
        let numToMintTo = 2;
        await kosiumPioneer.mintTo(accounts[1], numToMintTo);
        numMinted += numToMintTo;
        let totalSupply = await kosiumPioneer.totalSupply();
        let addrOwner = await kosiumPioneer.ownerOf(totalSupply - 1);
        assert.equal(accounts[1], addrOwner);
        assert.equal(totalSupply.words[0], numMinted);
    });

    it('should set base uri', async()=>{
        let baseUri = 'ipfs://QmdrX4RFbkmt2uhTA1ETPrQoJqtS1yiXA1qop2j3Mzt64T/';
        await kosiumPioneer.setBaseTokenURI(baseUri);
        let uri0 = await kosiumPioneer.tokenURI(0);
        let correctURI0 = baseUri + '0';
        assert.equal(correctURI0, uri0);
    });

    it('should start the presale', async()=>{
        await kosiumPioneer.whitelistAddressForPresale(accounts);
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.mintPresalePioneer(1);
        }
        catch(e){
            //presale not started
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
        await kosiumPioneer.flipPresaleState();
        let numToMint = 2;
        let successMint = await kosiumPioneer.mintPresalePioneer(numToMint,{value: mintCost(numToMint)});
        numMinted += numToMint;
        assert(successMint.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
    });

    it('should fail to mint more than max amount in presale', async()=>{
        let errHappened = false;
        try{
            await kosiumPioneer.mintPresalePioneer(1,{value: mintCost(1)});
        }
        catch(e){
            //minting too many for presale
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('mint pioneers pure', async()=>{
        await kosiumPioneer.flipSaleState();
        await kosiumPioneer.setReserveLimit(2);
        let numToMint = 1;
        let successMint = await kosiumPioneer.mintPioneer(numToMint, {value: mintCost(numToMint)});
        numMinted += numToMint;
        assert(successMint.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
    });

    it('should remove from whitelist and then fail to mint presale pioneer', async()=>{
        await kosiumPioneer.removeFromWhitelist(accounts);
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.mintPresalePioneer(1);
        }
        catch(e){
            //not whitelisted yet
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should fail to mint more than the max num pioneers per address', async()=>{
        let failed = false;
        try{
            let successMint = await kosiumPioneer.mintPioneer(6);
        }
        catch(e){
            //to many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should withdraw the balance', async()=>{
        let balanceBefore = await web3.eth.getBalance(accounts[0]);//instance.address);
        let txn = await kosiumPioneer.withdraw();
        let balance = await web3.eth.getBalance(accounts[0]);//instance.address);

        let balanceIncrease = balance - balanceBefore;
        let numBought = numMinted - numReserved;
        expect(balanceIncrease).to.be.above(underMintCost(numBought));
    });
    
    it('should reserve more pioneers', async ()=>{
        let numMinting = 1;
        let reserveReturn = await kosiumPioneer.reservePioneers(numMinting, {gas: 5000000});
        numReserved += numMinting;
        numMinted += numMinting;
        assert(reserveReturn.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
        let addrOwner = await kosiumPioneer.ownerOf(numMinted - 1);
        assert.equal(accounts[0], addrOwner);
        let numRes = await kosiumPioneer.numReserved.call();
        assert.equal(numRes.words[0], 2);  
    });

    it('should fail to reserve more pioneers', async()=>{
        let failed = false;
        try{
            let reserveReturn = await kosiumPioneer.reservePioneers(10, {gas: 5000000});
        }
        catch(e){
            //to many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should fail to mint more pioneers in presale', async()=>{
        await kosiumPioneer.whitelistAddressForPresale(accounts);
        let failed = false;
        try{
            let errMsg = await kosiumPioneer.mintPresalePioneer(2, {from: accounts[1]});
        }
        catch(e){
            //to many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });
});
  