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

const PIONEERS_RESERVED_LIMIT = process.env.PIONEERS_RESERVED_LIMIT;
const PIONEERS_PRESALE_LIMIT = process.env.PIONEERS_PRESALE_LIMIT;
const MAX_PIONEERS = process.env.MAX_PIONEERS;
const PRESALE_PURCHASE_LIMIT = process.env.PRESALE_PURCHASE_LIMIT;
const PIONEER_PURCHASE_LIMIT = process.env.PIONEER_PURCHASE_LIMIT;

//need to test if MAX_PIONEERS are minted that it stops minting with correct error msg

let printState = async function(kosiumPioneer){
    // let presaleState = await kosiumPioneer.presaleIsActive();
    let reserveLimit = await kosiumPioneer.PIONEERS_RESERVED();
    console.log('reserve limit: ', reserveLimit.words[0]);
    let saleLimit = await kosiumPioneer.MAX_PIONEERS();
    console.log('sale limit: ', saleLimit.words[0]);
    let limit = await kosiumPioneer.MAX_PRESALE_PIONEERS();
    console.log('presale limit: ', limit.words[0]);
    console.log('numMinted counter in test = ', numMinted);
    console.log('numReserved counter in test = ', numReserved);
}
  
contract("KosiumPioneer", (accounts) => {
    let kosiumPioneer;
    let printError = (e)=>{
        console.log(e.data[Object.keys(e.data)[0]].reason);
    };

    before(async () => {
        kosiumPioneer = await KosiumPioneer.deployed();
    });  

    it('should fail to set the purchase limit to a number > the max number of pioneers', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.setPurchaseLimit(MAX_PIONEERS + 1);
        }
        catch(e){
            //presale not started
            console.log('Error thrown correctly. Tried to set purchase limit to a number > the max number of pioneers');
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should fail to set the purchase limit for presale to a number > the max number of pioneers', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.setPurchaseLimitPresale(MAX_PIONEERS + 1);
        }
        catch(e){
            //presale not started
            console.log('Error thrown correctly. Tried to set presale purchase limit to a number > the max number of pioneers');
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should fail to set the presale limit to a number > the max number of pioneers', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.setPresaleLimit(MAX_PIONEERS + 1);
        }
        catch(e){
            //presale not started
            console.log('Error thrown correctly. Tried to set presale limit to a number > the max number of pioneers');
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should fail to set the reserve limit to a number > the max number of pioneers', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.setReserveLimit(MAX_PIONEERS + 1);
        }
        catch(e){
            //presale not started
            console.log('Error thrown correctly. Tried to set reserve limit to a number > the max number of pioneers');
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should set the presale limit', async()=>{
        let setLimitReturn = await kosiumPioneer.setPresaleLimit(PIONEERS_PRESALE_LIMIT);
        //check that it set
        let limit = await kosiumPioneer.MAX_PRESALE_PIONEERS();
        assert.equal(limit.words[0], PIONEERS_PRESALE_LIMIT);
    })
    
    it('should set the reserve limit', async()=>{
        let setLimitReturn = await kosiumPioneer.setReserveLimit(PIONEERS_RESERVED_LIMIT);
        //check that it set
        let limit = await kosiumPioneer.PIONEERS_RESERVED();
        assert.equal(limit.words[0], PIONEERS_RESERVED_LIMIT);
        console.log('RESERVE LIMIT set to ', limit.words[0]);
    }); 
    
    it('should set the purchase limit', async()=>{
        let setLimitReturn = await kosiumPioneer.setPurchaseLimit(PIONEER_PURCHASE_LIMIT);
        //check that it set
        let limit = await kosiumPioneer.maxPioneerPurchase();
        assert.equal(limit.words[0], PIONEER_PURCHASE_LIMIT);
    }); 

    it('should set the purchase limit in the presale', async()=>{
        let limit = PRESALE_PURCHASE_LIMIT;
        let setLimitReturn = await kosiumPioneer.setPurchaseLimitPresale(limit);
        //check that it set
        let limitAfter = await kosiumPioneer.maxPioneerPurchasePresale();
        assert.equal(limitAfter.words[0], limit);
    }); 

    it('should reserve pioneers', async ()=>{
        let numToMint = 1;
        let reserveReturn = await kosiumPioneer.reservePioneers(accounts[0], numToMint, {gas: 5000000});
        numReserved += numToMint;
        numMinted += numToMint;
        assert(reserveReturn.hasOwnProperty('tx'));
        let addrOwner = await kosiumPioneer.ownerOf(0);
        assert.equal(accounts[0], addrOwner);
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
        let numMintedInContract = await kosiumPioneer.numMinted();
        assert.equal(numMintedInContract.words[0], numMinted);
    });

    it('should reserve pioneers to a different address', async()=>{
        let numToMintTo = 2;
        await kosiumPioneer.reservePioneers(accounts[1], numToMintTo);
        numMinted += numToMintTo;
        numReserved += numToMintTo;
        let totalSupply = await kosiumPioneer.totalSupply();
        let addrOwner = await kosiumPioneer.ownerOf(totalSupply - 1);
        assert.equal(accounts[1], addrOwner);
        assert.equal(totalSupply.words[0], numMinted);
        let numMintedInContract = await kosiumPioneer.numMinted();
        assert.equal(numMintedInContract.words[0], numMinted);
    });

    it('should fail to mint before the presale is started', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.mintPresalePioneer(1);
        }
        catch(e){
            //presale not started
            console.log('Error thrown correctly. Trying to mint before presale started');
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should start the presale', async()=>{
        let saleBeforeState = await kosiumPioneer.presaleIsActive();
        assert(!saleBeforeState);
        let flipResult = await kosiumPioneer.flipPresaleState();
        assert(flipResult.hasOwnProperty('tx'));
        let saleAfterState = await kosiumPioneer.presaleIsActive();
        assert(saleAfterState);
    });

    it('should fail to mint if not whitelisted', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.mintPresalePioneer(1);
        }
        catch(e){
            //presale not started
            console.log('Error thrown correctly. Trying to mint from non whitelisted address');
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should whitelist an address for the presale', async()=>{
        //check
        let presaleWhitelist = await kosiumPioneer.whitelistedPresaleAddresses(accounts[0]);
        assert(!presaleWhitelist);
        let wlResult = await kosiumPioneer.whitelistAddressForPresale(accounts);
        //check
        let presaleWhitelistAfter = await kosiumPioneer.whitelistedPresaleAddresses(accounts[0]);
        assert(presaleWhitelistAfter);
    });

    it('should fail to mint in presale if eth sent is not enough', async()=>{
        try{
            let numToTryMinting = 3;
            await kosiumPioneer.mintPresalePioneer(numToTryMinting,{value: underMintCost(numToTryMinting), from: accounts[2]});
        }
        catch(e){
            //to many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should mint in the presale', async()=>{
        let numToMint = 2;
        let successMint = await kosiumPioneer.mintPresalePioneer(numToMint,{value: mintCost(numToMint)});
        numMinted += numToMint;
        assert(successMint.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
        let numMintedInContract = await kosiumPioneer.numMinted();
        assert.equal(numMintedInContract.words[0], numMinted);
    });

    it('should fail to mint more than max pioneers per address in presale', async()=>{
        let failed = false;
        try{
            let numToMint = 2;
            let successMint = await kosiumPioneer.mintPresalePioneer(numToMint,{value: mintCost(numToMint)});
        }
        catch(e){
            //to many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should fail to mint more than max amount in presale', async()=>{
        await printState(kosiumPioneer);
        let errHappened = false;
        try{
            let numToTryMinting = 3;
            await kosiumPioneer.mintPresalePioneer(numToTryMinting,{value: mintCost(numToTryMinting), from: accounts[1]});
        }
        catch(e){
            //minting too many for presale
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should fail to mint before the sale is started', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.mintPioneer(1);
        }
        catch(e){
            //presale not started
            console.log('Error thrown correctly. Trying to mint before sale started');
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should start the sale', async()=>{
        let saleBeforeState = await kosiumPioneer.saleIsActive();
        assert(!saleBeforeState);
        let flipResult = await kosiumPioneer.flipSaleState();
        assert(flipResult.hasOwnProperty('tx'));
        let saleAfterState = await kosiumPioneer.saleIsActive();
        assert(saleAfterState);
    });

    it('should fail to mint in sale if eth sent is not enough', async()=>{
        try{
            let numToTryMinting = PIONEER_PURCHASE_LIMIT;
            await kosiumPioneer.mintPioneer(numToTryMinting,{value: underMintCost(numToTryMinting), from: accounts[2]});
        }
        catch(e){
            //to many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should mint pioneers in the open sale', async()=>{
        await kosiumPioneer.setReserveLimit(numReserved + 1);
        let numToMint = 1;
        let successMint = await kosiumPioneer.mintPioneer(numToMint, {value: mintCost(numToMint)});
        numMinted += numToMint;
        assert(successMint.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
        let numMintedInContract = await kosiumPioneer.numMinted();
        assert.equal(numMintedInContract.words[0], numMinted);
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

    it('should fail to mint more than the max num pioneers per address in open sale', async()=>{
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
        let reserveReturn = await kosiumPioneer.reservePioneers(accounts[0], numMinting, {gas: 5000000});
        numReserved += numMinting;
        numMinted += numMinting;
        assert(reserveReturn.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], numMinted);
        let numMintedInContract = await kosiumPioneer.numMinted();
        assert.equal(numMintedInContract.words[0], numMinted);
        let addrOwner = await kosiumPioneer.ownerOf(numMinted - 1);
        assert.equal(accounts[0], addrOwner);
        let numRes = await kosiumPioneer.numReserved.call();
        assert.equal(numRes.words[0], numReserved);  
    });

    it('should fail to reserve more pioneers', async()=>{
        let failed = false;
        try{
            let reserveReturn = await kosiumPioneer.reservePioneers(accounts[0], 10, {gas: 5000000});
        }
        catch(e){
            //too many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should fail to mint more than max pioneer supply', async()=>{
        let failed = false;
        try{
            let reserveReturn = await kosiumPioneer.reservePioneers(accounts[3], 5, {gas: 5000000});
        }
        catch(e){
            //too many to mint
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should set base uri', async()=>{
        let baseUri = 'ipfs://QmdrX4RFbkmt2uhTA1ETPrQoJqtS1yiXA1qop2j3Mzt64T/';
        await kosiumPioneer.setBaseTokenURI(baseUri);
        let uri0 = await kosiumPioneer.tokenURI(0);
        let correctURI0 = baseUri + '0';
        assert.equal(correctURI0, uri0);
        console.log('num total minted = ', numMinted);
    });
});
  