const Web3 = require('web3');

let web3 = new Web3('ws://localhost:7545');
// console.log(web3);//shows all methods

const KosiumPioneer = artifacts.require(
    "../contracts/KosiumPioneer.sol"
);
  
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
        let reserveReturn = await kosiumPioneer.reservePioneers(1, {gas: 5000000});
        assert(reserveReturn.hasOwnProperty('tx'));
        let addrOwner = await kosiumPioneer.ownerOf(0);
        assert.equal(accounts[0], addrOwner);
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], 1);
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
        let successMint = await kosiumPioneer.mintPresalePioneer(2,{value: 160000000000000000});
        assert(successMint.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], 3);
    });

    it('should fail to mint more than max amount in presale', async()=>{
        let errHappened = false;
        try{
            await kosiumPioneer.mintPresalePioneer(1,{value: 80000000000000000});
        }
        catch(e){
            //minting too many for presale
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
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

    it('should fail to pledge if sale is not active', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.pledge(1);
        }
        catch(e){
            //sale not active
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });

    it('should fail to pledge if <0.08 ETH per token price', async()=>{
        await kosiumPioneer.setPurchaseLimit(5);
        await kosiumPioneer.flipSaleState();
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.pledge(5,{value: 390000000000000000});
        }
        catch(e){
            //price too low
            printError(e);
            errHappened = true;
        }
        assert(errHappened);
    });
    
    it('should pledge for 5 pioneers', async()=>{
        let successPledge = await kosiumPioneer.pledge(5,{value: 400000000000000000});
        assert(successPledge.hasOwnProperty('tx'));
        let pledges = await kosiumPioneer.accountPledges.call(accounts[0]);
        assert.equal(pledges.words[0], 5);
    });

    it('mint pioneers', async()=>{
        let successMint = await kosiumPioneer.mintPioneer(5);
        assert(successMint.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], 8);
    });

    it('should fail to pledge than the max num pioneers per address', async()=>{
        let failed = false;
        try{
            let successPledge = await kosiumPioneer.pledge(5,{value: 400000000000000000});
        }
        catch(e){
            //too many to pledge
            printError(e);
            failed = true;
        }
        assert(failed);
    });

    it('should fail to mint more than the max num pioneers per address', async()=>{
        let failed = false;
        try{
            let successMint = await kosiumPioneer.mintPioneer(5);
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
        expect(balanceIncrease).to.be.above(78000000000000000 * 5);
    });
    
    it('should reserve more pioneers', async ()=>{
        let reserveReturn = await kosiumPioneer.reservePioneers(1, {gas: 5000000});
        assert(reserveReturn.hasOwnProperty('tx'));
        let totalSupply = await kosiumPioneer.totalSupply();
        assert.equal(totalSupply.words[0], 9);
        let addrOwner = await kosiumPioneer.ownerOf(5);
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

    it('should fail to pledge more pioneers in sale', async()=>{
        let failed = false;
        try{
            let successPledge = await kosiumPioneer.pledge(5,{value: 400000000000000000, from: accounts[1]});
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
  